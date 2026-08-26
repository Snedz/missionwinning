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
 * `.993` — tap the open lift for prior sessions of that movement. Never a login wall.
 * `.994` — open set row honors type (weight / BW / duration / assisted). Never a login wall.
 * `.995` — per-exercise rest (warmup vs work) on the open lift. Never a login wall.
 * `.996` — their exercise note + pinned reminder on the open lift. Never a login wall.
 * `.997` — edit a finished session from History. Never a login wall.
 * `.998` — drag the lifts in the live session. Never a login wall.
 * `.999` — quiet diary PR on the live set. Never a login wall.
 * `.1000` — log a past session from History. Never a login wall.
 * `.1001` — pause the live session clock. Never a login wall.
 * `.1002` — merge duplicate exercises from History / library. Never a login wall.
 * `.1003` — delete one finished session from History. Never a login wall.
 * `.1004` — hide this exercise from the library. Never a login wall.
 * `.1005` — start history from this date (fold, don't erase). Never a login wall.
 * `.1006` — restore a deleted History session. Never a login wall.
 * `.1007` — name this finished session. Never a login wall.
 * `.1008` — search the History list. Never a login wall.
 * `.1009` — live next cite is BW, not 0 kg. Never a login wall.
 * `.1010` — library spark/count skip deleted sessions. Never a login wall.
 * `.1011` — export this diary from History. Never a login wall.
 * `.1012` — this-movement title is the date or the name. Never a login wall.
 * `.1013` — import the diary file they saved. Never a login wall.
 * `.1014` — live next cite is 0:45, not mute. Never a login wall.
 * `.1015` — assisted 0 cite is BW, not 0 kg. Never a login wall.
 * `.1016` — this session as a local file they own. Never a login wall.
 * `.1017` — live Last/Prev empty load is BW, not 0. Never a login wall.
 * `.1018` — the History month they own. Never a login wall.
 * `.1019` — never-trained anatomy is idle, not overdue. Never a login wall.
 * `.1020` — library spark empty load is reps, not a flat zero. Never a login wall.
 * `.1021` — Coach chat empty load is BW, not 0 × 8. Never a login wall.
 * `.1022` — heatmap empty-load volume is reps, not a 0 kg floor. Never a login wall.
 * `.1023` — Coach citation empty load is BW, not 0kg. Never a login wall.
 * `.1024` — History empty-load volume is reps, not 0 kg. Never a login wall.
 * `.1025` — completed set-table empty load is BW, not 0. Never a login wall.
 * `.1026` — Repeat this session from History into the live Start. Never a login wall.
 * `.1027` — Move this session to another day from History. Never a login wall.
 * `.1028` — log onto this empty day from the History month. Never a login wall.
 * `.1029` — this month as a local file they own. Never a login wall.
 * `.1030` — copy this session onto another day from History. Never a login wall.
 * `.1031` — This month on the History calendar. Never a login wall.
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
