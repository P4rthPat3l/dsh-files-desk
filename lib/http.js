const MAX_BODY = 16 * 1024 * 1024;
const PREFIX = '/files-rpc';

/**
 * Write one JSON response.
 * @param {import('node:http').ServerResponse} res - the response.
 * @param {number} status - the HTTP status.
 * @param {unknown} payload - the JSON body.
 */
function respond(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(body, 'utf8'),
    'cache-control': 'no-store',
  });
  res.end(body);
}

/**
 * Build one failure envelope.
 * @param {string} rpcId - the request id.
 * @param {string} code - the stable error code.
 * @param {string} message - the message.
 * @returns {object} the envelope.
 */
function failure(rpcId, code, message) {
  return {
    type: 'server-response',
    rpcId,
    result: {
      ok: false,
      error: { code, message, details: {} },
    },
  };
}

/**
 * Read a request body under the size cap.
 * @param {import('node:http').IncomingMessage} req - the request.
 * @returns {Promise<string>} the body text.
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let tooLarge = false;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        tooLarge = true;
        chunks.length = 0;
        return;
      }
      if (!tooLarge) chunks.push(chunk);
    });
    req.on('end', () => {
      if (tooLarge) reject(new Error('body-too-large'));
      else resolve(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', reject);
  });
}

/**
 * Register the authenticated files channel.
 *
 * The browser never touches the filesystem. This route admits the request
 * through the connection service, checks the owner principal, and dispatches
 * one endpoint. The handler returns the `{ ok, value }` or `{ ok, error }`
 * envelope, so the transport stays thin.
 *
 * @param {{ webServer: { register(route: object): () => void }, connection: { admit(request: object): object } }} ctx - host context.
 * @param {(endpoint: string, payload: unknown, signal: AbortSignal | undefined, peer: object | undefined) => Promise<unknown>} handler - the endpoint handler.
 * @returns {() => void} route disposer.
 */
export function registerFilesRoute(ctx, handler) {
  return ctx.webServer.register({
    kind: 'prefix',
    path: PREFIX,
    handler: async (req, res) => {
      let admission;
      try {
        admission = ctx.connection.admit(req);
      } catch {
        respond(res, 500, failure('unknown', 'files/internal', 'The files channel failed.'));
        return;
      }
      if ('rejection' in admission) {
        res.writeHead(admission.rejection);
        res.end(admission.rejection === 401 ? 'unauthorized' : 'forbidden');
        return;
      }
      if (req.method !== 'POST') {
        res.writeHead(405, { allow: 'POST' });
        res.end('method not allowed');
        return;
      }
      let endpoint;
      try {
        const url = new URL(req.url ?? '/', 'http://localhost');
        if (!url.pathname.startsWith(`${PREFIX}/`)) {
          respond(res, 404, failure('unknown', 'files/not-found', 'Unknown files endpoint.'));
          return;
        }
        endpoint = decodeURIComponent(url.pathname.slice(PREFIX.length + 1));
      } catch {
        respond(res, 400, failure('unknown', 'files/bad-request', 'The files endpoint is invalid.'));
        return;
      }
      let text;
      try {
        text = await readBody(req);
      } catch {
        respond(res, 413, failure('unknown', 'files/body-too-large', 'The files request is too large.'));
        return;
      }
      let message;
      try {
        message = JSON.parse(text);
      } catch {
        respond(res, 400, failure('unknown', 'files/bad-request', 'The files request is not valid JSON.'));
        return;
      }
      if (
        message === null ||
        typeof message !== 'object' ||
        message.type !== 'client-request' ||
        typeof message.rpcId !== 'string' ||
        typeof message.method !== 'string'
      ) {
        respond(res, 400, failure('unknown', 'files/bad-request', 'The files request envelope is invalid.'));
        return;
      }
      if (message.method !== endpoint) {
        respond(
          res,
          400,
          failure(message.rpcId, 'files/bad-request', 'The files endpoint does not match the request method.'),
        );
        return;
      }
      if (admission.peer.principal?.kind !== 'owner') {
        respond(res, 200, failure(message.rpcId, 'files/forbidden', 'Files are available only to the local user.'));
        return;
      }
      const result = await handler(endpoint, message.payload, undefined, admission.peer);
      respond(res, 200, { type: 'server-response', rpcId: message.rpcId, result });
    },
  });
}
