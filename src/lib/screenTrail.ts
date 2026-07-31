/**
 * Where they actually were when it broke.
 *
 * `.215` — the feedback sheet lives on Profile, so the route it is opened from
 * is always `/profile`. Attaching that and calling it context would be worse
 * than attaching nothing: it looks like a fact and answers nothing. *"The timer
 * jumped"* tagged `/profile` is a note you cannot act on; the same sentence
 * carrying `came from /active` is a bug report.
 *
 * So the shell records a short trail of visited routes and the sheet reports
 * both — the screen it was opened from **and** the one before it. Both, not one
 * chosen by a heuristic: the athlete may equally be reporting something about
 * Profile itself, and guessing which would silently discard the right answer
 * half the time.
 *
 * Session-scoped on purpose. This is a debugging breadcrumb, not a history: it
 * dies with the tab, is never synced, and holds at most four routes.
 */

export const SCREEN_TRAIL_KEY = 'mw_screen_trail';

/** Enough to answer "and before that?" once; short enough to stay a breadcrumb. */
export const TRAIL_MAX = 4;

/**
 * Append a route, collapsing repeats.
 *
 * Pure, so the interesting cases — a re-render of the same route, a trail at the
 * cap — are assertable without a browser. Next re-runs layout effects on
 * navigation *and* on some re-renders; without the collapse, standing on one
 * screen would flush the previous route out of the trail and the sheet would
 * report `/profile` came from `/profile`.
 */
export function pushScreen(trail: readonly string[], route: string): string[] {
  if (trail[trail.length - 1] === route) return [...trail];
  return [...trail, route].slice(-TRAIL_MAX);
}

/**
 * The most recent route that is not the one the sheet was opened from.
 *
 * Returns null rather than a fallback when there is no such route — a first
 * visit that starts on Profile genuinely has no previous screen, and inventing
 * one would put a wrong route on a real bug report.
 */
export function previousScreen(trail: readonly string[], current: string): string | null {
  for (let i = trail.length - 1; i >= 0; i--) {
    if (trail[i] !== current) return trail[i];
  }
  return null;
}

function session(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage;
  } catch {
    // Safari private mode and locked-down embedded webviews throw on access.
    return null;
  }
}

export function readScreenTrail(): string[] {
  const store = session();
  if (!store) return [];
  try {
    const raw = store.getItem(SCREEN_TRAIL_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string').slice(-TRAIL_MAX);
  } catch {
    return [];
  }
}

/**
 * Record a visit. Never throws: a breadcrumb that can break navigation is a
 * worse defect than the one it exists to help diagnose.
 */
export function recordScreen(route: string): void {
  const store = session();
  if (!store) return;
  try {
    store.setItem(SCREEN_TRAIL_KEY, JSON.stringify(pushScreen(readScreenTrail(), route)));
  } catch {
    /* quota, private mode — the trail is optional by design */
  }
}
