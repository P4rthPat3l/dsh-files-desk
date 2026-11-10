import fs from 'node:fs/promises';
import path from 'node:path';
import { FilesError } from './errors.js';
import {
  MAX_COPY_ENTRIES,
  MAX_ENTRIES,
  MAX_TEXT_BYTES,
  assertNotSymlink,
  inside,
  readable,
  versionOf,
} from './paths.js';

const decoder = new TextDecoder('utf-8', { fatal: true });

/**
 * Split a decoded file into editor text and its line ending style.
 * @param {string} text - the decoded text.
 * @returns {{ text: string, eol: 'lf' | 'crlf' }} normalized text and style.
 */
function splitEol(text) {
  if (!text.includes('\r\n')) return { text, eol: 'lf' };
  const withoutCrlf = text.replace(/\r\n/g, '');
  if (withoutCrlf.includes('\n')) return { text: text.replace(/\r\n/g, '\n'), eol: 'lf' };
  return { text: text.replace(/\r\n/g, '\n'), eol: 'crlf' };
}

/**
 * Read one UTF-8 text file with a version that a save can compare against.
 * @param {string} root - the registered workspace path.
 * @param {string} candidate - absolute or workspace-relative path.
 * @returns {Promise<{ path: string, text: string, version: string, size: number, eol: 'lf' | 'crlf', bom: boolean }>}
 */
export async function readText(root, candidate) {
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
    let decoded;
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
 * @param {string} root - the registered workspace path.
 * @param {string} candidate - absolute or workspace-relative path.
 * @param {string} text - normalized text with `\n` line endings.
 * @param {string} expectedVersion - the version the editor read.
 * @param {'lf' | 'crlf'} [eol] - the file's line ending style.
 * @param {boolean} [bom] - whether the file starts with a UTF-8 BOM.
 * @returns {Promise<{ path: string, version: string, size: number }>}
 */
export async function writeText(root, candidate, text, expectedVersion, eol = 'lf', bom = false) {
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
 * @param {string} root - the registered workspace path.
 * @param {string} candidate - absolute or workspace-relative path.
 * @param {'file' | 'directory'} kind - the entry to create.
 * @returns {Promise<{ path: string }>}
 */
export async function createEntry(root, candidate, kind) {
  if (kind !== 'file' && kind !== 'directory') {
    throw new FilesError('files/bad-request', 'Unknown entry kind.', { kind });
  }
  const entry = await inside(root, candidate);
  if (entry.absolute === entry.root) {
    throw new FilesError('files/exists', 'That name already exists.', { path: candidate });
  }
  if (entry.exists) {
    throw new FilesError('files/exists', 'That name already exists.', { path: candidate });
  }
  try {
    if (kind === 'file') await fs.writeFile(entry.absolute, '', { encoding: 'utf8', flag: 'wx' });
    else await fs.mkdir(entry.absolute);
  } catch (error) {
    if (error.code === 'EEXIST') throw new FilesError('files/exists', 'That name already exists.', { path: candidate });
    if (error.code === 'ENOENT') throw new FilesError('files/not-found', 'The parent folder does not exist.', { path: candidate });
    throw error;
  }
  return { path: entry.absolute };
}

/**
 * Rename or move one entry. The target must not exist.
 * @param {string} root - the registered workspace path.
 * @param {string} from - the current path.
 * @param {string} to - the new path.
 * @returns {Promise<{ path: string, from: string }>}
 */
export async function renameEntry(root, from, to) {
  const source = await inside(root, from);
  if (!source.exists) throw new FilesError('files/not-found', 'The entry no longer exists.', { path: from });
  if (source.absolute === source.root) {
    throw new FilesError('files/bad-request', 'The workspace root cannot be renamed.', { path: from });
  }
  const target = await inside(root, to);
  if (target.absolute === target.root) {
    throw new FilesError('files/exists', 'That name already exists.', { path: to });
  }
  if (target.exists) throw new FilesError('files/exists', 'That name already exists.', { path: to });
  if (target.absolute === source.absolute) {
    throw new FilesError('files/exists', 'The name is unchanged.', { path: to });
  }
  if (source.stat.isDirectory() && target.absolute.startsWith(source.absolute + path.sep)) {
    throw new FilesError('files/bad-request', 'A folder cannot move inside itself.', { path: to });
  }
  try {
    await fs.rename(source.absolute, target.absolute);
  } catch (error) {
    if (error.code === 'ENOTEMPTY' || error.code === 'EISDIR' || error.code === 'ENOTDIR') {
      throw new FilesError('files/exists', 'That name already exists.', { path: to });
    }
    throw error;
  }
  return { path: target.absolute, from: source.absolute };
}

/**
 * Copy one file or directory tree. The target must not exist.
 * @param {string} root - the registered workspace path.
 * @param {string} from - the source path.
 * @param {string} to - the target path.
 * @returns {Promise<{ path: string }>}
 */
export async function copyEntry(root, from, to) {
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
 * @param {string} source - absolute source path.
 * @param {string} target - absolute target path.
 * @param {{ count: number }} counter - entries created so far.
 */
async function copyNode(source, target, counter) {
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
 * @param {string} root - the registered workspace path.
 * @param {string} candidate - absolute or workspace-relative path.
 * @returns {Promise<{ path: string }>}
 */
export async function removeEntry(root, candidate) {
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
 * @param {string} root - the registered workspace path.
 * @param {string} candidate - absolute or workspace-relative path.
 * @returns {Promise<{ path: string, version: string, size: number, mtimeMs: number }>}
 */
export async function statEntry(root, candidate) {
  const { absolute } = await readable(root, candidate);
  const stat = await fs.stat(absolute, { bigint: true });
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
 * @param {string} root - the registered workspace path.
 * @param {string} candidate - absolute or workspace-relative directory path.
 * @returns {Promise<{ path: string, entries: Array<{ name: string, type: string, size?: number }>, truncated: boolean }>}
 */
export async function listDirectory(root, candidate) {
  const entry = await inside(root, candidate === '' ? root : candidate);
  if (!entry.exists) throw new FilesError('files/not-found', 'The folder no longer exists.', { path: candidate });
  if (!entry.stat.isDirectory()) throw new FilesError('files/not-directory', 'Not a folder.', { path: candidate });
  const dirents = await fs.readdir(entry.absolute, { withFileTypes: true });
  const entries = [];
  for (const dirent of dirents.slice(0, MAX_ENTRIES)) {
    let size;
    try {
      size = (await fs.lstat(path.join(entry.absolute, dirent.name))).size;
    } catch {
      size = undefined;
    }
    const type = dirent.isDirectory() ? 'directory' : dirent.isFile() ? 'file' : 'other';
    entries.push({ name: dirent.name, type, size });
  }
  return { path: entry.absolute, entries, truncated: dirents.length > MAX_ENTRIES };
}
