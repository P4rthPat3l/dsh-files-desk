import React, { useEffect, useRef, useState } from 'react';
import {
  basename,
  call,
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
import { ConflictBanner } from './dialogs.jsx';
import { IconEye, IconSave } from './icons.jsx';
import { notify } from './store.js';
import { openPreview, revealInFiles } from './ops.js';

const PREVIEW_CODES = new Set(['files/binary', 'files/too-large', 'files/not-utf8']);

/**
 * One resource file opened as an editor tab. It carries a path from the
 * address and an optional line from navigation parameters.
 * @param {object} props - slot props and injected services.
 * @returns {JSX.Element} the editor tab.
 */
export function EditorTab(props) {
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
  const line = tab.navigation?.params?.line;
  const readOnly = root === null || absolutePath === '' ? true : !isInside(root, absolutePath);
  const [load, setLoad] = useState({ status: 'loading', file: null, error: null });
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [status, setStatus] = useState('clean');
  const apiRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    if (workspaceId === null || absolutePath === '') {
      setLoad({ status: 'failed', file: null, error: { code: 'files/no-workspace', message: 'No workspace.' } });
      return () => {
        cancelled = true;
      };
    }
    setLoad({ status: 'loading', file: null, error: null });
    call('read', { workspaceId, path: absolutePath })
      .then((file) => {
        if (!cancelled) setLoad({ status: 'ready', file, error: null });
      })
      .catch((error) => {
        if (!cancelled) setLoad({ status: 'failed', file: null, error });
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, absolutePath, tab.id]);

  const name = absolutePath === '' ? '' : basename(absolutePath);
  const directory = absolutePath.slice(0, absolutePath.length - name.length);
  let displayDirectory = root !== null && directory.startsWith(root) ? directory.slice(root.length) : directory;
  if (displayDirectory === '/') displayDirectory = '';
  const failedCode = load.error?.code;
  const canPreview = previewOnly(absolutePath) || PREVIEW_CODES.has(failedCode);

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
            sessionId={targetSession}
            workspaceId={workspaceId}
            path={absolutePath}
            initialText={load.file.text}
            version={load.file.version}
            eol={load.file.eol}
            bom={load.file.bom}
            readOnly={readOnly}
            wrap={false}
            tabSize={2}
            line={typeof line === 'number' ? line : undefined}
            autoSave
            onDirty={(dirty) => setStatus(dirty ? 'dirty' : 'clean')}
            onStatus={(next) => setStatus(next)}
            onSaved={() => setStatus('clean')}
            onCursor={setCursor}
            onError={(error) => notify(t(errorKey(error?.code)), 'error')}
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
