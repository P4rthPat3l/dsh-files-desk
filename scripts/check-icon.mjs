import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '..');

/** The harness admits a plugin icon into component metadata only under this cap. */
export const MAX_ICON_BYTES = 256 * 1024;
const ICON_EXTENSIONS = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp']);

/**
 * Assert that every icon export fits the harness metadata cap.
 * @returns {Promise<{ key: string, file: string, bytes: number }[]>} the checked icons.
 */
export async function checkIcon() {
  const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'package.json'), 'utf8'));
  const entries = Object.entries(manifest.exports ?? {}).filter(
    ([key]) => key === './icon' || key.startsWith('./icons/'),
  );
  if (entries.length === 0) throw new Error('package.json exports no icon');
  const icons = [];
  for (const [key, target] of entries) {
    if (typeof target !== 'string') throw new Error(`${key} must map to one file`);
    const file = path.resolve(ROOT, target);
    const stat = await fs.stat(file);
    if (!stat.isFile()) throw new Error(`${key} must point at a regular file`);
    const extension = path.extname(file).toLowerCase();
    if (!ICON_EXTENSIONS.has(extension)) {
      throw new Error(`${key} must be SVG, PNG, JPEG, or WebP, not ${extension}`);
    }
    if (stat.size > MAX_ICON_BYTES) {
      throw new Error(
        `${key} is ${stat.size} bytes, over the harness icon cap of ${MAX_ICON_BYTES} bytes`,
      );
    }
    icons.push({ key, file, bytes: stat.size });
  }
  return icons;
}

if (process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  checkIcon().then(
    (icons) => {
      for (const icon of icons) console.log(`${icon.key} ${icon.bytes} bytes`);
    },
    (error) => {
      console.error(`icon check failed: ${error.message}`);
      process.exitCode = 1;
    },
  );
}
