/**
 * Accept a program template. Refuse billing fields.
 * Copies known fields only — a premium flag cannot ride along.
 */

import {
  PROGRAM_EQUIPMENT,
  PROGRAM_LEVELS,
  type Program,
  type ProgramEquipment,
  type ProgramExercise,
  type ProgramLevel,
  type ProgramSession,
  type ProgramWeek,
  type SuggestedSet,
} from './types';

/** Closed refuse list. These names are not program fields. */
export const BILLING_KEYS = [
  'isPremium',
  'paymentUrl',
  'price',
  'priceMonthly',
  'priceYearly',
  'currency',
  'subscription',
  'subscriptions',
  'revenueCat',
  'revenueCatUserId',
  'stripe',
  'stripePriceId',
  'license',
  'licenses',
] as const;

const BILLING = new Set<string>(BILLING_KEYS);

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

export function containsBillingKey(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsBillingKey);
  if (!isRecord(value)) return false;
  for (const [key, child] of Object.entries(value)) {
    if (BILLING.has(key)) return true;
    if (containsBillingKey(child)) return true;
  }
  return false;
}

function intIn(v: unknown, min: number, max: number): number | null {
  if (typeof v !== 'number' || !Number.isInteger(v) || v < min || v > max) return null;
  return v;
}

function text(v: unknown, min: number, max: number): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (s.length < min || s.length > max) return null;
  return s;
}

function slugText(v: unknown): string | null {
  const s = text(v, 1, 80);
  if (!s || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) return null;
  return s;
}

function isLevel(v: string): v is ProgramLevel {
  return (PROGRAM_LEVELS as readonly string[]).includes(v);
}

function isEquipment(v: string): v is ProgramEquipment {
  return (PROGRAM_EQUIPMENT as readonly string[]).includes(v);
}

function parseEquipment(v: unknown): ProgramEquipment[] | null {
  if (!Array.isArray(v) || v.length === 0 || v.length > PROGRAM_EQUIPMENT.length) return null;
  const out: ProgramEquipment[] = [];
  for (const item of v) {
    if (typeof item !== 'string' || !isEquipment(item) || out.includes(item)) return null;
    out.push(item);
  }
  return out;
}

function parseSet(v: unknown): SuggestedSet | null {
  if (!isRecord(v)) return null;
  const setIndex = intIn(v.setIndex, 1, 30);
  if (setIndex == null) return null;
  const reps = v.reps === undefined ? undefined : intIn(v.reps, 1, 100);
  if (v.reps !== undefined && reps == null) return null;
  const seconds = v.seconds === undefined ? undefined : intIn(v.seconds, 1, 3600);
  if (v.seconds !== undefined && seconds == null) return null;
  if (reps == null && seconds == null) return null;
  let weightKg: number | undefined;
  if (v.weightKg !== undefined) {
    if (typeof v.weightKg !== 'number' || !Number.isFinite(v.weightKg) || v.weightKg < 0 || v.weightKg > 500) {
      return null;
    }
    weightKg = v.weightKg;
  }
  return {
    setIndex,
    ...(reps != null ? { reps } : {}),
    ...(seconds != null ? { seconds } : {}),
    ...(weightKg != null ? { weightKg } : {}),
  };
}

function parseExercise(v: unknown): ProgramExercise | null {
  if (!isRecord(v)) return null;
  const order = intIn(v.order, 1, 20);
  const exerciseId = slugText(v.exerciseId);
  if (order == null || !exerciseId) return null;
  if (!Array.isArray(v.suggestedSets) || v.suggestedSets.length === 0 || v.suggestedSets.length > 30) {
    return null;
  }
  const suggestedSets: SuggestedSet[] = [];
  for (const row of v.suggestedSets) {
    const set = parseSet(row);
    if (!set || suggestedSets.some((s) => s.setIndex === set.setIndex)) return null;
    suggestedSets.push(set);
  }
  const note = v.note === undefined ? undefined : text(v.note, 1, 200);
  if (v.note !== undefined && note == null) return null;
  return { order, exerciseId, ...(note ? { note } : {}), suggestedSets };
}

function parseSession(v: unknown, sessionNumber: number): ProgramSession | null {
  if (!isRecord(v)) return null;
  const id = slugText(v.id);
  const title = text(v.title, 1, 80);
  const number = intIn(v.sessionNumber, 1, 7);
  if (!id || !title || number !== sessionNumber) return null;
  if (!Array.isArray(v.exercises) || v.exercises.length === 0 || v.exercises.length > 12) return null;
  const exercises: ProgramExercise[] = [];
  for (const row of v.exercises) {
    const exercise = parseExercise(row);
    if (!exercise || exercises.some((e) => e.order === exercise.order)) return null;
    exercises.push(exercise);
  }
  const estimatedMinutes =
    v.estimatedMinutes === undefined ? undefined : intIn(v.estimatedMinutes, 5, 180);
  if (v.estimatedMinutes !== undefined && estimatedMinutes == null) return null;
  return {
    id,
    sessionNumber,
    title,
    ...(estimatedMinutes != null ? { estimatedMinutes } : {}),
    exercises,
  };
}

function parseWeek(v: unknown, weekNumber: number, sessionsPerWeek: number): ProgramWeek | null {
  if (!isRecord(v)) return null;
  const title = text(v.title, 1, 80);
  const number = intIn(v.weekNumber, 1, 12);
  if (!title || number !== weekNumber) return null;
  if (!Array.isArray(v.sessions) || v.sessions.length !== sessionsPerWeek) return null;
  const sessions: ProgramSession[] = [];
  for (let i = 0; i < v.sessions.length; i++) {
    const session = parseSession(v.sessions[i], i + 1);
    if (!session || sessions.some((s) => s.id === session.id)) return null;
    sessions.push(session);
  }
  return { weekNumber, title, sessions };
}

/** A program, or null when the shape is wrong or a billing key is present. */
export function parseProgram(value: unknown): Program | null {
  if (containsBillingKey(value) || !isRecord(value)) return null;
  const id = slugText(value.id);
  const slug = slugText(value.slug);
  const title = text(value.title, 1, 80);
  const description = text(value.description, 1, 400);
  const levelRaw = text(value.level, 1, 20);
  const durationWeeks = intIn(value.durationWeeks, 1, 12);
  const sessionsPerWeek = intIn(value.sessionsPerWeek, 1, 7);
  const equipment = parseEquipment(value.equipment);
  if (!id || !slug || !title || !description || !levelRaw || !isLevel(levelRaw)) return null;
  if (durationWeeks == null || sessionsPerWeek == null || !equipment) return null;
  if (!Array.isArray(value.weeks) || value.weeks.length !== durationWeeks) return null;
  const weeks: ProgramWeek[] = [];
  for (let i = 0; i < value.weeks.length; i++) {
    const week = parseWeek(value.weeks[i], i + 1, sessionsPerWeek);
    if (!week) return null;
    weeks.push(week);
  }
  return {
    id,
    slug,
    title,
    description,
    level: levelRaw,
    durationWeeks,
    sessionsPerWeek,
    equipment,
    weeks,
  };
}
