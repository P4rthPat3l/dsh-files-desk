import type { DirectoryEntry, DirectoryListing, Eol, TextFile } from '../contract.js';
import { call, codeOfFailure, isAbsolutePath, isInside, joinPath, normalizePath, treeRoot } from './api.js';
import { tr } from './locale.js';

const PREFS_KEY = 'dsh-files.preferences.v1';

/** Fixed editor metrics for this version. */
export const EDITOR_METRICS = { fontSize: 13, tabSize: 2 };

/** The two editor preferences this version stores. */
export interface Preferences {
  wrap: boolean;
  autoSave: boolean;
}

/**
 * Read stored editor preferences.
 * @returns the preferences.
 */
function readPreferences(): Preferences {
  const defaults: Preferences = { wrap: false, autoSave: true };
  try {
    if (typeof localStorage === 'undefined') return defaults;
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw === null) return defaults;
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object') return defaults;
    const candidate = parsed as Record<string, unknown>;
    return { wrap: candidate.wrap === true, autoSave: candidate.autoSave !== false };
  } catch {
    return defaults;
  }
}

/**
 * Persist one editor preference.
 * @param prefs the full preference set.
 */
function writePreferences(prefs: Preferences): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // A browser that refuses storage keeps the in-memory preference only.
  }
}

/** The save status of one open buffer. */
export type BufferStatus = 'clean' | 'dirty' | 'saving' | 'saved' | 'conflict' | 'error';

/** A failure shown under a buffer. */
export interface BufferError {
  code?: string;
  message: string;
}

/** One open file. */
export interface BufferState {
  path: string;
  text: string;
  version: string | null;
  eol: Eol;
  bom: boolean;
  status: BufferStatus;
  error: BufferError | null;
  readOnly: boolean;
}

/** One directory level in the tree. */
export interface LevelState {
  status: 'loading' | 'ready' | 'failed';
  entries: DirectoryEntry[];
  truncated?: boolean;
  error?: BufferError;
}

/** One pane's rendered state. */
export interface WorkbenchState {
  sessionId: string | null;
  workspaceId: string | null;
  root: string | null;
  levels: Record<string, LevelState>;
  expanded: string[];
  buffers: BufferState[];
  activePath: string | null;
  treeWidth: number;
  wrap: boolean;
  autoSave: boolean;
}

/** Content a caller already holds for one file. */
export interface OpenFileOptions {
  text?: string;
  version?: string;
  eol?: Eol;
  bom?: boolean;
  readOnly?: boolean;
}

const stores = new Map<string, WorkbenchStore>();

/**
 * The workbench store for one pane. It survives tab switches and remounts.
 * @param paneId the pane id from `useTabInfo`.
 * @returns the store.
 */
export function storeFor(paneId: string): WorkbenchStore {
  let store = stores.get(paneId);
  if (store === undefined) {
    store = new WorkbenchStore();
    stores.set(paneId, store);
  }
  return store;
}

/** One session and the workbench bound to it, for menu actions outside React. */
export interface SessionContext {
  sessionId: string;
  workspaceId: string;
  root: string;
  store: WorkbenchStore;
}

/** Session contexts used by menu actions that run outside React. */
export const contexts = new Map<string, SessionContext>();

/** One path on the client clipboard. */
export interface FileClipboard {
  path: string | null;
  mode: 'copy' | 'cut' | null;
  sessionId: string | null;
}

/** The client-side file clipboard. */
export const clipboard: FileClipboard = { path: null, mode: null, sessionId: null };

/** A name dialog waiting for an answer. */
export interface PromptOptions {
  title: string;
  label: string;
  initial: string;
  confirmLabel: string;
  submit: (value: string) => Promise<void>;
}

export interface PromptRequest extends PromptOptions {
  resolve: (value: string | null) => void;
}

/** A confirmation dialog waiting for an answer. */
export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
}

export interface ConfirmRequest extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

/** One short notice. */
export interface ToastState {
  text: string;
  tone: 'info' | 'error';
  token: number;
}

/** Everything the overlay host renders. */
export interface OverlayState {
  prompt: PromptRequest | null;
  confirm: ConfirmRequest | null;
  toast: ToastState | null;
}

let overlayState: OverlayState = { prompt: null, confirm: null, toast: null };
const overlayListeners = new Set<() => void>();

/** Dialogs and notices rendered by the overlay host. */
export const overlay = {
  subscribe(listener: () => void): () => void {
    overlayListeners.add(listener);
    return () => {
      overlayListeners.delete(listener);
    };
  },
  getSnapshot(): OverlayState {
    return overlayState;
  },
  /**
   * Replace one part of the overlay state.
   * @param patch the change.
   */
  patch(patch: Partial<OverlayState>): void {
    overlayState = { ...overlayState, ...patch };
    for (const listener of overlayListeners) listener();
  },
};

