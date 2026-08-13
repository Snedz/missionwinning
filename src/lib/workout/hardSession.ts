/**
 * Closed marks for a pre-start hard-session warning.
 *
 * A max-effort session must not be the silent default. This module is the one
 * definition of *when* the warning applies. It does not gate Log set — callers
 * must pass `hasLoggedWork` (or skip the sheet once a set is completed).
 *
 * Field test (#505) may pass `kind: 'field-test'` or start a named session;
 * this file does not implement that session.
 */

export type HardSessionKind = 'pft' | 'pft-mini' | 'field-test';

export type HardSessionInput = {
  kind?: HardSessionKind | null;
  /** Active / program session title — not an exercise name. */
  name?: string | null;
  /** `/active?fieldTest=1` — we do not start the field test here. */
  fieldTestParam?: string | null;
  /** Completed set on the in-progress session → never a logger gate. */
  hasLoggedWork?: boolean;
};

export const HARD_SESSION_KINDS: readonly HardSessionKind[] = [
  'pft',
  'pft-mini',
  'field-test',
];

/** Folded exact titles that exist on master (and field-test names for #505). */
export const EXACT_HARD_SESSION_NAMES: readonly string[] = [
  'peaking - 1rm test',
  'week 3 - session 4 (test)',
  'field test',
  'five-event field test',
];

/**
 * Closed name patterns — session titles only. Not a generic "test" substring
 * (`Tester`, World's Greatest Stretch).
 */
export const HARD_SESSION_NAME_RES: readonly RegExp[] = [
  /\b2[\s-]?miles?\b/i,
  /\b1\s*rm\s*test\b/i,
  /\bmax[\s-]?test\b/i,
  /\bmax[\s-]?effort\b/i,
];

export function foldHardSessionName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[—–]/g, '-')
    .replace(/\s+/g, ' ');
}

export function isHardSessionName(name: string | null | undefined): boolean {
  if (!name || !name.trim()) return false;
  const folded = foldHardSessionName(name);
  if ((EXACT_HARD_SESSION_NAMES as readonly string[]).includes(folded)) return true;
  return HARD_SESSION_NAME_RES.some((re) => re.test(name) || re.test(folded));
}

export function isFieldTestStartParam(param: string | null | undefined): boolean {
  return param === '1';
}

export function needsHardSessionWarning(input: HardSessionInput): boolean {
  if (input.hasLoggedWork) return false;
  if (input.kind && (HARD_SESSION_KINDS as readonly string[]).includes(input.kind)) {
    return true;
  }
  if (isFieldTestStartParam(input.fieldTestParam)) return true;
  return isHardSessionName(input.name);
}
