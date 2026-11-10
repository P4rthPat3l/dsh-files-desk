import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

/**
 * Install a jsdom window as the global browser environment.
 * @returns {JSDOM} the DOM.
 */
function installDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="host"></div></body></html>', {
    pretendToBeVisual: true,
    url: 'http://localhost/',
  });
  const window = dom.window;
  global.window = window;
  global.document = window.document;
  Object.defineProperty(global, 'navigator', { value: window.navigator, configurable: true });
  global.getComputedStyle = window.getComputedStyle.bind(window);
  global.DOMRect = window.DOMRect;
  global.Range = window.Range;
  global.Node = window.Node;
  global.Element = window.Element;
  global.HTMLElement = window.HTMLElement;
  global.Text = window.Text;
  global.Event = window.Event;
  global.KeyboardEvent = window.KeyboardEvent;
  global.MouseEvent = window.MouseEvent;
  global.MutationObserver = window.MutationObserver;
  global.selectedText = '';
  global.requestAnimationFrame = window.requestAnimationFrame.bind(window);
  global.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  return dom;
}

/**
 * Load the lazy editor chunk and return its exports.
 * @returns {Promise<object>} the chunk exports.
 */
async function loadChunk() {
  const source = await fs.readFile(path.join(root, 'client.editor.js'), 'utf8');
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
  assert.ok(definition, 'the editor chunk did not call the module loader');
  assert.equal(definition.chunk, 'client.editor.js');
  const requireModule = (specifier) => {
    throw new Error(`Unexpected module ${specifier}`);
  };
  requireModule.async = async () => ({});
  return definition.factory(requireModule);
}

test('the editor chunk renders, edits, and reports its cursor', async () => {
  installDom();
  const chunk = await loadChunk();
  assert.equal(typeof chunk.createEditor, 'function');
  const parent = document.getElementById('host');
  const positions = [];
  const changes = [];
  let saves = 0;
  const handle = chunk.createEditor({
    parent,
    doc: 'const answer = 42;\n',
    language: 'typescript',
    readOnly: false,
    wrap: false,
    tabSize: 2,
    onChange: (text) => changes.push(text),
    onCursor: (position) => positions.push(position),
    onSave: () => {
      saves += 1;
    },
  });
  assert.ok(parent.querySelector('.cm-editor'), 'the editor did not render');
  assert.equal(handle.getText(), 'const answer = 42;\n');
  handle.view.dispatch({ changes: { from: 0, insert: '// note\n' } });
  assert.equal(handle.getText(), '// note\nconst answer = 42;\n');
  assert.equal(changes.at(-1), '// note\nconst answer = 42;\n');
  handle.view.dispatch({ selection: { anchor: 10 } });
  assert.deepEqual(positions.at(-1), { line: 2, column: 3 });
  handle.revealLine(2);
  handle.setText('export {};\n');
  assert.equal(handle.getText(), 'export {};\n');
  handle.destroy();
});

test('the editor refuses edits in read-only mode', async () => {
  installDom();
  const chunk = await loadChunk();
  const parent = document.getElementById('host');
  const handle = chunk.createEditor({ parent, doc: 'fixed\n', language: 'text', readOnly: true });
  const content = parent.querySelector('.cm-content');
  assert.equal(content.getAttribute('contenteditable'), 'false');
  assert.equal(handle.getText(), 'fixed\n');
  handle.destroy();
});
