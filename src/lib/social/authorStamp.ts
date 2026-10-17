/**
 * Garage author line. One profile column, one mission-id row.
 *
 * The message payload used to supply the call sign, the two-digit mission
 * number, and the timestamp. The insert policy only checks `user_id`. A
 * signed-in caller could post as any name. The route stamps these, and the
 * BEFORE INSERT trigger stamps them again, because PostgREST is a second door.
 */

export const UNSET_GARAGE_CALL_SIGN = 'Athlete';

/** `profiles.full_name`, clipped to the column check. Empty becomes Athlete. */
export function garageCallSignFromProfile(fullName: string | null | undefined): string {
  const trimmed = (fullName ?? '').trim().slice(0, 24);
  return trimmed.length > 0 ? trimmed : UNSET_GARAGE_CALL_SIGN;
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
