/**
 * Today → CoachConcept chip. Source-guard locks desk wiring (.1071).
 * Mirror Victory cite discipline: plan truth only, no Feed, no invented loads.
 */
import { describe, it, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { CoachPlan, PlanSession } from '@/lib/coach/types';
import {
  formatTodayConceptChip,
  resolveTodayConceptId,
  TODAY_CONCEPT_CHIP_DEFAULT,
  todayConceptChip,
} from '@/lib/today/todayConceptChip';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

function session(
  partial: Partial<PlanSession> & Pick<PlanSession, 'id' | 'dayOffset'>
): PlanSession {
  return {
    kind: 'strength',
    name: 'Session',
    focusGroups: ['Chest'],
    exercises: [
      { exerciseId: 'bench-press', sets: 3, reps: 8, weight: 60, whyKey: 'coachWhyHold' },
    ],
    estMinutes: 45,
    status: 'planned',
    ...partial,
  };
}

function plan(sessions: PlanSession[], extra: Partial<CoachPlan> = {}): CoachPlan {
  return {
    weekStart: '2026-07-06',
    revision: 1,
    generatedAt: '2026-07-06T00:00:00.000Z',
    equipmentProfile: 'full-gym',
    daysPerWeek: sessions.length || 3,
    contextHash: 'today-concept-chip-test',
    sessions,
    ...extra,
  };
}

describe('resolveTodayConceptId', () => {
  it('null when there is no plan', () => {
    assert.equal(resolveTodayConceptId(null), null);
    assert.equal(resolveTodayConceptId(undefined), null);
  });

  it('null when the week is complete — no open session', () => {
    assert.equal(
      resolveTodayConceptId(
        plan([
          session({ id: 'a', dayOffset: 0, status: 'done' }),
          session({ id: 'b', dayOffset: 2, status: 'missed' }),
        ])
      ),
      null
    );
  });

  it('prefers plan.nextConceptId when a next open session exists', () => {
    assert.equal(
      resolveTodayConceptId(
        plan(
          [
            session({ id: 'a', dayOffset: 0, status: 'done' }),
            session({
              id: 'b',
              dayOffset: 2,
              focusGroups: ['Chest'],
              conceptId: 'strength-push',
            }),
          ],
          { nextConceptId: 'strength-legs' }
        )
      ),
      'strength-legs'
    );
  });

  it('ignores a stale nextConceptId when no session is open', () => {
    assert.equal(
      resolveTodayConceptId(
        plan([session({ id: 'a', dayOffset: 0, status: 'done' })], {
          nextConceptId: 'strength-legs',
        })
      ),
      null
    );
  });

  it('uses the next session conceptId when the plan id is missing', () => {
    assert.equal(
      resolveTodayConceptId(
        plan([
          session({
            id: 'b',
            dayOffset: 2,
            kind: 'recovery',
            focusGroups: [],
            conceptId: 'recovery',
          }),
        ])
      ),
      'recovery'
    );
  });

  it('derives Push/Pull/Legs from the next open session', () => {
    assert.equal(
      resolveTodayConceptId(
        plan([session({ id: 'p', dayOffset: 0, focusGroups: ['Chest', 'Shoulders'] })])
      ),
      'strength-push'
    );
    assert.equal(
      resolveTodayConceptId(
        plan([
          session({
            id: 'u',
            dayOffset: 1,
            focusGroups: ['Back'],
            name: 'Pull A',
          }),
        ])
      ),
      'strength-pull'
    );
    assert.equal(
      resolveTodayConceptId(
        plan([session({ id: 'l', dayOffset: 2, focusGroups: ['Legs'] })])
      ),
      'strength-legs'
    );
  });

  it('rejects an unknown nextConceptId and derives instead', () => {
    const p = plan([session({ id: 'l', dayOffset: 0, focusGroups: ['Legs'] })], {
      nextConceptId: 'not-a-concept' as CoachPlan['nextConceptId'],
    });
    assert.equal(resolveTodayConceptId(p), 'strength-legs');
  });
});

describe('formatTodayConceptChip', () => {
  it('formats concept-first glance copy', () => {
    assert.equal(
      formatTodayConceptChip('strength-legs'),
      'Today: Legs · from last log'
    );
    assert.equal(formatTodayConceptChip('strength-push'), 'Today: Push · from last log');
    assert.equal(formatTodayConceptChip('recovery'), 'Today: Recovery · from last log');
    assert.equal(TODAY_CONCEPT_CHIP_DEFAULT, 'Today: {{concept}} · from last log');
  });
});

describe('todayConceptChip', () => {
  it('returns null for freestyle — empty sessions invent nothing', () => {
    assert.equal(todayConceptChip(plan([])), null);
  });

  it('returns label + text when the next concept is known', () => {
    const chip = todayConceptChip(
      plan([session({ id: 'l', dayOffset: 0, focusGroups: ['Legs'] })], {
        nextConceptId: 'strength-legs',
      })
    );
    assert.deepEqual(chip, {
      conceptId: 'strength-legs',
      label: 'Legs',
      text: 'Today: Legs · from last log',
    });
  });
});

test('TodayDesk paints one house-state chip from the helper before Start', () => {
  const desk = read('src/page-components/TodayDesk.tsx');
  assert.match(desk, /todayConceptChip/);
  assert.match(desk, /data-testid="today-concept-chip"/);
  assert.match(desk, /house-state/);
  assert.match(desk, /todayConceptChip/);
  const chip = desk.indexOf('data-testid="today-concept-chip"');
  const start = desk.indexOf('data-testid="today-start-cta"');
  assert.ok(chip >= 0 && start > chip, 'chip glances before Start');
  // Still the house desk — one Start, no remake.
  assert.match(desk, /data-house-desk="today"/);
  assert.match(desk, /id="today-start"/);
  assert.match(desk, /HouseFirstRoomsCard/);
  assert.match(desk, /id="today-week"/);
  assert.doesNotMatch(desk, /ChatWindow|victory-feed|VictoryFeed|Discord/i);
});

test('Helper stays on CoachConcept spine — no Feed, no invented loads', () => {
  const helper = read('src/lib/today/todayConceptChip.ts');
  assert.match(helper, /nextOpenPlanSession/);
  assert.match(helper, /nextConceptId/);
  assert.match(helper, /deriveCoachConceptFromSession/);
  assert.match(helper, /isCoachConceptId/);
  assert.doesNotMatch(helper, /\bRSI\b|recursive self|invented load/i);
  assert.doesNotMatch(helper, /ChatWindow|social\//);
});
