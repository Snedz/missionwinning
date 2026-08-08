import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { adaptPlan } from '@/lib/coach/adapt';
import {
  hasCoachAdaptationSignal,
  summarizeCoachAdaptations,
} from '@/lib/coach/adaptSummary';
import type { CoachPlan, PlanSession } from '@/lib/coach/types';

/**
 * A missed day is narrated, not deleted.
 *
 * `adaptPlan`'s normal branch — missed days exist *and* future days remain —
 * ended `sessions = [...doneSessions, ...reassigned]`, dropping every missed
 * session. The stated reason was to stop the week strip "painting Missed on
 * days the plan left", but **nothing left those days**: the branch above
 * re-opens the *missed* sessions and therefore must dedupe against
 * `placedIds`; this branch re-spreads `remaining` and never touches `missed`.
 * There was no duplicate to avoid, so the filter deleted the only record that
 * a day had been missed.
 *
 * Everything downstream reads that record. `summarizeCoachAdaptations` filters
 * `status === 'missed'`, so it produced no beat; `hasCoachAdaptationSignal`
 * went false; `CoachAdaptBanner` returned `null` — in the file whose header
 * calls it *"demo-critical: partners must see log/miss → week changed in
 * ≤60s"* — and the re-entry block never rendered. The athlete missed Monday
 * and the week silently shrank.
 *
 * The beat's own copy is the proof of intent: *"Life happened — missed {days}.
 * Remaining days are re-spread so the week still fits."* It describes this
 * branch precisely, and this branch was the one case that could never show it.
 *
 * 2183 tests were green over it, because every existing case exercised the
 * *cold-start* branch or asserted on the sessions that survived.
 */

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/** Monday-anchored week; dates derived, never literals — a fixture with a date has an expiry. */
function weekFrom(daysAgo: number): { weekStart: string; today: string } {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysAgo);
  return { weekStart: monday.toISOString().slice(0, 10), today: now.toISOString().slice(0, 10) };
}

function session(dayOffset: number, kind: PlanSession['kind'] = 'strength'): PlanSession {
  return {
    id: `s${dayOffset}`,
    dayOffset,
    kind,
    name: `Day ${dayOffset}`,
    focusGroups: [],
    exercises: [{ exerciseId: 'bench-press', sets: 3, reps: 8, weight: 60 }],
    estMinutes: 40,
    status: 'planned',
  } as unknown as PlanSession;
}

function plan(sessions: PlanSession[], weekStart: string): CoachPlan {
  return {
    revision: 1,
    weekStart,
    daysPerWeek: sessions.length,
    sessions,
    generatedAt: new Date().toISOString(),
    contextHash: 'h',
    equipmentProfile: 'minimal',
  } as unknown as CoachPlan;
}

/**
 * Readiness mid-range and no logged history: nothing here should trigger the
 * low-readiness swap or the external-workout marking, so the only thing under
 * test is the missed/re-spread path itself.
 */
const ctx = {
  experience: 'intermediate',
  equipment: 'minimal',
  goalId: 'strength',
  daysPerWeek: 3,
  preferredDays: [0, 2, 4],
  history: [],
  readiness: {},
  bodyScores: { readiness: 70, strain: 40, recovery: 70 },
  units: 'metric',
  assessmentRisk: 'low',
  seedId: 'test-seed',
} as never;

