import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectContradiction, sharedTags } from './formCueContradiction.ts';
import type { FormCue } from './formCueContradiction.ts';

function cue(fields: FormCue): FormCue {
  return Object.freeze({
    ...fields,
    tags: Object.freeze([...fields.tags]),
  });
}

test('same cue id returns self-noop', () => {
  const outcome = detectContradiction(
    cue({
      cueId: 'same',
      text: 'Brace the trunk',
      confidence: 'high',
      tags: ['brace'],
      lift: 'squat',
    }),
    cue({
      cueId: 'same',
      text: 'Do not brace the trunk',
      confidence: 'low',
      tags: ['brace'],
      lift: 'squat',
    }),
  );
  assert.deepEqual(outcome, { kind: 'self-noop', cueId: 'same' });
});

test('same lift, shared tag, opposite text, mid vs high flags the lower cue', () => {
  const outcome = detectContradiction(
    cue({
      cueId: 'high-cue',
      text: 'Sit back into the hips',
      confidence: 'high',
      tags: ['hips', 'depth'],
      lift: 'squat',
    }),
    cue({
      cueId: 'mid-cue',
      text: 'Do not sit back into the hips',
      confidence: 'mid',
      tags: ['depth', 'hips'],
      lift: 'squat',
    }),
  );
  assert.deepEqual(outcome, {
    kind: 'flag-lower',
    lowerCueId: 'mid-cue',
    higherCueId: 'high-cue',
    sharedTag: 'depth',
    lift: 'squat',
  });
});

test('equal confidence opposite claims return equal-confidence with sorted cue ids', () => {
  const outcome = detectContradiction(
    cue({
      cueId: 'cue-b',
      text: 'Never bounce',
      confidence: 'low',
      tags: ['bounce'],
      lift: 'squat',
    }),
    cue({
      cueId: 'cue-a',
      text: 'Bounce out of the hole',
      confidence: 'low',
      tags: ['bounce'],
      lift: 'squat',
    }),
  );
  assert.deepEqual(outcome, {
    kind: 'equal-confidence',
    cueIds: ['cue-a', 'cue-b'],
    sharedTag: 'bounce',
    lift: 'squat',
  });
});

test('different lifts return none', () => {
  const outcome = detectContradiction(
    cue({
      cueId: 'squat-cue',
      text: 'Brace the trunk',
      confidence: 'high',
      tags: ['brace'],
      lift: 'squat',
    }),
    cue({
      cueId: 'bench-cue',
      text: 'Do not brace the trunk',
      confidence: 'low',
      tags: ['brace'],
      lift: 'bench',
    }),
  );
  assert.deepEqual(outcome, { kind: 'none' });
});

test('no shared tags return none', () => {
  const outcome = detectContradiction(
    cue({
      cueId: 'brace-cue',
      text: 'Brace the trunk',
      confidence: 'mid',
      tags: ['brace'],
      lift: 'squat',
    }),
    cue({
      cueId: 'depth-cue',
      text: 'Avoid collapsing at the bottom',
      confidence: 'high',
      tags: ['depth'],
      lift: 'squat',
    }),
  );
  assert.deepEqual(outcome, { kind: 'none' });
});

test('sharedTags returns the sorted unique intersection', () => {
  const tags = sharedTags(
    cue({
      cueId: 'a',
      text: 'Brace',
      confidence: 'low',
      tags: ['zeta', 'alpha', 'mu', 'alpha'],
      lift: 'squat',
    }),
    cue({
      cueId: 'b',
      text: 'Brace hard',
      confidence: 'high',
      tags: ['mu', 'nope', 'alpha', 'mu'],
      lift: 'bench',
    }),
  );
  assert.deepEqual(tags, ['alpha', 'mu']);
});
