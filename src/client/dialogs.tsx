import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { codeOfFailure, errorKey } from './api.js';
import type { Translator } from './harness.js';
import type { ConfirmRequest, PromptRequest } from './store.js';
import { overlay } from './store.js';

/** The name dialog's props. */
interface PromptDialogProps {
  t: Translator;
  data: PromptRequest;
}

/**
 * The name dialog driven by `askName`.
 * @param props translator and dialog data.
 * @returns the dialog.
 */
function PromptDialog({ t, data }: PromptDialogProps) {
  const [value, setValue] = useState(data.initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const close = (result: string | null) => {
    overlay.patch({ prompt: null });
    data.resolve(result);
  };

  const submit = async () => {
    const trimmed = value.trim();
    if (trimmed === '' || busy) return;
    setBusy(true);
    setError(null);
    try {
      await data.submit(trimmed);
      overlay.patch({ prompt: null });
      data.resolve(trimmed);
    } catch (failure) {
      setError(t(errorKey(codeOfFailure(failure))));
      setBusy(false);
    }
  };

  return (
    <div
      className="fdp-scrim"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget && !busy) close(null);
      }}
    >
      <div
        className="fdp-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={data.title}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && !busy) close(null);
        }}
      >
        <div className="fdp-dialog-head">{data.title}</div>
        <label className="fdp-field">
          <span className="fdp-field-label">{data.label}</span>
          <input
            ref={inputRef}
            className="fdp-input"
            value={value}
            spellCheck={false}
            onChange={(event) => {
              setValue(event.target.value);
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void submit();
              }
            }}
          />
        </label>
        {error === null ? null : <p className="fdp-field-error">{error}</p>}
        <div className="fdp-dialog-actions">
          <button type="button" className="fdp-button" disabled={busy} onClick={() => close(null)}>
            {t('action.cancel')}
          </button>
          <button
            type="button"
            className="fdp-button fdp-button-primary"
            disabled={busy || value.trim() === ''}
            onClick={() => void submit()}
          >
            {busy ? '...' : data.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** The confirmation dialog's props. */
interface ConfirmDialogProps {
  t: Translator;
  data: ConfirmRequest;
}

/**
 * The confirmation dialog driven by `askConfirm`.
 * @param props translator and dialog data.
 * @returns the dialog.
 */
function ConfirmDialog({ t, data }: ConfirmDialogProps) {
  const close = (result: boolean) => {
    overlay.patch({ confirm: null });
    data.resolve(result);
  };
  return (
    <div
      className="fdp-scrim"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) close(false);
      }}
    >
      <div
        className="fdp-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={data.title}
        onKeyDown={(event) => {
          if (event.key === 'Escape') close(false);
        }}
      >
        <div className="fdp-dialog-head">{data.title}</div>
        <p className="fdp-dialog-message">{data.message}</p>
        <div className="fdp-dialog-actions">
          <button type="button" className="fdp-button" onClick={() => close(false)}>
            {t('action.cancel')}
          </button>
          <button
            type="button"
            className={data.danger === true ? 'fdp-button fdp-button-danger' : 'fdp-button fdp-button-primary'}
            onClick={() => close(true)}
          >
            {data.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * The overlay host: dialogs and notices for file operations from anywhere.
 * @param props translator.
 * @returns the host.
 */
export function FileOpsHost({ t }: { t: Translator }) {
  const state = useSyncExternalStore(overlay.subscribe, overlay.getSnapshot);
  const toast = state.toast;
  if (state.prompt === null && state.confirm === null && toast === null) return null;
  return (
    <div className="fdp-overlay-root" data-dsh-files-overlay="">
      {state.prompt === null ? null : <PromptDialog t={t} data={state.prompt} />}
      {state.confirm === null ? null : <ConfirmDialog t={t} data={state.confirm} />}
      {toast === null ? null : (
        <div className={toast.tone === 'error' ? 'fdp-toast fdp-toast-error' : 'fdp-toast'} role="status">
          {toast.text}
        </div>
      )}
    </div>
  );
}

/** The inline conflict banner's props. */
export interface ConflictBannerProps {
  t: Translator;
  onReload: () => void;
  onOverwrite: () => void;
}

/**
 * The inline banner shown when a buffer conflicts with the disk.
 * @param props the banner actions.
 * @returns the banner.
 */
export function ConflictBanner({ t, onReload, onOverwrite }: ConflictBannerProps) {
  return (
    <div className="fdp-conflict" role="alert">
      <div className="fdp-conflict-text">
        <strong>{t('conflict.title')}</strong>
        <span>{t('conflict.body')}</span>
      </div>
      <div className="fdp-conflict-actions">
        <button type="button" className="fdp-button" onClick={onReload}>
          {t('action.reload')}
        </button>
        <button type="button" className="fdp-button" onClick={onOverwrite}>
          {t('action.overwrite')}
        </button>
      </div>
    </div>
  );
}
