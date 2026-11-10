import { addressFor, basename, call, codeOfFailure, dirname, errorKey, joinPath } from './api.js';
import { askConfirm, askName, clipboard, contexts, notify } from './store.js';
import { tr } from './locale.js';
import { runtime } from './runtime.js';

const PREVIEW_KIND = 'text';

/** A refused name, reported like a host failure. */
class NameError extends Error {
  readonly code = 'files/name';

  constructor() {
    super('A name without path separators is required.');
    this.name = 'NameError';
  }
}

/**
 * Show a failed operation as a notice.
 * @param error the failure.
 */
export function report(error: unknown): void {
  notify(tr(errorKey(codeOfFailure(error))), 'error');
}

/**
 * Reject a name that would change the parent directory.
 * @param name the submitted name.
 */
function assertSimpleName(name: string): void {
  if (name.includes('/') || name.includes('\\') || name === '.' || name === '..') throw new NameError();
}

/**
 * Open one path in the editor tab at a line.
 * @param sessionId the session.
 * @param path the file path.
 * @param line a 1-based line.
 */
export function openInEditor(sessionId: string, path: string, line?: number): void {
  const cwd = contexts.get(sessionId)?.root;
  const params = typeof line === 'number' && line > 0 ? { line } : {};
  runtime.sidebarRight?.openResource(addressFor(sessionId, cwd ?? undefined, path), { params });
}

/**
 * Open one path in the shipped preview.
 * @param sessionId the session.
 * @param path the file path.
 * @param line a 1-based line.
 */
export function openPreview(sessionId: string, path: string, line?: number): void {
  const cwd = contexts.get(sessionId)?.root;
  const params = typeof line === 'number' && line > 0 ? { line } : {};
  runtime.sidebarRight?.openResource(addressFor(sessionId, cwd ?? undefined, path), { kind: PREVIEW_KIND, params });
}

/**
 * Open the workbench at one path.
 * @param path the file path.
 */
export function revealInFiles(path: string): void {
  runtime.sidebarRight?.openTab('files', { params: { path } });
}

/**
 * Copy an absolute path to the browser clipboard.
 * @param path the path.
 */
export async function copyPath(path: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(path);
    notify(tr('toast.copiedPath'));
  } catch (error) {
    report(error);
  }
}

/**
 * Create a file in a directory.
 * @param sessionId the session.
 * @param directory the target directory.
 */
export async function newFile(sessionId: string, directory: string): Promise<void> {
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
      context.store.refreshPath(directory);
      void context.store.reveal(target).catch(report);
    },
  });
}

/**
 * Create a folder in a directory.
 * @param sessionId the session.
 * @param directory the target directory.
 */
export async function newFolder(sessionId: string, directory: string): Promise<void> {
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
      context.store.refreshPath(directory);
    },
  });
}

/**
 * Rename one entry.
 * @param sessionId the session.
 * @param path the entry path.
 */
export async function renameEntry(sessionId: string, path: string): Promise<void> {
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
      context.store.renameBuffers(path, target);
      context.store.refreshPath(dirname(path));
    },
  });
}

/**
 * Copy one entry next to itself with a unique name.
 * @param sessionId the session.
 * @param path the entry path.
 */
export async function duplicateEntry(sessionId: string, path: string): Promise<void> {
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
        context.store.refreshPath(parent);
        return;
      } catch (error) {
        if (codeOfFailure(error) !== 'files/exists') throw error;
      }
    }
  } catch (error) {
    report(error);
  }
}

/**
 * Put one path on the client clipboard.
 * @param sessionId the session.
 * @param path the entry path.
 * @param mode the clipboard mode.
 */
export function setFileClipboard(sessionId: string, path: string, mode: 'copy' | 'cut'): void {
  clipboard.path = path;
  clipboard.mode = mode;
  clipboard.sessionId = sessionId;
  notify(tr(mode === 'cut' ? 'toast.cut' : 'toast.copied', { name: basename(path) }));
}

/**
 * Paste the client clipboard into a directory.
 * @param sessionId the session.
 * @param directory the target directory.
 */
export async function pasteInto(sessionId: string, directory: string): Promise<void> {
  const context = contexts.get(sessionId);
  if (context === undefined || clipboard.path === null) return;
  const source = clipboard.path;
  const target = joinPath(directory, basename(source));
  try {
    if (clipboard.mode === 'cut') {
      await call('rename', { workspaceId: context.workspaceId, from: source, to: target });
      context.store.renameBuffers(source, target);
      clipboard.path = null;
      clipboard.mode = null;
      clipboard.sessionId = null;
    } else {
      await call('copy', { workspaceId: context.workspaceId, from: source, to: target });
    }
    context.store.refreshPath(directory);
    notify(tr('toast.pasted', { name: basename(target) }));
  } catch (error) {
    report(error);
  }
}

/**
 * Delete one entry after confirmation.
 * @param sessionId the session.
 * @param path the entry path.
 * @param directory whether the entry is a folder.
 */
export async function deleteEntry(sessionId: string, path: string, directory: boolean): Promise<void> {
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
    context.store.closeBuffersUnder(path);
    context.store.refreshPath(dirname(path));
  } catch (error) {
    report(error);
  }
}
