import type { ConnectionService } from './harness.js';

const FILE_PREFIX = 'dsh-resource://file/session/';

/** Every endpoint the files channel serves. */
export type Endpoint = 'list' | 'read' | 'write' | 'create' | 'rename' | 'copy' | 'delete' | 'stat';

/** A failed route call, carrying the host's stable code. */
export class FilesCallError extends Error {
  readonly code: string;

  readonly details: Record<string, unknown>;

  constructor(code: string, message: string, details: Record<string, unknown>) {
    super(message);
    this.name = 'FilesCallError';
    this.code = code;
    this.details = details;
  }
}

let connection: ConnectionService | null = null;

/**
 * Bind the client connection used for route calls.
 * @param ctx the plugin context.
 */
export function configureConnection(ctx: { connection: ConnectionService }): void {
  connection = ctx.connection;
}

/**
 * Call one files endpoint.
 * @param endpoint the endpoint name.
 * @param payload the endpoint payload.
 * @param signal caller cancellation.
 * @returns the endpoint value.
 */
export async function call<T>(endpoint: Endpoint, payload: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  if (connection === null) throw new Error('The files channel is not ready.');
  const outcome = await connection.rpc.call('/files-rpc', endpoint, payload, signal);
  if (!outcome.ok) {
    throw new FilesCallError(outcome.error.code, outcome.error.message, outcome.error.details);
  }
  return outcome.value as T;
}

/**
 * Read the stable code from a failed operation.
 * @param error the thrown value.
 * @returns the code, or undefined when it did not come from the files channel.
 */
