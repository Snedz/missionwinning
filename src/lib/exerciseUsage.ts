/**
 * Reverse index: exercise id → free program/template names that include it.
 * Computed once at module load (static catalogs). Server-oriented.
 */
import { PROGRAM_TEMPLATES } from '@/data/programTemplates';
import { FREE_STARTER_PROGRAMS } from '@/data/starterPrograms';

export type ExerciseUsageHit = {
  name: string;
  kind: 'starter' | 'template';
};

const usageMap: Map<string, ExerciseUsageHit[]> = (() => {
  const map = new Map<string, ExerciseUsageHit[]>();

  const push = (id: string, hit: ExerciseUsageHit) => {
    const list = map.get(id) ?? [];
    if (!list.some((h) => h.name === hit.name && h.kind === hit.kind)) {
      list.push(hit);
      map.set(id, list);
    }
  };

  for (const prog of FREE_STARTER_PROGRAMS) {
    for (const ex of prog.exercises) {
      push(ex.exerciseId, { name: prog.name, kind: 'starter' });
    }
  }

  // Beginner free templates only (pro/premium filtered at template level in data).
  for (const tmpl of PROGRAM_TEMPLATES) {
    if (tmpl.category === 'pro') continue;
    for (const session of tmpl.sessions) {
      for (const ex of session.exercises) {
        if (ex.exerciseId) {
          push(ex.exerciseId, { name: tmpl.name, kind: 'template' });
        }
      }
    }
  }

  return map;
})();

export function templatesUsingExercise(exerciseId: string, limit = 8): ExerciseUsageHit[] {
  return (usageMap.get(exerciseId) ?? []).slice(0, limit);
}
