# dsh-files-desk

- Plain JavaScript, ES modules, no TypeScript build. Host side runs in Node with built-ins only.
- The client half is a built bundle in the harness module-loader format: `client.js` plus the lazy `client.editor.js`. Edit `src/client/`, run `npm run build`, never hand-edit the built files.
- The plugin must not import `@deepseek-ai/dsh-client-ui-primitives`. Reproduce their styles in the plugin stylesheet with `--dsw-*` and `--dsh-*` tokens only.
- The tab registry, tree factory, context menu, and preview are external contracts. Use them through the documented inputs. Do not read their DOM or copy their internals.
- The `/files-rpc` contract, error codes, and tab registrations are recorded in `docs/features/FEAT-001-files-workbench.md` §12. Update the document with any change.
- Writes, renames, copies, deletes, and folder creation are confined to the workspace root. Reads outside are allowed and read-only. Do not add a bypass.
- Every visible string goes through the local `t()` with EN and ZH dictionaries.
- Tests: `npm test` covers host rules and the client smoke. `npm run build` checks the bundles. Live verification needs a window reload.
