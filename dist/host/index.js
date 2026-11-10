import { registerFilesRoute } from './lib/http.js';
import { createHandler } from './lib/rpc.js';
export const inject = ['workspaceRegistry', 'connection', 'webServer'];
/**
 * Expose one authenticated files channel. The browser owns no filesystem
 * access; every read and write goes through this route.
 * @param ctx the plugin context.
 */
export function apply(ctx) {
    const handler = createHandler(ctx);
    ctx.effect(() => registerFilesRoute(ctx, handler), 'dsh-files-desk: authenticated files channel');
}
