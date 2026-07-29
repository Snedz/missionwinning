import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDebrief } from '@/lib/coach/debrief';
import { findToneViolations } from '@/lib/reentryTone';
import type { CompletedWorkoutLog, Rpe, SetKind } from '@/types';

const NOW = new Date('2026-07-29T12:00:00Z');

function at(daysAgo: number): string {
  return new Date(NOW.getTime() - daysAgo * 86_400_000).toISOString();
}

function log(
  daysAgo: number,
  sets: { reps: number; weight: number; kind?: SetKind; rpe?: Rpe }[] = [
    { reps: 5, weight: 100, rpe: 'med' },
  ],
  minutes = 60,
  id = `w-${daysAgo}`
): CompletedWorkoutLog {
  return {
    id,
    workoutName: 'Session',
    startedAt: at(daysAgo),
    completedAt: at(daysAgo),
    durationSeconds: minutes * 60,
    deletedAt: null,
    exercises: [{ exerciseId: 'bench-press', sets }],
    totalVolume: sets.reduce((s, x) => s + x.reps * x.weight, 0),
  };
}

/** A steady 10-week base, so bands and baselines are available. */
function base(): CompletedWorkoutLog[] {
  const out: CompletedWorkoutLog[] = [];
  for (let d = 70; d >= 2; d -= 2) out.push(log(d));
  return out;
}

test('the debrief always leads with effort and closes with a question', () => {
  const today = log(0);
  const d = buildDebrief({ log: today, history: [...base(), today], now: NOW });
  assert.equal(d.lines[0].kind, 'effort');
  assert.equal(d.lines[d.lines.length - 1].kind, 'question');
  assert.equal(d.replies.length, 3, 'the question needs chips to be answerable');
});

test('every line obeys the re-entry tone contract', () => {
  const today = log(0, [{ reps: 5, weight: 130, rpe: 'hard' }], 120);
  const d = buildDebrief({
    log: today,
    history: [...base(), today],
    checkIn: { sleep: 1, stress: 5, energy: 1, soreness: 5 },
    now: NOW,
  });
  for (const line of d.lines) {
    assert.deepEqual(
      findToneViolations(line.text),
      [],
      `${line.kind} broke the tone contract: "${line.text}"`
    );
  }
});

test('says nothing about a baseline it does not have', () => {
  // Two prior sessions is not a baseline, and 4 days is not a load history.
  const today = log(0);
  const d = buildDebrief({ log: today, history: [log(4), log(2), today], now: NOW });
  const text = d.lines.map((l) => l.text).join(' ');
  assert.equal(/above your recent average|lighter than usual/.test(text), false);
  assert.equal(d.lines.some((l) => l.kind === 'band'), false, 'no band without history');
  assert.equal(d.zone, 'unknown');
});

test('a big session reads as big — it is not flattened by its own baseline', () => {
  // End-to-end check on the guarantee. The guard itself is compareToBaseline's
  // strict date comparison; this asserts the behaviour a reader actually cares about.
  const today = log(0, [{ reps: 5, weight: 100 }], 180, 'today');
  const d = buildDebrief({ log: today, history: [...base(), today], now: NOW });
  const effort = d.lines.find((l) => l.kind === 'effort')!.text;
  assert.match(effort, /above your recent average/, `got: ${effort}`);
});

test('a same-day earlier session does not become its own comparison', () => {
  // Sized so the guard actually decides the sentence. Three priors at 60 min
  // (load 420); today is 69 min (load 483) — exactly +15%, which reads "above".
  // Let the same-day session into the baseline and the mean rises to ~435, the
  // delta falls to +11%, and the line silently downgrades to "right around your
  // usual". A larger base would absorb the extra session and prove nothing, which
  // is what the first two versions of this test did.
  const priors = [log(6, undefined, 60, 'p1'), log(4, undefined, 60, 'p2'), log(2, undefined, 60, 'p3')];
  const morning = log(0, undefined, 60, 'morning');
  const evening = log(0, undefined, 69, 'evening');

  const d = buildDebrief({ log: evening, history: [...priors, morning, evening], now: NOW });
  assert.match(
    d.lines[0].text,
    /above your recent average/,
    `same-day session leaked into the baseline: "${d.lines[0].text}"`
  );
});

test('a real PR is congratulated with what it beat', () => {
  const today = log(0, [{ reps: 5, weight: 140 }], 60, 'today');
  const d = buildDebrief({ log: today, history: [...base(), today], now: NOW });
  const record = d.lines.find((l) => l.kind === 'record');
  assert.ok(record, 'a 40 kg jump should be a record');
  assert.match(record!.text, /past 100/);
});

test('a first-ever session is not told it broke a record', () => {
  const first = log(0);
  const d = buildDebrief({ log: first, history: [first], now: NOW });
  assert.equal(d.lines.some((l) => l.kind === 'record'), false);
});

test('a hard check-in is explained, not silently applied', () => {
  const today = log(0);
  const d = buildDebrief({
    log: today,
    history: [...base(), today],
    checkIn: { sleep: 2, stress: 3, energy: 3 },
    now: NOW,
  });
  const readiness = d.lines.find((l) => l.kind === 'readiness');
  assert.ok(readiness, 'the athlete should be told why the dose changed');
  assert.match(readiness!.text, /sleep 2\/5/);
});

test('a good day gets no invented concern and no invented action', () => {
  const today = log(0);
  const d = buildDebrief({
    log: today,
    history: [...base(), today],
    checkIn: { sleep: 5, stress: 1, energy: 5, soreness: 1 },
    now: NOW,
  });
  assert.equal(d.lines.some((l) => l.kind === 'readiness'), false, 'nothing negative fired');
  assert.equal(d.lines.some((l) => l.kind === 'action'), false, 'no action worth naming');
});

test('bodyweight-only sessions read cleanly, with no phantom tonnage', () => {
  const today = log(0, [{ reps: 20, weight: 0, rpe: 'hard' }], 30, 'today');
  const d = buildDebrief({ log: today, history: [today], now: NOW });
  const effort = d.lines[0].text;
  assert.equal(effort.includes('0 kg moved'), false, `should omit tonnage, got: ${effort}`);
  // Caught in the browser, not by a test: a single set read "1 working sets".
  assert.match(effort, /1 working set in 30 min/);
  assert.equal(effort.includes('working sets'), false, 'singular set must not be pluralised');
});

test('more than one set is pluralised', () => {
  const today = log(
    0,
    [
      { reps: 5, weight: 100 },
      { reps: 5, weight: 100 },
    ],
    40,
    'today'
  );
  const d = buildDebrief({ log: today, history: [today], now: NOW });
  assert.match(d.lines[0].text, /2 working sets in 40 min/);
});

test('the band never predicts, it only compares', () => {
  const history = [];
  for (let d = 70; d >= 14; d -= 3) history.push(log(d, undefined, 45));
  for (let d = 6; d >= 0; d -= 1) {
    history.push(log(d, [{ reps: 5, weight: 150, rpe: 'hard' }], 120, `spike-${d}`));
  }
  const today = history[history.length - 1];
  const d = buildDebrief({ log: today, history, now: NOW });
  const band = d.lines.find((l) => l.kind === 'band');
  assert.ok(band, 'a spike after a steady base should say something');
  for (const word of ['injury', 'risk', 'overtrain', 'danger', 'warning']) {
    assert.equal(
      band!.text.toLowerCase().includes(word),
      false,
      `band line must not say "${word}": ${band!.text}`
    );
  }
});
