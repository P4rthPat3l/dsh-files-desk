import React from 'react';
import type { ReactNode } from 'react';
import { basename, canEditAddress, configureConnection, parseAddress } from './api.js';
import type { ClientContext, EditorTabProps, FilesWorkbenchProps, Translator, UseTabInfo } from './harness.js';
import { EN, ZH, setTranslator } from './locale.js';
import { registerMenus } from './menus.js';
import { runtime } from './runtime.js';
import { FileOpsHost } from './dialogs.jsx';
import { SurfaceBoundary } from './boundary.jsx';
import { FilesWorkbench } from './workbench.jsx';
import { EditorTab } from './editor-tab.jsx';
import { IconFile, IconFolder } from './icons.jsx';
import { installStyles } from './styles.js';

export { EditorTab, FilesWorkbench };

const h = React.createElement;
const NS = 'files';
const TAB_ID = 'dsh-files-desk';
const EDITOR_ID = 'dsh-files-desk/editor';

export const inject = ['connection', 'slots', 'locale', 'sidebarRightTabs', 'sidebarRight', 'contextMenus'];

/** A leading icon and a label. */
interface ChipProps {
  icon: ReactNode;
  text: string;
}

/**
 * The chip content before a tab title.
 * @param props the leading icon and label.
 * @returns the chip.
 */
function Chip({ icon, text }: ChipProps) {
  return h('span', { className: 'fdp-chip' }, icon, h('span', null, text));
}

/**
 * The artwork for the Files guide card.
 * @returns a folder with a code mark.
 */
function GuideFilesIcon(): ReactNode {
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
 * @param props slot props.
 * @returns the body.
 */
function FilesBody(props: FilesWorkbenchProps): ReactNode {
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
 * @param props slot props.
 * @returns the body.
 */
function EditorBody(props: EditorTabProps): ReactNode {
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
 * @param props the injected translator.
 * @returns the chip.
 */
function FilesTitle({ t }: { t: Translator }): ReactNode {
  return h(Chip, { icon: h(IconFolder, { size: 14 }), text: t('panel') });
}

/**
 * The editor tab chip, named after the file in the address.
 * @param props the injected translator and tab hook.
 * @returns the chip.
 */
function EditorTitle({ useTabInfo }: { useTabInfo: UseTabInfo }): ReactNode {
  const { tab } = useTabInfo();
  const parsed = parseAddress(tab.contentId ?? tab.navigation?.address);
  return h(Chip, { icon: h(IconFile, { size: 14 }), text: parsed === undefined ? '' : basename(parsed.path) });
}

/**
 * Register the files workbench, the editor tab type, the overlay dialogs, and
 * the shared file menus.
 * @param ctx the plugin context.
 */
export function apply(ctx: ClientContext): void {
  installStyles();
  configureConnection(ctx);
  runtime.sidebarRight = ctx.sidebarRight;

  ctx.locale.register(NS, 'en', EN);
  ctx.locale.register(NS, 'zh', ZH);
  const t: Translator = (key, values) => ctx.locale.bind(NS)(key, values);
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
