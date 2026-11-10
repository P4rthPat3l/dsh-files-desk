import type { ComponentType, ReactNode } from 'react';

/** Harness services the browser client receives through its plugin context. */

/** One outcome of a route call. */
export type RpcOutcome =
  | { ok: true; value: unknown }
  | { ok: false; error: { code: string; message: string; details: Record<string, unknown> } };

/** The RPC client behind the connection service. */
export interface RpcClient {
  call(route: string, endpoint: string, payload: unknown, signal?: AbortSignal): Promise<RpcOutcome>;
}

/** The connection service. */
export interface ConnectionService {
  rpc: RpcClient;
}

/** Options for opening a resource in the right sidebar. */
export interface OpenResourceOptions {
  kind?: string;
  params?: Record<string, unknown>;
}

/** The right sidebar service. */
export interface SidebarRightService {
  openResource(address: string, options?: OpenResourceOptions): void;
  openTab(kind: string, options?: { params?: Record<string, unknown> }): void;
}

/** A translator bound to one namespace. */
export type Translator = (key: string, values?: Record<string, string | number>) => string;

/** The locale service. */
export interface LocaleService {
  register(namespace: string, language: string, dictionary: Record<string, string>): void;
  bind(namespace: string): Translator;
}

/** Navigation parameters the sidebar passes to a tab. */
export interface TabNavigation {
  address?: string;
  params?: Record<string, unknown>;
  revision?: number;
}

/** The tab and pane the harness hands to one slot body. */
export interface TabInfo {
  tab: { id: string; contentId?: string; navigation?: TabNavigation };
  panel: { id: string };
}

/** The tab hook the harness injects. */
export type UseTabInfo = () => TabInfo;

/** One registered workspace. */
export interface WorkspaceItem {
  workspaceId: string;
  path: string;
  sessionIds?: string[];
}

/** One session. */
export interface SessionItem {
  cwd?: string;
}

export interface WorkspaceState {
  items: WorkspaceItem[];
}

export interface SessionState {
  byId: Record<string, SessionItem | undefined>;
}

/** A store hook shaped like the harness session and workspace hooks. */
export type StoreHook<T> = <R>(selector: (state: T) => R) => R;

/** One menu request, keyed by the target kind. */
export interface ContextMenuRequest {
  kind: string;
  value: Record<string, unknown>;
}

/** The context menu service. */
export interface ContextMenuService {
  getTriggerProps(request: ContextMenuRequest): Record<string, unknown>;
}

/** The hook the harness injects for context menu triggers. */
export type UseContextMenu = () => ContextMenuService | null;

/** One rendered tree row. */
export interface TreeEntry {
  path: string;
  name: string;
  meta: { kind: string };
}

/** One directory's state in the tree input. */
export interface TreeDirectoryState {
  loading?: boolean;
  failure?: string;
  truncated?: boolean;
}

/** The input the harness tree factory renders. */
export interface TreeInput {
  root: string;
  entries: TreeEntry[];
  expanded: string[];
  onToggle: (entry: TreeEntry, expanded: boolean) => void;
  onOpen: (entry: TreeEntry) => void;
  directories: Record<string, TreeDirectoryState>;
  current: string | undefined;
  rowTriggerProps: (entry: TreeEntry, kind: string) => Record<string, unknown>;
}

/** The factory renderer the harness injects. */
export type RenderFactorySlot = (name: string, input: unknown, options: { fallback: null }) => ReactNode;

/** One menu contribution. */
export interface MenuAction {
  id: string;
  label: string;
  disabled?: boolean;
  run: () => void;
}

/** One context menu registration. */
export interface MenuRegistration {
  id: string;
  target: string;
  order: number;
  resolve: (value: Record<string, unknown>) => MenuAction[];
}

/** One guide card on the start screen. */
export interface GuideEntry {
  id: string;
  order: number;
  commandId: string;
  title: () => string;
  description: () => string;
  icon: () => ReactNode;
}

/** One tab type registration. */
export interface TabTypeDefinition {
  id: string;
  kind: string;
  priority: 'extension' | 'builtin' | 'fallback';
  keepMounted?: boolean;
  patterns?: string[];
  title: (address: string) => string;
  canOpen?: (address: string) => boolean;
  guide?: GuideEntry[];
}

/** One slot registration. */
export interface SlotSpec {
  name: string;
  key?: string;
  id?: string;
  locale?: string;
  inject?: () => Record<string, unknown>;
}

/** The slot service. */
export interface SlotsService {
  inject(name: string, register: () => (() => void) | void): void;
  register<P>(spec: SlotSpec, component: ComponentType<P>): () => void;
}

/** The plugin context the harness passes to `apply`. */
export interface ClientContext {
  connection: ConnectionService;
  sidebarRight: SidebarRightService;
  locale: LocaleService;
  slots: SlotsService;
  sidebarRightTabs: { register(definition: TabTypeDefinition): () => void };
  contextMenus: { register(registration: MenuRegistration): () => void };
  effect(callback: () => (() => void) | void, label?: string): void;
}

/** Props the harness injects into the files workbench body. */
export interface FilesWorkbenchProps {
  sessionId: string;
  t: Translator;
  useTabInfo: UseTabInfo;
  useSessions: StoreHook<SessionState>;
  useWorkspaces: StoreHook<WorkspaceState>;
  useContextMenu?: UseContextMenu;
  renderFactorySlot?: RenderFactorySlot;
}

/** Props the harness injects into the editor tab body. */
export interface EditorTabProps {
  sessionId: string;
  t: Translator;
  useTabInfo: UseTabInfo;
  useSessions: StoreHook<SessionState>;
  useWorkspaces: StoreHook<WorkspaceState>;
}
