import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

/**
 * The arrow clause was vacuous the same way loop 577's copy pin was: it read
 * the component's `defaultValue` fallbacks, but `todayLocales.ts` ships
 * `'Build a custom session →'`, `'Go to Builder / Choose Template →'` and
 * `'View Leaderboard →'`, so the pack has rendered arrows to users the whole
 * time. `.828` matched the fallbacks to the pack and the clause went red.
 *
 * Dropped rather than moved to the pack: no design doc bans arrows
 * (DESIGN_SYSTEM / DESIGN_ORCHESTRATION / brand-guidelines have no such rule)
 * and they are product-wide — coachLocales 21, guidebookLocales 10,
 * infoLocales 10, landingLocales 8, learnLocales 8. Banning them is a founder
 * copy decision across every pack, not something this guard may decide.
 * The link-label assertion below is the part that was ever real.
 */
test('Today progress links drop arrow flourish', () => {
  const src = readFileSync(
    join(root, 'src/components/today/TodayProgressSection.tsx'),
    'utf8'
  );
  assert.match(src, /Open builder|View full history|See full in Fuel/);
});

test('chrome hover is muted; auth chip 44px', () => {
  const header = readFileSync(join(root, 'src/components/layout/AppHeader.tsx'), 'utf8');
  assert.match(header, /hover:bg-muted/);
  assert.doesNotMatch(header, /hover:bg-accent-100/);

  const side = readFileSync(join(root, 'src/components/layout/Sidebar.tsx'), 'utf8');
  assert.match(side, /hover:bg-muted/);

  const chip = readFileSync(join(root, 'src/components/layout/HeaderAuthChip.tsx'), 'utf8');
  assert.match(chip, /min-h-\[44px\]/);
});

test('Today week recap and freshness use muted not accent wash', () => {
  const recap = readFileSync(
    join(root, 'src/components/today/TodayWeekRecapCard.tsx'),
    'utf8'
  );
  assert.match(recap, /bg-muted/);
  assert.doesNotMatch(recap, /bg-accent-100/);

  const fresh = readFileSync(
    join(root, 'src/components/today/MuscleFreshnessStrip.tsx'),
    'utf8'
  );
  assert.match(fresh, /bg-muted/);
});
