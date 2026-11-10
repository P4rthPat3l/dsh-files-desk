import { clipboard, contexts } from './store.js';
import { tr } from './locale.js';
import {
  copyPath,
  deleteEntry,
  duplicateEntry,
  newFile,
  newFolder,
  openInEditor,
  openPreview,
  pasteInto,
  renameEntry,
  revealInFiles,
  setFileClipboard,
} from './ops.js';

/**
 * The actions for a file target.
 * @param {{ sessionId: string, path: string, line?: number }} value - the captured target.
 * @returns {Array<object>} the menu actions.
 */
function fileActions(value) {
  const { sessionId, path } = value;
  const line = typeof value.line === 'number' ? value.line : undefined;
  const actions = [
    { id: 'open', label: tr('menu.openInEditor'), run: () => openInEditor(sessionId, path, line) },
    { id: 'preview', label: tr('menu.preview'), run: () => openPreview(sessionId, path, line) },
    { id: 'reveal', label: tr('menu.reveal'), run: () => revealInFiles(path) },
    { id: 'copy-path', label: tr('menu.copyPath'), run: () => void copyPath(path) },
  ];
  const context = contexts.get(sessionId);
  if (context !== undefined) {
    actions.push(
      { id: 'rename', label: tr('menu.rename'), run: () => void renameEntry(sessionId, path) },
      { id: 'duplicate', label: tr('menu.duplicate'), run: () => void duplicateEntry(sessionId, path) },
      { id: 'cut', label: tr('menu.cut'), run: () => setFileClipboard(sessionId, path, 'cut') },
      { id: 'copy', label: tr('menu.copy'), run: () => setFileClipboard(sessionId, path, 'copy') },
    );
    if (path !== context.root) {
      actions.push({ id: 'delete', label: tr('menu.delete'), run: () => void deleteEntry(sessionId, path, false) });
    }
  }
  return actions;
}

/**
 * The actions for a directory target.
 * @param {{ sessionId: string, path: string }} value - the captured target.
 * @returns {Array<object>} the menu actions.
 */
function directoryActions(value) {
  const { sessionId, path } = value;
  const context = contexts.get(sessionId);
  const actions = [];
  if (context !== undefined) {
    actions.push(
      { id: 'new-file', label: tr('menu.newFileHere'), run: () => void newFile(sessionId, path) },
      { id: 'new-folder', label: tr('menu.newFolderHere'), run: () => void newFolder(sessionId, path) },
      {
        id: 'paste',
        label: tr('menu.paste'),
        disabled: clipboard.path === null,
        run: () => void pasteInto(sessionId, path),
      },
    );
    if (path !== context.root) {
      actions.push(
        { id: 'rename', label: tr('menu.rename'), run: () => void renameEntry(sessionId, path) },
        { id: 'cut', label: tr('menu.cut'), run: () => setFileClipboard(sessionId, path, 'cut') },
        { id: 'copy', label: tr('menu.copy'), run: () => setFileClipboard(sessionId, path, 'copy') },
        { id: 'delete', label: tr('menu.delete'), run: () => void deleteEntry(sessionId, path, true) },
      );
    }
  }
  actions.push({ id: 'copy-path', label: tr('menu.copyPath'), run: () => void copyPath(path) });
  return actions;
}

/**
 * The actions for an image target.
 * @param {{ path: string }} value - the captured target.
 * @returns {Array<object>} the menu actions.
 */
function imageActions(value) {
  return [
    { id: 'reveal', label: tr('menu.reveal'), run: () => revealInFiles(value.path) },
    { id: 'copy-path', label: tr('menu.copyPath'), run: () => void copyPath(value.path) },
  ];
}

/**
 * Register the shared file, directory, and image menu contributions.
 * @param {object} ctx - the plugin context.
 */
export function registerMenus(ctx) {
  const families = [
    { target: 'file', resolve: fileActions },
    { target: 'directory', resolve: directoryActions },
    { target: 'image', resolve: imageActions },
  ];
  for (const family of families) {
    ctx.effect(
      () =>
        ctx.contextMenus.register({
          id: `dsh-files-desk/${family.target}`,
          target: family.target,
          order: 70,
          resolve: (value) => family.resolve(value),
        }),
      `dsh-files-desk: ${family.target} menu`,
    );
  }
}
