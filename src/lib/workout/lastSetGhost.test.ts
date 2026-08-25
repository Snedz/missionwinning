import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { CompletedWorkoutLog } from '@/types';
import {
  formatLastSetGhostExtras,
  resolveLastSetGhost,
  shouldOfferLastSetGhost,
} from './lastSetGhost.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function logWith(
  exerciseId: string,
  sets: {
    reps: number;
    weight: number;
    kind?: string;
    tempo?: string;
    rir?: number;
    rpe10?: number;
    side?: string;
  }[],
  over: Partial<CompletedWorkoutLog> = {}
): CompletedWorkoutLog {
  return {
    id: over.id ?? 'h1',
    workoutName: over.workoutName ?? 'Past',
    startedAt: over.startedAt ?? isoDaysAgo(2),
    completedAt: over.completedAt ?? isoDaysAgo(2),
    durationSeconds: 3600,
    totalVolume: 100,
    deletedAt: over.deletedAt,
    exercises: [
      {
        exerciseId,
        sets: sets.map((s) => ({
          id: `${s.kind ?? 'n'}-${s.weight}-${s.reps}`,
          reps: s.reps,
          weight: s.weight,
          completed: true,
          kind: (s.kind ?? 'normal') as 'normal' | 'warmup' | 'failure' | 'drop',
          ...(s.tempo ? { tempo: s.tempo } : {}),
          ...(s.rir != null ? { rir: s.rir } : {}),
          ...(s.rpe10 != null ? { rpe10: s.rpe10 } : {}),
          ...(s.side ? { side: s.side } : {}),
        })),
      },
    ],
  } as CompletedWorkoutLog;
}

describe('resolveLastSetGhost', () => {
  it('first-ever / empty history has no ghost', () => {
    assert.equal(resolveLastSetGhost([], 'bench-press'), null);
    assert.equal(
      resolveLastSetGhost(
        [logWith('squat', [{ reps: 5, weight: 100 }])],
        'bench-press'
      ),
      null
    );
    assert.equal(resolveLastSetGhost([logWith('bench-press', [])], 'bench-press'), null);
  });

  it('returning exercise ghosts the last working set, not warmup W', () => {
    const history = [
      logWith('bench-press', [
        { reps: 10, weight: 40, kind: 'warmup' },
        { reps: 5, weight: 80, kind: 'normal' },
      ]),
    ];
    assert.deepEqual(resolveLastSetGhost(history, 'bench-press'), {
      reps: 5,
      weight: 80,
    });
  });

  it('trailing warmup after work is not the ghost', () => {
    const history = [
      logWith('bench-press', [
        { reps: 5, weight: 80, kind: 'normal' },
        { reps: 10, weight: 40, kind: 'warmup' },
      ]),
    ];
    assert.deepEqual(resolveLastSetGhost(history, 'bench-press'), {
      reps: 5,
      weight: 80,
    });
  });

  it('last working set wins when several working sets exist', () => {
    const history = [
      logWith('bench-press', [
        { reps: 5, weight: 60, kind: 'normal' },
        { reps: 8, weight: 40, kind: 'warmup' },
        { reps: 5, weight: 80, kind: 'normal' },
      ]),
    ];
    assert.deepEqual(resolveLastSetGhost(history, 'bench-press'), {
      reps: 5,
      weight: 80,
    });
  });

  it('warmup-only last session looks further back', () => {
    const history = [
      logWith('bench-press', [{ reps: 10, weight: 40, kind: 'warmup' }], {
        id: 'newer',
        completedAt: isoDaysAgo(1),
      }),
      logWith('bench-press', [{ reps: 5, weight: 90, kind: 'normal' }], {
        id: 'older',
        completedAt: isoDaysAgo(8),
      }),
    ];
    assert.deepEqual(resolveLastSetGhost(history, 'bench-press'), {
      reps: 5,
      weight: 90,
    });
  });

  it('skips tombstones and 0-rep junk', () => {
    const history = [
      {
        ...logWith('bench-press', [{ reps: 5, weight: 999 }]),
        deletedAt: isoDaysAgo(0),
      },
      logWith('bench-press', [
        { reps: 0, weight: 80, kind: 'normal' },
        { reps: 5, weight: 70, kind: 'normal' },
      ]),
    ];
    assert.deepEqual(resolveLastSetGhost(history, 'bench-press'), {
      reps: 5,
      weight: 70,
    });
  });

  it('all-warmup history is first-ever (no ghost)', () => {
    assert.equal(
      resolveLastSetGhost(
        [logWith('bench-press', [{ reps: 10, weight: 40, kind: 'warmup' }])],
        'bench-press'
      ),
      null
    );
  });

  it('copies last tempo / RIR / side when those fields exist', () => {
    const history = [
      logWith('bench-press', [
        { reps: 10, weight: 40, kind: 'warmup' },
        {
          reps: 5,
          weight: 80,
          kind: 'normal',
          tempo: '3-1-1',
          rpe10: 9,
          rir: 2,
          side: 'L',
        },
      ]),
    ];
    assert.deepEqual(resolveLastSetGhost(history, 'bench-press'), {
      reps: 5,
      weight: 80,
      tempo: '3-1-1',
      rpe10: 9,
      rir: 2,
      side: 'L',
    });
  });

  it('omits extras when the last working set does not have them', () => {
    const ghost = resolveLastSetGhost(
      [logWith('bench-press', [{ reps: 5, weight: 80 }])],
      'bench-press'
    );
    assert.equal(ghost && 'tempo' in ghost, false);
    assert.equal(ghost && 'rir' in ghost, false);
    assert.equal(ghost && 'rpe10' in ghost, false);
    assert.equal(ghost && 'side' in ghost, false);
  });
});

