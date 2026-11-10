import { EditorState, StateEffect, StateField } from '@codemirror/state';
import {
  EditorView,
  Decoration,
  drawSelection,
  dropCursor,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  rectangularSelection,
  crosshairCursor,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import {
  bracketMatching,
  foldGutter,
  HighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';
import { highlightSelectionMatches, openSearchPanel, searchKeymap } from '@codemirror/search';
import { tags } from '@lezer/highlight';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { python } from '@codemirror/lang-python';
import { yaml } from '@codemirror/lang-yaml';
import { xml } from '@codemirror/lang-xml';
import { sql } from '@codemirror/lang-sql';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { rust } from '@codemirror/lang-rust';
import { go } from '@codemirror/lang-go';
import { php } from '@codemirror/lang-php';

const landingEffect = StateEffect.define();

const landingField = StateField.define({
  create: () => Decoration.none,
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(landingEffect)) {
        return effect.value === null
          ? Decoration.none
          : Decoration.set([Decoration.line({ class: 'fdp-landing' }).range(effect.value)]);
      }
    }
    return value.map(transaction.changes);
  },
  provide: (field) => EditorView.decorations.from(field),
});

const highlightStyle = HighlightStyle.define([
  { tag: [tags.keyword, tags.modifier, tags.controlKeyword, tags.operatorKeyword], class: 'fdp-tok-keyword' },
  { tag: [tags.string, tags.special(tags.string), tags.regexp], class: 'fdp-tok-string' },
  { tag: [tags.number, tags.bool, tags.null], class: 'fdp-tok-number' },
  { tag: [tags.comment, tags.lineComment, tags.blockComment, tags.docComment], class: 'fdp-tok-comment' },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName), tags.macroName], class: 'fdp-tok-function' },
  { tag: [tags.typeName, tags.className, tags.namespace, tags.definitionKeyword], class: 'fdp-tok-type' },
  { tag: [tags.variableName, tags.propertyName, tags.attributeName], class: 'fdp-tok-variable' },
  { tag: [tags.operator, tags.punctuation, tags.separator], class: 'fdp-tok-operator' },
  { tag: [tags.meta, tags.annotation, tags.labelName], class: 'fdp-tok-meta' },
  { tag: [tags.invalid, tags.deleted], class: 'fdp-tok-invalid' },
  { tag: tags.link, class: 'fdp-tok-link' },
  { tag: tags.heading, class: 'fdp-tok-heading' },
  { tag: tags.emphasis, class: 'fdp-tok-emphasis' },
  { tag: tags.strong, class: 'fdp-tok-strong' },
]);

const theme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: 'transparent',
    color: 'var(--dsw-alias-label-primary)',
  },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': {
    fontFamily: 'var(--fdp-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace)',
    fontSize: 'var(--fdp-font-size, 13px)',
    lineHeight: '1.55',
    overflow: 'auto',
  },
  '.cm-content': {
    padding: '8px 0 24px',
    caretColor: 'var(--dsw-alias-label-primary)',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: 'var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary))',
    border: 'none',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px 0 6px',
    minWidth: '34px',
  },
  '.cm-activeLine': {
    backgroundColor: 'color-mix(in srgb, var(--dsw-alias-label-primary) 5%, transparent)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: 'var(--dsw-alias-label-primary)',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'color-mix(in srgb, var(--dsw-alias-brand-primary) 22%, transparent)',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--dsw-alias-label-primary)',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: 'var(--dsw-alias-bg-layer-2)',
    border: 'none',
    color: 'var(--dsw-alias-label-secondary)',
  },
  '.cm-panels': {
    backgroundColor: 'var(--dsw-alias-bg-layer-2)',
    color: 'var(--dsw-alias-label-primary)',
  },
  '.cm-panels.cm-panels-top': { borderBottom: '1px solid var(--dsw-alias-border-l1)' },
  '.cm-searchMatch': {
    backgroundColor: 'color-mix(in srgb, var(--dsw-alias-state-warn-primary) 24%, transparent)',
    outline: '1px solid var(--dsw-alias-state-warn-primary)',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'color-mix(in srgb, var(--dsw-alias-state-warn-primary) 40%, transparent)',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'color-mix(in srgb, var(--dsw-alias-brand-primary) 20%, transparent)',
    outline: 'none',
  },
  '.fdp-landing': {
    backgroundColor: 'color-mix(in srgb, var(--dsw-alias-brand-primary) 16%, transparent)',
    transition: 'background-color 1.4s ease',
  },
}, { dark: false });

