import React, { useEffect, useRef, useState } from 'react';
import type { TextFile } from '../contract.js';
import {
  basename,
  call,
  codeOfFailure,
  errorKey,
  isAbsolutePath,
  isInside,
  joinPath,
  languageFor,
  normalizePath,
  parseAddress,
  previewOnly,
} from './api.js';
import { useWorkspaceBinding } from './binding.js';
import { BufferEditor } from './editor-host.jsx';
import type { BufferEditorApi } from './editor-host.jsx';
import { ConflictBanner } from './dialogs.jsx';
import type { EditorTabProps } from './harness.js';
import { IconEye, IconSave } from './icons.jsx';
import type { BufferError, BufferStatus } from './store.js';
import { notify } from './store.js';
import { openPreview, revealInFiles } from './ops.js';

const PREVIEW_CODES: ReadonlySet<string> = new Set(['files/binary', 'files/too-large', 'files/not-utf8']);

/** One file load. */
type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; file: TextFile }
  | { status: 'failed'; error: BufferError };

/** The cursor readout. */
interface CursorReadout {
  line: number;
  column: number;
}

/**
 * One resource file opened as an editor tab. It carries a path from the
 * address and an optional line from navigation parameters.
 * @param props slot props and injected services.
 * @returns the editor tab.
 */
export function EditorTab(props: EditorTabProps) {
  const { t, sessionId, useTabInfo, useSessions, useWorkspaces } = props;
  const { tab } = useTabInfo();
  const parsed = parseAddress(tab.contentId ?? tab.navigation?.address);
  const targetSession = parsed?.sessionId ?? sessionId;
  const binding = useWorkspaceBinding({ sessionId: targetSession, useSessions, useWorkspaces });
  const root = binding.root;
  const workspaceId = binding.workspaceId;
  const rawPath = parsed?.path ?? '';
  const absolutePath =
    rawPath === ''
      ? ''
      : isAbsolutePath(rawPath)
        ? normalizePath(rawPath)
        : root === null
          ? rawPath
          : joinPath(root, rawPath);
  const lineParam = tab.navigation?.params?.line;
  const line = typeof lineParam === 'number' ? lineParam : undefined;
  const readOnly = root === null || absolutePath === '' ? true : !isInside(root, absolutePath);
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [cursor, setCursor] = useState<CursorReadout>({ line: 1, column: 1 });
  const [status, setStatus] = useState<BufferStatus>('clean');
  const apiRef = useRef<BufferEditorApi | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (workspaceId === null || absolutePath === '') {
      setLoad({
        status: 'failed',
        error: { code: 'files/no-workspace', message: 'No workspace.' },
      });
      return () => {
        cancelled = true;
      };
    }
    setLoad({ status: 'loading' });
    call<TextFile>('read', { workspaceId, path: absolutePath })
      .then((file) => {
        if (!cancelled) setLoad({ status: 'ready', file });
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoad({ status: 'failed', error: { code: codeOfFailure(error), message: String(error) } });
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, absolutePath, tab.id]);

  const name = absolutePath === '' ? '' : basename(absolutePath);
  const directory = absolutePath.slice(0, absolutePath.length - name.length);
  let displayDirectory = root !== null && directory.startsWith(root) ? directory.slice(root.length) : directory;
  if (displayDirectory === '/') displayDirectory = '';
  const failedCode = load.status === 'failed' ? load.error.code : undefined;
  const canPreview = previewOnly(absolutePath) || (failedCode !== undefined && PREVIEW_CODES.has(failedCode));

  return (
    <section className="fdp-root fdp-editor-tab" data-dsh-files="">
      <header className="fdp-header">
        <div className="fdp-heading">
          <span className="fdp-path" title={absolutePath}>
            {displayDirectory === '' ? null : <span className="fdp-path-dir">{displayDirectory}</span>}
            <span className="fdp-path-name">{name}</span>
          </span>
        </div>
        <div className="fdp-actions">
          {load.status === 'ready' && status !== 'clean' && status !== 'saved' ? (
            <button
              type="button"
              className="fdp-icon-button"
              aria-label={t('action.save')}
              title={t('action.save')}
              onClick={() => {
                void apiRef.current?.save();
              }}
            >
              <IconSave />
            </button>
          ) : null}
          <button
            type="button"
            className="fdp-icon-button"
            aria-label={t('action.preview')}
            title={t('action.preview')}
            onClick={() => openPreview(targetSession, absolutePath, line)}
          >
            <IconEye />
          </button>
        </div>
      </header>
      {load.status === 'loading' ? (
        <div className="fdp-empty">
          <p className="fdp-empty-hint">{t('empty.loading')}</p>
        </div>
      ) : null}
      {load.status === 'failed' ? (
        <div className="fdp-empty">
          <p className="fdp-empty-title">{t(errorKey(failedCode))}</p>
          {canPreview ? (
            <button type="button" className="fdp-button" onClick={() => openPreview(targetSession, absolutePath, line)}>
              {t('action.preview')}
            </button>
          ) : null}
          {workspaceId === null ? null : (
            <button type="button" className="fdp-button" onClick={() => revealInFiles(absolutePath)}>
              {t('action.reveal')}
            </button>
          )}
        </div>
      ) : null}
      {load.status === 'ready' ? (
        <>
          {status === 'conflict' ? (
            <ConflictBanner
              t={t}
              onReload={() => {
                void apiRef.current?.reload();
              }}
              onOverwrite={() => {
                void apiRef.current?.overwrite();
              }}
            />
          ) : null}
          <BufferEditor
            workspaceId={workspaceId}
            path={absolutePath}
            initialText={load.file.text}
            version={load.file.version}
            eol={load.file.eol}
            bom={load.file.bom}
            readOnly={readOnly}
            wrap={false}
            tabSize={2}
            line={line}
            autoSave
            onDirty={(dirty) => setStatus(dirty ? 'dirty' : 'clean')}
            onStatus={(next) => setStatus(next)}
            onSaved={() => setStatus('clean')}
            onCursor={setCursor}
            onError={(error) => notify(t(errorKey(codeOfFailure(error))), 'error')}
            onApi={(api) => {
              apiRef.current = api;
            }}
          />
          <footer className="fdp-status">
            <span className="fdp-status-left">{readOnly ? t('status.readOnly') : t('status.encoding')}</span>
            <span className="fdp-status-right">
              <span>{`${cursor.line}:${cursor.column}`}</span>
              <span>{languageFor(absolutePath)}</span>
              <span>{load.file.eol === 'crlf' ? t('status.crlf') : t('status.lf')}</span>
              <span className={status === 'conflict' || status === 'error' ? 'fdp-status-warn' : ''}>
                {status === 'saving'
                  ? t('status.saving')
                  : status === 'conflict'
                    ? t('status.conflict')
                    : status === 'error'
                      ? t('status.error')
                      : status === 'dirty'
                        ? t('status.unsaved')
                        : ''}
              </span>
            </span>
          </footer>
        </>
      ) : null}
    </section>
  );
}
