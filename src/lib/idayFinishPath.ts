/**
 * Where I-Day Begin lands. Pure so a unit test can kill the gated-dead-end
 * mutant without mounting Welcome.
 *
 * Cold Begin opens Train. `/active` writes today's compose session before
 * paint, so the first set is the next screen. Finish does not call
 * startWorkout. Edit stays on Profile. `/active` is gate-public.
 */

export type IdayFinishPath = '/profile' | '/active' | '/log';

export function idayFinishPath(opts: {
  isEdit: boolean;
  hasLoggedWork: boolean;
  gateOn: boolean;
}): IdayFinishPath {
  if (opts.isEdit) return '/profile';
  return '/active';
}
