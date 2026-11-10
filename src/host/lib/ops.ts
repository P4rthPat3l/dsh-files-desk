import fs from 'node:fs/promises';
import path from 'node:path';
import type { BigIntStats } from 'node:fs';
import { FilesError, isErrno } from './errors.js';
import {
  MAX_COPY_ENTRIES,
  MAX_ENTRIES,
  MAX_TEXT_BYTES,
  assertNotSymlink,
  inside,
  readable,
  versionOf,
} from './paths.js';

import type {
  DirectoryEntry,
  DirectoryListing,
  Eol,
  EntryKind,
  FileStat,
  TextFile,
  WrittenFile,
} from '../../contract.js';

const decoder = new TextDecoder('utf-8', { fatal: true });

/**
 * Split a decoded file into editor text and its line ending style.
 * @param text the decoded text.
 * @returns normalized text and its style.
 */
function splitEol(text: string): { text: string; eol: Eol } {
  if (!text.includes('\r\n')) return { text, eol: 'lf' };
  const withoutCrlf = text.replace(/\r\n/g, '');
  if (withoutCrlf.includes('\n')) return { text: text.replace(/\r\n/g, '\n'), eol: 'lf' };
  return { text: text.replace(/\r\n/g, '\n'), eol: 'crlf' };
}

/**
 * Read one UTF-8 text file with a version that a save can compare against.
 * @param root the registered workspace path.
 * @param candidate absolute or workspace-relative path.
 * @returns the file content and its version.
 */
export async function readText(root: string, candidate: string): Promise<TextFile> {
  const { absolute } = await readable(root, candidate);
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const before = await fs.stat(absolute, { bigint: true });
    if (before.size > BigInt(MAX_TEXT_BYTES)) {
      throw new FilesError('files/too-large', 'The file is too large to edit here.', { path: candidate });
    }
    const buffer = await fs.readFile(absolute);
    const after = await fs.stat(absolute, { bigint: true });
    if (versionOf(before) !== versionOf(after)) continue;
    if (buffer.subarray(0, 8192).includes(0)) {
      throw new FilesError('files/binary', 'Binary files cannot be edited here.', { path: candidate });
    }
    let decoded: string;
    try {
      decoded = decoder.decode(buffer);
    } catch {
      throw new FilesError('files/not-utf8', 'The file is not UTF-8 text.', { path: candidate });
    }
    const bom = buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf;
    if (decoded.charCodeAt(0) === 0xfeff) decoded = decoded.slice(1);
    const split = splitEol(decoded);
    return {
      path: absolute,
      text: split.text,
      version: versionOf(after),
      size: Number(after.size),
      eol: split.eol,
      bom,
    };
  }
  throw new FilesError('files/conflict', 'The file changed while it was being read.', { path: candidate });
}

/**
 * Write one text file atomically, only when its version still matches.
 * @param root the registered workspace path.
 * @param candidate absolute or workspace-relative path.
 * @param text normalized text with `\n` line endings.
 * @param expectedVersion the version the editor read.
 * @param eol the file's line ending style.
 * @param bom whether the file starts with a UTF-8 BOM.
 * @returns the file's new version.
 */
export async function writeText(
  root: string,
  candidate: string,
  text: string,
  expectedVersion: string,
  eol: Eol = 'lf',
  bom = false,
): Promise<WrittenFile> {
  const bytes = Buffer.byteLength(text, 'utf8');
  if (bytes > MAX_TEXT_BYTES) {
    throw new FilesError('files/too-large', 'The file is too large to save here.', { path: candidate });
  }
  const entry = await inside(root, candidate);
  if (!entry.exists) {
    throw new FilesError('files/not-found', 'The file no longer exists.', { path: candidate });
  }
  assertNotSymlink(entry.stat, candidate);
  if (!entry.stat.isFile()) {
    throw new FilesError('files/not-file', 'Not a regular file.', { path: candidate });
  }
  const current = await fs.stat(entry.absolute, { bigint: true });
  if (versionOf(current) !== expectedVersion) {
    throw new FilesError('files/conflict', 'The file changed on disk.', { path: candidate });
  }
  const output = `${bom ? '\uFEFF' : ''}${eol === 'crlf' ? text.replace(/\n/g, '\r\n') : text}`;
  const temp = path.join(
    path.dirname(entry.absolute),
    `.${path.basename(entry.absolute)}.dsh-${process.pid}-${Math.random().toString(36).slice(2, 8)}`,
  );
  try {
    await fs.writeFile(temp, output, { encoding: 'utf8', mode: entry.stat.mode });
    await fs.chmod(temp, entry.stat.mode);
    await fs.rename(temp, entry.absolute);
  } catch (error) {
    await fs.rm(temp, { force: true });
    throw error;
  }
  const next = await fs.stat(entry.absolute, { bigint: true });
  return { path: entry.absolute, version: versionOf(next), size: Number(next.size) };
}

