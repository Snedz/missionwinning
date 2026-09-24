/**
 * The personal trainer is on Today, Train, and Coach.
 * It does not sell a bundle, invent a checkout URL, or wear another product's name.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('session trainer surfaces', () => {
  it('Today, Train, and Coach mount the same card', () => {
    assert.match(read('src/page-components/TodayDesk.tsx'), /<SessionTrainerCard/);
    assert.match(read('src/page-components/ActiveWorkoutPage.tsx'), /surface="train"/);
    assert.match(read('src/page-components/CoachPage.tsx'), /surface="coach"/);
  });

  it('the card is not a checkout and not another brand', () => {
    const card = read('src/components/coach/SessionTrainerCard.tsx');
    assert.match(card, /session-trainer-library/);
    assert.doesNotMatch(card, /house-btn-primary/);
    assert.doesNotMatch(card, /paymentUrl|\/bundle|Super Bundle|Muse/i);
    const server = read('src/lib/coach/sessionTrainerServer.ts');
    assert.match(server, /gemini-2\.5-flash/);
    assert.doesNotMatch(server, /\bMuse\b/);
  });
});
