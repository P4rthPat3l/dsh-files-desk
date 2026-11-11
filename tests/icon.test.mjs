import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkIcon, MAX_ICON_BYTES } from '../scripts/check-icon.mjs';

test('PKG-001: the exported plugin icon fits the harness 256 KiB metadata cap', async () => {
  const icons = await checkIcon();
  assert.ok(icons.length > 0, 'the package exports an icon');
  for (const icon of icons) {
    assert.ok(
      icon.bytes <= MAX_ICON_BYTES,
      `${icon.key} is ${icon.bytes} bytes, over the ${MAX_ICON_BYTES}-byte cap`,
    );
  }
});