/**
 * Create one file or directory. The parent must exist; the name must be free.
 * @param root the registered workspace path.
 * @param candidate absolute or workspace-relative path.
 * @param kind the entry to create.
 * @returns the created path.
 */
export async function createEntry(root: string, candidate: string, kind: EntryKind): Promise<{ path: string }> {
  const entry = await inside(root, candidate);
  if (entry.absolute === entry.root || entry.exists) {
    throw new FilesError('files/exists', 'That name already exists.', { path: candidate });
  }
  try {
    if (kind === 'file') await fs.writeFile(entry.absolute, '', { encoding: 'utf8', flag: 'wx' });
    else await fs.mkdir(entry.absolute);
  } catch (error) {
    if (isErrno(error, 'EEXIST')) {
      throw new FilesError('files/exists', 'That name already exists.', { path: candidate });
    }
    if (isErrno(error, 'ENOENT')) {
      throw new FilesError('files/not-found', 'The parent folder does not exist.', { path: candidate });
    }
    throw error;
  }
  return { path: entry.absolute };
}

/**
 * Rename or move one entry. The target must not exist.
 * @param root the registered workspace path.
 * @param from the current path.
 * @param to the new path.
 * @returns the new path.
 */
export async function renameEntry(root: string, from: string, to: string): Promise<{ path: string; from: string }> {
  const source = await inside(root, from);
  if (!source.exists) throw new FilesError('files/not-found', 'The entry no longer exists.', { path: from });
  if (source.absolute === source.root) {
    throw new FilesError('files/bad-request', 'The workspace root cannot be renamed.', { path: from });
  }
  const target = await inside(root, to);
  if (target.absolute === target.root || target.exists) {
    throw new FilesError('files/exists', 'That name already exists.', { path: to });
  }
  if (target.absolute === source.absolute) {
    throw new FilesError('files/exists', 'The name is unchanged.', { path: to });
  }
  if (source.stat.isDirectory() && target.absolute.startsWith(source.absolute + path.sep)) {
    throw new FilesError('files/bad-request', 'A folder cannot move inside itself.', { path: to });
  }
  try {
    await fs.rename(source.absolute, target.absolute);
  } catch (error) {
    if (isErrno(error, 'ENOTEMPTY') || isErrno(error, 'EISDIR') || isErrno(error, 'ENOTDIR')) {
      throw new FilesError('files/exists', 'That name already exists.', { path: to });
    }
    throw error;
  }
  return { path: target.absolute, from: source.absolute };
}

/**
 * Copy one file or directory tree. The target must not exist.
 * @param root the registered workspace path.
 * @param from the source path.
 * @param to the target path.
 * @returns the copied path.
 */
export async function copyEntry(root: string, from: string, to: string): Promise<{ path: string }> {
  const source = await inside(root, from);
  if (!source.exists) throw new FilesError('files/not-found', 'The entry no longer exists.', { path: from });
  const target = await inside(root, to);
  if (target.exists) throw new FilesError('files/exists', 'That name already exists.', { path: to });
  if (target.absolute === source.absolute || target.absolute.startsWith(source.absolute + path.sep)) {
    throw new FilesError('files/bad-request', 'A folder cannot be copied inside itself.', { path: to });
  }
  const counter = { count: 0 };
  try {
    await copyNode(source.absolute, target.absolute, counter);
  } catch (error) {
    await fs.rm(target.absolute, { recursive: true, force: true });
    throw error;
  }
  return { path: target.absolute };
}

