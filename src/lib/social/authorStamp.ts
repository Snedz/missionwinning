/**
 * Garage author line. The account chooses it. The payload does not.
 *
 * `profiles.call_sign` is the handle other people see. With none set, a post
 * says `Mission` plus the two-digit mission id. `profiles.full_name` is copied
 * only when `garage_name_mode` is `real_name` and that name is not a handle:
 * after trim, NFKC, collapsed whitespace, and zero-width stripping, it must
 * not match any call sign (case-insensitive) and must not start with "mission".
 * The route stamps this, and the BEFORE INSERT trigger stamps it again,
 * because PostgREST is a second door.
 */

export type GarageNameMode = 'call_sign' | 'real_name';

export type GarageAuthorStamp = {
  label: string;
  /** True only when the published line is an opted-in real name. */
  realName: boolean;
};

/** Device fallback in `callSign.ts`. Syncing it would claim a unique handle. */
export const DEVICE_DEFAULT_CALL_SIGN = 'Athlete';

const CALL_SIGN = /^[A-Za-z0-9_-]{3,20}$/;

/**
 * Closed set of format and bidi characters that must not change a comparison.
 * Soft hyphen, Mongolian vowel separator, zero-width space/non-joiner/joiner,
 * LRM/RLM, bidi overrides and isolates, word joiner, BOM.
 */
const ZERO_WIDTH = /[\u00AD\u180E\u200B-\u200F\u202A-\u202E\u2060\u2066-\u2069\uFEFF]/g;

/** Owner-set handle: 3–20 characters, letters, numbers, hyphen, underscore. */
export function isGarageCallSign(value: string | null | undefined): boolean {
  return typeof value === 'string' && CALL_SIGN.test(value);
}

/** Comparison key shared with `garage_compare_key` in the stamp migration. */
export function garageCompareKey(value: string | null | undefined): string {
  const stripped = (value ?? '').replace(ZERO_WIDTH, '').normalize('NFKC').replace(ZERO_WIDTH, '');
  return stripped.trim().replace(/\s+/gu, ' ').toLowerCase();
}

/** What a real-name post may show. Not a comparison key: case and spaces stay. */
export function garageDisplayName(value: string | null | undefined): string {
  const stripped = (value ?? '').replace(ZERO_WIDTH, '').normalize('NFKC').replace(ZERO_WIDTH, '');
  return stripped.trim().replace(/\s+/gu, ' ').slice(0, 24);
}

/**
 * Stored form of a call sign. Lowercase, so `lower(call_sign)` uniqueness
 * matches the value that was written. Spaces and other characters fail.
 */
export function normalizeCallSign(raw: string | null | undefined): string | null {
  const key = garageCompareKey(raw);
  return isGarageCallSign(key) ? key : null;
}

/**
 * A device operator name may contain spaces. Only a value that already
 * satisfies the column check is written up, and the unset default is not.
 */
export function callSignToSync(deviceLabel: string | null | undefined): string | null {
  const key = normalizeCallSign(deviceLabel);
  if (!key || key === DEVICE_DEFAULT_CALL_SIGN.toLowerCase()) return null;
  return key;
}

/**
 * A real name must not read as a call sign or as a Mission fallback.
 * `takenCallSigns` is the handle list the name is compared against.
 */
export function realNameIsReserved(
  fullName: string | null | undefined,
  takenCallSigns: readonly string[]
): boolean {
  const key = garageCompareKey(fullName);
  if (key.length === 0) return false;
  if (key.startsWith('mission')) return true;
  return takenCallSigns.some((sign) => garageCompareKey(sign) === key);
}

/**
 * `mission_ids.mission_id` as `00`–`99`. The column check is two digits.
 * Anything outside that range is stored as null rather than a truncated id.
 */
export function garageMissionLabel(missionId: number | null | undefined): string | null {
  if (typeof missionId !== 'number' || !Number.isInteger(missionId)) return null;
  if (missionId < 0 || missionId > 99) return null;
  return String(missionId).padStart(2, '0');
}

/** Visible fallback when the owner has no call sign. `Mission 07`, or `Mission`. */
export function garageMissionFallback(missionId: number | null | undefined): string {
  if (typeof missionId !== 'number' || !Number.isInteger(missionId) || missionId < 0) {
    return 'Mission';
  }
  if (missionId <= 99) return `Mission ${String(missionId).padStart(2, '0')}`;
  const wide = `Mission ${missionId}`;
  return wide.length <= 24 ? wide : 'Mission';
}

/**
 * What a post may show. A reserved or blocked real name falls back to the
 * call sign, then `Mission NN`. `reserved` is the database answer; the
 * local checks still run so a missed lookup cannot publish a handle.
 */
export function garageAuthorStamp(input: {
  callSign?: string | null;
  mode?: string | null;
  fullName?: string | null;
  missionId?: number | null;
  takenCallSigns?: readonly string[];
  reserved?: boolean;
}): GarageAuthorStamp {
  const handle = normalizeCallSign(input.callSign);
  const blocked =
    input.reserved === true || realNameIsReserved(input.fullName, input.takenCallSigns ?? []);
  if (input.mode === 'real_name' && !blocked) {
    const name = garageDisplayName(input.fullName);
    if (name.length > 0) return { label: name, realName: true };
  }
  if (handle) return { label: handle, realName: false };
  return { label: garageMissionFallback(input.missionId), realName: false };
}

/** Label only. Prefer `garageAuthorStamp` when the name badge matters. */
export function garageAuthorLabel(input: {
  callSign?: string | null;
  mode?: string | null;
  fullName?: string | null;
  missionId?: number | null;
  takenCallSigns?: readonly string[];
  reserved?: boolean;
}): string {
  return garageAuthorStamp(input).label;
}
