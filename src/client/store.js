import { call, isAbsolutePath, isInside, joinPath, normalizePath, treeRoot } from './api.js';
import { tr } from './locale.js';

const PREFS_KEY = 'dsh-files.preferences.v1';

/** Fixed editor metrics for this version. */
export const EDITOR_METRICS = { fontSize: 13, tabSize: 2 };

/**
 * Read stored editor preferences.
 * @returns {{ wrap: boolean, autoSave: boolean }} the preferences.
 */
function readPreferences() {
  const defaults = { wrap: false, autoSave: true };
  try {
    if (typeof localStorage === 'undefined') return defaults;
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw === null) return defaults;
    const parsed = JSON.parse(raw);
    return {
      wrap: parsed?.wrap === true,
      autoSave: parsed?.autoSave !== false,
    };
  } catch {
    return defaults;
  }
}

/**
 * Persist one editor preference.
 * @param {{ wrap: boolean, autoSave: boolean }} prefs - the full preference set.
 */
function writePreferences(prefs) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // A browser that refuses storage keeps the in-memory preference only.
  }
}

const stores = new Map();

/**
 * The workbench store for one pane. It survives tab switches and remounts.
 * @param {string} paneId - the pane id from `useTabInfo`.
 * @returns {WorkbenchStore} the store.
 */
export function storeFor(paneId) {
  let store = stores.get(paneId);
  if (store === undefined) {
    store = new WorkbenchStore();
    stores.set(paneId, store);
  }
  return store;
}

/** Session contexts used by menu actions that run outside React. */
export const contexts = new Map();

/** The client-side file clipboard. */
export const clipboard = { path: null, mode: null };

let overlayState = { prompt: null, confirm: null, toast: null };
const overlayListeners = new Set();

/** Dialogs and notices rendered by the overlay host. */
export const overlay = {
  subscribe(listener) {
    overlayListeners.add(listener);
    return () => {
      overlayListeners.delete(listener);
    };
  },
  getSnapshot() {
    return overlayState;
  },
  /**
   * Replace one part of the overlay state.
   * @param {{ prompt?: object | null, confirm?: object | null, toast?: object | null }} patch - the change.
   */
  patch(patch) {
    overlayState = { ...overlayState, ...patch };
    for (const listener of overlayListeners) listener();
  },
};

/**
 * Open a name dialog and wait for its outcome.
 * @param {{ title: string, label: string, initial: string, confirmLabel: string, submit: (value: string) => Promise<void> }} options - dialog content and submit.
 * @returns {Promise<string | null>} the submitted name, or null when cancelled.
 */
export function askName(options) {
  return new Promise((resolve) => {
    overlay.patch({ prompt: { ...options, resolve } });
  });
}

/**
 * Open a confirmation dialog.
 * @param {{ title: string, message: string, confirmLabel: string, danger?: boolean }} options - dialog content.
 * @returns {Promise<boolean>} whether the user confirmed.
 */
export function askConfirm(options) {
  return new Promise((resolve) => {
    overlay.patch({ confirm: { ...options, resolve } });
  });
}

let toastToken = 0;

/**
 * Show one short notice.
 * @param {string} text - the message.
 * @param {'info' | 'error'} [tone] - the tone.
 */
export function notify(text, tone = 'info') {
  toastToken += 1;
  const token = toastToken;
  overlay.patch({ toast: { text, tone, token } });
  setTimeout(() => {
    if (overlayState.toast?.token === token) overlay.patch({ toast: null });
  }, 2600);
}

/**
 * Read one file's name and relative path for menu labels.
 * @param {string} path - the file path.
 * @returns {{ name: string, parent: string }} the parts.
 */
export function splitPath(path) {
  const name = normalizePath(path).replace(/\/+$/, '').split('/').pop() ?? path;
  const parent = normalizePath(path).replace(/\/+$/, '').split('/').slice(0, -1).join('/');
  return { name, parent };
}

/** One pane's workbench state. */
export class WorkbenchStore {
  constructor() {
    const prefs = readPreferences();
    this.listeners = new Set();
    this.state = {
      sessionId: null,
      workspaceId: null,
      root: null,
      levels: {},
      expanded: [],
      buffers: [],
      activePath: null,
      treeWidth: 260,
      wrap: prefs.wrap,
      autoSave: prefs.autoSave,
    };
  }

