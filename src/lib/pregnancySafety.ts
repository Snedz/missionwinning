/**
 * Pregnancy / miscarriage / postpartum safety — v1.
 *
 * Athlete-owned flag, never inferred, never a logger gate. The flag changes
 * exactly one product behavior: which stop-symptoms line appears on the
 * hard-session warning sheet. See docs/PREGNANCY_SAFETY.md.
 *
 * Counsel reviews copy before production (same hold as PT safety).
 */

import { readRaw, writeRaw, remove } from '@/lib/storage/safeStorage';
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

/** #519 hard-session stop line when the flag is off. */
export const HARD_SESSION_STOP_DEFAULT =
  'Stop if you have chest pain, feel faint, have severe shortness of breath, or cannot talk.';

/** Hard-session stop line when a hold flag is on. */
export const HARD_SESSION_STOP_PREGNANCY =
  'Stop if you have bleeding, cramping, chest pain, feel faint or dizzy, have severe shortness of breath, or cannot talk.';

/**
 * DRAFT / NOT FOR PROD. If asked whether training caused a loss, do not answer;
 * point to a clinician. Not wired into Coach, chat, or any athlete UI in v1.
 */
export const CAUSE_TALK_REFUSAL_DRAFT =
  'I cannot say whether training caused a pregnancy loss. That is a question for a clinician, not this app.';

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

export function hardSessionStopLine(
  flag: PregnancyFlag | string | null | undefined
): string {
  return isPregnancySafetyHold(flag) ? HARD_SESSION_STOP_PREGNANCY : HARD_SESSION_STOP_DEFAULT;
}

export function hardSessionStopKey(
  flag: PregnancyFlag | string | null | undefined
): 'hardSessionStopPregnancy' | 'hardSessionStop' {
  return isPregnancySafetyHold(flag) ? 'hardSessionStopPregnancy' : 'hardSessionStop';
}

export function loadPregnancyFlag(): PregnancyFlag {
  return parsePregnancyFlag(readRaw(STORAGE_KEYS.pregnancyFlag));
}

/** Clearing to `none` deletes the key — silent flag-off, no derived hold left behind. */
export function savePregnancyFlag(flag: PregnancyFlag): void {
  if (flag === 'none') {
    remove(STORAGE_KEYS.pregnancyFlag);
    return;
  }
  writeRaw(STORAGE_KEYS.pregnancyFlag, flag);
}
