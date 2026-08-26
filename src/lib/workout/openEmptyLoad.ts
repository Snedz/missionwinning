/**
 * Open set-row empty load is blank, not 0 (.1048).
 *
 * Store stays `weight: 0`. Display only. Never write BW / a bodyweight
 * kilogram into the store. Completed kg cell BW stays `.1025`.
 */

/** Open load cell. 0 / missing / non-finite → blank. Typed load stays the number. */
export function formatOpenLoadInput(weight: unknown): string {
  if (typeof weight !== 'number' || !Number.isFinite(weight) || weight === 0) {
    return '';
  }
  return String(weight);
}

/** Blank / junk → 0 so the store stays 0. Typed finite load stays that number. */
export function parseOpenLoadInput(raw: unknown): number {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? raw : 0;
  }
  if (typeof raw !== 'string') return 0;
  const text = raw.trim().replace(',', '.');
  if (!text) return 0;
  const n = Number.parseFloat(text);
  return Number.isFinite(n) ? n : 0;
}
