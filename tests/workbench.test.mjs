import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { installDom, loadChunk, settle } from './dom.mjs';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

/**
 * Build a stub plugin context with a stubbed files route.
 * @returns {{ ctx: object, calls: Array<object> }} the context and its calls.
 */
function stubContext() {
  const calls = [];
  const menus = [];
  const ctx = {
    connection: {
      rpc: {
        async call(route, endpoint, payload) {
          calls.push({ endpoint, payload });
          if (endpoint === 'list') {
            return {
              ok: true,
              value: {
                path: '/tmp/ws',
                entries: [
                  { name: 'src', type: 'directory' },
                  { name: 'a.ts', type: 'file', size: 10 },
                ],
                truncated: false,
              },
            };
          }
          if (endpoint === 'read') {
            return {
              ok: true,
              value: {
                path: '/tmp/ws/a.ts',
                text: 'const a = 1;\n',
                version: '1:12:5',
                eol: 'lf',
                bom: false,
                size: 12,
              },
            };
          }
          if (endpoint === 'stat') {
            return { ok: true, value: { path: '/tmp/ws/a.ts', version: '1:12:5', size: 12, mtimeMs: 1 } };
          }
          return { ok: true, value: {} };
        },
      },
    },
    locale: {
      register() {},
      bind() {
        return (key) => key;
      },
    },
    sidebarRight: { openResource() {}, openTab() {} },
    sidebarRightTabs: { register: () => () => {} },
    slots: {
      inject(name, callback) {
        callback();
      },
      register: () => () => {},
    },
    contextMenus: {
      register(input) {
        menus.push(input);
        return () => {};
      },
    },
    effect: (effect) => effect(),
  };
  return { ctx, calls, menus };
}

/**
 * Load the main client bundle with the editor chunk available.
 * @param {object} chunk - the editor chunk exports.
 * @returns {Promise<object>} the plugin exports and module table.
 */
async function loadPlugin(chunk) {
  const source = await fs.readFile(path.join(root, 'client.js'), 'utf8');
  let definition;
  const window = { __ModuleLoader__: { load(value) { definition = value; } } };
  const facade = new Function('window', source);
  facade(window);
  assert.ok(definition, 'the main bundle did not call the module loader');
  const requireModule = (specifier) => {
    if (specifier === 'react') return require('react');
    if (specifier === 'react-dom') return require('react-dom');
    if (specifier === 'react/jsx-runtime') return require('react/jsx-runtime');
    if (specifier === 'react-dom/client') return require('react-dom/client');
    throw new Error(`Unexpected module ${specifier}`);
  };
  requireModule.async = async (name) => {
    if (name === './client.editor.js') return chunk;
    throw new Error(`Unexpected chunk ${name}`);
  };
  return definition.factory(requireModule);
}

test('the workbench mounts, lists the root, and shows the empty editor state', async () => {
  installDom();
  const chunk = await loadChunk();
  const plugin = await loadPlugin(chunk);
  const { ctx, calls } = stubContext();
  plugin.apply(ctx);

  const React = require('react');
  const { createRoot } = require('react-dom/client');
  const container = document.getElementById('host');
  const reactRoot = createRoot(container);
  reactRoot.render(
    React.createElement(plugin.FilesWorkbench, {
      t: (key) => key,
      sessionId: 's1',
      useTabInfo: () => ({ tab: { navigation: { params: {} } }, panel: { id: 'p1' } }),
      useSessions: (select) => select({ byId: { s1: { cwd: '/tmp/ws' } } }),
      useWorkspaces: (select) => select({ items: [{ workspaceId: 'ws1', path: '/tmp/ws', sessionIds: ['s1'] }] }),
      useContextMenu: () => ({ getTriggerProps: () => ({}) }),
      renderFactorySlot: () => null,
    }),
  );
  await settle(80);
  assert.ok(container.querySelector('[data-dsh-files]'), 'the workbench root did not render');
  assert.ok(container.textContent.includes('empty.select'), 'the empty editor state is missing');
  assert.ok(container.textContent.includes('tree.unavailable'), 'the tree fallback is missing');
  assert.ok(calls.some((call) => call.endpoint === 'list' && call.payload.path === '/tmp/ws'), 'the root was not listed');
  reactRoot.unmount();
});

