import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { ActiveWorkout } from '@/types';
import {
  activeFromSnapshot,
  countCompletedSets,
  decideOpenSession,
  parseOpenSession,
  snapshotFromActive,
  tombstoneFromActive,
  touchOpenSession,
  type OpenSessionSnapshot,
} from './openSessionContinuity.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const NOW = 't0';
const LATER = 't1';

function set(completed: boolean, reps = 5) {
  return { id: 's', reps, weight: 60, completed, kind: 'normal' as const };
}

function workout(opts: {
  clientId: string;
  revision: number;
  updatedAt?: string;
  completed?: number;
  name?: string;
  startedAt?: string;
  sessionNote?: string;
}): ActiveWorkout {
  const completed = opts.completed ?? 0;
  return {
    workoutName: opts.name ?? 'Push',
    startedAt: opts.startedAt ?? NOW,
    clientId: opts.clientId,
    revision: opts.revision,
    updatedAt: opts.updatedAt ?? NOW,
    sessionNote: opts.sessionNote,
    exercises: [
      {
        exerciseId: 'bench-press',
        sets: [
          set(completed > 0),
          set(completed > 1),
          set(false, 0),
        ],
      },
    ],
  };
}

function snap(active: ActiveWorkout): OpenSessionSnapshot {
  const s = snapshotFromActive(active, active.updatedAt ?? NOW);
  assert.ok(s);
  return s;
}

describe('openSessionContinuity', () => {
  it('empty + empty invents nothing', () => {
    assert.equal(decideOpenSession(null, null).action, 'empty');
    assert.equal(countCompletedSets(null), 0);
    assert.equal(parseOpenSession(42), null);
    assert.equal(parseOpenSession({ clientId: 'x' }), null);
  });

  it('desk start → phone empty adopts the same clientId (0 sets still Start)', () => {
    const desk = snap(workout({ clientId: 'desk-1', revision: 1, completed: 0 }));
    const decision = decideOpenSession(null, desk);
    assert.equal(decision.action, 'adopt-remote');
    const adopted = activeFromSnapshot(desk);
    assert.ok(adopted);
    assert.equal(adopted.clientId, 'desk-1');
    assert.equal(adopted.revision, 1);
  });

  it('desk start → phone finish is one session', () => {
    const desk = snap(workout({ clientId: 'one', revision: 2, completed: 1 }));
    assert.equal(decideOpenSession(null, desk).action, 'adopt-remote');
    const phone = touchOpenSession(
      {
        ...activeFromSnapshot(desk)!,
        exercises: [
          {
            exerciseId: 'bench-press',
            sets: [set(true), set(true), set(false, 0)],
          },
        ],
      },
      LATER
    );
    assert.equal(phone.clientId, 'one');
    assert.ok((phone.revision ?? 0) > (desk.revision ?? 0));
    assert.equal(countCompletedSets(phone), 2);
    const phoneSnap = snap(phone);
    assert.equal(decideOpenSession(phoneSnap, desk).action, 'push-local');
    const finished = {
      clientId: phone.clientId,
      sets: phone.exercises.flatMap((ex) => ex.sets.filter((s) => s.completed)),
    };
    assert.equal(finished.sets.length, 2);
    assert.equal(finished.clientId, desk.clientId);
  });

  it('guest local survives; signed-out does not invent a remote', () => {
    const guest = snap(workout({ clientId: 'guest-1', revision: 1, completed: 1 }));
    assert.equal(decideOpenSession(guest, null).action, 'push-local');
    assert.equal(countCompletedSets(guest.workout), 1);
  });

  it('surface change does not wipe local logged work', () => {
    const local = snap(workout({ clientId: 'phone', revision: 1, completed: 1 }));
    assert.equal(decideOpenSession(local, null).action, 'push-local');
    const other = snap(
      workout({ clientId: 'desk', revision: 1, completed: 1, name: 'Pull' })
    );
    assert.equal(decideOpenSession(local, other).action, 'needs-confirm');
  });

  it('empty local start yields to a remote session with work', () => {
    const local = snap(workout({ clientId: 'noise', revision: 1, completed: 0 }));
    const remote = snap(workout({ clientId: 'desk', revision: 3, completed: 1 }));
    assert.equal(decideOpenSession(local, remote).action, 'adopt-remote');
  });

  it('same clientId takes the higher revision', () => {
    const older = snap(workout({ clientId: 'one', revision: 1, completed: 1 }));
    const newer = snap(
      workout({ clientId: 'one', revision: 3, completed: 2, updatedAt: LATER })
    );
    assert.equal(decideOpenSession(older, newer).action, 'adopt-remote');
    assert.equal(decideOpenSession(newer, older).action, 'push-local');
    assert.equal(decideOpenSession(newer, newer).action, 'keep-local');
  });

  it('tombstone of the same session clears local (finish on the other surface)', () => {
    const live = snap(workout({ clientId: 'one', revision: 2, completed: 1 }));
    const tomb = tombstoneFromActive(live, LATER);
    assert.ok(tomb?.deletedAt);
    assert.equal(decideOpenSession(live, tomb).action, 'apply-tombstone');
    assert.equal(decideOpenSession(null, tomb).action, 'empty');
  });

  it('tombstone of a different session does not wipe local logged work', () => {
    const local = snap(workout({ clientId: 'phone', revision: 1, completed: 1 }));
    const tomb = tombstoneFromActive(
      workout({ clientId: 'desk', revision: 4, completed: 1 }),
      LATER
    );
    assert.equal(decideOpenSession(local, tomb).action, 'keep-local');
  });

  it('sessionNote is stripped from the snapshot (journal stays on device)', () => {
    const active = workout({
      clientId: 'one',
      revision: 1,
      completed: 1,
      sessionNote: 'knee twinge',
    });
    const s = snap(active);
    assert.equal('sessionNote' in (s.workout ?? {}), false);
    const json = JSON.stringify(s);
    assert.doesNotMatch(json, /knee twinge/);
  });

  it('touch never mints a second clientId', () => {
    const first = touchOpenSession(workout({ clientId: 'keep', revision: 1 }), LATER);
    const second = touchOpenSession(first, 't2');
    assert.equal(first.clientId, 'keep');
    assert.equal(second.clientId, 'keep');
    assert.ok((second.revision ?? 0) > (first.revision ?? 0));
  });
});

