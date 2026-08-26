/**
 * Coach citation empty load is BW, not 0kg (`.1023`).
 * Decision already refuses a 0 kg set. The formatter still interpolates weight.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { coachCitationFact, type CoachLogCitation } from './coach/logCitation.ts';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('coach citation empty load is BW, not 0kg (.1023)', () => {
  it('kind set with weight 0 prints 8 × BW, not 0kg × 8', () => {
    const citation: CoachLogCitation = {
      kind: 'set',
      exerciseName: 'Push-ups',
      weight: 0,
      reps: 8,
      at: new Date().toISOString(),
      sessionsLast7: 1,
    };
    const fact = coachCitationFact(citation, 'en', 'kg');
    assert.ok(fact);
    assert.match(fact, /8 × BW/);
    assert.doesNotMatch(fact, /0kg/);
    assert.doesNotMatch(fact, /0 kg/);
  });

  it('loaded set still quotes kg × reps', () => {
    const citation: CoachLogCitation = {
      kind: 'set',
      exerciseName: 'Squats',
      weight: 80,
      reps: 5,
      at: new Date().toISOString(),
      sessionsLast7: 1,
    };
    const fact = coachCitationFact(citation, 'en', 'kg');
    assert.ok(fact);
    assert.match(fact, /80kg × 5/);
    assert.doesNotMatch(fact, /8 × BW/);
  });

  it('formatter uses formatSetLoadLine — no second 0 interpolator', () => {
    const src = read('src/lib/coach/logCitation.ts');
    assert.match(src, /formatSetLoadLine/);
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
  });
});
