import React from 'react';
import { basename, canEditAddress, configureConnection, parseAddress } from './api.js';
import { EN, ZH, setTranslator } from './locale.js';
import { registerMenus } from './menus.js';
import { runtime } from './runtime.js';
import { FileOpsHost } from './dialogs.jsx';
import { SurfaceBoundary } from './boundary.jsx';
import { FilesWorkbench } from './workbench.jsx';
import { EditorTab } from './editor-tab.jsx';

export { EditorTab, FilesWorkbench };
import { IconFile, IconFolder } from './icons.jsx';
import { installStyles } from './styles.js';

const h = React.createElement;
const NS = 'files';
const TAB_ID = 'dsh-files-desk';
const EDITOR_ID = 'dsh-files-desk/editor';

export const inject = ['connection', 'slots', 'locale', 'sidebarRightTabs', 'sidebarRight', 'contextMenus'];

/**
 * The chip content before a tab title.
 * @param {React.ReactNode} icon - the leading icon.
 * @param {string} text - the label.
 * @returns {JSX.Element} the chip.
 */
function Chip({ icon, text }) {
  return h('span', { className: 'fdp-chip' }, icon, h('span', null, text));
}

/**
 * The artwork for the Files guide card.
 * @returns {JSX.Element} a folder with a code mark.
 */
function GuideFilesIcon() {
  return h(
    'svg',
    {
      viewBox: '0 0 24 24',
      width: 22,
      height: 22,
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 1.7,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': 'true',
    },
    h('path', { d: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z' }),
    h('path', { d: 'M10 12l-2 2 2 2M14 12l2 2-2 2' }),
  );
}

/**
 * The Files body with a boundary that keeps a render failure inside the pane.
 * @param {object} props - slot props.
 * @returns {JSX.Element} the body.
 */
function FilesBody(props) {
  return h(
    SurfaceBoundary,
    {
      title: props.t('error.surface'),
      hint: props.t('error.surfaceHint'),
      reloadLabel: props.t('action.reload'),
    },
    h(FilesWorkbench, props),
  );
}

/**
 * The editor tab body with the same boundary.
 * @param {object} props - slot props.
 * @returns {JSX.Element} the body.
 */
function EditorBody(props) {
  return h(
    SurfaceBoundary,
    {
      title: props.t('error.surface'),
      hint: props.t('error.surfaceHint'),
      reloadLabel: props.t('action.reload'),
    },
    h(EditorTab, props),
  );
}

/**
 * The Files tab chip.
 * @param {{ t: (key: string) => string }} props - the injected translator.
 * @returns {JSX.Element} the chip.
 */
function FilesTitle({ t }) {
  return h(Chip, { icon: h(IconFolder, { size: 14 }), text: t('panel') });
}

/**
 * The editor tab chip, named after the file in the address.
 * @param {{ t: (key: string) => string, useTabInfo: Function }} props - injected translator and tab hook.
 * @returns {JSX.Element} the chip.
 */
function EditorTitle({ useTabInfo }) {
  const { tab } = useTabInfo();
  const parsed = parseAddress(tab.contentId ?? tab.navigation?.address);
  return h(Chip, { icon: h(IconFile, { size: 14 }), text: parsed === undefined ? '' : basename(parsed.path) });
}

/**
 * Register the files workbench, the editor tab type, the overlay dialogs, and
 * the shared file menus.
 * @param {object} ctx - the plugin context.
 */
export function apply(ctx) {
  installStyles();
  configureConnection(ctx);
  runtime.sidebarRight = ctx.sidebarRight;

  ctx.locale.register(NS, 'en', EN);
  ctx.locale.register(NS, 'zh', ZH);
  const t = (key, values) => ctx.locale.bind(NS)(key, values);
  setTranslator(t);

  ctx.effect(
    () =>
      ctx.sidebarRightTabs.register({
        id: TAB_ID,
        kind: 'files',
        priority: 'extension',
        keepMounted: true,
        title: () => t('panel'),
        guide: [
          {
            id: 'workspace',
            order: 10,
            commandId: 'workspace.files',
            title: () => t('guide.title'),
            description: () => t('guide.description'),
            icon: GuideFilesIcon,
          },
        ],
      }),
    'dsh-files-desk: files tab type',
  );

  ctx.effect(
    () =>
      ctx.sidebarRightTabs.register({
        id: EDITOR_ID,
        kind: 'editor',
        priority: 'extension',
        patterns: ['dsh-resource://file/**'],
        canOpen: (address) => canEditAddress(address),
        title: (address) => {
          const parsed = parseAddress(address);
          return parsed === undefined ? '' : basename(parsed.path);
        },
      }),
    'dsh-files-desk: editor tab type',
  );

  ctx.slots.inject('sidebar.right.pane.tab', () =>
    ctx.slots.register(
      { name: 'sidebar.right.pane.tab', key: TAB_ID, locale: NS, inject: () => ({ t }) },
      FilesBody,
    ),
  );

  ctx.slots.inject('sidebar.right.pane.tab', () =>
    ctx.slots.register(
      { name: 'sidebar.right.pane.tab', key: EDITOR_ID, locale: NS, inject: () => ({ t }) },
      EditorBody,
    ),
  );

  ctx.slots.inject('sidebar.right.pane.tab.title', () =>
    ctx.slots.register(
      { name: 'sidebar.right.pane.tab.title', key: TAB_ID, locale: NS, inject: () => ({ t }) },
      FilesTitle,
    ),
  );

  ctx.slots.inject('sidebar.right.pane.tab.title', () =>
    ctx.slots.register(
      { name: 'sidebar.right.pane.tab.title', key: EDITOR_ID, locale: NS, inject: () => ({ t }) },
      EditorTitle,
    ),
  );

  ctx.slots.inject('shell.overlay', () =>
    ctx.slots.register(
      { name: 'shell.overlay', id: 'dsh-files-ops', locale: NS, inject: () => ({ t }) },
      FileOpsHost,
    ),
  );

  registerMenus(ctx);
}
