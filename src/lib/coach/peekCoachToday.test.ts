import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { peekCoachToday } from './peekCoachToday.ts';
import { clearPlan, loadCoachWeekChange, loadPlan, savePlan, savePlannedMissEdit } from './storage.ts';
import { currentWeekStart, todayDayOffset } from './splitPlanner.ts';
import type { CoachPlan } from './types.ts';

function installStorage(): () => void {
  const map = new Map<string, string>();
  const ls = {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
    clear: () => map.clear(),
    key: () => null,
    get length() {
      return map.size;
    },
  };
  const g = globalThis as unknown as {
    window?: unknown;
    localStorage?: typeof ls;
  };
  const prevWin = g.window;
  const prevLs = g.localStorage;
  g.window = { localStorage: ls, dispatchEvent: () => true };
  g.localStorage = ls;
  return () => {
    if (prevWin === undefined) delete g.window;
    else g.window = prevWin;
    if (prevLs === undefined) delete g.localStorage;
    else g.localStorage = prevLs;
  };
}

function planWithToday(status: 'planned' | 'done'): CoachPlan {
  const weekStart = currentWeekStart();
  const dayOffset = todayDayOffset(weekStart);
  return {
    revision: 1,
    weekStart,
    daysPerWeek: 3,
    generatedAt: new Date().toISOString(),
    contextHash: 'test',
    equipmentProfile: 'full-gym',
    sessions: [
      {
        id: 's-today',
        dayOffset,
        kind: 'strength',
        name: 'Peek Upper',
        focusGroups: ['Chest'],
        exercises: [
          {
            exerciseId: 'bench-press',
            sets: 3,
            reps: 8,
            weight: 60,
            whyKey: 'coachWhySteadyWeek',
          },
        ],
        estMinutes: 45,
        status,
      },
    ],
  };
}

describe('peekCoachToday', () => {
  let uninstall: () => void;

  beforeEach(() => {
    uninstall = installStorage();
    clearPlan();
  });

  afterEach(() => {
    clearPlan();
    uninstall();
  });

  it('returns null with no plan', () => {
    assert.equal(peekCoachToday(), null);
  });

  it('returns today’s planned session with exercises', () => {
    savePlan(planWithToday('planned'));
    const session = peekCoachToday();
    assert.ok(session);
    assert.equal(session!.name, 'Peek Upper');
    assert.equal(session!.status, 'planned');
    assert.equal(session!.exercises.length, 1);
    assert.equal(session!.exercises[0].exerciseId, 'bench-press');
  });

  it('skips done sessions', () => {
    savePlan(planWithToday('done'));
    assert.equal(peekCoachToday(), null);
  });

  for (const action of ['skip', 'slide'] as const) {
    it(`stores a receipt when the athlete chooses to ${action} a missed session`, () => {
      const before = planWithToday('planned');
      before.sessions[0] = { ...before.sessions[0], dayOffset: 0, status: 'missed' };
      savePlan(before);
      const id = before.sessions[0].id;
      savePlannedMissEdit(before.weekStart, id, action === 'skip' ? 'skip' : { slideFrom: 2 });
      const after = loadPlan()!;
      const [row] = loadCoachWeekChange(after)?.schedule ?? [];
      assert.equal(row?.kind, action === 'skip' ? 'dropped' : 'moved');
      if (row?.kind === 'dropped') assert.equal(row.missed, false);
      if (row?.kind === 'moved') assert.equal(row.after.dayOffset, 2);
    });
  }
});
