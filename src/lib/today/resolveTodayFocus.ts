import { MAJOR_GROUPS, type MuscleGroup } from '@/lib/muscleGroups';
import type { ReadinessInfo } from '@/lib/readinessIndex';
import { getRecommendedFocus, type RecommendedFocus } from '@/lib/score';

const FOCUS_ALIAS: Record<string, MuscleGroup> = {
  chest: 'Chest',
  back: 'Back',
  legs: 'Legs',
  quads: 'Legs',
  glutes: 'Legs',
  hamstrings: 'Legs',
  shoulders: 'Shoulders',
  arms: 'Arms',
  biceps: 'Arms',
  triceps: 'Arms',
  core: 'Core',
};

/** Map coach plan focus labels (incl. lowercase seed ids) to Today muscle groups. */
export function normalizeCoachFocusGroup(raw: string): MuscleGroup | null {
  if ((MAJOR_GROUPS as readonly string[]).includes(raw)) {
    return raw as MuscleGroup;
  }
  return FOCUS_ALIAS[raw.trim().toLowerCase()] ?? null;
}

/**
 * Today header + coach insight focus — prefer today's Mission Coach session
 * when one is live, else readiness-based recommendation (longest rested group).
 */
export function resolveTodayRecommendedFocus(
  readiness: Record<MuscleGroup, ReadinessInfo>,
  coachToday?: { focusGroups?: string[] } | null
): RecommendedFocus {
  const fallback = getRecommendedFocus(readiness);
  const raw = coachToday?.focusGroups?.[0];
  if (!raw) return fallback;
  const group = normalizeCoachFocusGroup(raw);
  if (!group) return fallback;
  return { group, statusKey: readiness[group].statusKey };
}
