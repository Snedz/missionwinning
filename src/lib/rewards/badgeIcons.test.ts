import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BADGE_DEFS, badgeIconPath } from '@/lib/rewards/catalog';

const root = join(import.meta.dirname, '..', '..', '..');

test('every badge def has a medallion SVG on disk', () => {
  for (const b of BADGE_DEFS) {
    const rel = badgeIconPath(b.id).replace(/^\//, '');
    assert.ok(existsSync(join(root, 'public', rel)), rel);
  }
});

test('badgeIconPath is stable under public/rewards/badges', () => {
  assert.equal(badgeIconPath('first_blood'), '/rewards/badges/first_blood.svg');
});

test('week_one is three session marks, not a warning triangle (.879)', () => {
  const src = readFileSync(join(root, 'public/rewards/badges/week_one.svg'), 'utf8');
  assert.doesNotMatch(
    src,
    /L32 20 L44 38 Z/,
    'the old mark was a closed triangle — it read as a broken-image warning on Victory'
  );
  assert.match(src, /rect x="16"/);
  assert.match(src, /rect x="29"/);
  assert.match(src, /rect x="42"/);
});
