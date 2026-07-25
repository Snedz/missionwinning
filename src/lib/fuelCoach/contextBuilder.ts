import { macroTargetsFromStats, defaultCalcInputs, type MacroGoal } from '@/lib/calcHelpers';
import { loadMacroTargets } from '@/lib/macroTargets';
import { parseGoalPresetId } from '@/lib/journeyGoals';
import type { UnitsPref } from '@/lib/units';
import type { CompletedWorkoutLog } from '@/types';
import type { FuelContext, FuelGoal, TrainingLoad } from '@/lib/fuelCoach/types';
import { getOrCreateDeviceId } from '@/lib/coach/storage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw } from '@/lib/storage/safeStorage';

const DAY_LABELS = [
  { dayKey: 'mon', label: 'Monday' },
  { dayKey: 'tue', label: 'Tuesday' },
  { dayKey: 'wed', label: 'Wednesday' },
  { dayKey: 'thu', label: 'Thursday' },
  { dayKey: 'fri', label: 'Friday' },
  { dayKey: 'sat', label: 'Saturday' },
  { dayKey: 'sun', label: 'Sunday' },
] as const;

export function parseFuelGoal(raw?: string | null): FuelGoal {
  const id = parseGoalPresetId(raw ?? '') ?? raw ?? '';
  if (id.includes('cut') || id.includes('fat') || id.includes('lose')) return 'cut';
  if (id.includes('muscle') || id.includes('bulk') || id.includes('gain')) return 'bulk';
  return 'maintain';
}

export function resolveBaseMacroTargets(units: UnitsPref = 'metric'): FuelContext['baseTargets'] {
  const stored = loadMacroTargets();
  if (stored) {
    return {
      cals: stored.cals,
      protein: stored.protein,
      carbs: stored.carbs,
      fat: stored.fat,
    };
  }
  const defaults = defaultCalcInputs(units);
  return macroTargetsFromStats({ bw: defaults.bw, units, goal: 'maintain' });
}

export function trainingLoadForDay(
  history: CompletedWorkoutLog[],
  weekStart: string,
  dayOffset: number
): TrainingLoad {
  const start = new Date(`${weekStart}T12:00:00`);
  const day = new Date(start);
  day.setDate(start.getDate() + dayOffset);
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const logs = history.filter((log) => {
    const d = new Date(log.completedAt);
    return d >= dayStart && d < dayEnd;
  });

  if (logs.some((l) => l.totalVolume >= 4500)) return 'heavy';
  if (logs.length > 0) return 'moderate';

  const prev = new Date(dayStart);
  prev.setDate(prev.getDate() - 1);
  const prevEnd = new Date(dayStart);
  const prevLogs = history.filter((log) => {
    const d = new Date(log.completedAt);
    return d >= prev && d < prevEnd;
  });
  if (prevLogs.some((l) => l.totalVolume >= 4500)) return 'light';
  return 'rest';
}

export function weekTrainingVolume(history: CompletedWorkoutLog[], weekStart: string): number {
  const start = new Date(`${weekStart}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return history
    .filter((log) => {
      const d = new Date(log.completedAt);
      return d >= start && d < end;
    })
    .reduce((s, l) => s + l.totalVolume, 0);
}

export function buildFuelContext(params: {
  history: CompletedWorkoutLog[];
  goal?: FuelGoal;
  seedId?: string;
  units?: UnitsPref;
}): FuelContext {
  const units = params.units ?? 'metric';
  let goal = params.goal;
  if (!goal) {
    const raw = readRaw(STORAGE_KEYS.primaryGoal) ?? readRaw(STORAGE_KEYS.goals) ?? '';
    if (raw) goal = parseFuelGoal(raw);
  }
  goal ??= 'maintain';

  return {
    goal,
    baseTargets: resolveBaseMacroTargets(units),
    history: params.history,
    seedId: params.seedId ?? getOrCreateDeviceId(),
    units,
    bodyweightKg: units === 'metric' ? 82 : 82,
  };
}

export function readLocalFuelContext(history: CompletedWorkoutLog[]): FuelContext {
  const units = (readRaw(STORAGE_KEYS.units) as UnitsPref | null) ?? 'metric';
  return buildFuelContext({ history, units });
}

export function fuelDayLabels(): { dayKey: string; label: string }[] {
  return DAY_LABELS.map((d) => ({ ...d }));
}

export function goalToMacroGoal(goal: FuelGoal): MacroGoal {
  return goal;
}