const LANGUAGE_EXTENSIONS = {
  javascript: () => javascript(),
  typescript: () => javascript({ typescript: true }),
  jsx: () => javascript({ jsx: true }),
  tsx: () => javascript({ jsx: true, typescript: true }),
  json: () => json(),
  markdown: () => markdown(),
  css: () => css(),
  html: () => html(),
  python: () => python(),
  yaml: () => yaml(),
  xml: () => xml(),
  sql: () => sql(),
  java: () => java(),
  cpp: () => cpp(),
  rust: () => rust(),
  go: () => go(),
  php: () => php(),
  text: () => [],
};

/**
 * Read the 1-based line and column of the main cursor.
 * @param {EditorState} state - the current state.
 * @returns {{ line: number, column: number }} the position.
 */
function cursorOf(state) {
  const head = state.selection.main.head;
  const line = state.doc.lineAt(head);
  return { line: line.number, column: head - line.from + 1 };
}

/**
 * Create one editor view.
 * @param {object} options - creation options.
 * @param {HTMLElement} options.parent - the container.
 * @param {string} options.doc - initial text.
 * @param {string} [options.language] - the language key.
 * @param {boolean} [options.readOnly] - whether editing is disabled.
 * @param {boolean} [options.wrap] - whether long lines wrap.
 * @param {number} [options.tabSize] - the tab width.
 * @param {number} [options.line] - a 1-based line to reveal.
 * @param {(text: string) => void} [options.onChange] - document change callback.
 * @param {(position: { line: number, column: number }) => void} [options.onCursor] - cursor callback.
 * @param {() => void} [options.onSave] - Ctrl+S callback.
 * @returns {object} the editor handle.
 */
export function createEditor(options) {
  const language = LANGUAGE_EXTENSIONS[options.language ?? 'text'] ?? LANGUAGE_EXTENSIONS.text;
  let landingTimer;
  const saveKey = {
    key: 'Mod-s',
    preventDefault: true,
    run: () => {
      options.onSave?.();
      return true;
    },
  };
  const findKey = {
    key: 'Mod-f',
    preventDefault: true,
    run: (view) => {
      openSearchPanel(view);
      return true;
    },
  };
  const view = new EditorView({
    parent: options.parent,
    state: EditorState.create({
      doc: options.doc,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        drawSelection(),
        dropCursor(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        indentOnInput(),
        bracketMatching(),
        foldGutter(),
        syntaxHighlighting(highlightStyle),
        landingField,
        keymap.of([saveKey, findKey, ...defaultKeymap, ...historyKeymap, ...searchKeymap, indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) options.onChange?.(update.state.doc.toString());
          if (update.selectionSet || update.docChanged) options.onCursor?.(cursorOf(update.state));
        }),
        theme,
        options.wrap === true ? EditorView.lineWrapping : [],
        options.readOnly === true
          ? [EditorState.readOnly.of(true), EditorView.editable.of(false)]
          : [],
        EditorState.tabSize.of(Math.max(1, options.tabSize ?? 2)),
        language(),
      ],
    }),
  });

  function revealLine(lineNumber) {
    const total = view.state.doc.lines;
    const line = view.state.doc.line(Math.min(Math.max(1, lineNumber), total));
    view.dispatch({
      selection: { anchor: line.from },
      effects: EditorView.scrollIntoView(line.from, { y: 'center' }),
    });
    view.dispatch({ effects: landingEffect.of(line.from) });
    clearTimeout(landingTimer);
    landingTimer = setTimeout(() => {
      view.dispatch({ effects: landingEffect.of(null) });
    }, 1600);
  }

  if (typeof options.line === 'number' && options.line > 0) {
    requestAnimationFrame(() => revealLine(options.line));
  }

  return {
    view,
    getText: () => view.state.doc.toString(),
    setText(text) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: text },
        selection: { anchor: Math.min(view.state.selection.main.anchor, text.length) },
        scrollIntoView: false,
      });
    },
    revealLine,
    focus: () => view.focus(),
    destroy() {
      clearTimeout(landingTimer);
      view.destroy();
    },
  };
}
