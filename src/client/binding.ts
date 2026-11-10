import { useMemo } from 'react';
import type { SessionItem, SessionState, StoreHook, WorkspaceItem, WorkspaceState } from './harness.js';

/** A session bound to the workspace that owns it. */
export interface WorkspaceBinding {
  session: SessionItem | undefined;
  workspace: WorkspaceItem | null;
  root: string | null;
  workspaceId: string | null;
}

/** The hooks this binding needs. */
export interface WorkspaceBindingInput {
  sessionId: string;
  useSessions: StoreHook<SessionState>;
  useWorkspaces: StoreHook<WorkspaceState>;
}

/**
 * Resolve the workspace and working directory for one session.
 * @param input the session and hooks.
 * @returns the binding.
 */
export function useWorkspaceBinding({ sessionId, useSessions, useWorkspaces }: WorkspaceBindingInput): WorkspaceBinding {
  const workspaces = useWorkspaces((state) => state.items);
  const session = useSessions((state) => state.byId[sessionId]);
  return useMemo(() => {
    const cwd = typeof session?.cwd === 'string' ? session.cwd : null;
    const workspace =
      workspaces.find((item) => item.sessionIds?.includes(sessionId)) ??
      workspaces.find((item) => cwd !== null && (cwd === item.path || cwd.startsWith(`${item.path}/`))) ??
      null;
    return {
      session,
      workspace,
      root: cwd ?? workspace?.path ?? null,
      workspaceId: workspace?.workspaceId ?? null,
    };
  }, [workspaces, session, sessionId]);
}