describe('shouldOfferLastSetGhost', () => {
  it('is false when there is no ghost or the dial already matches', () => {
    assert.equal(shouldOfferLastSetGhost(null, { reps: 5, weight: 80 }), false);
    assert.equal(
      shouldOfferLastSetGhost({ reps: 5, weight: 80 }, { reps: 5, weight: 80 }),
      false
    );
  });

  it('is true when last working differs from the dial (including a warmup prefill)', () => {
    assert.equal(
      shouldOfferLastSetGhost({ reps: 5, weight: 80 }, { reps: 10, weight: 40 }),
      true
    );
  });
});

describe('formatLastSetGhostExtras', () => {
  it('is empty without optional fields', () => {
    assert.equal(formatLastSetGhostExtras({ reps: 5, weight: 80 }), '');
  });

  it('joins tempo, RPE, RIR, and side when present', () => {
    assert.equal(
      formatLastSetGhostExtras({
        reps: 5,
        weight: 80,
        tempo: '3-1-1',
        rpe10: 9,
        rir: 2,
        side: 'L',
      }),
      ' · 3-1-1 · RPE 9 · RIR 2 · L'
    );
  });
});

describe('compose — do not rewrite colliding logger homes', () => {
  it('lives in lastSetGhost.ts and does not import restTimer / resolveSetInput / speech', () => {
    const src = readFileSync(path.join(import.meta.dirname, 'lastSetGhost.ts'), 'utf8');
    assert.doesNotMatch(src, /from ['"]@\/lib\/workout\/restTimer/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/workout\/nextSetTargets/);
    assert.doesNotMatch(src, /resolveRepeatLastTarget/);
    assert.doesNotMatch(src, /from ['"]@\/lib\/speech/);
    assert.match(src, /workingSets/);
  });

  it('ActiveWorkoutPage still owns set-log first paint (no speech on the logger)', () => {
    const src = readFileSync(
      path.join(root, 'src/page-components/ActiveWorkoutPage.tsx'),
      'utf8'
    );
    assert.doesNotMatch(src, /from '@\/lib\/speech/);
    assert.match(src, /ActiveExerciseList/);
    assert.match(src, /SetLog|buildConsoleSet/);
  });

  it('compact console and desktop table mount LastSetGhostButton; accept reuses Use-next patches', () => {
    const consoleSrc = readFileSync(
      path.join(root, 'src/components/workout/LogConsole.tsx'),
      'utf8'
    );
    const tableSrc = readFileSync(
      path.join(root, 'src/components/workout/SetLogTable.tsx'),
      'utf8'
    );
    const dockSrc = readFileSync(
      path.join(root, 'src/components/workout/ActiveSessionDock.tsx'),
      'utf8'
    );
    const btnSrc = readFileSync(
      path.join(root, 'src/components/workout/LastSetGhostButton.tsx'),
      'utf8'
    );
    assert.match(consoleSrc, /LastSetGhostButton/);
    assert.match(tableSrc, /LastSetGhostButton/);
    assert.match(dockSrc, /lastSetGhost=\{consoleSet\.lastSetGhost\}/);
    assert.match(dockSrc, /patchesForUseNext\(target\)/);
    assert.match(btnSrc, /activeLastPerformance/);
    assert.match(btnSrc, /activeCopyLast/);
    assert.doesNotMatch(btnSrc, /from '@\/lib\/speech/);
  });
});