/**
 * Copy one node and, for a directory, its children.
 * @param source absolute source path.
 * @param target absolute target path.
 * @param counter entries created so far.
 */
async function copyNode(source: string, target: string, counter: { count: number }): Promise<void> {
  counter.count += 1;
  if (counter.count > MAX_COPY_ENTRIES) {
    throw new FilesError('files/too-many-entries', 'The folder has too many entries to copy.');
  }
  const stat = await fs.lstat(source);
  if (stat.isSymbolicLink()) {
    throw new FilesError('files/symlink', 'Symlinks are not copied here.', { path: source });
  }
  if (stat.isDirectory()) {
    await fs.mkdir(target);
    const names = await fs.readdir(source);
    for (const name of names) {
      await copyNode(path.join(source, name), path.join(target, name), counter);
    }
    return;
  }
  if (!stat.isFile()) {
    throw new FilesError('files/not-file', 'Only files and folders are copied.', { path: source });
  }
  await fs.copyFile(source, target);
  await fs.chmod(target, stat.mode);
}

/**
 * Delete one file or directory tree. The workspace root is refused.
 * @param root the registered workspace path.
 * @param candidate absolute or workspace-relative path.
 * @returns the deleted path.
 */
export async function removeEntry(root: string, candidate: string): Promise<{ path: string }> {
  const entry = await inside(root, candidate);
  if (!entry.exists) throw new FilesError('files/not-found', 'The entry no longer exists.', { path: candidate });
  if (entry.absolute === entry.root) {
    throw new FilesError('files/bad-request', 'The workspace root cannot be deleted.', { path: candidate });
  }
  if (entry.stat.isSymbolicLink()) await fs.unlink(entry.absolute);
  else if (entry.stat.isDirectory()) await fs.rm(entry.absolute, { recursive: true, force: false });
  else await fs.unlink(entry.absolute);
  return { path: entry.absolute };
}

/**
 * Report one file's current version without its content.
 * @param root the registered workspace path.
 * @param candidate absolute or workspace-relative path.
 * @returns the file state.
 */
export async function statEntry(root: string, candidate: string): Promise<FileStat> {
  const { absolute } = await readable(root, candidate);
  const stat: BigIntStats = await fs.stat(absolute, { bigint: true });
  return {
    path: absolute,
    version: versionOf(stat),
    size: Number(stat.size),
    mtimeMs: Number(stat.mtimeMs),
  };
}

/**
 * List one directory's direct children. Types are `directory`, `file`, or `other`
 * (a symlink or a special file, which the editor does not open).
 * @param root the registered workspace path.
 * @param candidate absolute or workspace-relative directory path.
 * @returns the listing.
 */
export async function listDirectory(root: string, candidate: string): Promise<DirectoryListing> {
  const entry = await inside(root, candidate === '' ? root : candidate);
  if (!entry.exists) throw new FilesError('files/not-found', 'The folder no longer exists.', { path: candidate });
  if (!entry.stat.isDirectory()) throw new FilesError('files/not-directory', 'Not a folder.', { path: candidate });
  const dirents = await fs.readdir(entry.absolute, { withFileTypes: true });
  const entries: DirectoryEntry[] = [];
  for (const dirent of dirents.slice(0, MAX_ENTRIES)) {
    let size: number | undefined;
    try {
      size = (await fs.lstat(path.join(entry.absolute, dirent.name))).size;
    } catch {
      size = undefined;
    }
    const type: DirectoryEntry['type'] = dirent.isDirectory() ? 'directory' : dirent.isFile() ? 'file' : 'other';
    entries.push({ name: dirent.name, type, size });
  }
  return { path: entry.absolute, entries, truncated: dirents.length > MAX_ENTRIES };
}