  subscribe = (listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.state;

  emit() {
    for (const listener of this.listeners) listener();
  }

  /**
   * Merge one patch into the state and notify.
   * @param {object} patch - the state change.
   */
  patch(patch) {
    this.state = { ...this.state, ...patch };
    this.emit();
  }

  /**
   * Bind this store to one session and workspace root. Resets when either changes.
   * @param {string} sessionId - the session.
   * @param {string} workspaceId - the registered workspace.
   * @param {string} root - the working directory.
   */
  init(sessionId, workspaceId, root) {
    const nextRoot = treeRoot(root);
    if (this.state.sessionId === sessionId && this.state.root === nextRoot && this.state.workspaceId === workspaceId) {
      return;
    }
    this.state = {
      ...this.state,
      sessionId,
      workspaceId,
      root: nextRoot,
      levels: {},
      expanded: [nextRoot],
      buffers: [],
      activePath: null,
    };
    this.emit();
    void this.loadLevel(nextRoot);
  }

  /**
   * Load or reload one directory level.
   * @param {string} path - the absolute directory path.
   */
  async loadLevel(path) {
    const current = this.state.levels[path];
    if (current?.status === 'loading') return;
    this.setLevel(path, { status: 'loading', entries: current?.entries ?? [] });
    try {
      const listing = await call('list', { workspaceId: this.state.workspaceId, path });
      this.setLevel(path, { status: 'ready', entries: listing.entries, truncated: listing.truncated });
    } catch (error) {
      this.setLevel(path, {
        status: 'failed',
        entries: current?.entries ?? [],
        error: { code: error.code, message: error.message },
      });
    }
  }

  /**
   * Replace one level state.
   * @param {string} path - the directory path.
   * @param {object} level - the new state.
   */
  setLevel(path, level) {
    this.patch({ levels: { ...this.state.levels, [path]: level } });
  }

  /**
   * Expand or collapse one directory.
   * @param {string} path - the directory path.
   * @param {boolean} expanded - the requested state.
   */
  toggle(path, expanded) {
    const set = new Set(this.state.expanded);
    if (expanded) set.add(path);
    else set.delete(path);
    this.patch({ expanded: [...set] });
    if (expanded) void this.loadLevel(path);
  }

  /** Reload the root and every expanded directory. */
  refresh() {
    const paths = new Set([this.state.root, ...this.state.expanded]);
    for (const path of paths) {
      if (typeof path === 'string' && path !== '') void this.loadLevel(path);
    }
  }

  /**
   * Reload one directory after a change.
   * @param {string} path - the directory path.
   */
  refreshPath(path) {
    if (typeof path === 'string' && path !== '') void this.loadLevel(path);
  }

  /**
   * Find one open buffer.
   * @param {string} path - the file path.
   * @returns {object | undefined} the buffer.
   */
  buffer(path) {
    return this.state.buffers.find((buffer) => buffer.path === path);
  }

  /**
   * Open a file into a buffer, reading it when no content is supplied.
   * @param {string} path - the file path.
   * @param {{ text?: string, version?: string, eol?: string, bom?: boolean, readOnly?: boolean }} [options] - preloaded content.
   * @returns {Promise<object>} the buffer.
   */
  async openFile(path, options = {}) {
    const existing = this.buffer(path);
    if (existing !== undefined) {
      this.patch({ activePath: path });
      return existing;
    }
    let content = options;
    if (typeof options.text !== 'string') {
      const file = await call('read', { workspaceId: this.state.workspaceId, path });
      content = { text: file.text, version: file.version, eol: file.eol, bom: file.bom };
    }
    const buffer = {
      path,
      text: content.text,
      version: content.version,
      eol: content.eol === 'crlf' ? 'crlf' : 'lf',
      bom: content.bom === true,
      status: 'clean',
      error: null,
      readOnly: options.readOnly === true || !isInside(this.state.root, path),
    };
    this.patch({ buffers: [...this.state.buffers, buffer], activePath: path });
    return buffer;
  }

  /**
   * Update one buffer and notify.
   * @param {string} path - the file path.
   * @param {object} patch - the buffer change.
   */
  updateBuffer(path, patch) {
    const buffers = this.state.buffers.map((buffer) => (buffer.path === path ? { ...buffer, ...patch } : buffer));
    this.patch({ buffers });
  }

  /**
   * Keep the latest editor text without rendering on every keystroke.
   * @param {string} path - the file path.
   * @param {string} text - the document text.
   */
  setBufferText(path, text) {
    const buffer = this.buffer(path);
    if (buffer !== undefined) buffer.text = text;
  }

  /**
   * Set one buffer's save status.
   * @param {string} path - the file path.
   * @param {string} status - the new status.
   * @param {object | null} [error] - the failure, when any.
   */
  setBufferStatus(path, status, error = null) {
    this.updateBuffer(path, { status, error });
  }

  /**
   * Make one buffer active.
   * @param {string} path - the file path.
   */
  setActive(path) {
    this.patch({ activePath: path });
  }

  /**
   * Close one buffer and choose the next active buffer.
   * @param {string} path - the file path.
   */
  closeBuffer(path) {
    const buffers = this.state.buffers.filter((buffer) => buffer.path !== path);
    let activePath = this.state.activePath;
    if (activePath === path) activePath = buffers.length > 0 ? buffers[buffers.length - 1].path : null;
    this.patch({ buffers, activePath });
  }

  /**
   * Follow a rename for open buffers, including children of a renamed folder.
   * @param {string} from - the old path.
   * @param {string} to - the new path.
   */
  renameBuffers(from, to) {
    const buffers = this.state.buffers.map((buffer) => {
      if (buffer.path === from) return { ...buffer, path: to };
      if (buffer.path.startsWith(`${from}/`)) return { ...buffer, path: to + buffer.path.slice(from.length) };
      return buffer;
    });
    const activePath = this.state.activePath;
    const nextActive = activePath === from
      ? to
      : activePath !== null && activePath.startsWith(`${from}/`)
        ? to + activePath.slice(from.length)
        : activePath;
    this.patch({ buffers, activePath: nextActive });
  }

  /**
   * Close every buffer at or under a deleted path.
   * @param {string} path - the deleted path.
   */
  closeBuffersUnder(path) {
    const buffers = this.state.buffers.filter(
      (buffer) => buffer.path !== path && !buffer.path.startsWith(`${path}/`),
    );
    const activePath = buffers.some((buffer) => buffer.path === this.state.activePath) ? this.state.activePath : null;
    this.patch({ buffers, activePath });
  }

  /**
   * Expand the ancestors of a path and open it.
   * @param {string} path - absolute or root-relative path.
   * @param {{ line?: number }} [options] - a line to reveal.
   * @returns {Promise<string | null>} the absolute path that opened.
   */
  async reveal(path, options = {}) {
    const root = this.state.root;
    if (root === null) return null;
    const absolute = isAbsolutePath(path) ? normalizePath(path) : joinPath(root, normalizePath(path));
    if (!isInside(root, absolute)) {
      await this.openFile(absolute, options);
      return absolute;
    }
    const parts = absolute.slice(root.length).split('/').filter((part) => part !== '');
    const expanded = new Set(this.state.expanded);
    expanded.add(root);
    await this.loadLevel(root);
    let current = root;
    for (let index = 0; index < parts.length - 1; index += 1) {
      current = joinPath(current, parts[index]);
      expanded.add(current);
      await this.loadLevel(current);
    }
    this.patch({ expanded: [...expanded] });
    await this.openFile(absolute, options);
    return absolute;
  }

  /**
   * Set the tree width and remember it.
   * @param {number} width - pixels.
   */
  setTreeWidth(width) {
    this.patch({ treeWidth: Math.max(180, Math.min(560, Math.round(width))) });
  }

  /**
   * Toggle the wrap preference.
   * @returns {boolean} the new value.
   */
  toggleWrap() {
    const wrap = !this.state.wrap;
    writePreferences({ wrap, autoSave: this.state.autoSave });
    this.patch({ wrap });
    return wrap;
  }

  /**
   * Toggle the autosave preference.
   * @returns {boolean} the new value.
   */
  toggleAutoSave() {
    const autoSave = !this.state.autoSave;
    writePreferences({ wrap: this.state.wrap, autoSave });
    this.patch({ autoSave });
    return autoSave;
  }
}

/**
 * A short status label for one buffer state.
 * @param {string} status - the buffer status.
 * @returns {string} the label.
 */
export function statusLabel(status) {
  switch (status) {
    case 'saving':
      return tr('status.saving');
    case 'saved':
      return tr('status.saved');
    case 'conflict':
      return tr('status.conflict');
    case 'error':
      return tr('status.error');
    case 'dirty':
      return tr('status.unsaved');
    default:
      return '';
  }
}
