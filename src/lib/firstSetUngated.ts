/**
 * F-017 — first set without an account.
 *
 * Header Sign-in chrome is wayfinding, never a logger gate. Cold / first
 * session and mid-set `/active` must not paint it (and must not call getUser
 * to decide). One predicate — do not invent a second flag.
 * `.958` — desk → gym uses the same ungated logger; no Force Sync wall.
 * `.963` — leave Today / week / receipt, come back; same session. No Session Expired.
 * `.967` — optional RPE 1–10 / RIR on a logged set. Never a login wall.
 * `.970` — optional W / D / F on the set (concern `.966`); never a Log set gate.
 * `.964` / `.971` — one or two sessions stay a notebook. Wednesday does not invent tomorrow.
 * `.973` — short written cues on the open live exercise. Never a login wall.
 * `.977` — empty week-strip rest day may log one quiet Fuel / Move / Track row. Never a login wall.
 * `.978` — Quiet Learn intro + cue link. Never a login wall.
 * `.980` — optional exercise group (superset) in the live log. Never a login wall.
 * `.981` — optional % of a known 1-rep max on the set row. Never a login wall.
 * `.983` — optional private session notes on the live session / close receipt (concern `.982`). Never a login wall.
 * `.985` — free warmup batch from the working weight (concern `.984`). Never a login wall.
 * `.986` — drop-tagged set skips rest / zeros a running timer. Never a login wall.
 * `.988` — optional EMOM / AMRAP on the live set row (title `.987`). Never a login wall.
 * `.989` — muted last-vs-this on a week-strip Track day. Never a login wall.
 * `.990` / stamp `.992` — named custom on the live Train picker. Unlimited. Free. Never a login wall.
 * `.991` — Start this again from the close receipt / History. Never a login wall.
 */

export function normalizeAppPath(pathname: string | null | undefined): string {
  const raw = String(pathname ?? '')
    .split(/[?#]/)[0]
    ?.trim() ?? '';
  if (!raw) return '/';
  if (raw.length > 1 && raw.endsWith('/')) return raw.slice(0, -1);
  return raw;
}

export function isActiveLoggerPath(pathname: string | null | undefined): boolean {
  const path = normalizeAppPath(pathname);
  return path === '/active' || path.startsWith('/active/');
}

/**
 * Whether the app-header Sign in chip may mount.
 * False until the first logged workout; false on Train even after.
 */
export function showHeaderSignInChip(params: {
  hasFirstWorkout: boolean;
  pathname: string | null | undefined;
}): boolean {
  if (!params.hasFirstWorkout) return false;
  if (isActiveLoggerPath(params.pathname)) return false;
  return true;
}
