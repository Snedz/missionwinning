import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
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
