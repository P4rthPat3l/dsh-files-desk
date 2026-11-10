/**
 * The shapes the files channel exchanges. The host route and the browser client
 * both read this file, so the wire contract has one definition.
 */

/** The line ending style a file uses. */
export type Eol = 'lf' | 'crlf';

/** The kind of entry a create call makes. */
export type EntryKind = 'file' | 'directory';

/** One file as the editor receives it. */
export interface TextFile {
  path: string;
  text: string;
  version: string;
  size: number;
  eol: Eol;
  bom: boolean;
}

/** A file's state after a write. */
export interface WrittenFile {
  path: string;
  version: string;
  size: number;
}

/** One file's state without its content. */
export interface FileStat {
  path: string;
  version: string;
  size: number;
  mtimeMs: number;
}

/** One directory entry. */
export interface DirectoryEntry {
  name: string;
  type: 'directory' | 'file' | 'other';
  size?: number;
}

/** One directory listing. */
export interface DirectoryListing {
  path: string;
  entries: DirectoryEntry[];
  truncated: boolean;
}
