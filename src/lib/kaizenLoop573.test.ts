import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('UnlockButton is i18n-backed with 52px primary', () => {
  const src = readFileSync(join(root, 'src/components/UnlockButton.tsx'), 'utf8');
  assert.match(src, /useTranslation/);
  assert.match(src, /unlockStartingCheckout/);
  assert.match(src, /unlockGetNotified/);
  assert.match(src, /min-h-\[52px\]/);
  assert.match(src, /unlockFoundersListed/);
  assert.doesNotMatch(src, />Starting checkout…</);
  assert.match(src, /unlockGetNotified/);
});

test('Public shell + marketing nav + import samples have hit targets', () => {
  const pub = readFileSync(join(root, 'src/components/public/PublicPageShell.tsx'), 'utf8');
  assert.match(pub, /primary-action min-h-\[52px\]/);

  const nav = readFileSync(join(root, 'src/components/marketing/MarketingNav.tsx'), 'utf8');
  assert.match(nav, /min-h-\[44px\]/);

  const imp = readFileSync(join(root, 'src/components/track/ActivityImportPanel.tsx'), 'utf8');
  assert.match(imp, /min-h-\[44px\] tap-target/);
});
