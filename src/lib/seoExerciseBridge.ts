/**
 * SEO exercise catalog → free logger bridge (Flow-2).
 *
 * Public `/exercises/[id]` must hand the athlete into Train with that movement
 * already on the session — not dump them on generic Welcome with no memory of
 * which lift they opened from Google.
 *
 * Query contract: `/active?exercise=<id>` (id is catalog exercise id).
 */

import type { WorkoutExerciseTemplate } from '@/types';

/** Query key on `/active` — keep stable; tests and SEO CTAs pin this spelling. */
export const SEO_EXERCISE_QUERY = 'exercise';

/** Path + query for the primary CTA on public exercise detail. */
export function seoExerciseTrainHref(exerciseId: string): string {
  const id = exerciseId.trim();
  if (!id) return '/active';
  return `/active?${SEO_EXERCISE_QUERY}=${encodeURIComponent(id)}`;
}

/** Read a valid-looking exercise id from URLSearchParams or a query string. */
export function parseSeoExerciseParam(
  source: URLSearchParams | string | null | undefined
): string | null {
  if (source == null || source === '') return null;
  const params =
    typeof source === 'string'
      ? new URLSearchParams(source.startsWith('?') ? source.slice(1) : source)
      : source;
  const raw = params.get(SEO_EXERCISE_QUERY)?.trim() ?? '';
  if (!raw) return null;
  // Catalog ids are kebab-case tokens — reject path injection / garbage.
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(raw)) return null;
  if (raw.length > 80) return null;
  return raw.toLowerCase();
}

/**
 * Whether the SEO bridge may call `startWorkout` (must not clobber logged work).
 * Abandoned empty sessions may be replaced — same line as Welcome finish.
 */
export function shouldStartSeoExerciseSession(args: {
  exerciseId: string | null;
  hasLoggedWork: boolean;
}): boolean {
  if (!args.exerciseId) return false;
  if (args.hasLoggedWork) return false;
  return true;
}

/** Whether to add the SEO exercise onto an already-live session that has work. */
export function shouldAddSeoExerciseToActive(args: {
  exerciseId: string | null;
  hasLoggedWork: boolean;
  activeExerciseIds: string[];
}): boolean {
  if (!args.exerciseId) return false;
  if (!args.hasLoggedWork) return false;
  return !args.activeExerciseIds.includes(args.exerciseId);
}

/** Single-lift freestyle template — same shape as Library detail “train this”. */
export function seoExerciseSessionTemplate(
  exerciseId: string,
  exerciseName: string
): { name: string; exercises: WorkoutExerciseTemplate[] } {
  return {
    name: exerciseName,
    exercises: [{ exerciseId, sets: [{ reps: 8, weight: 0 }] }],
  };
}

/** Strip `exercise` from the URL after consume so refresh does not re-fire. */
export function stripSeoExerciseFromSearch(search: string): string {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  params.delete(SEO_EXERCISE_QUERY);
  const q = params.toString();
  return q ? `?${q}` : '';
}
