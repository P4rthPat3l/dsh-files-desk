const FILE_PREFIX = 'dsh-resource://file/session/';

let connection = null;

/**
 * Bind the client connection used for route calls.
 * @param {{ connection: object }} ctx - the plugin context.
 */
export function configureConnection(ctx) {
  connection = ctx.connection;
}

/**
 * Call one files endpoint.
 * @param {string} endpoint - the endpoint name.
 * @param {object} payload - the endpoint payload.
 * @param {AbortSignal} [signal] - caller cancellation.
 * @returns {Promise<any>} the endpoint value.
 */
export async function call(endpoint, payload, signal) {
  if (connection === null) throw new Error('The files channel is not ready.');
  const result = await connection.rpc.call('/files-rpc', endpoint, payload, signal);
  if (!result.ok) {
    const error = new Error(result.error.message);
    error.code = result.error.code;
    error.details = result.error.details;
    throw error;
  }
  return result.value;
}

/**
 * Replace Windows separators with `/`.
 * @param {string} value - a path.
 * @returns {string} the normalized path.
 */
export function normalizePath(value) {
  return value.replace(/\\/g, '/');
}

/**
 * Whether a path is absolute in either spelling the host accepts.
 * @param {string} value - a path.
 * @returns {boolean} whether it is absolute.
 */
export function isAbsolutePath(value) {
  return value.startsWith('/') || /^[A-Za-z]:\//.test(normalizePath(value)) || normalizePath(value).startsWith('//');
}

/**
 * The final path segment.
 * @param {string} value - a path.
 * @returns {string} the name.
 */
export function basename(value) {
  const path = normalizePath(value).replace(/\/+$/, '');
  const index = path.lastIndexOf('/');
  return index < 0 ? path : path.slice(index + 1);
}

/**
 * The path without its final segment.
 * @param {string} value - a path.
 * @returns {string} the parent path.
 */
export function dirname(value) {
  const path = normalizePath(value).replace(/\/+$/, '');
  const index = path.lastIndexOf('/');
  if (index < 0) return '';
  if (index === 0) return '/';
  return path.slice(0, index);
}

/**
 * Join one directory and one name with `/`.
 * @param {string} directory - the parent path.
 * @param {string} name - the child name.
 * @returns {string} the joined path.
 */
export function joinPath(directory, name) {
  const base = normalizePath(directory).replace(/\/+$/, '');
  return base === '' ? name : `${base}/${name}`;
}

/**
 * The tree key of a root: no trailing separator.
 * @param {string} value - the root path.
 * @returns {string} the tree key.
 */
export function treeRoot(value) {
  const path = normalizePath(value).replace(/\/+$/, '');
  return path === '' ? '/' : path;
}

/**
 * Whether a path is the root or inside it.
 * @param {string} root - the tree root.
 * @param {string} path - a candidate path.
 * @returns {boolean} containment.
 */
export function isInside(root, path) {
  const base = treeRoot(root);
  const candidate = normalizePath(path);
  return candidate === base || candidate.startsWith(`${base}/`);
}

/**
 * Encode one path as address segments.
 * @param {string} value - the path.
 * @returns {string} encoded segments.
 */
function encodePath(value) {
  return normalizePath(value)
    .replace(/^(?:\.\/)+/, '')
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

/**
 * Build a session-scoped file address.
 * @param {string} sessionId - the session.
 * @param {string} path - an absolute or root-relative path.
 * @returns {string} the address.
 */
function sessionAddress(sessionId, path) {
  return `${FILE_PREFIX}${encodeURIComponent(sessionId)}/${encodePath(path)}`;
}

/**
 * The address for a path as a caller holds it, matching the harness util.
 * @param {string} sessionId - the session.
 * @param {string | null} cwd - the session working directory.
 * @param {string} path - absolute or workspace-relative path.
 * @returns {string} the address.
 */
export function addressFor(sessionId, cwd, path) {
  const normalized = normalizePath(path);
  if (!isAbsolutePath(normalized)) return sessionAddress(sessionId, normalized);
  const root = cwd === null || cwd === undefined ? '' : treeRoot(cwd);
  if (root !== '' && normalized === root) return sessionAddress(sessionId, '');
  if (root !== '' && normalized.startsWith(`${root}/`)) return sessionAddress(sessionId, normalized.slice(root.length + 1));
  return sessionAddress(sessionId, normalized);
}

/**
 * Read a file address into its session and path.
 * @param {string} address - a candidate address.
 * @returns {{ sessionId: string, path: string } | undefined} the parts.
 */
export function parseAddress(address) {
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
};

/**
 * The language key for a path.
 * @param {string} path - the file path.
 * @returns {string} the language key.
 */
export function languageFor(path) {
  const name = basename(path).toLowerCase();
  if (name === 'dockerfile' || name === 'makefile' || name === 'procfile') return 'text';
  const dot = name.lastIndexOf('.');
  if (dot < 0) return 'text';
  return LANGUAGE_BY_EXTENSION[name.slice(dot + 1)] ?? 'text';
}

const BINARY_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'icns', 'avif', 'tif', 'tiff', 'psd', 'heic',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp', 'rtf', 'epub',
  'zip', 'gz', 'tgz', 'tar', 'bz2', 'xz', '7z', 'rar', 'jar', 'war',
  'exe', 'dll', 'so', 'dylib', 'bin', 'dat', 'wasm', 'class', 'pyc', 'o', 'a', 'lib', 'obj',
  'woff', 'woff2', 'ttf', 'otf', 'eot',
  'mp3', 'wav', 'flac', 'ogg', 'oga', 'm4a', 'mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'wmv',
  'sqlite', 'sqlite3', 'db', 'mdb', 'ttc', 'icns',
]);

/**
 * Whether a path is a type the editor does not open by default.
 * @param {string} path - the file path.
 * @returns {boolean} whether it belongs to a preview or external viewer.
 */
export function previewOnly(path) {
  const name = basename(path).toLowerCase();
  const dot = name.lastIndexOf('.');
  if (dot < 0) return false;
  return BINARY_EXTENSIONS.has(name.slice(dot + 1));
}

/**
 * Whether an address should open in the editor.
 * @param {string} address - the resource address.
 * @returns {boolean} whether the editor claims it.
 */
export function canEditAddress(address) {
  const parsed = parseAddress(address);
  if (parsed === undefined) return false;
  return parsed.path !== '' && !previewOnly(parsed.path);
}

/**
 * The map from error code to locale key.
 * @param {string | undefined} code - the error code.
 * @returns {string} the locale key.
 */
export function errorKey(code) {
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
