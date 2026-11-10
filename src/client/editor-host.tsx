import React, { useEffect, useRef, useState } from 'react';
import type { FileStat, TextFile, WrittenFile } from '../contract.js';
import { call, codeOfFailure, languageFor } from './api.js';
import type { CursorPosition, EditorChunk, EditorHandle } from './editor/entry.js';
import { tr } from './locale.js';
import type { BufferError, BufferStatus } from './store.js';

let chunkPromise: Promise<EditorChunk> | null = null;

/**
 * Load the editor chunk once.
 * @returns the chunk exports.
 */
function loadEditorChunk(): Promise<EditorChunk> {
  if (chunkPromise === null) {
    const load = globalThis.__dshFilesDeskRequireAsync;
    if (typeof load !== 'function') throw new Error('The editor chunk loader is unavailable.');
    chunkPromise = load<EditorChunk>('./client.editor.js');
  }
  return chunkPromise;
}

/** The handle a parent keeps to drive one open buffer. */
export interface BufferEditorApi {
  save: () => Promise<boolean> | undefined;
  reload: () => Promise<void>;
  overwrite: () => Promise<void>;
  focus: () => void;
  revealLine: (line: number) => void;
  getText: () => string;
}

/** Buffer identity, initial content, preferences, and callbacks. */
export interface BufferEditorProps {
  workspaceId: string | null;
  path: string;
  initialText: string;
  version: string | null;
  eol: 'lf' | 'crlf';
  bom: boolean;
  readOnly: boolean;
  wrap: boolean;
  tabSize: number;
  line?: number;
  autoSave: boolean;
  onChange?: (text: string) => void;
  onDirty?: (dirty: boolean) => void;
  onStatus?: (status: BufferStatus, error?: BufferError) => void;
  onSaved?: (version: string) => void;
  onCursor?: (position: CursorPosition) => void;
  onError?: (error: unknown) => void;
  onApi?: (api: BufferEditorApi) => void;
}

/**
 * Read a failure as a buffer error.
 * @param error the thrown value.
 * @returns the message and code.
 */
function bufferErrorOf(error: unknown): BufferError {
  return {
    code: codeOfFailure(error),
    message: error instanceof Error ? error.message : String(error),
  };
}

/**
 * One file buffer with a CodeMirror editor, versioned saves, autosave, and a
 * disk-change check.
 *
 * The parent owns the buffer record and receives every status change. This
 * component owns the document text, the version it last read or wrote, and the
 * save loop.
 *
 * @param props buffer identity, initial content, preferences, and callbacks.
 * @returns the editor surface.
 */
