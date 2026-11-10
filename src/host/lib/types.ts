import type { IncomingMessage, ServerResponse } from 'node:http';

/** One registered workspace, as far as this plugin reads it. */
export interface WorkspaceRecord {
  readonly path: string;
}

/** The workspace registry service. */
export interface WorkspaceRegistry {
  get(id: string): WorkspaceRecord | undefined;
}

/** The caller behind an admitted request. */
export interface Peer {
  readonly principal?: { readonly kind?: string };
}

/** A request the connection service admitted. */
export interface Admitted {
  readonly peer: Peer;
}

/** A request the connection service rejected. */
export interface Rejected {
  readonly rejection: number;
}

export type Admission = Admitted | Rejected;

/** One authenticated browser connection. */
export interface Connection {
  admit(request: IncomingMessage): Admission;
}

/** One route the web server exposes. */
export interface Route {
  readonly kind: 'prefix';
  readonly path: string;
  readonly handler: (request: IncomingMessage, response: ServerResponse) => Promise<void>;
}

/** The web server service. */
export interface WebServer {
  register(route: Route): () => void;
}

/** One failure as the endpoint handler reports it. */
export interface EndpointFailure {
  code: string;
  message: string;
  details: Record<string, unknown>;
}

/** The value an endpoint handler resolves with. */
export type EndpointResult = { ok: true; value: unknown } | { ok: false; error: EndpointFailure };

/** The endpoint handler the route calls. */
export type EndpointHandler = (
  endpoint: string,
  payload: unknown,
  signal: AbortSignal | undefined,
  peer: Peer | undefined,
) => Promise<EndpointResult>;

/** The host context this plugin receives. */
export interface HostContext {
  readonly workspaceRegistry: WorkspaceRegistry;
  readonly connection: Connection;
  readonly webServer: WebServer;
  effect(callback: () => (() => void) | void, label?: string): void;
}
