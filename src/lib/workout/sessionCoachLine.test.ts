/**
 * Open-set trainer line (.1114). States the dial. Invents no load.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { findToneViolations } from '@/lib/reentryTone';
import { sessionCoachLine, type SessionCoachLineInput } from '@/lib/workout/sessionCoachLine';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function line(over: Partial<SessionCoachLineInput> = {}): string | null {
  return sessionCoachLine({
    exerciseName: 'Bench press',
    setNumber: 2,
    setCount: 5,
    reps: 5,
    weight: 80,
    unitLabel: 'kg',
    kind: 'normal',
    rowType: 'weight',
    hardCount: 0,
    ...over,
  });
}

test('work set states index, name, and the dialed load', () => {
  assert.equal(line(), 'Set 2 of 5. Bench press. 80 kg for 5.');
});

test('blank name is silence', () => {
  assert.equal(line({ exerciseName: '   ' }), null);
  assert.equal(line({ exerciseName: '' }), null);
});

test('a set index outside the exercise is silence', () => {
  assert.equal(line({ setNumber: 0 }), null);
  assert.equal(line({ setNumber: 6 }), null);
  assert.equal(line({ setCount: 0 }), null);
  assert.equal(line({ setNumber: 1.5 }), null);
});

test('empty barbell load is not bodyweight and not zero kilograms', () => {
  const spoken = line({ weight: 0, reps: 5 });
  assert.equal(spoken, 'Set 2 of 5. Bench press. 5 reps.');
  assert.doesNotMatch(spoken ?? '', /BW|0 kg/);
  assert.equal(line({ weight: 0, reps: 0 }), 'Set 2 of 5. Bench press.');
});

test('warmup, drop, and last clean rep name the kind and skip the tank line', () => {
  assert.equal(
    line({ kind: 'warmup', setNumber: 1, weight: 40, reps: 8, hardCount: 4 }),
    'Warm-up. Set 1 of 5. Bench press. 40 kg for 8.'
  );
  assert.equal(
    line({ kind: 'drop', weight: 60, reps: 8, hardCount: 4 }),
    'Drop. Set 2 of 5. Bench press. 60 kg for 8.'
  );
  const last = line({ kind: 'failure', setNumber: 5, hardCount: 4 });
  assert.equal(last, 'Last clean rep. Set 5 of 5. Bench press. 80 kg for 5.');
  assert.doesNotMatch(last ?? '', /failure|Leave a little/i);
});

test('several hard sets ask a work set to leave a little', () => {
  assert.match(line({ hardCount: 2 }) ?? '', /^Set 2 of 5\. Bench press\. 80 kg for 5\.$/);
  assert.equal(
    line({ hardCount: 3 }),
    'Set 2 of 5. Bench press. 80 kg for 5. Leave a little if the bar slows.'
  );
});

test('bodyweight, assistance, and a hold use that row grammar', () => {
  assert.equal(
    line({
      exerciseName: 'Pull-up',
      rowType: 'bodyweight',
      weight: 0,
      reps: 8,
      setNumber: 1,
      setCount: 3,
    }),
    'Set 1 of 3. Pull-up. 8 × BW.'
  );
  assert.equal(
    line({
      exerciseName: 'Dip',
      rowType: 'bodyweight',
      weight: 10,
      reps: 8,
      setNumber: 1,
      setCount: 3,
    }),
    'Set 1 of 3. Dip. 8 × BW + 10 kg.'
  );
  assert.equal(
    line({
      exerciseName: 'Assisted pull-up',
      rowType: 'assisted',
      weight: 0,
      reps: 8,
      setNumber: 1,
      setCount: 3,
    }),
    'Set 1 of 3. Assisted pull-up. 8 × BW.'
  );
  assert.equal(
    line({
      exerciseName: 'Assisted pull-up',
      rowType: 'assisted',
      weight: 20,
      reps: 8,
      setNumber: 1,
      setCount: 3,
    }),
    'Set 1 of 3. Assisted pull-up. 8 × −20 kg.'
  );
  assert.equal(
    line({
      exerciseName: 'Plank',
      rowType: 'duration',
      reps: 0,
      weight: 0,
      durationSeconds: 45,
      setNumber: 1,
      setCount: 1,
    }),
    'Set 1 of 1. Plank. 0:45.'
  );
});

test('every spoken line clears the return-tone contract', () => {
  const samples = [
    line(),
    line({ kind: 'warmup', hardCount: 5 }),
    line({ kind: 'drop', hardCount: 5 }),
    line({ kind: 'failure', hardCount: 5 }),
    line({ hardCount: 4 }),
    line({ weight: 0, reps: 0 }),
    line({ rowType: 'bodyweight', weight: 0, reps: 6 }),
  ];
  for (const spoken of samples) {
    assert.ok(spoken);
    assert.deepEqual(findToneViolations(spoken), [], spoken);
  }
});

test('Train paints the line from sessionCoachLine on the open lift only', () => {
  const card = read('src/components/workout/ActiveExerciseCard.tsx');
  assert.match(card, /sessionCoachLine\(/);
  assert.match(card, /data-testid="session-coach-line"/);
  assert.match(card, /house-session-coach/);
  assert.doesNotMatch(
    card,
    /Leave a little if the bar slows/,
    'the sentence lives in sessionCoachLine, not a second copy in the card'
  );
  const css = read('src/components/house/house.css');
  assert.match(
    css,
    /\.mw-house \.house-compose-live \.house-session-coach\.house-lede \{[^}]*--house-ink/
  );
  assert.doesNotMatch(
    css.slice(css.indexOf('.house-session-coach'), css.indexOf('.house-session-coach') + 280),
    /accent-poster|--primary/
  );
  assert.match(read('src/components/house/DESIGN.md'), /Session coach line is house leftover/);
  assert.match(read('docs/help/getting-started.md'), /open lift states this set/);
});
