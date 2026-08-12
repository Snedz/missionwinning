import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { BETA_EN, BETA_STEP_DEFS } from '@/i18n/betaLocales';
import { firstPaintString, interpolateTemplate } from '@/lib/i18n/firstPaintString';

describe('interpolateTemplate', () => {
  it('replaces {{name}} placeholders', () => {
    assert.equal(interpolateTemplate('Hello {{name}}', { name: 'Alex' }), 'Hello Alex');
  });

  it('leaves unknown placeholders empty', () => {
    assert.equal(interpolateTemplate('Hi {{missing}}', {}), 'Hi ');
  });
});

describe('firstPaintString', () => {
  it('returns floor when t echoes the raw key (react-i18next before hydrate)', () => {
    const t = (key: string) => key;
    assert.equal(
      firstPaintString('betaStep1Title', BETA_EN.betaStep1Title, t),
      'Unlock access'
    );
  });

  it('returns floor when t leaves unreplaced mustache placeholders', () => {
    const t = () => 'Hello {{name}}';
    assert.equal(firstPaintString('greet', 'Hello friend', t), 'Hello friend');
  });

  it('SSR path (no window) always uses floor even when t would resolve', () => {
    const t = () => 'Desbloquear acceso';
    assert.equal(
      firstPaintString('betaStep1Title', BETA_EN.betaStep1Title, t),
      'Unlock access'
    );
  });

  it('every beta step key has an English floor that is not the key itself', () => {
    for (const step of BETA_STEP_DEFS) {
      for (const key of [step.titleKey, step.bodyKey, step.ctaKey] as const) {
        const floor = BETA_EN[key];
        assert.ok(floor && floor.length > 0, `missing BETA_EN floor for ${key}`);
        assert.notEqual(floor, key, `${key} floor must not echo the key`);
        const t = (k: string) => k;
        assert.equal(firstPaintString(key, floor, t), floor);
      }
    }
  });
});

describe('BetaStartPage beta step wiring', () => {
  it('uses firstPaintString via betaLine for step keys, not defaultValue alone', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '../../page-components/BetaStartPage.tsx'),
      'utf8'
    );
    assert.match(src, /firstPaintString/);
    assert.match(src, /function betaLine\(/);
    assert.match(src, /betaLine\(primary\.titleKey,\s*t\)/);
    assert.match(src, /betaLine\(primary\.bodyKey,\s*t\)/);
    assert.match(src, /betaLine\(primary\.ctaKey,\s*t\)/);
    assert.match(src, /betaLine\(step\.titleKey,\s*t\)/);
    assert.match(src, /betaLine\(step\.bodyKey,\s*t\)/);
    assert.match(src, /betaLine\(step\.ctaKey,\s*t\)/);
    assert.doesNotMatch(
      src,
      /t\(primary\.titleKey,\s*\{\s*defaultValue/,
      'primary step title must not rely on defaultValue alone'
    );
    assert.doesNotMatch(
      src,
      /t\(step\.titleKey,\s*\{\s*defaultValue/,
      'folded step title must not rely on defaultValue alone'
    );
  });
});
