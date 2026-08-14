/**
 * PAR-Q is intake before a coach plan — not a toolkit you go do.
 *
 * Persist the screen on device. Never write it as a Fuel row. Never gate
 * Log set / Today / I-Day. `hasParqScreen` is what Coach generate asks.
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readJson, writeJson } from '@/lib/storage/safeStorage';
import { localDateKey } from '@/lib/time/localDate';

/** Classic PAR-Q flags already keyed in assessmentsLocales. */
export const PARQ_INTAKE_KEYS = [
  'chest_pain',
  'shortness_breath',
  'fainting',
  'heart',
  'high_bp',
  'bone_joint',
  'hospital',
] as const;

export type ParqIntakeKey = (typeof PARQ_INTAKE_KEYS)[number];

export type ParqRisk = 'low' | 'moderate' | 'high';

export type ParqSnapshot = {
  risk: ParqRisk;
  notes: string;
  date: string;
};

export function hasParqScreen(): boolean {
  return readJson<ParqSnapshot | null>(STORAGE_KEYS.lastAssessment, null) !== null;
}

export function scoreParqAnswers(answers: Record<string, string>): {
  risk: ParqRisk;
  yesCount: number;
} {
  const yesCount = PARQ_INTAKE_KEYS.filter((k) =>
    (answers[k] ?? '').toLowerCase().includes('yes')
  ).length;
  const risk: ParqRisk = yesCount >= 3 ? 'high' : yesCount >= 1 ? 'moderate' : 'low';
  return { risk, yesCount };
}

export function persistParqScreen(input: {
  risk: ParqRisk;
  notes: string;
  date?: string;
}): ParqSnapshot {
  const snap: ParqSnapshot = {
    risk: input.risk,
    notes: input.notes,
    date: input.date ?? localDateKey(),
  };
  writeJson(STORAGE_KEYS.lastAssessment, snap);
  return snap;
}
