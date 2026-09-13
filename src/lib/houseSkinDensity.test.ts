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
  assert.match(css, /\.victory-lock \{[^}]*--card:\s*216 20% 5%/);
  const sheet = read('src/components/workout/WorkoutVictorySheet.tsx');
  const dialog = sheet.slice(
    sheet.indexOf('victory-lock') - 40,
    sheet.indexOf('victory-lock') + 80
  );
  assert.doesNotMatch(dialog, /mw-house/);
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

test('DESIGN names the C2 token table', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /`--house-press` \| `#ffb000`/);
  assert.match(spec, /`--house-paper` \| `#0a0c0f`/);
  assert.match(spec, /`--house-void` \| `#0a0c0f`/);
  assert.doesNotMatch(spec, /`--house-paper` \| `#ffffff`/);
  assert.doesNotMatch(spec, /`--house-press` \| `#f5c518`/);
});
