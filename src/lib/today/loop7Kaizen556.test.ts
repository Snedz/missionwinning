import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

test('Today hovers use muted not accent-100 wash', () => {
  const journal = readFileSync(
    join(root, 'src/components/today/TodayJournalStrip.tsx'),
    'utf8'
  );
  assert.match(journal, /hover:bg-muted/);
  assert.doesNotMatch(journal, /hover:bg-accent-100/);

  const header = readFileSync(
    join(root, 'src/components/today/TodayPageHeader.tsx'),
    'utf8'
  );
  assert.match(header, /hover:bg-muted/);
  assert.doesNotMatch(header, /hover:bg-accent-100/);
});

test('coach reentry and light-band locale are plain', () => {
  const locales = readFileSync(join(root, 'src/i18n/coachLocales.ts'), 'utf8');
  assert.match(locales, /Ready to train again/);
  assert.doesNotMatch(locales, /back on the path/);
  assert.doesNotMatch(locales, /room to add/);

  const banner = readFileSync(
    join(root, 'src/components/coach/CoachAdaptBanner.tsx'),
    'utf8'
  );
  assert.match(banner, /Ready to train again/);
});

test('Today customize section toggles are 44px', () => {
  const src = readFileSync(
    join(root, 'src/components/today/TodayDashboardCustomize.tsx'),
    'utf8'
  );
  assert.match(src, /min-h-\[44px\]/);
  assert.doesNotMatch(src, /min-h-\[36px\]/);
});