describe('a missed day survives adaptation', () => {
  /**
   * Three days out, so day 0 is in the past (missed) while days 4 and 5 are
   * still ahead — the branch that has both `missed` and `remaining`, i.e. the
   * ordinary mid-week case, not the cold-start collapse.
   */
  function midWeekMiss() {
    const { weekStart, today } = weekFrom(3);
    return adaptPlan(plan([session(0), session(4), session(5)], weekStart), ctx, today);
  }

  it('keeps the missed session in the week', () => {
    const missed = midWeekMiss().sessions.filter((s) => s.status === 'missed');
    assert.equal(
      missed.length,
      1,
      'the missed day was dropped from the plan — every downstream beat reads `status === "missed"`'
    );
    assert.equal(missed[0]!.dayOffset, 0);
  });

  it('still re-spreads the days that are left', () => {
    // Keeping the record must not cost the actual adaptation.
    const out = midWeekMiss().sessions;
    const planned = out.filter((s) => s.status === 'planned');
    assert.ok(planned.length > 0, 'the remaining days must still be re-spread forward');
    assert.ok(
      planned.every((s) => s.dayOffset >= 3),
      're-spread sessions must land on days that are still ahead'
    );
  });

  it('produces the "Life happened" beat the copy was written for', () => {
    const beats = summarizeCoachAdaptations(midWeekMiss());
    const missedBeat = beats.find((b) => b.key === 'coachAdaptMissedNote');
    assert.ok(missedBeat, 'no missed beat — the banner renders nothing and the week shrinks silently');
    assert.equal(missedBeat.count, 1);
    assert.match(
      missedBeat.defaultMessage,
      /re-spread/,
      'the beat describes exactly this branch; if it cannot fire here it fires nowhere useful'
    );
  });

  it('raises the adaptation signal the banner gates on', () => {
    assert.equal(
      hasCoachAdaptationSignal(midWeekMiss()),
      true,
      'CoachAdaptBanner returns null without this, taking the re-entry block with it'
    );
  });

  it('does not duplicate a session across two days', () => {
    // The cold-start branch dedupes via `placedIds` because it re-opens the
    // missed sessions themselves. This branch must not need that — and must not
    // silently start producing duplicates if it ever does.
    const out = midWeekMiss().sessions;
    const ids = out.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length, `a session appears twice in the week: ${ids.join(', ')}`);
  });
});

describe('the cold-start branch still refuses a wall of shame', () => {
  /**
   * `.the late-week collapse` case: every planned day is in the past. Those get
   * re-opened onto the days that are left rather than reported as misses — the
   * behaviour the comment at the top of that branch exists to protect, and the
   * one this change must not disturb.
   */
  function coldStart() {
    const { weekStart, today } = weekFrom(4);
    return adaptPlan(plan([session(0), session(1)], weekStart), ctx, today);
  }

  it('re-opens past days instead of marking them all missed', () => {
    assert.ok(
      coldStart().sessions.some((s) => s.status === 'planned'),
      'a brand-new athlete starting late must get forward sessions, not a wall of "missed"'
    );
  });

  /**
   * The `placedIds` dedupe is what makes that branch safe: it re-opens the
   * *missed* sessions themselves, so without the filter the same session is
   * both "missed" on its old day and "planned" on its new one.
   *
   * This assertion exists because the first version of the test above could not
   * fail from deleting the filter — it only checked that *something* was
   * planned, which stays true while duplicates pile up. Caught by mutating the
   * filter away and watching the suite stay green.
   */
  it('never lists the same session twice while re-opening it', () => {
    /*
     * A **done** session is the precondition, not decoration: the dedupe lives
     * in the `doneSessions.length > 0` arm of the ternary, and a cold-start
     * fixture with nothing logged takes the `: []` arm instead — so the filter
     * is unreachable and mutating it away changes nothing.
     *
     * The first two attempts at this test both used an all-missed fixture and
     * both stayed green against exactly that mutant. `CLAUDE.md` §6: assert
     * preconditions, never skip past them.
     */
    const { weekStart, today } = weekFrom(4);
    const sessions = [
      { ...session(0), status: 'done' as const },
      session(1),
      session(2),
    ];
    const out = adaptPlan(plan(sessions, weekStart), ctx, today);

    assert.ok(
      out.sessions.some((s) => s.status === 'done'),
      'precondition: the fixture must reach the arm that holds the dedupe'
    );
    const ids = out.sessions.map((s) => s.id);
    assert.equal(
      new Set(ids).size,
      ids.length,
      `a re-opened session is still also listed as missed: ${ids.join(', ')}`
    );
  });
});

describe('the week strip does not shout the day you missed', () => {
  it('mutes the missed glyph instead of drawing it in the live accent', () => {
    const src = read('src/components/coach/WeekStrip.tsx');
    assert.match(
      src,
      /missed \? 'text-muted-foreground' : 'text-primary'/,
      'a missed day drew its glyph in the same accent a live day uses, beside the strikethrough ' +
        'that exists to say the opposite'
    );
    assert.match(src, /missed=\{missed\}/, 'the glyph must actually receive the missed state');
  });
});
