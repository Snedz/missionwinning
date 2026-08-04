/**
 * Craft-index content ratchet: structured form guides only grow.
 * Pattern media still covers long-tail; this pins text teaching depth.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EXERCISES } from '@/data/exercises';
import { getFormGuide, getFormGuideOrCues } from '@/lib/formGuides';

/** Floor after `.458` (66) + this expansion toward 80. Raise only when you win. */
const STRUCTURED_GUIDE_FLOOR = 80;

test('structured form guide count only ratchets up', () => {
  let n = 0;
  for (const e of EXERCISES) {
    if (getFormGuide(e.id, { exercise: e })) n += 1;
  }
  assert.ok(
    n >= STRUCTURED_GUIDE_FLOOR,
    `structured guides ${n} < floor ${STRUCTURED_GUIDE_FLOOR} — add EXTENDED_GUIDES, do not lower the floor`
  );
});

test('every catalog exercise has teachable form content (guide or cues)', () => {
  const bare: string[] = [];
  for (const e of EXERCISES) {
    if (!getFormGuideOrCues(e.id, { exercise: e })) bare.push(e.id);
  }
  assert.deepEqual(bare, [], `no form teaching for: ${bare.slice(0, 12).join(', ')}`);
});
