/**
 * Per-exercise rest lives on the open Train lift. Warmup ≠ work.
 * Today stays one Start. Honesty .971 still applies.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const BANNED =
  /UnlockButton|isPremium|\/bundle|permalink|discord\.com|WeChat|four-scene|Force Sync|Session Expired|SignInPrompt/i;
const FEED = /likes|Top 8|Feed permalink|shame slope/i;

describe('per-exercise rest surface lock (.995)', () => {
  it('open lift mounts two rest lanes; presets write the exercise not Profile', () => {
    const strip = read('src/components/workout/ExerciseRestStrip.tsx');
    assert.match(strip, /data-testid="exercise-rest-strip"/);
    assert.match(strip, /data-testid="exercise-rest-work"/);
    assert.match(strip, /data-testid="exercise-rest-warmup"/);
    assert.match(strip, /rememberLastRest|onSetLane/);
    assert.doesNotMatch(strip, /saveDefaultRestSeconds/);
    assert.doesNotMatch(strip, /primary-action|bg-primary-fill/);
    assert.doesNotMatch(strip, BANNED);
    assert.doesNotMatch(strip, FEED);

    const footer = read('src/components/workout/ActiveExerciseFooter.tsx');
    assert.match(footer, /ExerciseRestStrip/);
    assert.match(footer, /holdsActiveSet/);
  });

  it('Today stays one Start; lean and /private do not import exercise rest', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
    assert.doesNotMatch(lean, /ExerciseRestStrip|exercise-rest-|rememberLastRest/);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, /ExerciseRestStrip|resolveRestForNextSet/);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, /ExerciseRestStrip|exercise-rest-/);
  });

  it('global Default chips stay on the running dock — not a second rest home', () => {
    const dock = read('src/components/workout/RestTimerBar.tsx');
    assert.match(dock, /saveDefaultRestSeconds/);
    assert.match(dock, /activeRestDefault/);
    const profile = read('src/page-components/ProfilePage.tsx');
    assert.doesNotMatch(profile, /ExerciseRestStrip|lastRestByExercise|rememberLastRest/);
  });

  it('history chrome stays on the name tap — rest strip is not a diary', () => {
    const header = read('src/components/workout/ActiveExerciseHeader.tsx');
    assert.match(header, /data-testid="movement-history-open"/);
    assert.doesNotMatch(header, /ExerciseRestStrip|exercise-rest-/);
    const strip = read('src/components/workout/ExerciseRestStrip.tsx');
    assert.doesNotMatch(strip, /listMovementHistory|MovementHistorySheet/);
  });

  it('first set stays ungated — strip never mounts a login wall', () => {
    for (const rel of [
      'src/lib/workout/restTimer.ts',
      'src/components/workout/ExerciseRestStrip.tsx',
      'src/components/workout/ActiveExerciseFooter.tsx',
    ]) {
      const src = read(rel);
      assert.doesNotMatch(src, /SignInPrompt|SignInPanel/, rel);
      assert.doesNotMatch(src, /Force Sync|Session Expired/, rel);
      assert.doesNotMatch(src, /need an account|sign in to (?:log|start|train)/i, rel);
    }
  });
});
