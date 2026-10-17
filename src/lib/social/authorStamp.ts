/**
 * Garage author line. The account chooses it. The payload does not.
 *
 * `profiles.call_sign` is the handle other people see. With none set, a post
 * says `Mission` plus the two-digit mission id. `profiles.full_name` is copied
 * only when `garage_name_mode` is `real_name`. The route stamps this, and the
 * BEFORE INSERT trigger stamps it again, because PostgREST is a second door.
 */

export type GarageNameMode = 'call_sign' | 'real_name';

/** Device fallback in `callSign.ts`. Syncing it would claim a unique handle. */
export const DEVICE_DEFAULT_CALL_SIGN = 'Athlete';

const CALL_SIGN = /^[A-Za-z0-9_-]{3,20}$/;

/** Owner-set handle: 3–20 characters, letters, numbers, hyphen, underscore. */
export function isGarageCallSign(value: string | null | undefined): boolean {
  return typeof value === 'string' && CALL_SIGN.test(value);
}

/**
 * A device operator name may contain spaces. Only a value that already
 * satisfies the column check is written up, and the unset default is not.
 */
export function callSignToSync(deviceLabel: string | null | undefined): string | null {
  const trimmed = (deviceLabel ?? '').trim();
  if (trimmed.length === 0 || trimmed === DEVICE_DEFAULT_CALL_SIGN) return null;
  return isGarageCallSign(trimmed) ? trimmed : null;
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
 * What a post may show. `fullName` is ignored unless the owner opted in.
 * An empty opt-in falls through to the call sign, then the mission fallback.
 */
export function garageAuthorLabel(input: {
  callSign?: string | null;
  mode?: string | null;
  fullName?: string | null;
  missionId?: number | null;
}): string {
  if (input.mode === 'real_name') {
    const name = (input.fullName ?? '').trim().slice(0, 24);
    if (name.length > 0) return name;
  }
  const sign = (input.callSign ?? '').trim();
  if (isGarageCallSign(sign)) return sign;
  return garageMissionFallback(input.missionId);
}
