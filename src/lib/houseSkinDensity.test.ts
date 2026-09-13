/**
 * 4th house skin is black + yellow density, scoped to `.mw-house`.
 * Field-manual / landing / www stay paper. Discover the refuse set.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

test('house tokens are deep black + amber press', () => {
  const css = read('src/components/house/house.css');
  assert.match(css, /--house-void:\s*#070707/);
  assert.match(css, /--house-paper:\s*#111111/);
  assert.match(css, /--house-stage:\s*#070707/);
  assert.match(css, /--house-press:\s*#f5c518/);
  assert.match(css, /--house-press-ink:\s*#111111/);
  assert.match(css, /--house-amber:\s*#f5c518/);
  assert.doesNotMatch(css, /--house-paper:\s*#ffffff/);
  assert.doesNotMatch(css, /--house-press:\s*#18181b/);
});

test('Today week done + Train Log set + Coach Generate + Start use press', () => {
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-week-cell\.is-done \{[^}]*--house-press/
  );
  assert.match(
    css,
    /\.mw-house \.house-compose-live \.house-set-log \{[^}]*--house-press/
  );
  assert.match(
    css,
    /\.mw-house \.house-btn-primary[\s\S]*?--house-press/
  );
  const desk = read('src/page-components/TodayDesk.tsx');
  assert.match(desk, /house-btn house-btn-primary/);
  const coach = read('src/page-components/CoachPage.tsx');
  assert.match(coach, /house-generate-dock/);
  assert.match(coach, /house-btn house-btn-primary/);
});

test('public gate stays field-manual — no house yellow costume', () => {
  const landing = read('src/page-components/LandingPage.tsx');
  assert.doesNotMatch(landing, /--house-press|#f5c518|mw-house/);
  const indexCss = read('src/index.css');
  assert.doesNotMatch(indexCss, /--house-press:\s*#f5c518/);
  assert.doesNotMatch(indexCss, /--house-paper:\s*#111111/);
  const priv = read('app/private/PrivateTeaserClient.tsx');
  assert.doesNotMatch(priv, /--house-press:\s*#f5c518/);
  assert.doesNotMatch(priv, /--house-paper:\s*#111111/);
  const wwwCss = existsSync(path.join(root, 'sites/www/src/styles/global.css'))
    ? read('sites/www/src/styles/global.css')
    : existsSync(path.join(root, 'sites/www/src/styles/tokens.css'))
      ? read('sites/www/src/styles/tokens.css')
      : '';
  if (wwwCss) {
    assert.doesNotMatch(wwwCss, /--house-press:\s*#f5c518/);
    assert.doesNotMatch(wwwCss, /--house-paper:\s*#111111/);
  }
});

test('DESIGN names the 4th-skin token table', () => {
  const spec = read('src/components/house/DESIGN.md');
  assert.match(spec, /`--house-press` \| `#f5c518`/);
  assert.match(spec, /`--house-paper` \| `#111111`/);
  assert.match(spec, /`--house-void` \| `#070707`/);
  assert.doesNotMatch(spec, /`--house-paper` \| `#ffffff`/);
});
