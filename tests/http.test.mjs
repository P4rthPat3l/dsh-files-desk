import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHandler } from '../lib/rpc.js';
import { registerFilesRoute } from '../lib/http.js';

let route;
let root;
let base;

async function request({ method = 'POST', url = '/files-rpc/list', payload, owner = true, reject = false }) {
  const body = payload === undefined ? '' : JSON.stringify(payload);
  const req = Readable.from(body === '' ? [] : [Buffer.from(body)]);
  req.method = method;
  req.url = url;
  req.headers = {
    'x-guest': owner ? 'no' : 'yes',
    'x-reject': reject ? 'yes' : 'no',
  };
  const res = {
    status: 0,
    headers: {},
    body: '',
    writeHead(status, headers) {
      this.status = status;
      this.headers = headers;
    },
    end(body = '') {
      this.body = body;
    },
  };
  await route.handler(req, res);
  return res;
}

function envelope(method, payload, rpcId = 'rpc-1') {
  return { type: 'client-request', rpcId, method, payload };
}

before(async () => {
  base = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-files-http-'));
  root = path.join(base, 'workspace');
  await fs.mkdir(root);
  await fs.writeFile(path.join(root, 'a.txt'), 'hello\n');
  const handler = createHandler({
    workspaceRegistry: { get: (id) => (id === 'ws' ? { id: 'ws', path: root } : undefined) },
  });
  registerFilesRoute(
    {
      webServer: {
        register(input) {
          route = input;
          return () => {};
        },
      },
      connection: {
        admit(req) {
          if (req.headers['x-reject'] === 'yes') return { rejection: 401 };
          return { peer: { principal: { kind: req.headers['x-guest'] === 'yes' ? 'guest' : 'owner' } } };
        },
      },
    },
    handler,
  );
});

after(async () => {
  await fs.rm(base, { recursive: true, force: true });
});

test('an owner receives the endpoint value', async () => {
  const res = await request({
    payload: envelope('list', { workspaceId: 'ws' }),
  });
  assert.equal(res.status, 200);
  const body = JSON.parse(res.body);
  assert.equal(body.type, 'server-response');
  assert.equal(body.rpcId, 'rpc-1');
  assert.equal(body.result.ok, true);
  assert.ok(body.result.value.entries.some((entry) => entry.name === 'a.txt'));
});

test('a non-owner receives files/forbidden', async () => {
  const res = await request({
    payload: envelope('list', { workspaceId: 'ws' }),
    owner: false,
  });
  const body = JSON.parse(res.body);
  assert.equal(res.status, 200);
  assert.equal(body.result.ok, false);
  assert.equal(body.result.error.code, 'files/forbidden');
});

test('a rejected connection gets the rejection status', async () => {
  const res = await request({ payload: envelope('list', {}), reject: true });
  assert.equal(res.status, 401);
});

test('a non-POST method is refused', async () => {
  const res = await request({ method: 'GET', payload: envelope('list', {}) });
  assert.equal(res.status, 405);
  assert.equal(res.headers.allow, 'POST');
});

test('invalid JSON and invalid envelopes are refused', async () => {
  const badJson = await request({ payload: 'not json' });
  assert.equal(badJson.status, 400);
  const badEnvelope = await request({ payload: { type: 'client-request' } });
  assert.equal(badEnvelope.status, 400);
  const mismatch = await request({ payload: envelope('read', {}) });
  assert.equal(mismatch.status, 400);
});

test('an unknown endpoint returns a structured error', async () => {
  const res = await request({ url: '/files-rpc/explode', payload: envelope('explode', { workspaceId: 'ws' }) });
  const body = JSON.parse(res.body);
  assert.equal(res.status, 200);
  assert.equal(body.result.ok, false);
  assert.equal(body.result.error.code, 'files/bad-request');
});
