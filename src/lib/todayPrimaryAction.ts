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

type StartWorkoutFn = (
  name: string,
  exercises: { exerciseId: string; sets: { reps: number; weight: number }[] }[],
  workoutId?: string
) => void;

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
    startWorkout,
    navigate,
  } = opts;

  if (hasActiveWorkout) {
    navigate('/active');
    return;
  }

  const trainReady =
    action.href === '/active' ||
    !!action.startWorkout ||
    action.phase === 'commissioned' ||
    (includeBasicJustGo && action.phase === 'basic');

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
      startWorkout(session.name, session.exercises);
      track('just_go_started', { source: session.source, focus: session.focusGroup });
      navigate('/active');
      return;
    }
    if (action.startWorkout) {
      startWorkout(
        action.startWorkout.name,
        action.startWorkout.exercises.map((e) => ({
          exerciseId: e.exerciseId,
          sets: e.sets,
        }))
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
      action.startWorkout.exercises.map((e) => ({
        exerciseId: e.exerciseId,
        sets: e.sets,
      }))
    );
    navigate('/active');
    return;
  }

  navigate(action.href);
}
