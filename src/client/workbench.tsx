import React, { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { basename, codeOfFailure, dirname, errorKey, languageFor, previewOnly } from './api.js';
import { useWorkspaceBinding } from './binding.js';
import { BufferEditor } from './editor-host.jsx';
import type { BufferEditorApi } from './editor-host.jsx';
import { ConflictBanner } from './dialogs.jsx';
import type { FilesWorkbenchProps, TreeDirectoryState, TreeEntry, TreeInput } from './harness.js';
import {
  IconClose,
  IconEye,
  IconFile,
  IconFilePlus,
  IconFolder,
  IconFolderPlus,
  IconRefresh,
  IconSave,
  IconWrap,
} from './icons.jsx';
import { contexts, notify, statusLabel, storeFor } from './store.js';
import type { BufferError } from './store.js';
import { newFile, newFolder, openPreview } from './ops.js';

const TREE_OPTIONS = { fallback: null };
const PREVIEW_ONLY_CODES: ReadonlySet<string> = new Set(['files/binary', 'files/too-large', 'files/not-utf8']);

/** The cursor readout. */
interface CursorReadout {
  line: number;
  column: number;
}

/**
 * A path split into a subdued directory and a primary name.
 * @param props the path and workspace root.
 * @returns the label.
 */
function PathLabel({ path, root }: { path: string; root: string | null }) {
  const normalized = path.replace(/\\/g, '/');
  const slash = normalized.lastIndexOf('/');
  const directory = slash < 0 ? '' : normalized.slice(0, slash + 1);
  const name = slash < 0 ? normalized : normalized.slice(slash + 1);
  let display = root !== null && directory.startsWith(root) ? directory.slice(root.length) : directory;
  if (display === '/') display = '';
  return (
    <span className="fdp-path" title={path}>
      {display === '' ? null : <span className="fdp-path-dir">{display}</span>}
      <span className="fdp-path-name">{name}</span>
    </span>
  );
}

/** One icon-only control. */
interface IconButtonProps {
  label: string;
  onClick: () => void;
  children: ReactNode;
  pressed?: boolean;
}

/**
 * One icon-only control with a tooltip and accessible name.
 * @param props control input.
 * @returns the button.
 */
function IconButton({ label, onClick, children, pressed }: IconButtonProps) {
  return (
    <button
      type="button"
      className="fdp-icon-button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/**
 * The `files` page: a workspace tree and a CodeMirror editor.
 * @param props slot props and injected services.
 * @returns the workbench.
 */
export function FilesWorkbench(props: FilesWorkbenchProps) {
  const { t, useTabInfo, useSessions, useWorkspaces, useContextMenu, renderFactorySlot, sessionId } = props;
  const { tab, panel } = useTabInfo();
  const store = useMemo(() => storeFor(panel.id), [panel.id]);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const binding = useWorkspaceBinding({ sessionId, useSessions, useWorkspaces });
  const root = binding.root;
  const workspaceId = binding.workspaceId;
  const [cursor, setCursor] = useState<CursorReadout>({ line: 1, column: 1 });
  const [draggingWidth, setDraggingWidth] = useState<number | null>(null);
  const editorApi = useRef<BufferEditorApi | null>(null);

  useEffect(() => {
    if (root !== null && workspaceId !== null) store.init(sessionId, workspaceId, root);
  }, [store, sessionId, workspaceId, root]);

  useEffect(() => {
    if (root !== null && workspaceId !== null) {
      contexts.set(sessionId, { sessionId, workspaceId, root: root.replace(/\/+$/, ''), store });
    }
  }, [sessionId, workspaceId, root, store]);

  const navigationPath = tab.navigation?.params?.path;
  const navigationRevision = tab.navigation?.revision;
  useEffect(() => {
    if (typeof navigationPath === 'string' && navigationPath !== '' && state.root !== null) {
      void store.reveal(navigationPath).catch((error: unknown) => {
        notify(t(errorKey(codeOfFailure(error))), 'error');
      });
    }
  }, [navigationRevision, state.root]);

  const active = state.buffers.find((buffer) => buffer.path === state.activePath) ?? null;

  const openEntry = useCallback(
    async (path: string) => {
      if (previewOnly(path)) {
        openPreview(sessionId, path);
        return;
      }
      try {
        await store.openFile(path);
      } catch (error) {
        const code = codeOfFailure(error);
        if (code !== undefined && PREVIEW_ONLY_CODES.has(code)) openPreview(sessionId, path);
        else notify(t(errorKey(code)), 'error');
      }
    },
    [sessionId, store, t],
  );

  const entries = useMemo(() => {
    const list: TreeEntry[] = [];
    for (const [levelPath, level] of Object.entries(state.levels)) {
      if (level.status !== 'ready') continue;
      for (const entry of level.entries) {
        list.push({
          path: `${levelPath.replace(/\/+$/, '')}/${entry.name}`,
          name: entry.name,
          meta: { kind: entry.type === 'directory' ? 'directory' : entry.type === 'file' ? 'file' : 'other' },
        });
      }
    }
    return list;
  }, [state.levels]);

  const directories = useMemo(() => {
    const map: Record<string, TreeDirectoryState> = {};
    const paths = new Set<string>();
    if (state.root !== null) paths.add(state.root);
    for (const path of state.expanded) paths.add(path);
    for (const path of paths) {
      if (path === '') continue;
      const key = path.replace(/\/+$/, '');
      const level = state.levels[path];
      if (level === undefined || level.status === 'loading') map[key] = { loading: true };
      else if (level.status === 'failed') map[key] = { failure: t('tree.failed') };
      else map[key] = level.truncated === true ? { truncated: true } : {};
    }
    return map;
  }, [state.levels, state.expanded, state.root, t]);

  const contextMenu = typeof useContextMenu === 'function' ? useContextMenu() : null;
  const getTriggerProps = contextMenu?.getTriggerProps;

  const treeInput = useMemo<TreeInput>(
    () => ({
      root: state.root === null ? '' : state.root.replace(/\/+$/, ''),
      entries,
      expanded: state.expanded,
      onToggle: (entry, expanded) => store.toggle(entry.path, expanded),
      onOpen: (entry) => {
        void openEntry(entry.path);
      },
      directories,
      current: active?.path,
      rowTriggerProps: (entry, kind) =>
        typeof getTriggerProps === 'function'
          ? getTriggerProps(
              kind === 'directory'
                ? { kind: 'directory', value: { sessionId, path: entry.path } }
                : { kind: 'file', value: { sessionId, path: entry.path, paneId: panel.id } },
            )
          : {},
    }),
    [state.root, entries, state.expanded, directories, active?.path, getTriggerProps, sessionId, panel.id, store, openEntry],
  );

  const closeBuffer = async (path: string) => {
    const buffer = store.buffer(path);
    if (buffer !== undefined && path === state.activePath && (buffer.status === 'dirty' || buffer.status === 'conflict')) {
      await editorApi.current?.save();
    }
    store.closeBuffer(path);
  };

  const saveActive = () => {
    void editorApi.current?.save();
  };

  const treeWidth = draggingWidth ?? state.treeWidth;
  const targetDirectory = active === null ? state.root : dirname(active.path);

  const beginResize = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = state.treeWidth;
    const move = (moveEvent: PointerEvent) =>
      setDraggingWidth(Math.max(180, Math.min(560, startWidth + moveEvent.clientX - startX)));
    const end = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      setDraggingWidth((width) => {
        if (width !== null) store.setTreeWidth(width);
        return null;
      });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
  };

  if (root === null || workspaceId === null) {
    return (
      <section className="fdp-root" data-dsh-files="">
        <div className="fdp-empty">
          <IconFolder />
          <p className="fdp-empty-title">{t('empty.noRoot')}</p>
          <p className="fdp-empty-hint">{t('empty.noRootHint')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="fdp-root" data-dsh-files="">
      <header className="fdp-header">
        <div className="fdp-heading">
          {active === null ? (
            <span className="fdp-path" title={state.root ?? ''}>
              <IconFolder />
              <span className="fdp-path-name">{state.root === null ? t('empty.noRoot') : basename(state.root)}</span>
            </span>
          ) : (
            <PathLabel path={active.path} root={root} />
          )}
        </div>
        <div className="fdp-actions">
          {active !== null && active.status !== 'clean' && active.status !== 'saved' ? (
            <IconButton label={t('action.save')} onClick={saveActive}>
              <IconSave />
            </IconButton>
          ) : null}
          {active !== null ? (
            <IconButton label={t('action.preview')} onClick={() => openPreview(sessionId, active.path)}>
              <IconEye />
            </IconButton>
          ) : null}
          <IconButton
            label={t('action.newFile')}
            onClick={() => {
              if (targetDirectory !== null) void newFile(sessionId, targetDirectory);
            }}
          >
            <IconFilePlus />
          </IconButton>
          <IconButton
            label={t('action.newFolder')}
            onClick={() => {
              if (targetDirectory !== null) void newFolder(sessionId, targetDirectory);
            }}
          >
            <IconFolderPlus />
          </IconButton>
          <IconButton label={t('action.refresh')} onClick={() => store.refresh()}>
            <IconRefresh />
          </IconButton>
        </div>
      </header>
      <div className="fdp-body">
        <aside className="fdp-tree" style={{ width: `${treeWidth}px` }}>
          <div className="fdp-tree-scroll">
            {state.root === null ? (
              <p className="fdp-note">{t('tree.loading')}</p>
            ) : typeof renderFactorySlot === 'function' ? (
              renderFactorySlot('sidebar.files.tree', treeInput, TREE_OPTIONS) ?? (
                <p className="fdp-note">{t('tree.unavailable')}</p>
              )
            ) : (
              <p className="fdp-note">{t('tree.unavailable')}</p>
            )}
          </div>
        </aside>
        <div
          className="fdp-divider"
          role="separator"
          aria-orientation="vertical"
          aria-label={t('action.refresh')}
          aria-valuenow={treeWidth}
          tabIndex={0}
          onPointerDown={beginResize}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') store.setTreeWidth(treeWidth - 16);
            else if (event.key === 'ArrowRight') store.setTreeWidth(treeWidth + 16);
          }}
        />
        <main className="fdp-main">
          {state.buffers.length > 0 ? (
            <div className="fdp-tabs" role="tablist">
              {state.buffers.map((buffer) => {
                const isActive = buffer.path === state.activePath;
                const dirty = buffer.status === 'dirty' || buffer.status === 'conflict';
                return (
                  <div key={buffer.path} className={isActive ? 'fdp-tab fdp-tab-active' : 'fdp-tab'} role="presentation">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className="fdp-tab-main"
                      title={buffer.path}
                      onClick={() => store.setActive(buffer.path)}
                    >
                      <span className="fdp-tab-name">{basename(buffer.path)}</span>
                      {dirty ? (
                        <span
                          className={buffer.status === 'conflict' ? 'fdp-dot fdp-dot-warn' : 'fdp-dot'}
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                    <button
                      type="button"
                      className="fdp-tab-close"
                      aria-label={t('tab.close', { name: basename(buffer.path) })}
                      title={t('tab.close', { name: basename(buffer.path) })}
                      onClick={() => {
                        void closeBuffer(buffer.path);
                      }}
                    >
                      <IconClose />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}
          {active === null ? (
            <div className="fdp-empty">
              <IconFile />
              <p className="fdp-empty-title">{t('empty.select')}</p>
              <p className="fdp-empty-hint">{t('empty.selectHint')}</p>
            </div>
          ) : (
            <>
              {active.status === 'conflict' ? (
                <ConflictBanner
                  t={t}
                  onReload={() => {
                    void editorApi.current?.reload();
                  }}
                  onOverwrite={() => {
                    void editorApi.current?.overwrite();
                  }}
                />
              ) : null}
              <BufferEditor
                key={`${active.path}:${state.wrap}`}
                workspaceId={workspaceId}
                path={active.path}
                initialText={active.text}
                version={active.version}
                eol={active.eol}
                bom={active.bom}
                readOnly={active.readOnly}
                wrap={state.wrap}
                tabSize={2}
                line={typeof tab.navigation?.params?.line === 'number' ? tab.navigation.params.line : undefined}
                autoSave={state.autoSave}
                onChange={(text) => store.setBufferText(active.path, text)}
                onDirty={(dirty) => store.setBufferStatus(active.path, dirty ? 'dirty' : 'clean')}
                onStatus={(status, error?: BufferError) => store.setBufferStatus(active.path, status, error ?? null)}
                onSaved={(version) => store.updateBuffer(active.path, { version, status: 'clean' })}
                onCursor={setCursor}
                onError={(error) => notify(t(errorKey(codeOfFailure(error))), 'error')}
                onApi={(api) => {
                  editorApi.current = api;
                }}
              />
            </>
          )}
          <footer className="fdp-status">
            <span className="fdp-status-left">{active === null ? '' : t('status.encoding')}</span>
            <span className="fdp-status-right">
              {active === null ? null : (
                <>
                  <span>{`${cursor.line}:${cursor.column}`}</span>
                  <span>{languageFor(active.path)}</span>
                  <span>{active.eol === 'crlf' ? t('status.crlf') : t('status.lf')}</span>
                  <span className={active.status === 'conflict' || active.status === 'error' ? 'fdp-status-warn' : ''}>
                    {statusLabel(active.status)}
                  </span>
                  <button
                    type="button"
                    className="fdp-icon-button"
                    aria-label={t('action.wrap')}
                    title={t('action.wrap')}
                    aria-pressed={state.wrap}
                    onClick={() => store.toggleWrap()}
                  >
                    <IconWrap />
                  </button>
                </>
              )}
            </span>
          </footer>
        </main>
      </div>
    </section>
  );
}
