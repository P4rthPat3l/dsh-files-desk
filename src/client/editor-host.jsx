import React, { useEffect, useRef, useState } from 'react';
import { call, languageFor } from './api.js';
import { tr } from './locale.js';

let chunkPromise = null;

/**
 * Load the editor chunk once.
 * @returns {Promise<object>} the chunk exports.
 */
function loadEditorChunk() {
  if (chunkPromise === null) {
    const load = globalThis.__dshFilesDeskRequireAsync;
    if (typeof load !== 'function') {
      throw new Error('The editor chunk loader is unavailable.');
    }
    chunkPromise = load('./client.editor.js');
  }
  return chunkPromise;
}

/**
 * One file buffer with a CodeMirror editor, versioned saves, autosave, and a
 * disk-change check.
 *
 * The parent owns the buffer record and receives every status change. This
 * component owns the document text, the version it last read or wrote, and the
 * save loop.
 *
 * @param {object} props - buffer identity, initial content, preferences, and callbacks.
 * @returns {JSX.Element} the editor surface.
 */
export function BufferEditor(props) {
  const { workspaceId, path, initialText, version, eol, bom, readOnly, wrap, tabSize, line, autoSave } = props;
  const hostRef = useRef(null);
  const handleRef = useRef(null);
  const latestRef = useRef(initialText);
  const savedRef = useRef(initialText);
  const versionRef = useRef(version);
  const dirtyRef = useRef(false);
  const savingRef = useRef(false);
  const conflictRef = useRef(false);
  const autosaveRef = useRef(null);
  const propsRef = useRef(props);
  const saveRef = useRef(null);
  const [failed, setFailed] = useState(false);
  propsRef.current = props;

  /**
   * Write the current text when its version still matches.
   * @param {string} text - the document text.
   * @param {string} [forcedVersion] - a version to use instead, for overwrite.
   * @returns {Promise<boolean>} whether the write succeeded.
   */
  async function performSave(text, forcedVersion) {
    if (propsRef.current.readOnly || savingRef.current) return false;
    savingRef.current = true;
    propsRef.current.onStatus?.('saving');
    try {
      const result = await call('write', {
        workspaceId: propsRef.current.workspaceId,
        path: propsRef.current.path,
        text,
        version: forcedVersion ?? versionRef.current,
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
      if (error.code === 'files/conflict') {
        conflictRef.current = true;
        propsRef.current.onStatus?.('conflict');
      } else {
        propsRef.current.onStatus?.('error', error);
        propsRef.current.onError?.(error);
      }
      return false;
    } finally {
      savingRef.current = false;
    }
  }
  saveRef.current = performSave;

  /** Read the file again and replace the document. */
  async function reload() {
    try {
      const file = await call('read', { workspaceId: propsRef.current.workspaceId, path: propsRef.current.path });
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
  async function overwrite() {
    try {
      const stat = await call('stat', { workspaceId: propsRef.current.workspaceId, path: propsRef.current.path });
      await performSave(handleRef.current?.getText() ?? latestRef.current, stat.version);
    } catch (error) {
      propsRef.current.onError?.(error);
    }
  }

  /**
   * Handle one document change: dirty state, parent record, and autosave.
   * @param {string} text - the current document text.
   */
  function handleChange(text) {
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
        const api = {
          save: () => saveRef.current?.(handle.getText()),
          reload,
          overwrite,
          focus: handle.focus,
          revealLine: handle.revealLine,
          getText: handle.getText,
        };
        propsRef.current.onApi?.(api);
        propsRef.current.onStatus?.(dirtyRef.current ? 'dirty' : 'clean');
        if (typeof propsRef.current.line === 'number' && propsRef.current.line > 0) {
          handle.revealLine(propsRef.current.line);
        }
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
          const stat = await call('stat', { workspaceId, path });
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
