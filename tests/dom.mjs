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
export function installDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="host"></div><div id="second"></div></body></html>', {
    pretendToBeVisual: true,
    url: 'http://localhost/',
  });
  const window = dom.window;
  global.window = window;
  global.document = window.document;
  Object.defineProperty(global, 'navigator', { value: window.navigator, configurable: true });
  global.getComputedStyle = window.getComputedStyle.bind(window);
  global.requestAnimationFrame = window.requestAnimationFrame.bind(window);
  global.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
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
  global.Window = window.Window;
  global.Document = window.Document;
  global.ShadowRoot = window.ShadowRoot;
  global.HTMLIFrameElement = window.HTMLIFrameElement;
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
export async function loadChunk() {
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
  const requireModule = () => {
    throw new Error('The editor chunk requires no modules.');
  };
  requireModule.async = async () => ({});
  return definition.factory(requireModule);
}

/**
 * Wait for effects and promises to settle.
 * @param {number} [ms] - the delay.
 * @returns {Promise<void>} resolution.
 */
export function settle(ms = 40) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
