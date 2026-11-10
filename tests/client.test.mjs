import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { addressFor, canEditAddress, parseAddress } from '../src/client/api.ts';
import { EN, ZH } from '../src/client/locale.ts';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

/**
 * Load a built client artifact and return its loader definition.
 * @param {string} name - the artifact file name.
 * @param {(specifier: string) => unknown} modules - the module table.
 * @returns {Promise<object>} the definition.
 */
async function loadArtifact(name, modules) {
  const source = await fs.readFile(path.join(root, name), 'utf8');
  let definition;
  const window = {
    __ModuleLoader__: {
      load(value) {
        definition = value;
      },
    },
  };
  const facade = new Function('window', source);
  facade(window);
  assert.ok(definition, `${name} did not call the module loader`);
  const requireModule = (specifier) => {
    if (specifier === 'react') return require('react');
    if (specifier === 'react-dom') return require('react-dom');
    if (specifier === 'react/jsx-runtime') return require('react/jsx-runtime');
    if (specifier === 'react-dom/client') return require('react-dom/client');
    if (modules[specifier] !== undefined) return modules[specifier];
    throw new Error(`Unexpected module ${specifier}`);
  };
  requireModule.async = async (chunk) => {
    if (modules[chunk] === undefined) throw new Error(`Unexpected chunk ${chunk}`);
    return modules[chunk];
  };
  return { definition, requireModule };
}

/**
 * A stub plugin context that records registrations.
 * @returns {{ ctx: object, records: object }} the context and its records.
 */
function stubContext() {
  const records = { tabs: [], slots: [], menus: [] };
  const ctx = {
    connection: { rpc: { call: async () => ({ ok: true, value: {} }) } },
    locale: {
      register() {},
      bind() {
        return (key) => key;
      },
      subscribe() {
        return () => {};
      },
    },
    sidebarRight: { openResource() {}, openTab() {} },
    sidebarRightTabs: {
      register(definition) {
        records.tabs.push(definition);
        return () => {};
      },
    },
    slots: {
      inject(name, callback) {
        callback();
      },
      register(options, component) {
        records.slots.push({ options, component });
        return () => {};
      },
    },
    contextMenus: {
      register(input) {
        records.menus.push(input);
        return () => {};
      },
    },
    effect(effect) {
      return effect();
    },
  };
  return { ctx, records };
}

test('AC-001: the client bundle takes over kind files at the extension band', async () => {
  const { definition, requireModule } = await loadArtifact('client.js', {});
  const plugin = definition.factory(requireModule);
  assert.ok(Array.isArray(plugin.inject));
  assert.ok(plugin.inject.includes('sidebarRightTabs'));
  assert.ok(plugin.inject.includes('contextMenus'));
  const { ctx, records } = stubContext();
  plugin.apply(ctx);
  const files = records.tabs.find((tab) => tab.kind === 'files');
  assert.ok(files, 'no files tab type registered');
  assert.equal(files.id, 'dsh-files-desk');
  assert.equal(files.priority, 'extension');
  assert.equal(files.guide.length, 1, 'the Files card is missing');
  assert.equal(files.guide[0].commandId, 'workspace.files');
  const editor = records.tabs.find((tab) => tab.kind === 'editor');
  assert.ok(editor, 'no editor tab type registered');
  assert.equal(editor.id, 'dsh-files-desk/editor');
  assert.equal(editor.priority, 'extension');
  assert.deepEqual(editor.patterns, ['dsh-resource://file/**']);
  assert.equal(editor.canOpen('dsh-resource://file/session/s1/home/me/app.ts'), true);
  assert.equal(editor.canOpen('dsh-resource://file/session/s1/home/me/photo.png'), false);
  assert.equal(records.slots.length, 5);
  const slotNames = records.slots.map((slot) => `${slot.options.name}:${slot.options.key ?? slot.options.id}`);
  assert.deepEqual(slotNames.sort(), [
    'shell.overlay:dsh-files-ops',
    'sidebar.right.pane.tab.title:dsh-files-desk',
    'sidebar.right.pane.tab.title:dsh-files-desk/editor',
    'sidebar.right.pane.tab:dsh-files-desk',
    'sidebar.right.pane.tab:dsh-files-desk/editor',
  ]);
  assert.deepEqual(records.menus.map((menu) => menu.target).sort(), ['directory', 'file', 'image']);
});

test('addresses round-trip between absolute and session-relative paths', () => {
  const root = '/home/me/project';
  const absolute = addressFor('s1', root, `${root}/src/app.ts`);
  assert.equal(absolute, 'dsh-resource://file/session/s1/src/app.ts');
  assert.deepEqual(parseAddress(absolute), { sessionId: 's1', path: 'src/app.ts' });
  const relative = addressFor('s1', root, 'src/app.ts');
  assert.equal(relative, absolute);
  const outside = addressFor('s1', root, '/tmp/other.ts');
  assert.deepEqual(parseAddress(outside), { sessionId: 's1', path: '/tmp/other.ts' });
});

test('AC-010: the editor claims text and refuses binary resources', () => {
  assert.equal(canEditAddress('dsh-resource://file/session/s1/a.ts'), true);
  assert.equal(canEditAddress('dsh-resource://file/session/s1/a.md'), true);
  assert.equal(canEditAddress('dsh-resource://file/session/s1/a.png'), false);
  assert.equal(canEditAddress('dsh-resource://file/session/s1/a.zip'), false);
  assert.equal(canEditAddress('dsh-resource://file/session/s1/a.unknown'), true);
  assert.equal(canEditAddress('dsh-resource://session/s1/a.ts'), false);
});

test('AC-015: every source string key exists in both dictionaries', async () => {
  const files = await fs.readdir(path.join(root, 'src/client'), { withFileTypes: true });
  const sources = [];
  for (const entry of files) {
    if (entry.isFile() && /\.(js|jsx)$/.test(entry.name)) {
      sources.push(await fs.readFile(path.join(root, 'src/client', entry.name), 'utf8'));
    }
  }
  const keys = new Set();
  for (const source of sources) {
    for (const match of source.matchAll(/\b(?:t|tr)\('([^']+)'/g)) keys.add(match[1]);
    for (const match of source.matchAll(/\b(?:t|tr)\(\s*'([^']+)'/g)) keys.add(match[1]);
  }
  const missingEn = [...keys].filter((key) => EN[key] === undefined);
  const missingZh = [...keys].filter((key) => ZH[key] === undefined);
  assert.deepEqual(missingEn, [], 'EN is missing keys');
  assert.deepEqual(missingZh, [], 'ZH is missing keys');
  assert.deepEqual(Object.keys(EN).sort(), Object.keys(ZH).sort(), 'dictionary keys differ');
});
