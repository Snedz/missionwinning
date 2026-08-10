import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { COACH_WHY_DEFAULTS, coachWhyLine } from './coachWhyDefaults.ts';

const root = join(import.meta.dirname, '..', '..', '..');

describe('coachWhyDefaults', () => {
  it('covers every whyKey the progression/selector engines emit', () => {
    const files = [
      'src/lib/coach/progression.ts',
      'src/lib/coach/selector.ts',
      'src/lib/coach/adjust.ts',
    ];
    const keys = new Set<string>();
    for (const rel of files) {
      const src = readFileSync(join(root, rel), 'utf8');
      for (const m of src.matchAll(/whyKey:\s*'([a-zA-Z0-9_]+)'/g)) {
        keys.add(m[1]!);
      }
    }
    assert.ok(keys.size >= 5, `expected engine whyKeys, found ${keys.size}`);
    for (const key of keys) {
      assert.ok(
        COACH_WHY_DEFAULTS[key],
        `engine emits whyKey "${key}" with no English floor — athlete would see blank or raw key`
      );
    }
  });

  it('never returns a bare catalogued key when the pack is empty', () => {
    const missing = (k: string, o?: Record<string, unknown>) =>
      (o?.defaultValue as string) ?? k;
    for (const [key, floor] of Object.entries(COACH_WHY_DEFAULTS)) {
      const line = coachWhyLine(key, missing);
      assert.equal(line, floor);
      assert.notEqual(line, key);
    }
  });

  it('CoachAdaptBanner uses coachWhyLine not i18n.exists blanking', () => {
    const src = readFileSync(
      join(root, 'src/components/coach/CoachAdaptBanner.tsx'),
      'utf8'
    );
    assert.match(src, /coachWhyLine/);
    assert.doesNotMatch(src, /i18n\.exists\(key\)\s*\?\s*t\(key\)\s*:\s*''/);
  });

  it('PlanExerciseLine uses coachWhyLine not i18n.exists blanking', () => {
    const src = readFileSync(
      join(root, 'src/components/coach/PlanExerciseLine.tsx'),
      'utf8'
    );
    assert.match(src, /coachWhyLine/);
    assert.doesNotMatch(src, /i18n\.exists/);
  });
});
