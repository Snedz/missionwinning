/**
 * Client-minted identity for anything that syncs.
 *
 * Same guarded shape as `getOrCreateDeviceId` in `src/lib/coach/storage.ts`:
 * `crypto.randomUUID` is unavailable on older Safari and in some SSR contexts, so
 * fall back to a collision-resistant string rather than throwing at the one moment
 * a user has just finished a workout.
 */
export function newClientId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  const rand = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
  // UUID-shaped so the column type and any server-side validation still accept it.
  return `${rand()}${rand()}-${rand()}-4${rand().slice(1)}-8${rand().slice(1)}-${rand()}${rand()}${rand()}`;
}
