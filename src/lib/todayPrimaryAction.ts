/**
 * Shared Today primary CTA: resume, live Coach, Repeat last session, Just Go, or journey.
 * Used by lean + full dashboard shells.
 */
import type { JourneyAction } from '@/lib/missionJourney';
import type { RecommendedFocus } from '@/lib/score';
import type { ReadinessInfo } from '@/lib/readinessIndex';
import type { MuscleGroup } from '@/lib/muscleGroups';
import type { CompletedWorkoutLog, SavedWorkout } from '@/types';
import type { UnitsPref } from '@/lib/units';
import { loadCoachTodayOptional } from '@/lib/coach/loadCoachTodayOptional';
import { track } from '@/lib/analytics';
import { scaleExercisesByDose } from '@/lib/reentry';
import { shouldRepeatLastOnToday } from '@/lib/workout/repeatLastSession';
import { pickHonoredStart } from '@/lib/workout/honorSavedRoutine';
import type { HomeGymKit } from '@/lib/workout/homeGymKit';

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
  /** Lean dock: cold I-Day is still Start, not Welcome. */
  includeColdStart?: boolean;
}): boolean {
  return (
    opts.href === '/active' ||
    opts.hasStartWorkout ||
    opts.phase === 'commissioned' ||
    (!!opts.includeBasicJustGo && opts.phase === 'basic') ||
    !!opts.includeColdStart
  );
}

export type TodayPrimaryActionOpts = {
  hasActiveWorkout: boolean;
  action: JourneyAction;
  recommendedFocus: RecommendedFocus;
  readiness: Record<MuscleGroup, ReadinessInfo>;
  history: CompletedWorkoutLog[];
  /** Saved notebook — Start honors it before Just Go / Coach peek (`.960`). */
  savedWorkouts?: SavedWorkout[];
  units: UnitsPref;
  equipment: string;
  homeGymKit?: HomeGymKit | null;
  /** When true, treat basic phase train-ready like lean (href /active or startWorkout or basic). */
  includeBasicJustGo?: boolean;
  /** Lean dock: never send the red field to `/welcome`. */
  includeColdStart?: boolean;
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
    savedWorkouts = [],
    units,
    equipment,
    homeGymKit = null,
    includeBasicJustGo = false,
    includeColdStart = false,
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
    includeColdStart,
  });

  if (trainReady) {
    // Dual-writer leak: saved notebook (incl. Builder save-all) beats Coach.
    // Documented in honorSavedRoutine.ts + docs/IA_SKELETON.md §5. Do not
    // reorder unless a test demands a comment. Not a join mechanic.
    const honored = pickHonoredStart({ saved: savedWorkouts, history });
    if (honored) {
      startWorkout(honored.name, applyDose(honored.exercises), honored.id);
      track('history_train_again', {
        exerciseCount: honored.exercises.length,
        from: 'today_saved',
      });
      navigate('/active');
      return;
    }
    const coachToday = await loadCoachTodayOptional();
    const last = shouldRepeatLastOnToday({
      hasLiveCoach: !!(coachToday && coachToday.exercises.length > 0),
      history,
    });
    if (last) {
      startWorkout(last.name, last.exercises);
      track('history_train_again', {
        exerciseCount: last.exercises.length,
        from: 'today',
      });
      navigate('/active');
      return;
    }
    const { buildJustGoSession } = await import('@/lib/justGoSession');
    const session = buildJustGoSession({
      focus: recommendedFocus,
      readiness,
      history,
      units,
      equipment,
      homeGymKit,
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
    navigate(leanSafeHref(action.href, includeColdStart));
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

  navigate(leanSafeHref(action.href, includeColdStart));
}

function leanSafeHref(href: string, includeColdStart: boolean): string {
  if (includeColdStart && href === '/welcome') return '/active';
  return href;
}
