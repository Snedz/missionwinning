/**
 * Public SEO helpers — related exercises, hubs, guide mesh.
 * Wave 4: docs/DESIGN_RESEARCH.md § Wave 4
 */

import { EXERCISES } from '@/data/exercises';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { MAJOR_GROUPS, type MuscleGroup } from '@/lib/muscleGroups';
import type { Exercise } from '@/types';
import {
  EXERCISE_PUBLIC_ENRICHMENT,
  type ExercisePublicEnrichment,
} from '@/data/exercisePublicEnrichment';
import { withPublicDepth } from '@/lib/exerciseDepthDefaults';

export const EQUIPMENT_HUBS = [
  { slug: 'bodyweight', label: 'Bodyweight', match: (e: string) => /bodyweight|none|chair|table|box/i.test(e) },
  { slug: 'dumbbells', label: 'Dumbbells', match: (e: string) => /dumbbell/i.test(e) },
  { slug: 'barbell', label: 'Barbell', match: (e: string) => /barbell/i.test(e) },
  { slug: 'cable', label: 'Cable / machine', match: (e: string) => /cable|machine/i.test(e) },
  { slug: 'kettlebell', label: 'Kettlebell', match: (e: string) => /kettlebell/i.test(e) },
  { slug: 'bands', label: 'Bands', match: (e: string) => /band/i.test(e) },
] as const;

export type EquipmentHubSlug = (typeof EQUIPMENT_HUBS)[number]['slug'];

export function muscleHubSlug(group: string): string {
  return group.toLowerCase().replace(/\s+/g, '-');
}

export function muscleFromSlug(slug: string): MuscleGroup | null {
  const hit = MAJOR_GROUPS.find((g) => muscleHubSlug(g) === slug.toLowerCase());
  return hit ?? null;
}

export function equipmentHubFromSlug(slug: string) {
  return EQUIPMENT_HUBS.find((h) => h.slug === slug) ?? null;
}

export function exercisesForMuscle(group: MuscleGroup): Exercise[] {
  return EXERCISES.filter((e) => e.muscleGroups.includes(group));
}

export function exercisesForEquipment(slug: EquipmentHubSlug): Exercise[] {
  const hub = equipmentHubFromSlug(slug);
  if (!hub) return [];
  return EXERCISES.filter((e) => hub.match(e.equipment || ''));
}

/** Related exercises by shared primary muscle (exclude self). */
export function relatedExercises(exercise: Exercise, limit = 6): Exercise[] {
  const primary = exercise.muscleGroups[0];
  if (!primary) return [];
  return EXERCISES.filter(
    (e) => e.id !== exercise.id && e.muscleGroups.includes(primary)
  ).slice(0, limit);
}

/** Guide chapters that mention training / movement themes for mesh links. */
export function guideChaptersForExercise(exercise: Exercise): { id: string; title: string }[] {
  const tags = new Set(
    [...exercise.muscleGroups, ...(exercise.tags ?? [])].map((t) => t.toLowerCase())
  );
  const out: { id: string; title: string }[] = [];
  for (const ch of BEYOND_THE_BASICS_CHAPTERS) {
    const hay = `${ch.title} ${ch.subtitle} ${ch.sections.map((s) => s.title).join(' ')}`.toLowerCase();
    const hit =
      (tags.has('chest') || tags.has('back') || tags.has('legs')) &&
      /strength|performance|movement|adapt/i.test(hay);
    const recoveryHit =
      (tags.has('core') || /mobility|stretch|corrective/i.test(exercise.name)) &&
      /recovery|mobility|corrective|sleep/i.test(hay);
    if (hit || recoveryHit || ch.id === 'human-performance') {
      out.push({ id: ch.id, title: ch.title });
    }
    if (out.length >= 3) break;
  }
  if (!out.length && BEYOND_THE_BASICS_CHAPTERS[0]) {
    out.push({
      id: BEYOND_THE_BASICS_CHAPTERS[0].id,
      title: BEYOND_THE_BASICS_CHAPTERS[0].title,
    });
  }
  return out;
}

/** Merge catalog exercise with public enrichment overlay + depth defaults. */
export function enrichExerciseForPublic(exercise: Exercise): Exercise & {
  enrichment?: ExercisePublicEnrichment;
} {
  const raw = EXERCISE_PUBLIC_ENRICHMENT[exercise.id];
  const enrichment = withPublicDepth(exercise, raw);
  return {
    ...exercise,
    cues: exercise.cues || enrichment.cues || exercise.cues,
    alternatives: exercise.alternatives?.length
      ? exercise.alternatives
      : enrichment.alternatives,
    enrichment,
  };
}

/** Sample related exercises for a guide chapter (by chapter theme). */
export function exercisesForGuideChapter(chapterId: string, limit = 8): Exercise[] {
  const map: Record<string, string[]> = {
    'human-performance': ['squats', 'deadlift', 'bench-press', 'pull-ups', 'push-ups'],
    'movement-mechanics': ['air-squat', 'cat-camel', 'bird-dog', 'plank', 'lunges'],
    'programming-tuning': ['squats', 'bench-press', 'barbell-row', 'overhead-press'],
    'getting-started-mw': ['push-ups', 'air-squat', 'plank', 'glute-bridge'],
    'nutrition-recovery': ['farmer-carry', 'goblet-squat', 'cat-camel', 'couch-stretch'],
    'assessments-progress': ['push-ups', 'squats', 'plank', 'pull-ups'],
  };
  const ids = map[chapterId] ?? ['squats', 'push-ups', 'plank'];
  return ids
    .map((id) => EXERCISES.find((e) => e.id === id))
    .filter((e): e is Exercise => !!e)
    .slice(0, limit);
}
