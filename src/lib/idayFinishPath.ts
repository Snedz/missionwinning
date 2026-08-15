/**
 * Where I-Day Continue lands. Pure so a unit test can kill the gated-dead-end
 * mutant without mounting Welcome.
 *
 * `.204` / F-004: land Today (one Start) — not an auto-started Active session.
 * GNT-1 U1/U5: first-90 Continue must hit `/log`. `/log` is gate-public like
 * `/active` so a cold Continue does not 307 to `/private`.
 */

export type IdayFinishPath = '/profile' | '/active' | '/log';

export function idayFinishPath(opts: {
  isEdit: boolean;
  hasLoggedWork: boolean;
  gateOn: boolean;
}): IdayFinishPath {
  if (opts.isEdit) return '/profile';
  if (opts.hasLoggedWork) return '/active';
  return '/log';
}
