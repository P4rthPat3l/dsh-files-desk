import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHandler } from '../dist/host/lib/rpc.js';

const peer = { principal: { kind: 'owner' } };
let base;
let root;
let outside;
let handler;

async function call(endpoint, payload = {}) {
  return handler(endpoint, { workspaceId: 'ws', ...payload }, undefined, peer);
}

async function value(endpoint, payload) {
  const result = await call(endpoint, payload);
  assert.equal(result.ok, true, `${endpoint} failed: ${JSON.stringify(result.error)}`);
  return result.value;
}

async function failure(endpoint, payload, code) {
  const result = await call(endpoint, payload);
  assert.equal(result.ok, false, `${endpoint} should have failed`);
  assert.equal(result.error.code, code, `${endpoint}: ${result.error.message}`);
  return result.error;
}

before(async () => {
  base = await fs.mkdtemp(path.join(os.tmpdir(), 'dsh-files-test-'));
  root = path.join(base, 'workspace');
  outside = path.join(base, 'outside');
  await fs.mkdir(root);
  await fs.mkdir(outside);
  await fs.writeFile(path.join(root, 'app.ts'), 'const answer = 42;\n');
  await fs.writeFile(path.join(root, 'crlf.txt'), 'one\r\ntwo\r\n');
  await fs.writeFile(path.join(root, 'bom.txt'), '\uFEFFhello');
  await fs.writeFile(path.join(root, 'empty.txt'), '');
  await fs.writeFile(path.join(root, 'binary.bin'), Buffer.from([0, 1, 2, 0, 3]));
  await fs.writeFile(path.join(root, 'latin1.txt'), Buffer.from([0x63, 0x61, 0x66, 0xe9]));
  await fs.writeFile(path.join(root, 'big.txt'), 'x'.repeat(5 * 1024 * 1024 + 1));
  await fs.mkdir(path.join(root, 'src', 'nested'), { recursive: true });
  await fs.writeFile(path.join(root, 'src', 'nested', 'deep.ts'), 'export {};\n');
  await fs.writeFile(path.join(outside, 'secret.txt'), 'outside\n');
  await fs.symlink(outside, path.join(root, 'link-out'));
  handler = createHandler({
    workspaceRegistry: {
      get: (id) => (id === 'ws' ? { id: 'ws', path: root } : undefined),
    },
  });
});

after(async () => {
  await fs.rm(base, { recursive: true, force: true });
});

