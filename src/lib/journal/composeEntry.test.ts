import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { collectFragments, composeSessionEntry } from '@/lib/journal/composeEntry';
import type { Debrief, DebriefLineKind } from '@/lib/coach/debrief';
import type { CompletedWorkoutLog } from '@/types';

function debrief(lines: { kind: DebriefLineKind; text: string }[]): Debrief {
  return {
    lines,
    session: { date: '2026-07-30', tonnage: 700, workingSets: 12, durationMinutes: 50, sessionRpe: 7, load: 350 },
    records: [],
    zone: 'steady',
    replies: ['Felt good'],
  };
}

const DEBRIEF = debrief([
  { kind: 'effort', text: '700 kg moved, 12 working sets in 50 min.' },
  { kind: 'record', text: 'Best bench press weight: 100 kg, past 95.' },
  { kind: 'question', text: 'How did that feel?' },
]);

function log(
  exercises: { exerciseId: string; note?: string }[]
): Pick<CompletedWorkoutLog, 'exercises'> {
  return {
    exercises: exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      sets: [{ reps: 5, weight: 100 }],
      ...(ex.note !== undefined ? { note: ex.note } : {}),
    })),
  };
}

describe('collectFragments', () => {
  it('session jot first, then exercise notes in log order, attributed by name', () => {
    const fragments = collectFragments(
      log([
        { exerciseId: 'bench-press', note: 'tuck elbows' },
        { exerciseId: 'squat' },
        { exerciseId: 'deadlift', note: 'hook grip from set 2' },
      ]),
      'knee twinge set 3',
      (id) => id.replace(/-/g, ' ')
    );
    assert.deepEqual(fragments, [
      { source: 'session', text: 'knee twinge set 3' },
      { source: 'exercise', label: 'bench press', text: 'tuck elbows' },
      { source: 'exercise', label: 'deadlift', text: 'hook grip from set 2' },
    ]);
  });

  it('a multi-line exercise note (the .184 per-set fold) is one fragment per line, same name', () => {
    const fragments = collectFragments(
      log([{ exerciseId: 'bench-press', note: 'slow eccentric\ngrip felt off' }]),
      undefined
    );
    assert.deepEqual(fragments, [
      { source: 'exercise', label: 'bench press', text: 'slow eccentric' },
      { source: 'exercise', label: 'bench press', text: 'grip felt off' },
    ]);
  });

  it('nothing written is an empty list — not a placeholder fragment', () => {
    assert.deepEqual(collectFragments(log([{ exerciseId: 'squat' }]), ''), []);
    assert.deepEqual(collectFragments(log([{ exerciseId: 'squat', note: '   ' }]), '  \n '), []);
  });
});

describe('composeSessionEntry', () => {
  it('empty fragments → the entry is exactly the debrief. The Strava mutant dies here.', () => {
    // Strava's Athlete Intelligence generated "reflection" over sessions where the
    // athlete had offered no words, and it became a meme. Any code path that
    // invents a fragment, adds a line, or rewords the debrief fails this deepEqual.
    const entry = composeSessionEntry(DEBRIEF, [], null);
    assert.deepEqual(entry.fragments, []);
    assert.deepEqual(entry.lines, DEBRIEF.lines);
    assert.equal(entry.checkIn, undefined);
  });

  it('fragments render first as the athlete wrote them, exercise ones attributed', () => {
    const entry = composeSessionEntry(DEBRIEF, [
      { source: 'session', text: 'knee twinge set 3' },
      { source: 'exercise', label: 'bench press', text: 'tuck elbows' },
    ]);
    assert.deepEqual(entry.fragments, ['knee twinge set 3', 'bench press: tuck elbows']);
    // The machine's half is untouched by the athlete having spoken.
    assert.deepEqual(entry.lines, DEBRIEF.lines);
  });

  it('the athlete\'s words are never reworded — every fragment survives verbatim', () => {
    const texts = ['PR attempt felt grindy', 'switch to low bar next week'];
    const entry = composeSessionEntry(
      DEBRIEF,
      texts.map((text) => ({ source: 'session' as const, text }))
    );
    for (const text of texts) {
      assert.ok(
        entry.fragments.some((f) => f.includes(text)),
        `fragment lost or reworded: ${text}`
      );
    }
  });

  it('blank fragments are dropped, not rendered as empty quotes', () => {
    const entry = composeSessionEntry(DEBRIEF, [
      { source: 'session', text: '   ' },
      { source: 'session', text: 'real note' },
    ]);
    assert.deepEqual(entry.fragments, ['real note']);
  });

  it('the check-in strip carries only fields the athlete rated', () => {
    const entry = composeSessionEntry(DEBRIEF, [], {
      sleep: 2,
      mood: 0, // unrated sentinel — must not appear
      stress: 3,
      energy: 4,
    });
    assert.deepEqual(entry.checkIn, { sleep: 2, stress: 3, energy: 4 });
    // Nothing rated at all → no strip, not an empty object pretending to be data.
    assert.equal(
      composeSessionEntry(DEBRIEF, [], { sleep: 0, mood: 0, stress: 0, energy: 0 }).checkIn,
      undefined
    );
  });
});
