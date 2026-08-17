import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SILENT_KINDS,
  SPOKEN_KINDS,
  joinForSpeech,
  shouldSpeakOnRestEnd,
  speakableChatReply,
  speakableDebriefLines,
  speakableDebriefText,
  speakableNextCue,
  speakableSetProgress,
} from '@/lib/speech/speakableLines';
import type { Debrief, DebriefLineKind } from '@/lib/coach/debrief';

function debrief(lines: { kind: DebriefLineKind; text: string }[]): Debrief {
  return {
    lines,
    session: { date: '2026-07-29', tonnage: 700, workingSets: 1, durationMinutes: 76, sessionRpe: 9, load: 684 },
    records: [],
    zone: 'steady',
    replies: ['Felt good', 'Harder than expected'],
  };
}

const FULL = debrief([
  { kind: 'effort', text: '700 kg moved, 1 working set in 76 min' },
  { kind: 'record', text: 'Best bench press weight: 140 kg, past 100.' },
  { kind: 'band', text: 'Your last week is running heavier than your month' },
  { kind: 'plateau', text: 'No new best on squats in 4 sessions — next week programs it lighter.' },
  { kind: 'readiness', text: 'You rated sleep 2/5 today, so the next session is scaled to match.' },
  { kind: 'action', text: 'Water, food, and an early night.' },
  { kind: 'question', text: 'How did that feel?' },
]);

describe('speakableDebriefLines', () => {
  it('never speaks the closing question — the voice cannot hear the answer', () => {
    // The question's answer is a TAP on a reply chip that writes today's check-in.
    // Speaking it invites the athlete to talk to a wall.
    const spoken = speakableDebriefLines(FULL);
    assert.ok(!spoken.some((l) => l.includes('How did that feel')));
  });

  it('never speaks the action line — a next step is to re-read, not half-remember', () => {
    const spoken = speakableDebriefLines(FULL);
    assert.ok(!spoken.some((l) => l.includes('early night')));
  });

  it('speaks exactly the debrief lines it was given, and nothing invented', () => {
    const spoken = speakableDebriefLines(FULL);
    // Every utterance must be traceable to a line the rules engine composed — this is
    // the whole doctrine: rules are the source, speech is presentation.
    for (const utterance of spoken) {
      assert.ok(
        FULL.lines.some((l) => l.text === utterance),
        `spoke something no rule composed: ${utterance}`
      );
    }
    assert.equal(spoken.length, 5, 'five spoken kinds present in this debrief');
  });

  it('keeps the debrief own order — re-sorting would escape the tone tests', () => {
    const spoken = speakableDebriefLines(FULL);
    assert.match(spoken[0], /700 kg moved/);
    assert.match(spoken[1], /Best bench press/);
    assert.match(spoken[2], /running heavier/);
    assert.match(spoken[3], /No new best/);
    assert.match(spoken[4], /rated sleep/);
  });

  it('a debrief with nothing sayable is silence, not filler', () => {
    assert.deepEqual(speakableDebriefLines(debrief([])), []);
    assert.deepEqual(speakableDebriefLines(null), []);
    assert.equal(speakableDebriefText(undefined), '');
    // Only screen-only kinds present → still silence.
    const screenOnly = debrief([
      { kind: 'action', text: 'Water and an early night.' },
      { kind: 'question', text: 'How did that feel?' },
    ]);
    assert.deepEqual(speakableDebriefLines(screenOnly), []);
  });

  it('blank and whitespace lines are dropped, not spoken as pauses', () => {
    const withBlanks = debrief([
      { kind: 'effort', text: '  ' },
      { kind: 'band', text: 'Steady week.' },
    ]);
    assert.deepEqual(speakableDebriefLines(withBlanks), ['Steady week.']);
  });

  it('the spoken and silent sets do not overlap', () => {
    for (const kind of SILENT_KINDS) {
      assert.ok(!SPOKEN_KINDS.includes(kind), `${kind} cannot be both spoken and silent`);
    }
  });

  it('joins with terminal punctuation so facts do not run together', () => {
    assert.equal(
      joinForSpeech(['700 kg moved', 'Steady week.', 'Sleep was 2/5!']),
      '700 kg moved. Steady week. Sleep was 2/5!'
    );
    assert.equal(joinForSpeech([]), '');
  });
});

describe('speakableNextCue', () => {
  it('names the next lift and load from the live store — nothing invented', () => {
    assert.equal(
      speakableNextCue({ exerciseName: 'Bench press', weight: 80, reps: 5 }),
      'Rest. Next: Bench press, 80 × 5.'
    );
  });

  it('bodyweight (0 load) speaks reps, not a fake bar', () => {
    assert.equal(
      speakableNextCue({ exerciseName: 'Push-up', weight: 0, reps: 12 }),
      'Rest. Next: Push-up, 12 reps.'
    );
  });

  it('a name with no targets is still a direction, not silence', () => {
    assert.equal(speakableNextCue({ exerciseName: 'Squat' }), 'Rest. Next: Squat.');
  });

  it('blank or missing name is silence — no filler coach', () => {
    assert.equal(speakableNextCue(null), '');
    assert.equal(speakableNextCue(undefined), '');
    assert.equal(speakableNextCue({ exerciseName: '   ' }), '');
  });
});

describe('speakableSetProgress', () => {
  it('speaks completed of planned from the store counts', () => {
    assert.equal(speakableSetProgress({ completed: 2, target: 4 }), '2 of 4.');
  });

  it('zero or inverted counts are silence, not "0 of 0"', () => {
    assert.equal(speakableSetProgress(null), '');
    assert.equal(speakableSetProgress({ completed: 0, target: 4 }), '');
    assert.equal(speakableSetProgress({ completed: 2, target: 0 }), '');
  });
});

describe('shouldSpeakOnRestEnd', () => {
  it('speaks only when Cue me is on and rest just ended', () => {
    assert.equal(shouldSpeakOnRestEnd(true, false, true), true);
    assert.equal(shouldSpeakOnRestEnd(true, false, false), false);
    assert.equal(shouldSpeakOnRestEnd(false, false, true), false);
    assert.equal(shouldSpeakOnRestEnd(true, true, true), false);
  });
});

describe('speakableChatReply', () => {
  it('speaks the reply text without markdown markers', () => {
    assert.equal(
      speakableChatReply('Keep **elbows** under the bar.'),
      'Keep elbows under the bar.'
    );
  });

  it('blank is silence', () => {
    assert.equal(speakableChatReply(''), '');
    assert.equal(speakableChatReply(null), '');
  });
});
