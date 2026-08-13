import { computeBodyScores, computeReadiness } from '@/lib/score';
import { parseGoalPresetId } from '@/lib/journeyGoals';
import type { CompletedWorkoutLog } from '@/types';
import type { UnitsPref } from '@/lib/units';
import type { CoachContext } from '@/lib/coach/types';
import { mapStorageEquipment } from '@/lib/coach/equipment';
import { loadBands } from '@/lib/coach/load';
import { getOrCreateDeviceId } from '@/lib/coach/storage';
import { loadPreferredDays, loadDaysPerWeek } from '@/lib/coach/schedulePrefs';
import { getTodayCheckIn } from '@/lib/mindCheckIns';
import { readRaw } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { loadPregnancyFlag, parsePregnancyFlag, type PregnancyFlag } from '@/lib/pregnancySafety';

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
  /** Pass false to skip reading today's check-in (tests / SSR). Default true on client. */
  includeCheckIn?: boolean;
  pregnancyFlag?: PregnancyFlag;
}): CoachContext {
  const experience = (params.experience ?? 'beginner') as CoachContext['experience'];
  const equipment = mapStorageEquipment(params.equipment ?? 'bodyweight');
  const goalRaw = params.goal ?? 'goal:general';
  const goalId = parseGoalPresetId(goalRaw) ?? 'general';
  const units = params.units ?? 'metric';
  const daysPerWeek = params.daysPerWeek ?? loadDaysPerWeek(experience);
  const preferredDays = params.preferredDays ?? loadPreferredDays();
  const checkIn =
    params.includeCheckIn === false
      ? null
      : typeof window !== 'undefined'
        ? getTodayCheckIn()
        : null;

  return {
    experience,
    equipment,
    goalId,
    daysPerWeek,
    preferredDays,
    history: params.history,
    readiness: computeReadiness(params.history),
    bodyScores: computeBodyScores(params.history, {
      assessmentRisk: params.assessmentRisk,
      checkIn,
    }),
    units,
    assessmentRisk: params.assessmentRisk,
    seedId: params.seedId ?? getOrCreateDeviceId(),
    // Computed here, once, so `generateWeek` stays deterministic given a context —
    // the `new Date()` inside `loadBands` lives at context-build time exactly as
    // `computeBodyScores`' does. It also means the zone is fixed when the week is
    // generated rather than re-read mid-week: load shapes the *next* session, it does
    // not pull the rug on a plan the athlete is already working through.
    loadZone: loadBands(params.history).zone,
    pregnancyFlag: parsePregnancyFlag(params.pregnancyFlag),
  };
}

export function readLocalCoachContext(history: CompletedWorkoutLog[]): CoachContext {
  if (typeof window === 'undefined') {
    return buildCoachContextFromInputs({ history, includeCheckIn: false });
  }
  const experience = readRaw(STORAGE_KEYS.experience) ?? 'beginner';
  const equipment = readRaw(STORAGE_KEYS.equipment) ?? 'bodyweight';
  const goal =
    readRaw(STORAGE_KEYS.primaryGoal) ?? readRaw(STORAGE_KEYS.goals) ?? 'goal:general';
  const units = (readRaw(STORAGE_KEYS.units) as UnitsPref) ?? 'metric';
  let assessmentRisk: string | undefined;
  try {
    const raw = readRaw(STORAGE_KEYS.lastAssessment);
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
    includeCheckIn: true,
    pregnancyFlag: loadPregnancyFlag(),
  });
}
