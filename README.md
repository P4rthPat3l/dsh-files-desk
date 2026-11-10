# Files workbench for DeepSeek Harness

A Files tab in the Harness right sidebar that browses the session workspace, edits files in a CodeMirror editor, saves them with a conflict check, manages files from shared context menus, and hands documents to the shipped preview.

## What it does

- Takes over the built-in `files` tab kind, so Mod+P, the Files guide card, and the tab strip open the workbench.
- Lazy workspace tree with the harness's own rows, sorting, icons, and context menus.
- CodeMirror editor with syntax highlighting for common languages, find and replace, cursor status, wrapping, and a landing band when a line is opened from elsewhere.
- Versioned save with `files/conflict` when the disk changed, autosave on an 800 ms debounce, and Ctrl+S.
- New file, new folder, rename, duplicate, cut, copy, paste, delete, and copy path from the toolbar and shared file and directory menus.
- A separate `editor` resource tab type, so file links and Git diffs open the same editor at the exact line.
- Markdown, HTML, images, CSV, Office, and PDF keep the shipped preview, with an Edit path from the preview and a Preview path from the editor.
- English and Chinese strings; every color comes from a harness token.

## Install

Open the app's Plugin manager, choose to install a local bundle, and point it at `/home/parth/Production/dsh-files`. Then reload the window once. The profile links this directory, so a rebuild is visible after a window reload.

## Open it

1. Reload the window once (Ctrl+R in the desktop app).
2. Press Mod+P, or pick the Files card in the right sidebar Start guide.
3. Expand a folder and click a text file. Images, PDF, Office files, and archives open the preview instead.

## Architecture

The browser never touches the filesystem. Every read and write goes through one authenticated route, `/files-rpc`, admitted by `ctx.connection.admit` and confined to the workspace root for mutations. Reads outside the workspace are allowed and read-only, matching the preview's read authority. Writes compare an opaque version (inode, size, modification time) before an atomic temp-and-rename.

The client registers two tab types. `dsh-files-desk` is an extension-band registration for kind `files`; the built-in page is shadowed while the plugin is loaded and returns when it unloads. `dsh-files-desk/editor` claims text file addresses at the extension band, so `openResource(address, { params: { line } })` lands in the editor at that line.

The editor is a lazy chunk (`client.editor.js`), loaded the first time a buffer opens. The main client bundle stays small.

## Development

```bash
npm install
npm run typecheck  # tsc over the host project and the browser client
npm test           # host, HTTP, client, editor, and workbench tests
npm run build      # compile src/host to dist and rebuild both client bundles
```

Sources are TypeScript. `src/host/` compiles to `dist/` and is the package entry; `src/client/` is bundled to `client.js` and `client.editor.js`. The wire shapes both halves share live in `src/contract.ts`. The compiled output is committed for the linked profile. Edit `src/` and rebuild; never edit `dist/`, `client.js`, or `client.editor.js` by hand.

## Verified

A live pass on 2026-11-10 used the running app in Chrome through the Playwright extension:

- The Start guide showed one Files card and opened the workbench.
- The tree listed and expanded; a Markdown file opened with highlighting; autosave, Ctrl+S, conflict, Overwrite, and Reload all behaved.
- New file, new folder, rename, duplicate, delete, copy, and paste worked from the toolbar and the shared menus.
- The Markdown preview, image preview, and the Git diff's Open in editor at line 11 all worked.

The pass also caught two defects that are fixed: a leading slash on root-level breadcrumbs, and a Git callback that read `repoRoot` outside its scope.

## Limits in this version

- No search across file contents, quick-open picker, split editors, multi-cursor, drag and drop, or LSP.
- Writes are local-disk only. A remote or SSH workspace is not supported.
- Text files over 5 MB, binary files, and non-UTF-8 files are not opened in the editor.
- File operations from a context menu need the workbench to have been opened in that session at least once, because that is when the workspace binding is recorded.
- The Git plugin opens the working-tree file at the first change in the diff. Per-line open buttons are not added yet.

Contracts, rules, acceptance criteria, and tests are in [`docs/features/FEAT-001-files-workbench.md`](docs/features/FEAT-001-files-workbench.md).
