import { computeBodyScores, computeReadiness } from '@/lib/score';
import { parseGoalPresetId } from '@/lib/journeyGoals';
import type { CompletedWorkoutLog } from '@/types';
import type { UnitsPref } from '@/lib/units';
import type { CoachContext, EquipmentProfile } from '@/lib/coach/types';
import { mapStorageEquipment } from '@/lib/coach/equipment';
import { getOrCreateDeviceId } from '@/lib/coach/storage';
import { defaultDaysPerWeek, loadPreferredDays, loadDaysPerWeek } from '@/lib/coach/schedulePrefs';

export function buildCoachContextFromInputs(params: {
  history: CompletedWorkoutLog[];
  experience?: string;
  equipment?: string;
  goal?: string;
  units?: UnitsPref;
  assessmentRisk?: string;
  seedId?: string;
  daysPerWeek?: number;
  preferredDays?: number[];
}): CoachContext {
  const experience = (params.experience ?? 'beginner') as CoachContext['experience'];
  const equipment = mapStorageEquipment(params.equipment ?? 'bodyweight');
  const goalRaw = params.goal ?? 'goal:general';
  const goalId = parseGoalPresetId(goalRaw) ?? 'general';
  const units = params.units ?? 'metric';
  const daysPerWeek = params.daysPerWeek ?? loadDaysPerWeek(experience);
  const preferredDays = params.preferredDays ?? loadPreferredDays();

  return {
    experience,
    equipment,
    goalId,
    daysPerWeek,
    preferredDays,
    history: params.history,
    readiness: computeReadiness(params.history),
    bodyScores: computeBodyScores(params.history, { assessmentRisk: params.assessmentRisk }),
    units,
    assessmentRisk: params.assessmentRisk,
    seedId: params.seedId ?? getOrCreateDeviceId(),
  };
}

export function readLocalCoachContext(history: CompletedWorkoutLog[]): CoachContext {
  if (typeof window === 'undefined') {
    return buildCoachContextFromInputs({ history });
  }
  const experience = localStorage.getItem('mw_experience') ?? 'beginner';
  const equipment = localStorage.getItem('mw_equipment') ?? 'bodyweight';
  const goal =
    localStorage.getItem('mw_primary_goal') ?? localStorage.getItem('mw_goals') ?? 'goal:general';
  const units = (localStorage.getItem('mw_units') as UnitsPref) ?? 'metric';
  let assessmentRisk: string | undefined;
  try {
    const raw = localStorage.getItem('mw_last_assessment');
    if (raw) assessmentRisk = (JSON.parse(raw) as { risk?: string }).risk;
  } catch {
    /* ignore */
  }
  return buildCoachContextFromInputs({
    history,
    experience,
    equipment,
    goal,
    units,
    assessmentRisk,
  });
}