export function BufferEditor(props: BufferEditorProps) {
  const { workspaceId, path, initialText, version, readOnly, wrap, tabSize, line } = props;
  const hostRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<EditorHandle | null>(null);
  const latestRef = useRef(initialText);
  const savedRef = useRef(initialText);
  const versionRef = useRef<string | null>(version);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const conflictRef = useRef(false);
  const autosaveRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const propsRef = useRef(props);
  const saveRef = useRef<((text: string, forcedVersion?: string) => Promise<boolean>) | null>(null);
  const [failed, setFailed] = useState(false);
  propsRef.current = props;

  /**
   * Write the current text when its version still matches.
   * @param text the document text.
   * @param forcedVersion a version to use instead, for overwrite.
   * @returns whether the write succeeded.
   */
  async function performSave(text: string, forcedVersion?: string): Promise<boolean> {
    if (propsRef.current.readOnly || savingRef.current) return false;
    savingRef.current = true;
    propsRef.current.onStatus?.('saving');
    try {
      const result = await call<WrittenFile>('write', {
        workspaceId: propsRef.current.workspaceId,
        path: propsRef.current.path,
        text,
        version: forcedVersion ?? versionRef.current ?? '',
        eol: propsRef.current.eol,
        bom: propsRef.current.bom,
      });
      versionRef.current = result.version;
      savedRef.current = text;
      latestRef.current = text;
      dirtyRef.current = false;
      conflictRef.current = false;
      propsRef.current.onDirty?.(false);
      propsRef.current.onSaved?.(result.version);
      propsRef.current.onStatus?.('saved');
      return true;
    } catch (error) {
      if (codeOfFailure(error) === 'files/conflict') {
        conflictRef.current = true;
        propsRef.current.onStatus?.('conflict');
      } else {
        propsRef.current.onStatus?.('error', bufferErrorOf(error));
        propsRef.current.onError?.(error);
      }
      return false;
    } finally {
      savingRef.current = false;
    }
  }
  saveRef.current = performSave;

  /** Read the file again and replace the document. */
  async function reload(): Promise<void> {
    try {
      const file = await call<TextFile>('read', {
        workspaceId: propsRef.current.workspaceId,
        path: propsRef.current.path,
      });
      versionRef.current = file.version;
      savedRef.current = file.text;
      latestRef.current = file.text;
      dirtyRef.current = false;
      conflictRef.current = false;
      handleRef.current?.setText(file.text);
      propsRef.current.onSaved?.(file.version);
      propsRef.current.onDirty?.(false);
      propsRef.current.onStatus?.('clean');
    } catch (error) {
      propsRef.current.onError?.(error);
    }
  }

  /** Write over the disk version after the user chose overwrite. */
  async function overwrite(): Promise<void> {
    try {
      const stat = await call<FileStat>('stat', {
        workspaceId: propsRef.current.workspaceId,
        path: propsRef.current.path,
      });
      await performSave(handleRef.current?.getText() ?? latestRef.current, stat.version);
    } catch (error) {
      propsRef.current.onError?.(error);
    }
  }

  /**
   * Handle one document change: dirty state, parent record, and autosave.
   * @param text the current document text.
   */
  function handleChange(text: string): void {
    latestRef.current = text;
    propsRef.current.onChange?.(text);
    const dirty = text !== savedRef.current;
    if (dirty !== dirtyRef.current) {
      dirtyRef.current = dirty;
      propsRef.current.onDirty?.(dirty);
      if (!dirty) propsRef.current.onStatus?.('clean');
    }
    if (propsRef.current.autoSave && dirty && conflictRef.current === false) {
      clearTimeout(autosaveRef.current);
      autosaveRef.current = setTimeout(() => {
        const handle = handleRef.current;
        if (handle !== null) void saveRef.current?.(handle.getText());
      }, 800);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    loadEditorChunk()
      .then((chunk) => {
        if (cancelled || hostRef.current === null) return;
        const handle = chunk.createEditor({
          parent: hostRef.current,
          doc: latestRef.current,
          language: languageFor(path),
          readOnly,
          wrap,
          tabSize,
          line,
          onChange: handleChange,
          onCursor: (position) => propsRef.current.onCursor?.(position),
          onSave: () => {
            const current = handleRef.current;
            if (current !== null) void saveRef.current?.(current.getText());
          },
        });
        handleRef.current = handle;
        const api: BufferEditorApi = {
          save: () => saveRef.current?.(handle.getText()),
          reload,
          overwrite,
          focus: handle.focus,
          revealLine: handle.revealLine,
          getText: handle.getText,
        };
        propsRef.current.onApi?.(api);
        propsRef.current.onStatus?.(dirtyRef.current ? 'dirty' : 'clean');
        const initialLine = propsRef.current.line;
        if (typeof initialLine === 'number' && initialLine > 0) handle.revealLine(initialLine);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      clearTimeout(autosaveRef.current);
      handleRef.current?.destroy();
      handleRef.current = null;
    };
  }, [path, wrap, readOnly, tabSize]);

  useEffect(() => {
    if (typeof line === 'number' && line > 0 && handleRef.current !== null) handleRef.current.revealLine(line);
  }, [line]);

  useEffect(() => {
    if (readOnly) return undefined;
    const timer = setInterval(() => {
      if (savingRef.current) return;
      void (async () => {
        try {
          const stat = await call<FileStat>('stat', { workspaceId, path });
          if (stat.version === versionRef.current) return;
          if (dirtyRef.current) {
            if (!conflictRef.current) {
              conflictRef.current = true;
              propsRef.current.onStatus?.('conflict');
            }
            return;
          }
          await reload();
        } catch {
          // A missing file or a transient read failure leaves the buffer as it is.
        }
      })();
    }, 3000);
    return () => clearInterval(timer);
  }, [workspaceId, path, readOnly]);

  return (
    <div className="fdp-editor-host">
      <div ref={hostRef} className="fdp-editor-mount" data-fdp-editor={path} />
      {failed ? <p className="fdp-note">{tr('error.generic')}</p> : null}
    </div>
  );
}
