/** Pure expiry helpers for crypto payment intents. */

export function isIntentExpired(expiresAtIso: string, nowMs = Date.now()): boolean {
  return new Date(expiresAtIso).getTime() < nowMs;
}
