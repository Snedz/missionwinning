/**
 * How the live store learns that storage was replaced underneath it.
 *
 * `.205` — restoring a backup wrote 300 workouts to disk and the app then
 * destroyed them.
 *
 * `backup.ts` and `importCsvRestore.ts` both write the zustand persist payload
 * straight to `WORKOUT_STORE_KEY` and, by explicit design, "let the caller
 * refresh" — keeping the pure merge separable from anything browser-only. That
 * seam is right. What was wrong is what the callers did with it: both ran
 * `setTimeout(() => router.refresh(), 1200)`.
 *
 * **`router.refresh()` re-fetches Server Components and deliberately preserves
 * client-side React state.** That is its documented purpose. The zustand store
 * is already hydrated, `persist` re-reads storage only on rehydrate, and nothing
 * asked it to rehydrate. So:
 *
 *   1. the toast says *"300 workouts merged… Reloading…"*
 *   2. nothing reloads; History and Today still show the old, empty history
 *   3. the athlete logs one set
 *   4. `persist` serialises its in-memory state over the file
 *   5. **all 300 restored workouts are gone, permanently**
 *
 * A full document reload is the only option that leaves no stale in-memory
 * writer behind. `persist.rehydrate()` would repopulate the store, but every
 * other module that cached a read at mount — history analytics, the Today
 * digest, challenges — would still hold pre-restore values, and the copy has
 * been promising a reload the whole time.
 *
 * This lives in its own module so the rule has a name, one home, and something
 * `restoreReload.test.ts` can point at: *a function that writes storage behind a
 * live store must say how the store learns.*
 */

/** Milliseconds the success toast stays legible before the document reloads. */
export const RESTORE_RELOAD_DELAY_MS = 1200;

/**
 * Reload the document after a restore, once the toast has been read.
 *
 * Guarded for SSR only — there is no non-browser caller, but a module that
 * touches `window` at import time is a module that breaks the route tests.
 */
export function reloadAfterRestore(delayMs: number = RESTORE_RELOAD_DELAY_MS): void {
  if (typeof window === 'undefined') return;
  setTimeout(() => {
    window.location.reload();
  }, delayMs);
}