describe('files route', () => {
  test('AC-002: list returns direct children with types and dotfiles', async () => {
    const listing = await value('list', {});
    const names = listing.entries.map((entry) => entry.name);
    assert.ok(names.includes('app.ts'));
    assert.ok(names.includes('src'));
    assert.equal(listing.entries.find((entry) => entry.name === 'src').type, 'directory');
    assert.equal(listing.entries.find((entry) => entry.name === 'app.ts').type, 'file');
    assert.equal(listing.truncated, false);
  });

  test('AC-003: read returns text, version, and line ending', async () => {
    const file = await value('read', { path: 'app.ts' });
    assert.equal(file.text, 'const answer = 42;\n');
    assert.equal(file.eol, 'lf');
    assert.match(file.version, /^\d+:\d+:\d+$/);
    assert.equal(file.path, path.join(root, 'app.ts'));
  });

  test('AC-003: read accepts an absolute path', async () => {
    const file = await value('read', { path: path.join(root, 'app.ts') });
    assert.equal(file.text, 'const answer = 42;\n');
  });

  test('AC-004: save writes atomically and returns the new version', async () => {
    const file = await value('read', { path: 'app.ts' });
    await fs.chmod(path.join(root, 'app.ts'), 0o640);
    const saved = await value('write', {
      path: 'app.ts',
      text: 'const answer = 43;\n',
      version: file.version,
    });
    assert.notEqual(saved.version, file.version);
    assert.equal(await fs.readFile(path.join(root, 'app.ts'), 'utf8'), 'const answer = 43;\n');
    const mode = (await fs.stat(path.join(root, 'app.ts'))).mode & 0o777;
    assert.equal(mode, 0o640, 'file mode is preserved');
    const leftovers = (await fs.readdir(root)).filter((name) => name.startsWith('.app.ts.'));
    assert.deepEqual(leftovers, [], 'no temp file remains');
  });

  test('AC-005: a stale save is refused and leaves the file untouched', async () => {
    const file = await value('read', { path: 'app.ts' });
    await fs.writeFile(path.join(root, 'app.ts'), 'agent wrote this\n');
    await failure('write', { path: 'app.ts', text: 'mine\n', version: file.version }, 'files/conflict');
    assert.equal(await fs.readFile(path.join(root, 'app.ts'), 'utf8'), 'agent wrote this\n');
  });

  test('BR-009: a CRLF file round-trips', async () => {
    const file = await value('read', { path: 'crlf.txt' });
    assert.equal(file.eol, 'crlf');
    assert.equal(file.text, 'one\ntwo\n');
    await value('write', { path: 'crlf.txt', text: 'one\nthree\n', version: file.version, eol: 'crlf' });
    assert.equal(await fs.readFile(path.join(root, 'crlf.txt'), 'utf8'), 'one\r\nthree\r\n');
  });

  test('BR-009: a BOM round-trips', async () => {
    const file = await value('read', { path: 'bom.txt' });
    assert.equal(file.bom, true);
    assert.equal(file.text, 'hello');
    await value('write', { path: 'bom.txt', text: 'bye', version: file.version, bom: true });
    assert.equal(await fs.readFile(path.join(root, 'bom.txt'), 'utf8'), '\uFEFFbye');
  });

  test('CASE-013: an empty file opens and saves', async () => {
    const file = await value('read', { path: 'empty.txt' });
    assert.equal(file.text, '');
    await value('write', { path: 'empty.txt', text: '', version: file.version });
    assert.equal(await fs.readFile(path.join(root, 'empty.txt'), 'utf8'), '');
  });

  test('BR-007: binary, non-UTF-8, and too-large files are refused', async () => {
    await failure('read', { path: 'binary.bin' }, 'files/binary');
    await failure('read', { path: 'latin1.txt' }, 'files/not-utf8');
    await failure('read', { path: 'big.txt' }, 'files/too-large');
  });

  test('AC-007: create makes a file and a folder, and refuses an existing name', async () => {
    const file = await value('create', { path: `notes-${process.pid}.md`, kind: 'file' });
    assert.equal(await fs.readFile(file.path, 'utf8'), '');
    const folder = await value('create', { path: `folder-${process.pid}`, kind: 'directory' });
    assert.equal((await fs.stat(folder.path)).isDirectory(), true);
    await failure('create', { path: `folder-${process.pid}`, kind: 'directory' }, 'files/exists');
    await failure('create', { path: `missing-${process.pid}/x.md`, kind: 'file' }, 'files/not-found');
    await failure('create', { path: 'x', kind: 'socket' }, 'files/bad-request');
  });

  test('AC-008: rename moves an entry and refuses collisions', async () => {
    const from = `renamed-${process.pid}.ts`;
    await fs.writeFile(path.join(root, from), 'x');
    await value('rename', { from, to: `${from}.bak` });
    assert.equal(await fs.readFile(path.join(root, `${from}.bak`), 'utf8'), 'x');
    await failure('rename', { from: `${from}.bak`, to: 'app.ts' }, 'files/exists');
    await failure('rename', { from: `${from}.bak`, to: `${from}.bak` }, 'files/exists');
    await fs.rm(path.join(root, `${from}.bak`));
  });

  test('AC-010: copy handles files and folders and refuses an existing target', async () => {
    const copied = await value('copy', { from: 'src', to: `copy-${process.pid}` });
    assert.equal(await fs.readFile(path.join(copied.path, 'nested', 'deep.ts'), 'utf8'), 'export {};\n');
    await failure('copy', { from: 'src', to: `copy-${process.pid}` }, 'files/exists');
    await failure('copy', { from: 'src', to: 'src/inside' }, 'files/bad-request');
    await fs.rm(copied.path, { recursive: true });
  });

  test('CASE-007: symlinks are refused for copy', async () => {
    await failure('copy', { from: 'link-out', to: `link-copy-${process.pid}` }, 'files/symlink');
  });

  test('AC-009: delete removes files and folders and refuses the root', async () => {
    const file = `delete-${process.pid}.txt`;
    await fs.writeFile(path.join(root, file), 'x');
    await value('delete', { path: file });
    assert.equal(await fs.stat(path.join(root, file)).catch(() => null), null);
    await failure('delete', { path: '.' }, 'files/bad-request');
    await failure('delete', { path: 'missing-file.txt' }, 'files/not-found');
  });

  test('AC-014: writes outside the workspace are refused', async () => {
    await failure('write', { path: path.join(outside, 'secret.txt'), text: 'x', version: '1:1:1' }, 'files/outside-workspace');
    await failure('rename', { from: 'app.ts', to: path.join(outside, 'app.ts') }, 'files/outside-workspace');
    await failure('delete', { path: path.join(outside, 'secret.txt') }, 'files/outside-workspace');
    await failure('create', { path: path.join(outside, 'new.txt'), kind: 'file' }, 'files/outside-workspace');
    await failure('write', { path: 'link-out/secret.txt', text: 'x', version: '1:1:1' }, 'files/outside-workspace');
    assert.equal(await fs.readFile(path.join(outside, 'secret.txt'), 'utf8'), 'outside\n');
  });

  test('SEC-003: reads outside the workspace are allowed and read-only', async () => {
    const file = await value('read', { path: path.join(outside, 'secret.txt') });
    assert.equal(file.text, 'outside\n');
    await failure('write', { path: path.join(outside, 'secret.txt'), text: 'x', version: file.version }, 'files/outside-workspace');
  });

  test('CASE-002: stat reports a version that save accepts', async () => {
    const stat = await value('stat', { path: 'app.ts' });
    const saved = await value('write', { path: 'app.ts', text: 'stat based\n', version: stat.version });
    assert.equal(saved.size, 'stat based\n'.length);
  });

  test('validation and authorization', async () => {
    await failure('read', {}, 'files/bad-request');
    await failure('read', { path: '' }, 'files/bad-request');
    await failure('nope', {}, 'files/bad-request');
    const noWorkspace = await call('list', { workspaceId: 'missing' });
    assert.equal(noWorkspace.ok, false);
    assert.equal(noWorkspace.error.code, 'files/no-workspace');
    const anonymous = await handler('list', { workspaceId: 'ws' }, undefined, { principal: { kind: 'guest' } });
    assert.equal(anonymous.ok, false);
    assert.equal(anonymous.error.code, 'files/forbidden');
  });
});