test('the editor tab reads the address and mounts CodeMirror', async () => {
  installDom();
  const chunk = await loadChunk();
  const plugin = await loadPlugin(chunk);
  const { ctx } = stubContext();
  plugin.apply(ctx);

  const React = require('react');
  const { createRoot } = require('react-dom/client');
  const container = document.getElementById('second');
  const reactRoot = createRoot(container);
  reactRoot.render(
    React.createElement(plugin.EditorTab, {
      t: (key) => key,
      sessionId: 's1',
      useTabInfo: () => ({
        tab: {
          id: 'tab-1',
          contentId: 'dsh-resource://file/session/s1/a.ts',
          navigation: { address: 'dsh-resource://file/session/s1/a.ts', params: {} },
        },
        panel: { id: 'p1' },
      }),
      useSessions: (select) => select({ byId: { s1: { cwd: '/tmp/ws' } } }),
      useWorkspaces: (select) => select({ items: [{ workspaceId: 'ws1', path: '/tmp/ws', sessionIds: ['s1'] }] }),
    }),
  );
  await settle(150);
  assert.ok(container.querySelector('.cm-editor'), 'CodeMirror did not mount in the editor tab');
  assert.ok(container.textContent.includes('a.ts'), 'the file name is missing from the header');
  reactRoot.unmount();
});

test('the shared file menu exposes the file operations and cut arms paste', async () => {
  installDom();
  const chunk = await loadChunk();
  const plugin = await loadPlugin(chunk);
  const { ctx, menus } = stubContext();
  plugin.apply(ctx);

  const React = require('react');
  const { createRoot } = require('react-dom/client');
  const container = document.getElementById('host');
  const reactRoot = createRoot(container);
  reactRoot.render(
    React.createElement(plugin.FilesWorkbench, {
      t: (key) => key,
      sessionId: 's1',
      useTabInfo: () => ({ tab: { navigation: { params: {} } }, panel: { id: 'p1' } }),
      useSessions: (select) => select({ byId: { s1: { cwd: '/tmp/ws' } } }),
      useWorkspaces: (select) => select({ items: [{ workspaceId: 'ws1', path: '/tmp/ws', sessionIds: ['s1'] }] }),
      useContextMenu: () => ({ getTriggerProps: () => ({}) }),
      renderFactorySlot: () => null,
    }),
  );
  await settle(80);

  const fileMenu = menus.find((menu) => menu.target === 'file');
  assert.ok(fileMenu, 'no file menu registered');
  const directoryMenu = menus.find((menu) => menu.target === 'directory');
  assert.ok(directoryMenu, 'no directory menu registered');
  const signal = new AbortController().signal;
  const fileActions = fileMenu.resolve({ sessionId: 's1', path: '/tmp/ws/a.ts', paneId: 'p1' }, signal);
  const ids = fileActions.map((action) => action.id);
  for (const id of ['open', 'preview', 'reveal', 'copy-path', 'rename', 'duplicate', 'cut', 'copy', 'delete']) {
    assert.ok(ids.includes(id), `missing file action ${id}`);
  }
  const before = directoryMenu.resolve({ sessionId: 's1', path: '/tmp/ws' }, signal);
  assert.equal(before.find((action) => action.id === 'paste').disabled, true, 'paste should start disabled');
  fileActions.find((action) => action.id === 'cut').run();
  const after = directoryMenu.resolve({ sessionId: 's1', path: '/tmp/ws' }, signal);
  assert.equal(after.find((action) => action.id === 'paste').disabled, false, 'paste should be enabled after cut');
  assert.equal(after.some((action) => action.id === 'rename'), false, 'the workspace root is not renamed');
  reactRoot.unmount();
});