/**
 * Open a name dialog and wait for its outcome.
 * @param options dialog content and submit.
 * @returns the submitted name, or null when cancelled.
 */
export function askName(options: PromptOptions): Promise<string | null> {
  return new Promise((resolve) => {
    overlay.patch({ prompt: { ...options, resolve } });
  });
}

/**
 * Open a confirmation dialog.
 * @param options dialog content.
 * @returns whether the user confirmed.
 */
export function askConfirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    overlay.patch({ confirm: { ...options, resolve } });
  });
}

let toastToken = 0;

/**
 * Show one short notice.
 * @param text the message.
 * @param tone the tone.
 */
export function notify(text: string, tone: 'info' | 'error' = 'info'): void {
  toastToken += 1;
  const token = toastToken;
  overlay.patch({ toast: { text, tone, token } });
  setTimeout(() => {
    if (overlayState.toast?.token === token) overlay.patch({ toast: null });
  }, 2600);
}

/**
 * Read one file's name and relative path for menu labels.
 * @param path the file path.
 * @returns the parts.
 */
export function splitPath(path: string): { name: string; parent: string } {
  const segments = normalizePath(path).replace(/\/+$/, '').split('/');
  const name = segments[segments.length - 1] ?? path;
  const parent = segments.slice(0, -1).join('/');
  return { name, parent };
}

/** One pane's workbench state. */
export class WorkbenchStore {
  private listeners = new Set<() => void>();

  private state: WorkbenchState;

  constructor() {
    const prefs = readPreferences();
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

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): WorkbenchState => this.state;

  /**
   * Merge one patch into the state and notify.
   * @param patch the state change.
   */
  patch(patch: Partial<WorkbenchState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }

