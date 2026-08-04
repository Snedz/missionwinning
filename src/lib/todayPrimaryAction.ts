/**
 * Shared Today primary CTA: resume active, Just Go, or journey startWorkout / href.
 * Used by lean + full dashboard shells.
 */
import type { JourneyAction } from '@/lib/missionJourney';
import type { RecommendedFocus } from '@/lib/score';
import type { ReadinessInfo } from '@/lib/readinessIndex';
import type { MuscleGroup } from '@/lib/muscleGroups';
import type { CompletedWorkoutLog } from '@/types';
import type { UnitsPref } from '@/lib/units';
import { loadCoachTodayOptional } from '@/lib/coach/loadCoachTodayOptional';
import { track } from '@/lib/analytics';
import { scaleExercisesByDose } from '@/lib/reentry';

type StartWorkoutFn = (
  name: string,
  exercises: { exerciseId: string; sets: { reps: number; weight: number }[] }[],
  workoutId?: string
) => void;

/**
 * One definition for “Just Go / train is the primary next” on Today.
 * Lean, full dashboard, and `runTodayPrimaryAction` must agree (.426).
 */
export function isTodayTrainReady(opts: {
  href: string;
  hasStartWorkout: boolean;
  phase: JourneyAction['phase'];
  /** Full-shell primary CTA: also treat basic phase as train-ready. */
  includeBasicJustGo?: boolean;
}): boolean {
  return (
    opts.href === '/active' ||
    opts.hasStartWorkout ||
    opts.phase === 'commissioned' ||
    (!!opts.includeBasicJustGo && opts.phase === 'basic')
  );
}

export type TodayPrimaryActionOpts = {
  hasActiveWorkout: boolean;
  action: JourneyAction;
  recommendedFocus: RecommendedFocus;
  readiness: Record<MuscleGroup, ReadinessInfo>;
  history: CompletedWorkoutLog[];
  units: UnitsPref;
  equipment: string;
  /** When true, treat basic phase train-ready like lean (href /active or startWorkout or basic). */
  includeBasicJustGo?: boolean;
  /**
   * Re-entry dose from `computeReentry` (1 = full). When &lt; 1, Just Go / plan
   * starts with fewer sets so the first session back is finishable.
   */
  doseScale?: number;
  startWorkout: StartWorkoutFn;
  navigate: (href: string) => void;
};

export async function runTodayPrimaryAction(opts: TodayPrimaryActionOpts): Promise<void> {
  const {
    hasActiveWorkout,
    action,
    recommendedFocus,
    readiness,
    history,
    units,
    equipment,
    includeBasicJustGo = false,
    doseScale = 1,
    startWorkout,
    navigate,
  } = opts;

  const applyDose = <T extends { sets: { reps: number; weight: number }[] }>(
    exercises: T[]
  ): T[] => scaleExercisesByDose(exercises, doseScale);

  if (hasActiveWorkout) {
    navigate('/active');
    return;
  }

  const trainReady = isTodayTrainReady({
    href: action.href,
    hasStartWorkout: !!action.startWorkout,
    phase: action.phase,
    includeBasicJustGo,
  });

  if (trainReady) {
    const [{ buildJustGoSession }, coachToday] = await Promise.all([
      import('@/lib/justGoSession'),
      loadCoachTodayOptional(),
    ]);
    const session = buildJustGoSession({
      focus: recommendedFocus,
      readiness,
      history,
      units,
      equipment,
      coachToday,
    });
    if (session.exercises.length > 0) {
      const exercises = applyDose(session.exercises);
      startWorkout(session.name, exercises);
      track('just_go_started', {
        source: session.source,
        focus: session.focusGroup,
        doseScale,
      });
      navigate('/active');
      return;
    }
    if (action.startWorkout) {
      startWorkout(
        action.startWorkout.name,
        applyDose(
          action.startWorkout.exercises.map((e) => ({
            exerciseId: e.exerciseId,
            sets: e.sets,
          }))
        )
      );
      navigate('/active');
      return;
    }
    navigate(action.href);
    return;
  }

  if (action.startWorkout) {
    startWorkout(
      action.startWorkout.name,
      applyDose(
        action.startWorkout.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          sets: e.sets,
        }))
      )
    );
    navigate('/active');
    return;
  }

  navigate(action.href);
}
