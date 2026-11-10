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
import type { ClientContext, MenuAction, MenuRegistration } from './harness.js';

/**
 * The actions for a file target.
 * @param value the captured target.
 * @returns the menu actions.
 */
function fileActions(value: { sessionId: string; path: string; line?: number }): MenuAction[] {
  const { sessionId, path } = value;
  const line = typeof value.line === 'number' ? value.line : undefined;
  const actions: MenuAction[] = [
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
 * @param value the captured target.
 * @returns the menu actions.
 */
function directoryActions(value: { sessionId: string; path: string }): MenuAction[] {
  const { sessionId, path } = value;
  const context = contexts.get(sessionId);
  const actions: MenuAction[] = [];
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
 * @param value the captured target.
 * @returns the menu actions.
 */
function imageActions(value: { path: string }): MenuAction[] {
  return [
    { id: 'reveal', label: tr('menu.reveal'), run: () => revealInFiles(value.path) },
    { id: 'copy-path', label: tr('menu.copyPath'), run: () => void copyPath(value.path) },
  ];
}

/**
 * Read the target fields one menu family needs.
 * @param value the menu target.
 * @returns the target as a record.
 */
function targetOf(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

/**
 * Read one required string from a menu target.
 * @param value the menu target.
 * @param key the field name.
 * @returns the field value.
 */
function stringOf(value: Record<string, unknown>, key: string): string {
  const field = value[key];
  return typeof field === 'string' ? field : '';
}

/**
 * Read the optional line from a menu target.
 * @param value the menu target.
 * @returns the line, when present.
 */
function lineOf(value: Record<string, unknown>): number | undefined {
  const line = value.line;
  return typeof line === 'number' ? line : undefined;
}

/**
 * Register the shared file, directory, and image menu contributions.
 * @param ctx the plugin context.
 */
export function registerMenus(ctx: ClientContext): void {
  const families: MenuRegistration[] = [
    {
      id: 'dsh-files-desk/file',
      target: 'file',
      order: 70,
      resolve: (value) => {
        const target = targetOf(value);
        return fileActions({
          sessionId: stringOf(target, 'sessionId'),
          path: stringOf(target, 'path'),
          line: lineOf(target),
        });
      },
    },
    {
      id: 'dsh-files-desk/directory',
      target: 'directory',
      order: 70,
      resolve: (value) => {
        const target = targetOf(value);
        return directoryActions({ sessionId: stringOf(target, 'sessionId'), path: stringOf(target, 'path') });
      },
    },
    {
      id: 'dsh-files-desk/image',
      target: 'image',
      order: 70,
      resolve: (value) => imageActions({ path: stringOf(targetOf(value), 'path') }),
    },
  ];
  for (const family of families) {
    ctx.effect(() => ctx.contextMenus.register(family), `dsh-files-desk: ${family.target} menu`);
  }
}