  /**
   * Bind this store to one session and workspace root. Resets when either changes.
   * @param sessionId the session.
   * @param workspaceId the registered workspace.
   * @param root the working directory.
   */
  init(sessionId: string, workspaceId: string, root: string): void {
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
   * @param path the absolute directory path.
   */
  async loadLevel(path: string): Promise<void> {
    const current = this.state.levels[path];
    if (current?.status === 'loading') return;
    this.setLevel(path, { status: 'loading', entries: current?.entries ?? [] });
    try {
      const listing = await call<DirectoryListing>('list', { workspaceId: this.state.workspaceId, path });
      this.setLevel(path, { status: 'ready', entries: listing.entries, truncated: listing.truncated });
    } catch (error) {
      this.setLevel(path, {
        status: 'failed',
        entries: current?.entries ?? [],
        error: { code: codeOfFailure(error), message: error instanceof Error ? error.message : String(error) },
      });
    }
  }

  /**
   * Replace one level state.
   * @param path the directory path.
   * @param level the new state.
   */
  setLevel(path: string, level: LevelState): void {
    this.patch({ levels: { ...this.state.levels, [path]: level } });
  }

  /**
   * Expand or collapse one directory.
   * @param path the directory path.
   * @param expanded the requested state.
   */
  toggle(path: string, expanded: boolean): void {
    const set = new Set(this.state.expanded);
    if (expanded) set.add(path);
    else set.delete(path);
    this.patch({ expanded: [...set] });
    if (expanded) void this.loadLevel(path);
  }

  /** Reload the root and every expanded directory. */
  refresh(): void {
    const paths = new Set<string>();
    if (this.state.root !== null) paths.add(this.state.root);
    for (const path of this.state.expanded) paths.add(path);
    for (const path of paths) {
      if (path !== '') void this.loadLevel(path);
    }
  }

  /**
   * Reload one directory after a change.
   * @param path the directory path.
   */
  refreshPath(path: string): void {
    if (path !== '') void this.loadLevel(path);
  }

  /**
   * Find one open buffer.
   * @param path the file path.
   * @returns the buffer, when open.
   */
  buffer(path: string): BufferState | undefined {
    return this.state.buffers.find((buffer) => buffer.path === path);
  }

  /**
   * Open a file into a buffer, reading it when no content is supplied.
   * @param path the file path.
   * @param options preloaded content.
   * @returns the buffer.
   */
  async openFile(path: string, options: OpenFileOptions = {}): Promise<BufferState> {
    const existing = this.buffer(path);
    if (existing !== undefined) {
      this.patch({ activePath: path });
      return existing;
    }
    let text = options.text;
    let version = options.version ?? null;
    let eol: Eol = options.eol ?? 'lf';
    let bom = options.bom === true;
    if (typeof text !== 'string') {
      const file = await call<TextFile>('read', { workspaceId: this.state.workspaceId, path });
      text = file.text;
      version = file.version;
      eol = file.eol;
      bom = file.bom;
    }
    const buffer: BufferState = {
      path,
      text,
      version,
      eol,
      bom,
      status: 'clean',
      error: null,
      readOnly: options.readOnly === true || !isInside(this.state.root ?? '', path),
    };
    this.patch({ buffers: [...this.state.buffers, buffer], activePath: path });
    return buffer;
  }

  /**
   * Update one buffer and notify.
   * @param path the file path.
   * @param patch the buffer change.
   */
  updateBuffer(path: string, patch: Partial<BufferState>): void {
    const buffers = this.state.buffers.map((buffer) => (buffer.path === path ? { ...buffer, ...patch } : buffer));
    this.patch({ buffers });
  }

  /**
   * Keep the latest editor text without rendering on every keystroke.
   * @param path the file path.
   * @param text the document text.
   */
  setBufferText(path: string, text: string): void {
    const buffer = this.buffer(path);
    if (buffer !== undefined) buffer.text = text;
  }

  /**
   * Set one buffer's save status.
   * @param path the file path.
   * @param status the new status.
   * @param error the failure, when any.
   */
  setBufferStatus(path: string, status: BufferStatus, error: BufferError | null = null): void {
    this.updateBuffer(path, { status, error });
  }

  /**
   * Make one buffer active.
   * @param path the file path.
   */
  setActive(path: string): void {
    this.patch({ activePath: path });
  }

  /**
   * Close one buffer and choose the next active buffer.
   * @param path the file path.
   */
  closeBuffer(path: string): void {
    const buffers = this.state.buffers.filter((buffer) => buffer.path !== path);
    let activePath = this.state.activePath;
    if (activePath === path) activePath = buffers.length > 0 ? buffers[buffers.length - 1]?.path ?? null : null;
    this.patch({ buffers, activePath });
  }

  /**
   * Follow a rename for open buffers, including children of a renamed folder.
   * @param from the old path.
   * @param to the new path.
   */
  renameBuffers(from: string, to: string): void {
    const buffers = this.state.buffers.map((buffer) => {
      if (buffer.path === from) return { ...buffer, path: to };
      if (buffer.path.startsWith(`${from}/`)) return { ...buffer, path: to + buffer.path.slice(from.length) };
      return buffer;
    });
    const activePath = this.state.activePath;
    const nextActive =
      activePath === from
        ? to
        : activePath !== null && activePath.startsWith(`${from}/`)
          ? to + activePath.slice(from.length)
          : activePath;
    this.patch({ buffers, activePath: nextActive });
  }

  /**
   * Close every buffer at or under a deleted path.
   * @param path the deleted path.
   */
  closeBuffersUnder(path: string): void {
    const buffers = this.state.buffers.filter(
      (buffer) => buffer.path !== path && !buffer.path.startsWith(`${path}/`),
    );
    const activePath = buffers.some((buffer) => buffer.path === this.state.activePath) ? this.state.activePath : null;
    this.patch({ buffers, activePath });
  }

  /**
   * Expand the ancestors of a path and open it.
   * @param path absolute or root-relative path.
   * @returns the absolute path that opened.
   */
  async reveal(path: string): Promise<string | null> {
    const root = this.state.root;
    if (root === null) return null;
    const absolute = isAbsolutePath(path) ? normalizePath(path) : joinPath(root, normalizePath(path));
    if (!isInside(root, absolute)) {
      await this.openFile(absolute);
      return absolute;
    }
    const parts = absolute.slice(root.length).split('/').filter((part) => part !== '');
    const expanded = new Set(this.state.expanded);
    expanded.add(root);
    await this.loadLevel(root);
    let current = root;
    for (let index = 0; index < parts.length - 1; index += 1) {
      current = joinPath(current, parts[index] ?? '');
      expanded.add(current);
      await this.loadLevel(current);
    }
    this.patch({ expanded: [...expanded] });
    await this.openFile(absolute);
    return absolute;
  }

  /**
   * Set the tree width and remember it.
   * @param width pixels.
   */
  setTreeWidth(width: number): void {
    this.patch({ treeWidth: Math.max(180, Math.min(560, Math.round(width))) });
  }

  /**
   * Toggle the wrap preference.
   * @returns the new value.
   */
  toggleWrap(): boolean {
    const wrap = !this.state.wrap;
    writePreferences({ wrap, autoSave: this.state.autoSave });
    this.patch({ wrap });
    return wrap;
  }

  /**
   * Toggle the autosave preference.
   * @returns the new value.
   */
  toggleAutoSave(): boolean {
    const autoSave = !this.state.autoSave;
    writePreferences({ wrap: this.state.wrap, autoSave });
    this.patch({ autoSave });
    return autoSave;
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}

/**
 * A short status label for one buffer state.
 * @param status the buffer status.
 * @returns the label.
 */
export function statusLabel(status: BufferStatus): string {
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
    case 'clean':
      return '';
  }
}
