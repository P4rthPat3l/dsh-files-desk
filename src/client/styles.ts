const STYLE_ID = 'dsh-files-desk/styles';

const CSS = `
.fdp-root {
  --fdp-code-keyword: #8b3d9e;
  --fdp-code-string: #2f7d32;
  --fdp-code-number: #8a5a00;
  --fdp-code-comment: #8a8f98;
  --fdp-code-function: #2f5fb3;
  --fdp-code-type: #9a6700;
  --fdp-code-variable: #b03a2e;
  --fdp-code-operator: #0b7285;
  --fdp-code-meta: #2f5fb3;
  --fdp-code-invalid: #b03a2e;
  --fdp-code-link: #2f5fb3;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  font-size: 13px;
  line-height: 1.5;
}
body[data-ds-dark-theme] .fdp-root {
  --fdp-code-keyword: #c678dd;
  --fdp-code-string: #98c379;
  --fdp-code-number: #d19a66;
  --fdp-code-comment: #6b7280;
  --fdp-code-function: #61afef;
  --fdp-code-type: #e5c07b;
  --fdp-code-variable: #e06c75;
  --fdp-code-operator: #56b6c2;
  --fdp-code-meta: #61afef;
  --fdp-code-invalid: #e06c75;
  --fdp-code-link: #61afef;
}
.fdp-root *, .fdp-overlay-root *, .fdp-root *::before, .fdp-overlay-root *::before {
  box-sizing: border-box;
}
.fdp-header {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 6px 0 12px;
  border-bottom: .5px solid var(--dsw-alias-border-l3);
}
.fdp-editor-tab .fdp-header { padding-left: 14px; }
.fdp-heading {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--dsw-alias-label-secondary);
}
.fdp-path {
  display: flex;
  align-items: baseline;
  gap: 0;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  font-size: 12px;
}
.fdp-path svg { flex: none; align-self: center; margin-right: 6px; color: var(--dsw-alias-label-tertiary); }
.fdp-path-dir {
  color: var(--dsw-alias-label-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
}
.fdp-path-name {
  color: var(--dsw-alias-label-primary);
  overflow: hidden;
  text-overflow: ellipsis;
}
.fdp-actions { flex: none; display: flex; align-items: center; gap: 2px; }
.fdp-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: var(--dsw-radius-sm, 6px);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  flex: none;
}
.fdp-icon-button svg { width: 15px; height: 15px; }
.fdp-icon-button:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.fdp-icon-button[aria-pressed="true"] { background: var(--dsw-alias-interactive-bg-active); color: var(--dsw-alias-label-primary); }
.fdp-body { flex: 1; min-height: 0; min-width: 0; display: flex; }
.fdp-tree {
  flex: none;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--dsw-alias-bg-base);
}
.fdp-tree-scroll {
  height: 100%;
  overflow: auto;
  padding: 6px 0 10px 6px;
  scrollbar-gutter: stable;
}
.fdp-divider {
  flex: none;
  width: 5px;
  cursor: col-resize;
  position: relative;
  touch-action: none;
  background: transparent;
}
.fdp-divider::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 2px;
  width: 1px;
  background: var(--dsw-alias-border-l3);
  transition: background-color .12s ease;
}
.fdp-divider:hover::after, .fdp-divider:focus-visible::after { background: var(--dsw-alias-brand-primary); }
.fdp-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.fdp-tabs {
  flex: none;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 34px;
  padding: 4px 6px 0;
  border-bottom: .5px solid var(--dsw-alias-border-l3);
  overflow-x: auto;
  overflow-y: hidden;
}
.fdp-tabs::-webkit-scrollbar { height: 0; }
.fdp-tab {
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: 190px;
  height: 26px;
  border-radius: var(--dsw-radius-sm, 6px) var(--dsw-radius-sm, 6px) 0 0;
  color: var(--dsw-alias-label-secondary);
}
.fdp-tab-active {
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
}
.fdp-tab-main {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  height: 100%;
  padding: 0 4px 0 9px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.fdp-tab-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fdp-dot {
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--dsw-alias-state-warn-primary);
}
.fdp-dot-warn { background: var(--dsw-alias-state-error-primary); }
.fdp-tab-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 22px;
  height: 22px;
  margin-right: 3px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
}
.fdp-tab-close:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.fdp-editor-host { flex: 1; min-height: 0; min-width: 0; position: relative; }
.fdp-editor-mount { position: absolute; inset: 0; }
.fdp-editor-mount .cm-editor { height: 100%; }
.fdp-editor-mount .cm-editor.cm-focused { outline: none; }
.fdp-editor-mount .cm-scroller { overflow: auto; }
.fdp-status {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  height: 26px;
  padding: 0 8px 0 12px;
  border-top: .5px solid var(--dsw-alias-border-l3);
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
}
.fdp-status-right { display: flex; align-items: center; gap: 10px; min-width: 0; }
.fdp-status-left { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fdp-status-warn { color: var(--dsw-alias-state-warn-primary); }
.fdp-status .fdp-icon-button { width: 22px; height: 22px; }
.fdp-status .fdp-icon-button svg { width: 13px; height: 13px; }
.fdp-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 24px;
  text-align: center;
  color: var(--dsw-alias-label-tertiary);
}
.fdp-empty svg { width: 26px; height: 26px; color: var(--dsw-alias-label-tertiary); margin-bottom: 4px; }
.fdp-empty-title { margin: 0; font-size: 13px; font-weight: 500; color: var(--dsw-alias-label-secondary); }
.fdp-empty-hint { margin: 0; max-width: 280px; font-size: 12px; line-height: 1.6; }
.fdp-note { margin: 0; padding: 8px 10px; color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.fdp-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-sm, 6px);
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}
.fdp-button:hover { background: var(--dsw-alias-interactive-bg-hover); }
.fdp-button:disabled { opacity: .5; cursor: default; }
.fdp-button-primary {
  border-color: transparent;
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-label-primary-foreground);
}
.fdp-button-primary:hover { background: var(--dsw-alias-button-primary-hover); }
.fdp-button-danger {
  border-color: transparent;
  background: var(--dsw-alias-state-error-primary);
  color: var(--dsw-alias-label-primary-foreground);
}
.fdp-conflict {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: .5px solid var(--dsw-alias-border-l1);
  border-left: 3px solid var(--dsw-alias-state-warn-primary);
  background: var(--dsw-alias-bg-layer-2);
}
.fdp-conflict-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.fdp-conflict-text strong { font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.fdp-conflict-text span { font-size: 12px; color: var(--dsw-alias-label-secondary); }
.fdp-conflict-actions { flex: none; display: flex; gap: 6px; }
.fdp-overlay-root { position: fixed; inset: 0; z-index: 60; }
.fdp-scrim {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--dsw-alias-bg-mask-1);
}
.fdp-dialog {
  width: min(380px, 100%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: var(--dsw-radius-lg, 12px);
  border: .5px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-overlay);
  box-shadow: var(--dsw-elevation-prominent, 0 12px 32px rgba(0, 0, 0, .24));
  color: var(--dsw-alias-label-primary);
}
.fdp-dialog-head { font-size: 13px; font-weight: 600; }
.fdp-dialog-message { margin: 0; font-size: 12px; line-height: 1.6; color: var(--dsw-alias-label-secondary); }
.fdp-dialog-actions { display: flex; justify-content: flex-end; gap: 8px; }
.fdp-field { display: flex; flex-direction: column; gap: 6px; }
.fdp-field-label { font-size: 12px; color: var(--dsw-alias-label-secondary); }
.fdp-input {
  width: 100%;
  height: 32px;
  padding: 0 9px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-sm, 6px);
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
}
.fdp-input:focus { outline: none; border-color: var(--dsw-alias-state-business-primary); box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 22%, transparent); }
.fdp-field-error { margin: 0; font-size: 12px; color: var(--dsw-alias-state-error-primary); }
.fdp-toast {
  position: fixed;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  max-width: 80vw;
  padding: 8px 12px;
  border-radius: var(--dsw-radius-sm, 6px);
  background: var(--dsw-alias-toast-bg);
  color: var(--dsw-alias-toast-label);
  font-size: 12px;
  box-shadow: var(--dsw-elevation-prominent, 0 8px 24px rgba(0, 0, 0, .2));
}
.fdp-toast-error { border-left: 3px solid var(--dsw-alias-state-error-primary); }
.fdp-root .cm-panels { font-family: inherit; }
.fdp-root .cm-panel.cm-search { padding: 6px 8px; }
.fdp-root .cm-panel.cm-search input, .fdp-root .cm-panel.cm-search button { font-size: 12px; }
.fdp-root :focus-visible, .fdp-overlay-root :focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary);
  outline-offset: 1px;
}
.fdp-root .cm-editor:focus,
.fdp-root .cm-editor:focus-visible,
.fdp-root .cm-scroller:focus,
.fdp-root .cm-scroller:focus-visible,
.fdp-root .cm-content:focus,
.fdp-root .cm-content:focus-visible,
.fdp-root .cm-gutters:focus,
.fdp-root .cm-gutters:focus-visible {
  outline: none;
}
.fdp-tok-keyword { color: var(--fdp-code-keyword); }
.fdp-tok-string { color: var(--fdp-code-string); }
.fdp-tok-number { color: var(--fdp-code-number); }
.fdp-tok-comment { color: var(--fdp-code-comment); font-style: italic; }
.fdp-tok-function { color: var(--fdp-code-function); }
.fdp-tok-type { color: var(--fdp-code-type); }
.fdp-tok-variable { color: var(--fdp-code-variable); }
.fdp-tok-operator { color: var(--fdp-code-operator); }
.fdp-tok-meta { color: var(--fdp-code-meta); }
.fdp-tok-invalid { color: var(--fdp-code-invalid); text-decoration: underline; }
.fdp-tok-link { color: var(--fdp-code-link); text-decoration: underline; }
.fdp-tok-heading { font-weight: 600; color: var(--dsw-alias-label-primary); }
.fdp-tok-emphasis { font-style: italic; }
.fdp-tok-strong { font-weight: 700; }
.fdp-chip { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }
.fdp-chip svg { flex: none; color: var(--dsw-alias-label-tertiary); }
.fdp-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

/** Install the plugin stylesheet once. */
export function installStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`) !== null) return;
  const tag = document.createElement('style');
  tag.dataset.plugin = 'dsh-files-desk';
  tag.dataset.pluginCss = STYLE_ID;
  tag.textContent = CSS;
  document.head.appendChild(tag);
}