export function codeOfFailure(error: unknown): string | undefined {
  if (error instanceof FilesCallError) return error.code;
  if (error instanceof Error && 'code' in error) {
    const { code } = error as { code: unknown };
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

/**
 * Replace Windows separators with `/`.
 * @param value a path.
 * @returns the normalized path.
 */
export function normalizePath(value: string): string {
  return value.replace(/\\/g, '/');
}

/**
 * Whether a path is absolute in either spelling the host accepts.
 * @param value a path.
 * @returns whether it is absolute.
 */
export function isAbsolutePath(value: string): boolean {
  return value.startsWith('/') || /^[A-Za-z]:\//.test(normalizePath(value)) || normalizePath(value).startsWith('//');
}

/**
 * The final path segment.
 * @param value a path.
 * @returns the name.
 */
export function basename(value: string): string {
  const path = normalizePath(value).replace(/\/+$/, '');
  const index = path.lastIndexOf('/');
  return index < 0 ? path : path.slice(index + 1);
}

/**
 * The path without its final segment.
 * @param value a path.
 * @returns the parent path.
 */
export function dirname(value: string): string {
  const path = normalizePath(value).replace(/\/+$/, '');
  const index = path.lastIndexOf('/');
  if (index < 0) return '';
  if (index === 0) return '/';
  return path.slice(0, index);
}

/**
 * Join one directory and one name with `/`.
 * @param directory the parent path.
 * @param name the child name.
 * @returns the joined path.
 */
export function joinPath(directory: string, name: string): string {
  const base = normalizePath(directory).replace(/\/+$/, '');
  return base === '' ? name : `${base}/${name}`;
}

/**
 * The tree key of a root: no trailing separator.
 * @param value the root path.
 * @returns the tree key.
 */
export function treeRoot(value: string): string {
  const path = normalizePath(value).replace(/\/+$/, '');
  return path === '' ? '/' : path;
}

/**
 * Whether a path is the root or inside it.
 * @param root the tree root.
 * @param path a candidate path.
 * @returns containment.
 */
export function isInside(root: string, path: string): boolean {
  const base = treeRoot(root);
  const candidate = normalizePath(path);
  return candidate === base || candidate.startsWith(`${base}/`);
}

/**
 * Encode one path as address segments.
 * @param value the path.
 * @returns encoded segments.
 */
function encodePath(value: string): string {
  return normalizePath(value)
    .replace(/^(?:\.\/)+/, '')
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

/**
 * Build a session-scoped file address.
 * @param sessionId the session.
 * @param path an absolute or root-relative path.
 * @returns the address.
 */
function sessionAddress(sessionId: string, path: string): string {
  return `${FILE_PREFIX}${encodeURIComponent(sessionId)}/${encodePath(path)}`;
}

/**
 * The address for a path as a caller holds it, matching the harness util.
 * @param sessionId the session.
 * @param cwd the session working directory.
 * @param path absolute or workspace-relative path.
 * @returns the address.
 */
export function addressFor(sessionId: string, cwd: string | null | undefined, path: string): string {
  const normalized = normalizePath(path);
  if (!isAbsolutePath(normalized)) return sessionAddress(sessionId, normalized);
  const root = cwd === null || cwd === undefined ? '' : treeRoot(cwd);
  if (root !== '' && normalized === root) return sessionAddress(sessionId, '');
  if (root !== '' && normalized.startsWith(`${root}/`)) {
    return sessionAddress(sessionId, normalized.slice(root.length + 1));
  }
  return sessionAddress(sessionId, normalized);
}

/** One file address split into its parts. */
export interface ParsedAddress {
  sessionId: string;
  path: string;
}

/**
 * Read a file address into its session and path.
 * @param address a candidate address.
 * @returns the parts, or undefined when the address is not a file address.
 */
export function parseAddress(address: string | null | undefined): ParsedAddress | undefined {
  if (typeof address !== 'string' || !address.startsWith(FILE_PREFIX)) return undefined;
  const rest = address.slice(FILE_PREFIX.length);
  const slash = rest.indexOf('/');
  if (slash <= 0) return undefined;
  try {
    const sessionId = decodeURIComponent(rest.slice(0, slash));
    const encoded = rest.slice(slash + 1);
    const path = encoded === '' ? '' : encoded.split('/').map((segment) => decodeURIComponent(segment)).join('/');
    return { sessionId, path };
  } catch {
    return undefined;
  }
}

const LANGUAGE_BY_EXTENSION = {
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'jsx',
  json: 'json',
  jsonc: 'json',
  json5: 'json',
  md: 'markdown',
  markdown: 'markdown',
  mdx: 'markdown',
  css: 'css',
  scss: 'css',
  less: 'css',
  html: 'html',
  htm: 'html',
  vue: 'html',
  svelte: 'html',
  py: 'python',
  pyw: 'python',
  yml: 'yaml',
  yaml: 'yaml',
  xml: 'xml',
  svg: 'xml',
  xsd: 'xml',
  sql: 'sql',
  java: 'java',
  c: 'cpp',
  h: 'cpp',
  cc: 'cpp',
  cpp: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  rs: 'rust',
  go: 'go',
  php: 'php',
} as const;

/** One editor language the highlight packs cover. */
export type LanguageKey = (typeof LANGUAGE_BY_EXTENSION)[keyof typeof LANGUAGE_BY_EXTENSION] | 'text';

/**
 * The language key for a path.
 * @param path the file path.
 * @returns the language key.
 */
export function languageFor(path: string): LanguageKey {
  const name = basename(path).toLowerCase();
  if (name === 'dockerfile' || name === 'makefile' || name === 'procfile') return 'text';
  const dot = name.lastIndexOf('.');
  if (dot < 0) return 'text';
  return keyOfLanguage(name.slice(dot + 1));
}

/**
 * Look one extension up in the language table.
 * @param extension the extension without its dot.
 * @returns the language key.
 */
function keyOfLanguage(extension: string): LanguageKey {
  const known: Record<string, LanguageKey> = LANGUAGE_BY_EXTENSION;
  return known[extension] ?? 'text';
}

const BINARY_EXTENSIONS: ReadonlySet<string> = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'icns', 'avif', 'tif', 'tiff', 'psd', 'heic',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp', 'rtf', 'epub',
  'zip', 'gz', 'tgz', 'tar', 'bz2', 'xz', '7z', 'rar', 'jar', 'war',
  'exe', 'dll', 'so', 'dylib', 'bin', 'dat', 'wasm', 'class', 'pyc', 'o', 'a', 'lib', 'obj',
  'woff', 'woff2', 'ttf', 'otf', 'eot',
  'mp3', 'wav', 'flac', 'ogg', 'oga', 'm4a', 'mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'wmv',
  'sqlite', 'sqlite3', 'db', 'mdb', 'ttc',
]);

/**
 * Whether a path is a type the editor does not open by default.
 * @param path the file path.
 * @returns whether it belongs to a preview or external viewer.
 */
export function previewOnly(path: string): boolean {
  const name = basename(path).toLowerCase();
  const dot = name.lastIndexOf('.');
  if (dot < 0) return false;
  return BINARY_EXTENSIONS.has(name.slice(dot + 1));
}

/**
 * Whether an address should open in the editor.
 * @param address the resource address.
 * @returns whether the editor claims it.
 */
export function canEditAddress(address: string | null | undefined): boolean {
  const parsed = parseAddress(address);
  if (parsed === undefined) return false;
  return parsed.path !== '' && !previewOnly(parsed.path);
}

/**
 * The map from error code to locale key.
 * @param code the error code.
 * @returns the locale key.
 */
export function errorKey(code: string | undefined): string {
  switch (code) {
    case 'files/outside-workspace':
      return 'error.outside';
    case 'files/not-found':
      return 'error.notFound';
    case 'files/exists':
      return 'error.exists';
    case 'files/binary':
      return 'error.binary';
    case 'files/too-large':
      return 'error.tooLarge';
    case 'files/not-utf8':
      return 'error.notUtf8';
    case 'files/symlink':
      return 'error.symlink';
    case 'files/name':
      return 'error.name';
    default:
      return 'error.generic';
  }
}
