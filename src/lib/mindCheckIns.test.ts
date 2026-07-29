import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  checkInReadinessDelta,
  checkInReasons,
  getTodayCheckIn,
  loadCheckIns,
  MIND_CHECKINS_KEY,
  saveCheckIn,
  todayCheckInDate,
  upsertTodayPartial,
} from './mindCheckIns.ts';

describe('mindCheckIns', () => {
  const store = new Map<string, string>();
  let hadWindow: boolean;

  beforeEach(() => {
    store.clear();
    hadWindow = typeof globalThis.window !== 'undefined';
    if (!hadWindow) {
      (globalThis as unknown as { window: typeof globalThis }).window = globalThis;
    }
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      writable: true,
      value: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v);
        },
        removeItem: (k: string) => {
          store.delete(k);
        },
      },
    });
  });

  afterEach(() => {
    if (!hadWindow) {
      delete (globalThis as { window?: unknown }).window;
    }
  });

  it('saves and loads today check-in', () => {
    const date = todayCheckInDate();
    saveCheckIn({ date, sleep: 4, mood: 3, stress: 2, energy: 5, soreness: 2 });
    const t = getTodayCheckIn();
    assert.equal(t?.sleep, 4);
    assert.equal(t?.soreness, 2);
    assert.equal(loadCheckIns().length, 1);
    assert.ok(store.get(MIND_CHECKINS_KEY));
  });

  it('upsertTodayPartial merges without wiping mood', () => {
    const date = todayCheckInDate();
    saveCheckIn({ date, sleep: 3, mood: 5, stress: 1, energy: 3 });
    upsertTodayPartial({ sleep: 2, soreness: 4, energy: 2 });
    const t = getTodayCheckIn();
    assert.equal(t?.mood, 5);
    assert.equal(t?.sleep, 2);
    assert.equal(t?.soreness, 4);
    assert.equal(t?.energy, 2);
  });
});

describe('checkInReadinessDelta', () => {
  it('returns 0 for null', () => {
    assert.equal(checkInReadinessDelta(null), 0);
  });

  it('penalizes poor sleep and high soreness', () => {
    const d = checkInReadinessDelta({ sleep: 1, stress: 3, energy: 3, soreness: 5 });
    assert.ok(d < 0);
    assert.ok(d >= -15);
  });

  it('rewards good sleep and energy', () => {
    const d = checkInReadinessDelta({ sleep: 5, stress: 2, energy: 5, soreness: 1 });
    assert.ok(d > 0);
    assert.ok(d <= 15);
  });

  it('clamps extreme combinations to ±15', () => {
    const bad = checkInReadinessDelta({ sleep: 1, stress: 5, energy: 1, soreness: 5 });
    assert.equal(bad, -15);
  });

  /**
   * `.171` moved the thresholds into one rule table so the number and its explanation
   * cannot disagree. These pin that refactor: behaviour identical, reasons always
   * accounting for exactly the delta.
   */
  describe('readiness reasons', () => {
    /** The pre-refactor implementation, verbatim, as an oracle. */
    function legacyDelta(
      c: { sleep: number; stress: number; energy: number; soreness?: number },
      maxAbs = 15
    ): number {
      let delta = 0;
      if (c.sleep <= 2) delta -= 6;
      else if (c.sleep >= 4) delta += 3;
      if (c.soreness != null) {
        if (c.soreness >= 4) delta -= 6;
        else if (c.soreness <= 2) delta += 2;
      }
      if (c.energy <= 2) delta -= 4;
      else if (c.energy >= 4) delta += 2;
      if (c.stress >= 4) delta -= 3;
      return Math.min(maxAbs, Math.max(-maxAbs, delta));
    }

    it('is behaviourally identical to the pre-refactor implementation', () => {
      for (let sleep = 1; sleep <= 5; sleep++)
        for (let stress = 1; stress <= 5; stress++)
          for (let energy = 1; energy <= 5; energy++)
            for (const soreness of [undefined, 1, 2, 3, 4, 5]) {
              const c = { sleep, stress, energy, soreness };
              assert.equal(
                checkInReadinessDelta(c),
                legacyDelta(c),
                `diverged at ${JSON.stringify(c)}`
              );
            }
    });

    it('reasons account for exactly the delta, so the explanation cannot lie', () => {
      const c = { sleep: 2, stress: 4, energy: 2, soreness: 4 };
      const summed = checkInReasons(c).reduce((s, r) => s + r.points, 0);
      // Pre-clamp sum; the delta clamps at ±15 and this case is -19.
      assert.equal(summed, -19);
      assert.equal(checkInReadinessDelta(c), -15, 'clamped, but the reasons still total -19');
    });

    it('reports what the athlete actually entered, for the sentence', () => {
      const [worst] = checkInReasons({ sleep: 1, stress: 3, energy: 3, soreness: 3 });
      assert.equal(worst.factor, 'sleep');
      assert.equal(worst.rating, 1, 'so the UI can say "you rated sleep 1/5"');
      assert.equal(worst.points, -6);
    });

    it('orders by strength of effect, not by field order', () => {
      // stress -3 fires, sleep -6 fires: sleep must lead.
      const reasons = checkInReasons({ sleep: 2, stress: 5, energy: 3 });
      assert.deepEqual(reasons.map((r) => r.factor), ['sleep', 'stress']);
    });

    it('a middling day has no story rather than an invented one', () => {
      assert.deepEqual(checkInReasons({ sleep: 3, stress: 3, energy: 3, soreness: 3 }), []);
      assert.deepEqual(checkInReasons(null), []);
    });

    it('omitted soreness contributes nothing in either direction', () => {
      const reasons = checkInReasons({ sleep: 3, stress: 3, energy: 3 });
      assert.equal(reasons.some((r) => r.factor === 'soreness'), false);
    });
  });
});
