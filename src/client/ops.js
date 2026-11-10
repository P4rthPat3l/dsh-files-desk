import { addressFor, basename, call, dirname, errorKey, joinPath } from './api.js';
import { askConfirm, askName, clipboard, contexts, notify } from './store.js';
import { tr } from './locale.js';
import { runtime } from './runtime.js';

const PREVIEW_KIND = 'text';

/**
 * Show a failed operation as a notice.
 * @param {object} error - the failure.
 */
export function report(error) {
  notify(tr(errorKey(error?.code)), 'error');
}

/**
 * Reject a name that would change the parent directory.
 * @param {string} name - the submitted name.
 */
function assertSimpleName(name) {
  if (name.includes('/') || name.includes('\\') || name === '.' || name === '..') {
    const error = new Error('A name without path separators is required.');
    error.code = 'files/name';
    throw error;
  }
}

/**
 * Open one path in the editor tab at a line.
 * @param {string} sessionId - the session.
 * @param {string} path - the file path.
 * @param {number} [line] - a 1-based line.
 */
export function openInEditor(sessionId, path, line) {
  const cwd = contexts.get(sessionId)?.root;
  const params = typeof line === 'number' && line > 0 ? { line } : {};
  runtime.sidebarRight?.openResource(addressFor(sessionId, cwd ?? undefined, path), { params });
}

/**
 * Open one path in the shipped preview.
 * @param {string} sessionId - the session.
 * @param {string} path - the file path.
 * @param {number} [line] - a 1-based line.
 */
export function openPreview(sessionId, path, line) {
  const cwd = contexts.get(sessionId)?.root;
  const params = typeof line === 'number' && line > 0 ? { line } : {};
  runtime.sidebarRight?.openResource(addressFor(sessionId, cwd ?? undefined, path), { kind: PREVIEW_KIND, params });
}

/**
 * Open the workbench at one path.
 * @param {string} path - the file path.
 */
export function revealInFiles(path) {
  runtime.sidebarRight?.openTab('files', { params: { path } });
}

/**
 * Copy an absolute path to the browser clipboard.
 * @param {string} path - the path.
 */
export async function copyPath(path) {
  try {
    await navigator.clipboard.writeText(path);
    notify(tr('toast.copiedPath'));
  } catch (error) {
    report(error);
  }
}

/**
 * Create a file in a directory.
 * @param {string} sessionId - the session.
 * @param {string} directory - the target directory.
 */
export async function newFile(sessionId, directory) {
  const context = contexts.get(sessionId);
  if (context === undefined) return;
  await askName({
    title: tr('dialog.newFile'),
    label: tr('dialog.newFileLabel'),
    initial: '',
    confirmLabel: tr('action.create'),
    submit: async (name) => {
      assertSimpleName(name);
      const target = joinPath(directory, name);
      await call('create', { workspaceId: context.workspaceId, path: target, kind: 'file' });
      context.store?.refreshPath(directory);
      if (context.store !== undefined) void context.store.reveal(target).catch(report);
    },
  });
}

/**
 * Create a folder in a directory.
 * @param {string} sessionId - the session.
 * @param {string} directory - the target directory.
 */
export async function newFolder(sessionId, directory) {
  const context = contexts.get(sessionId);
  if (context === undefined) return;
  await askName({
    title: tr('dialog.newFolder'),
    label: tr('dialog.newFolderLabel'),
    initial: '',
    confirmLabel: tr('action.create'),
    submit: async (name) => {
      assertSimpleName(name);
      await call('create', { workspaceId: context.workspaceId, path: joinPath(directory, name), kind: 'directory' });
      context.store?.refreshPath(directory);
    },
  });
}

/**
 * Rename one entry.
 * @param {string} sessionId - the session.
 * @param {string} path - the entry path.
 */
export async function renameEntry(sessionId, path) {
  const context = contexts.get(sessionId);
  if (context === undefined) return;
  await askName({
    title: tr('dialog.rename'),
    label: tr('dialog.renameLabel'),
    initial: basename(path),
    confirmLabel: tr('dialog.rename'),
    submit: async (name) => {
      assertSimpleName(name);
      const target = joinPath(dirname(path), name);
      await call('rename', { workspaceId: context.workspaceId, from: path, to: target });
      context.store?.renameBuffers(path, target);
      context.store?.refreshPath(dirname(path));
    },
  });
}

/**
 * Copy one entry next to itself with a unique name.
 * @param {string} sessionId - the session.
 * @param {string} path - the entry path.
 */
export async function duplicateEntry(sessionId, path) {
  const context = contexts.get(sessionId);
  if (context === undefined) return;
  const parent = dirname(path);
  const name = basename(path);
  const dot = name.lastIndexOf('.');
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const extension = dot > 0 ? name.slice(dot) : '';
  try {
    for (let index = 1; index <= 20; index += 1) {
      const candidate = joinPath(parent, index === 1 ? `${stem} copy${extension}` : `${stem} copy ${index}${extension}`);
      try {
        await call('copy', { workspaceId: context.workspaceId, from: path, to: candidate });
        context.store?.refreshPath(parent);
        return;
      } catch (error) {
        if (error.code !== 'files/exists') throw error;
      }
    }
  } catch (error) {
    report(error);
  }
}

/**
 * Put one path on the client clipboard.
 * @param {string} sessionId - the session.
 * @param {string} path - the entry path.
 * @param {'copy' | 'cut'} mode - the clipboard mode.
 */
export function setFileClipboard(sessionId, path, mode) {
  clipboard.path = path;
  clipboard.mode = mode;
  clipboard.sessionId = sessionId;
  notify(tr(mode === 'cut' ? 'toast.cut' : 'toast.copied', { name: basename(path) }));
}

/**
 * Paste the client clipboard into a directory.
 * @param {string} sessionId - the session.
 * @param {string} directory - the target directory.
 */
export async function pasteInto(sessionId, directory) {
  const context = contexts.get(sessionId);
  if (context === undefined || clipboard.path === null) return;
  const source = clipboard.path;
  const target = joinPath(directory, basename(source));
  try {
    if (clipboard.mode === 'cut') {
      await call('rename', { workspaceId: context.workspaceId, from: source, to: target });
      context.store?.renameBuffers(source, target);
      clipboard.path = null;
      clipboard.mode = null;
      clipboard.sessionId = null;
    } else {
      await call('copy', { workspaceId: context.workspaceId, from: source, to: target });
    }
    context.store?.refreshPath(directory);
    notify(tr('toast.pasted', { name: basename(target) }));
  } catch (error) {
    report(error);
  }
}

/**
 * Delete one entry after confirmation.
 * @param {string} sessionId - the session.
 * @param {string} path - the entry path.
 * @param {boolean} directory - whether the entry is a folder.
 */
export async function deleteEntry(sessionId, path, directory) {
  const context = contexts.get(sessionId);
  if (context === undefined) return;
  const name = basename(path);
  const confirmed = await askConfirm({
    title: tr('dialog.delete'),
    message: tr(directory ? 'dialog.deleteFolder' : 'dialog.deleteFile', { name }),
    confirmLabel: tr('menu.delete'),
    danger: true,
  });
  if (!confirmed) return;
  try {
    await call('delete', { workspaceId: context.workspaceId, path });
    context.store?.closeBuffersUnder(path);
    context.store?.refreshPath(dirname(path));
  } catch (error) {
    report(error);
  }
}
