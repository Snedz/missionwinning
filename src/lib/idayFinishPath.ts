/**
 * Where I-Day Continue lands. Pure so a unit test can kill the gated-dead-end
 * mutant without mounting Welcome.
 *
 * `.204` / F-004: after public flip, land Today (one Start) — not an auto-started
 * Active session. `.768`: while the gate build is on, `/log` 307s to `/private`
 * for anyone without a cookie, so Continue must land the now-public logger.
 */

export type IdayFinishPath = '/profile' | '/active' | '/log';

export function idayFinishPath(opts: {
  isEdit: boolean;
  hasLoggedWork: boolean;
  gateOn: boolean;
}): IdayFinishPath {
  if (opts.isEdit) return '/profile';
  if (opts.hasLoggedWork) return '/active';
  if (opts.gateOn) return '/active';
  return '/log';
}
