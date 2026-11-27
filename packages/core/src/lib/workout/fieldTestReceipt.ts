/**
 * Field-test Victory receipt + vs-last (this field test vs the previous one).
 * Not general Victory vs-last (#495).
 */

import type { CompletedWorkoutLog } from '@/types';
import type { UnitsPref } from '@/lib/units';
import {
  extractFieldTestEvents,
  FIELD_TEST_WORKOUT_NAME,
  isFieldTestLog,
  type FieldTestRawEvent,
} from '@/lib/workout/fieldTest';
import {
  fieldTestTotal500,
  scoreFieldTestEvents,
  type FieldTestScaleKey,
  type FieldTestScoredEvent,
} from '@/lib/workout/fieldTestScore';
import type { FieldTestScaleEventId } from '@/data/fieldTestAcftScales';

export type FieldTestVsLastEvent = {
  slot: FieldTestScaleEventId;
  rawDelta?: number;
  pointsDelta?: number;
};

export type FieldTestReceipt = {
  events: FieldTestScoredEvent[];
  previousEvents?: FieldTestScoredEvent[];
  total500?: number;
  previousTotal500?: number;
  vsLast?: {
    events: FieldTestVsLastEvent[];
    totalDelta?: number;
  };
  scaleKey: FieldTestScaleKey | null;
};

function previousFieldTest(
  history: CompletedWorkoutLog[],
  current: CompletedWorkoutLog
): CompletedWorkoutLog | undefined {
  return history
    .filter(
      (log) =>
        log.id !== current.id &&
        isFieldTestLog(log) &&
        log.completedAt < current.completedAt
    )
    .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1))[0];
}

function vsLastFrom(
  events: FieldTestScoredEvent[],
  previous: FieldTestScoredEvent[] | undefined,
  total500: number | undefined,
  previousTotal500: number | undefined
): FieldTestReceipt['vsLast'] {
  if (!previous) return undefined;
  const bySlot = new Map(previous.map((e) => [e.slot, e]));
  return {
    events: events.map((event) => {
      const prior = bySlot.get(event.slot);
      const line: FieldTestVsLastEvent = { slot: event.slot };
      if (event.raw != null && prior?.raw != null) {
        line.rawDelta = event.raw - prior.raw;
      }
      if (event.points != null && prior?.points != null) {
        line.pointsDelta = event.points - prior.points;
      }
      return line;
    }),
    totalDelta:
      total500 != null && previousTotal500 != null
        ? total500 - previousTotal500
        : undefined,
  };
}

function scoreNamed(
  exercises: CompletedWorkoutLog['exercises'],
  named: boolean,
  scaleKey: FieldTestScaleKey | null,
  units: UnitsPref
): FieldTestScoredEvent[] {
  const raw: FieldTestRawEvent[] = extractFieldTestEvents(exercises, {
    namedFieldTest: named,
  });
  return scoreFieldTestEvents(raw, scaleKey, units);
}

export function buildFieldTestReceipt(
  log: CompletedWorkoutLog,
  history: CompletedWorkoutLog[],
  scaleKey: FieldTestScaleKey | null,
  units: UnitsPref
): FieldTestReceipt | undefined {
  if (!isFieldTestLog(log)) return undefined;
  const named = log.workoutName === FIELD_TEST_WORKOUT_NAME;
  const events = scoreNamed(log.exercises, named, scaleKey, units);
  const total500 = fieldTestTotal500(events);
  const prior = previousFieldTest(history, log);
  const previousEvents = prior
    ? scoreNamed(
        prior.exercises,
        prior.workoutName === FIELD_TEST_WORKOUT_NAME,
        scaleKey,
        units
      )
    : undefined;
  const previousTotal500 = previousEvents
    ? fieldTestTotal500(previousEvents)
    : undefined;
  return {
    events,
    previousEvents,
    total500,
    previousTotal500,
    vsLast: vsLastFrom(events, previousEvents, total500, previousTotal500),
    scaleKey,
  };
}

/** Live-rescore a receipt after the athlete picks a published scale column. */
export function rescoreFieldTestReceipt(
  receipt: FieldTestReceipt,
  scaleKey: FieldTestScaleKey | null,
  units: UnitsPref
): FieldTestReceipt {
  const events = scoreFieldTestEvents(receipt.events, scaleKey, units);
  const previousEvents = receipt.previousEvents
    ? scoreFieldTestEvents(receipt.previousEvents, scaleKey, units)
    : undefined;
  const total500 = fieldTestTotal500(events);
  const previousTotal500 = previousEvents
    ? fieldTestTotal500(previousEvents)
    : undefined;
  return {
    events,
    previousEvents,
    total500,
    previousTotal500,
    vsLast: vsLastFrom(events, previousEvents, total500, previousTotal500),
    scaleKey,
  };
}

export function formatFieldTestClock(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
