/**
 * 4th house skin is C2 Instrument — ground #0a0c0f + signal #ffb000.
 * Field-manual / landing / www stay paper. Discover the refuse set.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

test('house tokens are C2 ground + signal yellow', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-void:\s*#0a0c0f/);
  assert.match(css, /--house-paper:\s*#0a0c0f/);
  assert.match(css, /--house-stage:\s*#0a0c0f/);
  assert.match(css, /--house-press:\s*#ffb000/);
  assert.match(css, /--house-press-deep:\s*#c98a00/);
  assert.match(css, /--house-press-tint:\s*#1a1607/);
  assert.match(css, /--house-press-ink:\s*#0a0c0f/);
  assert.match(css, /--house-amber:\s*#ffb000/);
  assert.match(css, /--house-pill:\s*8px/);
  assert.doesNotMatch(css, /--house-paper:\s*#ffffff/);
  assert.doesNotMatch(css, /--house-paper:\s*#111111/);
  assert.doesNotMatch(css, /--house-press:\s*#f5c518/);
  assert.doesNotMatch(css, /--house-press:\s*#18181b/);
  assert.doesNotMatch(css, /--house-pill:\s*999px/);
  assert.doesNotMatch(css, /#ffffff|#18181b|#f4f4f5|#f5c518|#ffd000|#F5C400|#0A0A0A/i);
});

test('Today Start + Train Log set + Coach Generate + Victory Next use press', () => {
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-week-cell\.is-today \{[^}]*--house-press/
  );
  assert.match(
    css,
    /\.mw-house \.house-week-cell\.is-done \{[^}]*--house-selected/
  );
  assert.match(
    css,
    /\.mw-house \.house-compose-live \.house-set-log \{[^}]*--house-press/
  );
  assert.match(
    css,
    /\.mw-house \.house-btn-primary[\s\S]*?--house-press/
  );
  assert.match(
    css,
    /\.mw-house \.poster-field \.primary-action[\s\S]*?--house-press/
  );
  const desk = read('src/page-components/TodayDesk.tsx');
  assert.match(desk, /house-btn house-btn-primary/);
  const coach = read('src/page-components/CoachPage.tsx');
  assert.match(coach, /house-generate-dock/);
  assert.match(coach, /house-btn house-btn-primary/);
  const next = read('src/components/workout/VictoryNextActionStrip.tsx');
  assert.match(next, /mw-house poster-field/);
  assert.match(
    css,
    /\.mw-house\.house-victory-portal \{[^}]*--card:\s*216 20% 5%/,
  );
  assert.doesNotMatch(css, /^\.victory-lock \{/m);
  const sheet = read('src/components/workout/WorkoutVictorySheet.tsx');
  const dialog = sheet.slice(
    sheet.indexOf('victory-lock') - 40,
    sheet.indexOf('victory-lock') + 80
  );
  assert.doesNotMatch(dialog, /mw-house/);
});

test('PLAN scope is .mw-house only — lineage review', () => {
  const plan = read('PLAN.md');
  assert.match(plan, /this craft = `\.mw-house` only/);
  assert.match(plan, /Do not restyle `\/private` or public www/);
});

test('public gate stays field-manual — no house yellow costume', () => {
  const landing = read('src/page-components/LandingPage.tsx');
  assert.doesNotMatch(landing, /--house-press|#ffb000|#f5c518|mw-house/);
  const indexCss = read('src/index.css');
  assert.doesNotMatch(indexCss, /--house-press:\s*#ffb000/);
  assert.doesNotMatch(indexCss, /--house-paper:\s*#0a0c0f/);
  const priv = read('app/private/PrivateTeaserClient.tsx');
  assert.doesNotMatch(priv, /--house-press:\s*#ffb000/);
  assert.doesNotMatch(priv, /--house-paper:\s*#0a0c0f/);
  const wwwCss = existsSync(path.join(root, 'sites/www/src/styles/global.css'))
    ? read('sites/www/src/styles/global.css')
    : existsSync(path.join(root, 'sites/www/src/styles/tokens.css'))
      ? read('sites/www/src/styles/tokens.css')
      : '';
  if (wwwCss) {
    assert.doesNotMatch(wwwCss, /--house-press:\s*#ffb000/);
    assert.doesNotMatch(wwwCss, /--house-paper:\s*#0a0c0f/);
  }
});

test('rail + sheet use void / card / raised field — leftover 4', () => {
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-second \{[^}]*background:\s*var\(--house-chip\)/
  );
  assert.match(
    css,
    /\.mw-house \.house-stage \{[^}]*background:\s*var\(--house-soft\)/
  );
  assert.match(css, /--house-chip:\s*#12161b/);
  assert.match(css, /--house-soft:\s*#0f1319/);
  assert.match(css, /--house-line:\s*#1e252c/);
  assert.match(
    css,
    /@media \(min-width: 723px\)[\s\S]*?\.mw-house \.house-sheet \{[\s\S]*?background:\s*var\(--house-soft\)[\s\S]*?1px solid var\(--house-line\)/,
  );
  assert.doesNotMatch(css, /rgb\(7 7 7/);
  assert.doesNotMatch(css, /border-radius:\s*12px/);
  assert.match(
    css,
    /\.mw-house \.house-guide-card \{[^}]*border-radius:\s*var\(--house-radius\)/,
  );
});

test('one yellow field — selected chips, not press fills — HOLD', () => {
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-state\.is-on \{[^}]*background:\s*var\(--house-selected\)/,
  );
  assert.match(
    css,
    /\.mw-house \.house-empty button \{[^}]*min-height:\s*44px[^}]*--house-selected/,
  );
  assert.match(
    css,
    /\.mw-house \.house-rail-tip \{[^}]*background:\s*var\(--house-chip\)/,
  );
  assert.match(
    css,
    /\.mw-house \.house-lock-tip \{[^}]*background:\s*var\(--house-chip\)/,
  );
  assert.match(
    css,
    /\.mw-house \.house-catalog \.house-item-pick\.is-on \{[^}]*--house-selected/,
  );
  assert.match(
    css,
    /\.mw-house \.house-calc \[role='tab'\]\[data-state='active'\] \{[^}]*--house-selected/,
  );
  assert.match(
    css,
    /\.mw-house\.house-checkin \.house-checkin-tick\.is-on \{[^}]*--house-selected/,
  );
  assert.match(
    css,
    /\.mw-house \.house-week-cell\.is-done \.house-week-check \{[^}]*--house-ink/,
  );
  assert.match(
    css,
    /\.mw-house \.house-compose-live \.house-set-table \.house-set-log \{[^}]*font-size:\s*15px/,
  );
  assert.doesNotMatch(css, /^\.victory-lock \{/m);
  const next = read('src/components/workout/VictoryNextActionStrip.tsx');
  assert.doesNotMatch(next, /text-\[11px\]/);
  const sheet = read('src/components/workout/WorkoutVictorySheet.tsx');
  assert.match(sheet, /mw-house house-victory-portal/);
});

test('house empty copy is clinical — leftover 5', () => {
  const coach = read('src/i18n/coachLocales.ts');
  assert.match(coach, /coachGenerateEmptyTitle: 'No plan this week'/);
  assert.match(coach, /coachFreeBetaNextWeek: "From last week's logs\."/);
  assert.match(coach, /coachGenerateEmptyDesc: 'From your logs\. No wearable\.'/);
  assert.doesNotMatch(coach, /Free during Alpha/);
  assert.doesNotMatch(coach, /Free every week/);
  const builder = read('src/i18n/builderLocales.ts');
  assert.match(builder, /builderNoSaved: 'No saved workouts'/);
  assert.match(builder, /builderNoSavedDesc: 'Build one or load a template\.'/);
  assert.doesNotMatch(builder, /No saved workouts yet/);
  const coachPage = read('src/page-components/CoachPage.tsx');
  assert.match(coachPage, /From last week's logs/);
  assert.match(coachPage, /From your logs\. No wearable\./);
  assert.doesNotMatch(coachPage, /Free during Alpha/);
  const builderPage = read('src/page-components/BuilderPage.tsx');
  assert.match(builderPage, /defaultValue: 'No saved workouts'/);
  assert.match(builderPage, /defaultValue: 'Build one or load a template\.'/);
});

test('DESIGN names the C2 token table', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /`--house-press` \| `#ffb000`/);
  assert.match(spec, /`--house-paper` \| `#0a0c0f`/);
  assert.match(spec, /`--house-void` \| `#0a0c0f`/);
  assert.doesNotMatch(spec, /`--house-paper` \| `#ffffff`/);
  assert.doesNotMatch(spec, /`--house-press` \| `#f5c518`/);
});
