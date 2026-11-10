import { FilesError } from './errors.js';
import {
  copyEntry,
  createEntry,
  listDirectory,
  readText,
  removeEntry,
  renameEntry,
  statEntry,
  writeText,
} from './ops.js';

const ENDPOINTS = new Set(['list', 'read', 'write', 'create', 'rename', 'copy', 'delete', 'stat']);

/**
 * Read one required string field from a payload.
 * @param {unknown} payload - the client payload.
 * @param {string} key - the field name.
 * @returns {string} the field.
 */
function stringField(payload, key) {
  const value = payload !== null && typeof payload === 'object' ? payload[key] : undefined;
  if (typeof value !== 'string' || value === '') {
    throw new FilesError('files/bad-request', `The request is missing "${key}".`);
  }
  return value;
}

/**
 * Resolve the workspace a request targets.
 * @param {{ workspaceRegistry: { get(id: string): { path: string } | undefined } }} ctx - host context.
 * @param {unknown} payload - the client payload.
 * @returns {{ path: string }} the workspace.
 */
function workspaceOf(ctx, payload) {
  const id = stringField(payload, 'workspaceId');
  const workspace = ctx.workspaceRegistry.get(id);
  if (workspace === undefined) {
    throw new FilesError('files/no-workspace', 'That workspace is no longer registered.');
  }
  return workspace;
}

/**
 * Run one files endpoint.
 * @param {object} ctx - host context.
 * @param {string} endpoint - the endpoint name.
 * @param {unknown} payload - the client payload.
 * @returns {Promise<unknown>} the endpoint value.
 */
async function dispatch(ctx, endpoint, payload) {
  if (!ENDPOINTS.has(endpoint)) {
    throw new FilesError('files/bad-request', 'Unknown files endpoint.');
  }
  const workspace = workspaceOf(ctx, payload);
  const root = workspace.path;
  switch (endpoint) {
    case 'list': {
      const candidate = payload !== null && typeof payload === 'object' && typeof payload.path === 'string' ? payload.path : '';
      return listDirectory(root, candidate);
    }
    case 'read':
      return readText(root, stringField(payload, 'path'));
    case 'write': {
      if (payload === null || typeof payload !== 'object' || typeof payload.text !== 'string') {
        throw new FilesError('files/bad-request', 'The request is missing "text".');
      }
      const eol = payload.eol === 'crlf' ? 'crlf' : 'lf';
      return writeText(
        root,
        stringField(payload, 'path'),
        payload.text,
        stringField(payload, 'version'),
        eol,
        payload.bom === true,
      );
    }
    case 'create':
      return createEntry(root, stringField(payload, 'path'), stringField(payload, 'kind'));
    case 'rename':
      return renameEntry(root, stringField(payload, 'from'), stringField(payload, 'to'));
    case 'copy':
      return copyEntry(root, stringField(payload, 'from'), stringField(payload, 'to'));
    case 'delete':
      return removeEntry(root, stringField(payload, 'path'));
    case 'stat':
      return statEntry(root, stringField(payload, 'path'));
    default:
      throw new FilesError('files/bad-request', 'Unknown files endpoint.');
  }
}

/**
 * Build the endpoint handler that the HTTP route calls.
 * @param {object} ctx - host context with `workspaceRegistry`.
 * @returns {(endpoint: string, payload: unknown, signal: AbortSignal | undefined, peer: { principal?: { kind?: string } } | undefined) => Promise<unknown>}
 */
export function createHandler(ctx) {
  return async function handler(endpoint, payload, signal, peer) {
    if (peer === undefined || peer.principal?.kind !== 'owner') {
      return {
        ok: false,
        error: {
          code: 'files/forbidden',
          message: 'Files are available only to the local user.',
          details: {},
        },
      };
    }
    try {
      const value = await dispatch(ctx, endpoint, payload);
      return { ok: true, value };
    } catch (error) {
      if (error instanceof FilesError) {
        return {
          ok: false,
          error: { code: error.code, message: error.message, details: error.details ?? {} },
        };
      }
      const message = error instanceof Error ? error.message : String(error);
      return {
        ok: false,
        error: {
          code: signal?.aborted === true ? 'files/cancelled' : 'files/internal',
          message: message === '' ? 'The file operation failed.' : message,
          details: {},
        },
      };
    }
  };
}
