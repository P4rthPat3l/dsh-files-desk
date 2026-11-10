import { useMemo } from 'react';

/**
 * Resolve the workspace and working directory for one session.
 * @param {{ sessionId: string, useSessions: Function, useWorkspaces: Function }} input - session and hooks.
 * @returns {{ session: object | undefined, workspace: object | null, root: string | null, workspaceId: string | null }} the binding.
 */
export function useWorkspaceBinding({ sessionId, useSessions, useWorkspaces }) {
  const workspaces = useWorkspaces((state) => state.items);
  const session = useSessions((state) => state.byId[sessionId]);
  return useMemo(() => {
    const workspace =
      workspaces.find((item) => item.sessionIds?.includes(sessionId)) ??
      workspaces.find(
        (item) =>
          typeof session?.cwd === 'string' &&
          (session.cwd === item.path || session.cwd.startsWith(`${item.path}/`)),
      ) ??
      null;
    return {
      session,
      workspace,
      root: typeof session?.cwd === 'string' ? session.cwd : (workspace?.path ?? null),
      workspaceId: workspace?.workspaceId ?? null,
    };
  }, [workspaces, session, sessionId]);
}
