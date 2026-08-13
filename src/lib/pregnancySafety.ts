/**
 * Pregnancy / miscarriage / postpartum safety hold.
 *
 * Athlete-owned, never inferred, never a logger gate. Coach prescriptions and
 * max-effort CTAs read this; Log set must not. See docs/PREGNANCY_SAFETY.md.
 *
 * Counsel reviews copy before production (same hold as PT safety).
 */

import { readRaw, writeRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';

export const PREGNANCY_FLAGS = [
  'none',
  'pregnant',
  'postpartum',
  'miscarriage_recovery',
] as const;

export type PregnancyFlag = (typeof PREGNANCY_FLAGS)[number];

export const HOLD_FLAGS: readonly Exclude<PregnancyFlag, 'none'>[] = [
  'pregnant',
  'postpartum',
  'miscarriage_recovery',
];

/** Athlete-facing why-line when a load jump was available and the hold capped it. */
export const CLINICIAN_HOLD_WHY_KEY = 'coachWhyClinicianHold';

export const CLINICIAN_HOLD_LINE =
  'This is not medical advice; ask your clinician.';

export type LoadPrescription = {
  sets: number;
  reps: number;
  weight: number;
  whyKey: string;
  loadPct?: number;
};

const EPSILON = 1e-6;

/** Folded exact titles that exist on master (and field-test names for #505). */
export const EXACT_MAX_EFFORT_SESSION_NAMES: readonly string[] = [
  'peaking - 1rm test',
  'week 3 - session 4 (test)',
  'field test',
  'five-event field test',
];

/**
 * Closed name patterns — session titles only. Not a generic "test" substring
 * (`Tester`, World's Greatest Stretch).
 */
export const MAX_EFFORT_SESSION_NAME_RES: readonly RegExp[] = [
  /\b2[\s-]?miles?\b/i,
  /\b1\s*rm\s*test\b/i,
  /\bmax[\s-]?test\b/i,
  /\bmax[\s-]?effort\b/i,
];

export function parsePregnancyFlag(raw: string | null | undefined): PregnancyFlag {
  if (raw == null || raw === '') return 'none';
  const folded = raw.trim().toLowerCase();
  if ((PREGNANCY_FLAGS as readonly string[]).includes(folded)) {
    return folded as PregnancyFlag;
  }
  return 'none';
}

export function isPregnancySafetyHold(
  flag: PregnancyFlag | string | null | undefined
): boolean {
  const parsed = parsePregnancyFlag(flag ?? undefined);
  return parsed !== 'none';
}

export function shouldHideMaxEffortCtas(
  flag: PregnancyFlag | string | null | undefined
): boolean {
  return isPregnancySafetyHold(flag);
}

export function foldMaxEffortSessionName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[—–]/g, '-')
    .replace(/\s+/g, ' ');
}

export function isMaxEffortSessionName(name: string | null | undefined): boolean {
  if (!name || !name.trim()) return false;
  const folded = foldMaxEffortSessionName(name);
  if ((EXACT_MAX_EFFORT_SESSION_NAMES as readonly string[]).includes(folded)) return true;
  return MAX_EFFORT_SESSION_NAME_RES.some((re) => re.test(name) || re.test(folded));
}

export function loadPregnancyFlag(): PregnancyFlag {
  return parsePregnancyFlag(readRaw(STORAGE_KEYS.pregnancyFlag));
}

export function savePregnancyFlag(flag: PregnancyFlag): void {
  writeRaw(STORAGE_KEYS.pregnancyFlag, flag);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('mw-coach-plan-changed'));
  }
}

function isLoadJump(proposed: LoadPrescription, hold: LoadPrescription): boolean {
  if (proposed.weight > hold.weight + EPSILON) return true;
  if (
    proposed.loadPct != null &&
    hold.loadPct != null &&
    proposed.loadPct > hold.loadPct + EPSILON
  ) {
    return true;
  }
  return false;
}

/**
 * Hold a proposed weight / loadPct rise when a pregnancy safety flag is on.
 * Rep progress is not a load jump and passes through. Identity when hold is off
 * or the proposal is not an increase.
 */
export function capProgressionForPregnancyHold(
  holdOn: boolean,
  proposed: LoadPrescription,
  hold: LoadPrescription
): LoadPrescription {
  if (!holdOn) return proposed;
  if (!isLoadJump(proposed, hold)) return proposed;
  const capped: LoadPrescription = {
    sets: proposed.sets,
    reps: proposed.reps,
    weight: hold.weight,
    whyKey: CLINICIAN_HOLD_WHY_KEY,
  };
  if (hold.loadPct != null) capped.loadPct = hold.loadPct;
  return capped;
}
