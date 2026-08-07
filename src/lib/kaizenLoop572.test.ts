import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('Profile premium/backup/whatsnew use 44px tap targets', () => {
  for (const rel of [
    'src/components/profile/ProfilePremiumCard.tsx',
    'src/components/profile/ProfileBackupCard.tsx',
    'src/components/profile/ProfileWhatsNewCard.tsx',
    'src/components/profile/ProfileRemindersCard.tsx',
  ]) {
    const src = readFileSync(join(root, rel), 'utf8');
    assert.match(src, /tap-target|min-h-\[44px\]/, rel);
  }
  const prem = readFileSync(
    join(root, 'src/components/profile/ProfilePremiumCard.tsx'),
    'utf8'
  );
  assert.doesNotMatch(prem, /✓ Premium unlocked/);
});

test('Coach Bundle Feedback primary CTAs are 44/52px', () => {
  const coach = readFileSync(join(root, 'src/page-components/CoachPage.tsx'), 'utf8');
  assert.match(coach, /min-h-\[44px\] tap-target/);

  const bundle = readFileSync(join(root, 'src/page-components/BundlePage.tsx'), 'utf8');
  assert.match(bundle, /min-h-\[44px\] tap-target/);

  const fb = readFileSync(join(root, 'src/page-components/FeedbackPage.tsx'), 'utf8');
  assert.match(fb, /min-h-\[52px\] tap-target/);
});
