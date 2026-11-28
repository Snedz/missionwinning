import { generateWeek } from '@/lib/coach/planEngine';
import type { CoachContext, EquipmentProfile } from '@/lib/coach/types';
import { computeReadiness } from '@/lib/score';
import type { CompletedWorkoutLog } from '@/types';

const weekStart = '2026-06-08';
const workoutTime = '2026-06-08T12:00:00.000Z';
export const previewSets = Array.from({ length: 3 }, () => ({ reps: 10, weight: 20 }));
const history: CompletedWorkoutLog[] = [{
  id: 'landing-example',
  workoutName: 'Lunges',
  startedAt: workoutTime,
  completedAt: workoutTime,
  durationSeconds: 600,
  totalVolume: 600,
  exercises: [{ exerciseId: 'lunges', sets: previewSets }],
}];

export function landingPreviewWeek(equipment: EquipmentProfile, daysPerWeek: number, missedDay?: number) {
  const start = missedDay === undefined ? 2 : missedDay + 1;
  if (start > 6) return [];
  const context: CoachContext = {
    equipment,
    daysPerWeek,
    experience: 'beginner',
    goalId: 'general',
    preferredDays: [],
    history,
    readiness: computeReadiness([]),
    bodyScores: {
      readiness: 70,
      strain: 40,
      recovery: 70,
      readinessLabelKey: 'todayBodyTrainSmart',
      strainLabelKey: 'todayBodyLightWeek',
      recoveryLabelKey: 'todayBodyFullyRecovered',
    },
    units: 'metric',
    seedId: 'landing-preview',
  };
  return generateWeek(context, weekStart, missedDay === undefined ? 1 : 2, `2026-06-${String(8 + start).padStart(2, '0')}`)
    .sessions.toSorted((a, b) => a.dayOffset - b.dayOffset);
}
