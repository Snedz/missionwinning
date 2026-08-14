/**
 * Local knowledge corpus for coach retrieval.
 *
 * Built on the server from the exercise catalog + public form depth + free
 * guidebook summaries. Full chapter bodies stay out: retrieval quotes a
 * checkable chunk, not a magazine dump. Cached after first build.
 */

import { EXERCISES } from '@/data/exercises';
import { EXERCISE_PUBLIC_ENRICHMENT } from '@/data/exercisePublicEnrichment';
import { BEYOND_THE_BASICS_CHAPTERS } from '@/data/guidebook/chapters';
import { withPublicDepth } from '@/lib/exerciseDepthDefaults';
import type { CoachKnowledgeDoc } from '@/lib/coach/agent/types';

let cached: CoachKnowledgeDoc[] | null = null;

function exerciseDocs(): CoachKnowledgeDoc[] {
  return EXERCISES.map((ex) => {
    const depth = withPublicDepth(ex, EXERCISE_PUBLIC_ENRICHMENT[ex.id]);
    const parts = [
      ex.name,
      (ex.muscleGroups ?? []).join(' '),
      ex.equipment ?? '',
      ex.cues ?? '',
      depth.cues ?? '',
      (depth.formTips ?? []).join(' '),
      (depth.steps ?? []).join(' '),
      (depth.mistakes ?? []).join(' '),
      depth.safety ?? '',
      (depth.alternatives ?? []).join(' '),
    ].filter((p) => p && p.trim());
    return {
      id: `exercise:${ex.id}`,
      kind: 'exercise' as const,
      title: ex.name,
      text: parts.join(' · '),
      exerciseId: ex.id,
    };
  });
}

function guideDocs(): CoachKnowledgeDoc[] {
  const out: CoachKnowledgeDoc[] = [];
  for (const chapter of BEYOND_THE_BASICS_CHAPTERS) {
    for (const section of chapter.sections) {
      const parts = [
        section.summary,
        section.callout?.title ?? '',
        section.callout?.body ?? '',
        section.checklist?.title ?? '',
        (section.checklist?.items ?? []).join(' '),
      ].filter((p) => p && p.trim());
      out.push({
        id: `guide:${chapter.id}/${section.id}`,
        kind: 'guide',
        title: `${chapter.title}: ${section.title}`,
        text: parts.join(' · '),
        exerciseId: section.relatedExerciseIds?.[0],
      });
    }
  }
  return out;
}

export function buildCoachKnowledgeCorpus(): CoachKnowledgeDoc[] {
  if (cached) return cached;
  cached = [...exerciseDocs(), ...guideDocs()];
  return cached;
}

/** Test-only: drop the memo so a later suite cannot inherit a mutated list. */
export function resetCoachKnowledgeCorpusCache(): void {
  cached = null;
}
