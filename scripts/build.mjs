import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const EXTERNAL = ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'];

/**
 * Bundle one entry and return its CommonJS text.
 * @param {string} entry - entry file relative to the repository.
 * @returns {Promise<string>} the bundled text.
 */
async function bundle(entry) {
  const result = await build({
    entryPoints: [path.join(ROOT, entry)],
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'browser',
    target: ['chrome120'],
    minify: true,
    sourcemap: false,
    jsx: 'automatic',
    jsxImportSource: 'react',
    external: EXTERNAL,
    logLevel: 'silent',
  });
  if (result.errors.length > 0) {
    for (const error of result.errors) console.error(error.text);
    throw new Error(`Bundle failed: ${entry}`);
  }
  return result.outputFiles[0].text;
}

/**
 * Wrap a CommonJS bundle in the harness module loader format.
 * @param {string} js - the bundled text.
 * @param {{ id: string, chunk?: string, bridge?: boolean }} options - loader options.
 * @returns {string} the client artifact.
 */
function wrap(js, options) {
  const chunkLine = options.chunk === undefined ? '' : `\n  chunk: ${JSON.stringify(options.chunk)},`;
  const bridge = options.bridge === true
    ? '\n    globalThis.__dshFilesDeskRequireAsync = require.async;'
    : '';
  return `window.__ModuleLoader__.load({
  id: ${JSON.stringify(options.id)},${chunkLine}
  factory(require) {
    var module = { exports: {} };
    var exports = module.exports;${bridge}
${js}
    return module.exports;
  },
});
`;
}

const main = await bundle('src/client/index.js');
const editor = await bundle('src/client/editor/entry.js');
await fs.writeFile(path.join(ROOT, 'client.js'), wrap(main, { id: 'dsh-files-desk', bridge: true }));
await fs.writeFile(path.join(ROOT, 'client.editor.js'), wrap(editor, { id: 'dsh-files-desk', chunk: 'client.editor.js' }));
console.log(`client.js ${main.length} bytes`);
console.log(`client.editor.js ${editor.length} bytes`);