describe('openSessionContinuity source lock', () => {
  it('Train / Today / Coach have no Force Sync theater', () => {
    const files = [
      'src/page-components/ActiveWorkoutPage.tsx',
      'src/page-components/HomeTodayLean.tsx',
      'src/page-components/HomeTodayDashboard.tsx',
      'src/page-components/CoachPage.tsx',
      'src/components/workout/ActiveEmptyState.tsx',
      'src/components/workout/ActiveSessionChrome.tsx',
      'src/hooks/useJourneySync.ts',
      'src/lib/workout/openSessionContinuity.ts',
      'src/lib/sync/openSessionSync.ts',
    ];
    for (const rel of files) {
      const src = read(rel)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
      assert.doesNotMatch(
        src,
        /Force Sync|Session Expired|sign in to (?:keep|save) these sets/i,
        rel
      );
    }
  });

  it('this path does not remount the four-scene door or a sync screen', () => {
    const helper = read('src/lib/workout/openSessionContinuity.ts');
    const sync = read('src/lib/sync/openSessionSync.ts');
    const page = read('src/page-components/ActiveWorkoutPage.tsx');
    for (const src of [helper, sync, page]) {
      assert.doesNotMatch(src, /CinematicWww|four-scene|ForceSync|SyncScreen|sync-screen/);
      assert.doesNotMatch(src, /Watch|wearable permission|Apple Watch/i);
    }
  });

  it('does not import generateWeek / catalog / shop / Trainer', () => {
    const helper = read('src/lib/workout/openSessionContinuity.ts');
    assert.doesNotMatch(helper, /generateWeek|Trainer|shop|EXERCISES/);
    assert.doesNotMatch(helper, /from\s+['"]@\/lib\/coach\/planEngine/);
  });

  it('does not smash Today Start, Wednesday cite, close receipt, or /private', () => {
    const hero = read('src/components/journey/JourneyHero.tsx');
    const start = hero.slice(hero.indexOf('function StartDockHero'));
    const buttons = start.match(/className="primary-action/g) ?? [];
    assert.equal(buttons.length, 2, 'Today still one Start (desktop + compact)');

    const cite = read('src/components/coach/CoachNextDayCite.tsx');
    assert.match(cite, /data-testid="coach-next-day"/);
    assert.doesNotMatch(cite, /className="primary-action/);

    const receipt = read('src/lib/workout/victoryReceipt.ts');
    assert.doesNotMatch(receipt, /permalink|publicUrl|share\/workout/i);

    const teaser = read('app/private/GateTeaser.tsx');
    assert.doesNotMatch(teaser, /CinematicWww/);
    assert.match(teaser, /PrivateTeaserClient/);
  });
});
