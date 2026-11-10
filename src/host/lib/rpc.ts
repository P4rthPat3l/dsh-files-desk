import { FilesError } from './errors.js';
import type { EntryKind } from '../../contract.js';
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
import type { EndpointHandler, WorkspaceRegistry } from './types.js';

/** Every endpoint the files channel accepts. */
const ENDPOINTS = ['list', 'read', 'write', 'create', 'rename', 'copy', 'delete', 'stat'] as const;

/** One endpoint name. */
type Endpoint = (typeof ENDPOINTS)[number];

const ENDPOINT_NAMES: ReadonlySet<string> = new Set(ENDPOINTS);

/** The host surface the endpoints need. */
export interface HandlerContext {
  readonly workspaceRegistry: WorkspaceRegistry;
}

/** A request body narrowed to named fields. */
type Payload = Record<string, unknown>;

/**
 * Narrow a parsed request body to an object of named fields.
 * @param payload the client payload.
 * @returns the payload record.
 */
function payloadOf(payload: unknown): Payload {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new FilesError('files/bad-request', 'The request body must be an object.');
  }
  return payload as Payload;
}

/**
 * Read one required string field from a payload.
 * @param payload the client payload.
 * @param key the field name.
 * @returns the field.
 */
function stringField(payload: Payload, key: string): string {
  const value = payload[key];
  if (typeof value !== 'string' || value === '') {
    throw new FilesError('files/bad-request', `The request is missing "${key}".`);
  }
  return value;
}

/**
 * Tell one endpoint name from an unknown string.
 * @param value the requested endpoint.
 * @returns whether the channel serves it.
 */
function isEndpoint(value: string): value is Endpoint {
  return ENDPOINT_NAMES.has(value);
}

/**
 * Read the entry kind a create call asks for.
 * @param payload the client payload.
 * @returns the entry kind.
 */
function entryKindOf(payload: Payload): EntryKind {
  const kind = payload.kind;
  if (kind !== 'file' && kind !== 'directory') {
    throw new FilesError('files/bad-request', 'Unknown entry kind.', { kind });
  }
  return kind;
}

/**
 * Resolve the workspace a request targets.
 * @param ctx the host context.
 * @param payload the client payload.
 * @returns the workspace path.
 */
function workspaceOf(ctx: HandlerContext, payload: Payload): string {
  const id = stringField(payload, 'workspaceId');
  const workspace = ctx.workspaceRegistry.get(id);
  if (workspace === undefined) {
    throw new FilesError('files/no-workspace', 'That workspace is no longer registered.');
  }
  return workspace.path;
}

/**
 * Run one files endpoint.
 * @param ctx the host context.
 * @param endpoint the endpoint name.
 * @param payload the client payload.
 * @returns the endpoint value.
 */
async function dispatch(ctx: HandlerContext, endpoint: Endpoint, payload: Payload): Promise<unknown> {
  const root = workspaceOf(ctx, payload);
  switch (endpoint) {
    case 'list': {
      const candidate = typeof payload.path === 'string' ? payload.path : '';
      return listDirectory(root, candidate);
    }
    case 'read':
      return readText(root, stringField(payload, 'path'));
    case 'write': {
      if (typeof payload.text !== 'string') {
        throw new FilesError('files/bad-request', 'The request is missing "text".');
      }
      const eol = payload.eol === 'crlf' ? 'crlf' : 'lf';
      return writeText(root, stringField(payload, 'path'), payload.text, stringField(payload, 'version'), eol, payload.bom === true);
    }
    case 'create':
      return createEntry(root, stringField(payload, 'path'), entryKindOf(payload));
    case 'rename':
      return renameEntry(root, stringField(payload, 'from'), stringField(payload, 'to'));
    case 'copy':
      return copyEntry(root, stringField(payload, 'from'), stringField(payload, 'to'));
    case 'delete':
      return removeEntry(root, stringField(payload, 'path'));
    case 'stat':
      return statEntry(root, stringField(payload, 'path'));
  }
}

/**
 * Build the endpoint handler that the HTTP route calls.
 * @param ctx the host context with `workspaceRegistry`.
 * @returns the handler.
 */
export function createHandler(ctx: HandlerContext): EndpointHandler {
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
    if (!isEndpoint(endpoint)) {
      return { ok: false, error: { code: 'files/bad-request', message: 'Unknown files endpoint.', details: {} } };
    }
    try {
      const value = await dispatch(ctx, endpoint, payloadOf(payload));
      return { ok: true, value };
    } catch (error) {
      if (error instanceof FilesError) {
        return {
          ok: false,
          error: { code: error.code, message: error.message, details: error.details },
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
