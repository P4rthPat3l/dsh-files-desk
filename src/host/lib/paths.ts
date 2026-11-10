import fs from 'node:fs/promises';
import path from 'node:path';
import type { BigIntStats, Stats } from 'node:fs';
import { FilesError, isErrno } from './errors.js';

/** The largest text file the editor reads or saves. */
export const MAX_TEXT_BYTES = 5 * 1024 * 1024;

/** The largest number of entries one directory listing returns. */
export const MAX_ENTRIES = 2000;

/** The largest number of entries a recursive copy may create. */
export const MAX_COPY_ENTRIES = 5000;

/** A path proven to sit inside the workspace root, with its current state. */
export type Entry = { absolute: string; root: string } & ({ exists: false } | { exists: true; stat: Stats });

/** A readable file and its stat. */
export interface Readable {
  absolute: string;
  stat: Stats;
}

/**
 * The real path of a workspace root, without a trailing separator.
 * @param root the registered workspace path.
 * @returns its real path.
 */
export async function realRootOf(root: string): Promise<string> {
  let real: string;
  try {
    real = await fs.realpath(root);
  } catch {
    throw new FilesError('files/not-found', 'The workspace folder is not available.', { path: root });
  }
  return real.endsWith(path.sep) ? real.slice(0, -1) : real;
}

/**
 * Resolve a caller path against the workspace root.
 * @param root the real workspace root.
 * @param candidate absolute or workspace-relative path.
 * @returns a normalized absolute path.
 */
function resolveCandidate(root: string, candidate: string): string {
  if (candidate === '') {
    throw new FilesError('files/bad-request', 'A path is required.');
  }
  return path.isAbsolute(candidate) ? path.normalize(candidate) : path.resolve(root, candidate);
}

/**
 * Resolve a path that a mutation may touch, and prove it stays inside the root.
 *
 * The lexical check rejects `..` escapes. The parent's real path rejects a
 * symlinked directory that would leave the root. A symlink at the target itself
 * is reported to the caller, which refuses to write through it.
 *
 * @param root the registered workspace path.
 * @param candidate absolute or workspace-relative path.
 * @returns the resolved entry and whether it exists.
 */
export async function inside(root: string, candidate: string): Promise<Entry> {
  const real = await realRootOf(root);
  const absolute = resolveCandidate(real, candidate);
  if (absolute !== real && !absolute.startsWith(real + path.sep)) {
    throw new FilesError('files/outside-workspace', 'That path is outside the workspace.', { path: candidate });
  }
  if (absolute === real) {
    return { absolute, root: real, exists: true, stat: await fs.stat(real) };
  }
  let parent: string;
  try {
    parent = await fs.realpath(path.dirname(absolute));
  } catch {
    throw new FilesError('files/not-found', 'The parent folder does not exist.', { path: candidate });
  }
  if (parent !== real && !parent.startsWith(real + path.sep)) {
    throw new FilesError('files/outside-workspace', 'That path resolves outside the workspace.', { path: candidate });
  }
  const resolved = path.join(parent, path.basename(absolute));
  let stat: Stats | undefined;
  try {
    stat = await fs.lstat(resolved);
  } catch (error) {
    if (!isErrno(error, 'ENOENT')) throw error;
    stat = undefined;
  }
  if (stat === undefined) return { absolute: resolved, root: real, exists: false };
  return { absolute: resolved, root: real, exists: true, stat };
}

/**
 * Resolve a path for a read. Reads may leave the workspace, matching the
 * document preview's read authority; every mutation uses `inside` instead.
 * @param root the registered workspace path.
 * @param candidate absolute or workspace-relative path.
 * @returns the absolute path and its stat.
 */
export async function readable(root: string, candidate: string): Promise<Readable> {
  const real = await realRootOf(root);
  const absolute = resolveCandidate(real, candidate);
  let stat: Stats;
  try {
    stat = await fs.stat(absolute);
  } catch (error) {
    if (isErrno(error, 'ENOENT')) {
      throw new FilesError('files/not-found', 'The file no longer exists.', { path: candidate });
    }
    throw error;
  }
  if (!stat.isFile()) {
    throw new FilesError('files/not-file', 'Not a regular file.', { path: candidate });
  }
  return { absolute, stat };
}

/**
 * Refuse a target that is itself a symlink, so a write cannot follow it out.
 * @param stat the target's lstat.
 * @param candidate the path for the message.
 */
export function assertNotSymlink(stat: Stats, candidate: string): void {
  if (stat.isSymbolicLink()) {
    throw new FilesError('files/symlink', 'Symlinks are not edited here.', { path: candidate });
  }
}

/**
 * One file state as an opaque version string.
 * @param stat a bigint stat.
 * @returns the version.
 */
export function versionOf(stat: BigIntStats): string {
  return `${stat.ino}:${stat.size}:${stat.mtimeNs}`;
}
