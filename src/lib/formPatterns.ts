import type { Exercise } from '@/types';
import { getExerciseById } from '@/data/exercises';

/**
 * Shared movement-pattern media for long-tail exercises without a bespoke pack.
 * Honest: these are pattern art — cues stay exercise-specific.
 *
 * Preferred: public/form/pattern-{id}/side.webp (Form Index clinical still)
 * Legacy fallback: public/form-guides/pattern-{id}.svg
 */

export type FormPatternId =
  | 'squat'
  | 'hinge'
  | 'push'
  | 'pull'
  | 'core'
  | 'loco'
  | 'isolation';

export const FORM_PATTERN_IDS: readonly FormPatternId[] = [
  'squat',
  'hinge',
  'push',
  'pull',
  'core',
  'loco',
  'isolation',
] as const;

export const PATTERN_MEDIA_CAPTION =
  'Shared movement pattern — cues below are for this exercise';

/**
 * Patterns with clinical Form Index stills under public/form/pattern-{id}/side.webp.
 * Demoted (.467): core (was cropped curl), isolation (was side-plank / head fail).
 * Re-add only after Form Director regen + eyes-on QA.
 */
export const FORM_PATTERN_RASTER_IDS = new Set<FormPatternId>([
  'squat',
  // 'hinge', // demoted .541 — head cropped / tight crop hard reject
  'push',
  'pull',
  'loco',
  'core', // Form Director regen (.468) — forearm plank PASS
  'isolation', // Form Director regen (.468) — standing DB curl PASS
]);

/** Public path for a pattern diagram (raster preferred over legacy SVG). */
export function formPatternPath(pattern: FormPatternId): string {
  if (FORM_PATTERN_RASTER_IDS.has(pattern)) {
    return `/form/pattern-${pattern}/side.webp`;
  }
  return `/form-guides/pattern-${pattern}.svg`;
}

/**
 * Infer a movement pattern from exercise id, name, muscles, equipment.
 * Order matters: more specific families first.
 */
export function inferFormPattern(
  exerciseId: string,
  exercise?: Exercise | null
): FormPatternId | null {
  const ex = exercise ?? getExerciseById(exerciseId);
  const text = [
    exerciseId,
    ex?.name ?? '',
    ...(ex?.muscleGroups ?? []),
    ex?.equipment ?? '',
    ex?.cues ?? '',
  ]
    .join(' ')
    .toLowerCase();

  // Locomotion / conditioning first (burpee, sprint, carry, jump rope…)
  if (
    /cardio|sprint|run\b|rower|assault|carry|farmer|sled|prowler|battle.?rope|high.?knee|skater|double.?under|jump.?rope|wall.?ball|slam|tire|metcon|emom|amrap|interval|plyo|tuck.?jump|box.?jump|broad.?jump/.test(
      text
    )
  ) {
    return 'loco';
  }

  // Arm/shoulder isolation before compound families (hammer-curl must not hit "hamstring")
  if (
    /(?:^|[\s-])(curl|raise|kickback|preacher|skull|tricep|bicep|hammer)(?:$|[\s-])|lateral.?raise|front.?raise|rear.?delt|isolation|extension(?!.*press)/.test(
      text
    ) &&
    !/squat|deadlift|bench|row|press|pull.?up|push.?up/.test(text)
  ) {
    return 'isolation';
  }

  if (
    /squat|lunge|split.?squat|leg.?press|hack|step.?up|pistol|goblet|wall.?sit|leg.?extension|leg.?curl|calf/.test(
      text
    )
  ) {
    // calf / leg curl are not true squats — isolation for pure knee/ankle isolations
    if (/leg.?curl|leg.?extension|calf|seated.?calf|standing.?calf/.test(text) && !/squat|lunge|press/.test(text)) {
      return 'isolation';
    }
    return 'squat';
  }

  if (
    /deadlift|hinge|rdl|romanian|good.?morning|hip.?thrust|glute.?bridge|kettlebell.?swing|nordic|\bhamstring\b/.test(
      text
    )
  ) {
    return 'hinge';
  }

  if (
    /pull.?up|chin.?up|row|pulldown|lat |face.?pull|pull.?apart|inverted.?row|shrug|rear.?delt|scapular/.test(
      text
    )
  ) {
    return 'pull';
  }

  // Landmine family — route by movement, not bare "landmine" (else rotation → push).
  // Match id/name tokens carefully: cues may say "against rotation" on a press.
  if (/landmine/.test(text)) {
    const idName = `${exerciseId} ${ex?.name ?? ''}`.toLowerCase();
    if (/row|meadows/.test(idName)) return 'pull';
    if (/squat|lunge|hack|thruster/.test(idName)) return 'squat';
    if (/rdl|deadlift|hinge/.test(idName)) return 'hinge';
    if (/anti.?rotat|pallof/.test(idName)) return 'core';
    if (/rotation|twist|woodchop/.test(idName)) return 'core';
    if (/press|raise/.test(idName)) return 'push';
    return 'push';
  }

  if (
    /push.?up|bench|overhead|ohp|pike.?push|floor.?press|handstand|fly|crossover|pec|\bpress\b/.test(
      text
    )
  ) {
    // pure fly/crossover → isolation feel; still push pattern is ok for chest press family
    // Note: bare /press/ matched "pressed" in core cues — always use \bpress\b.
    if (/fly|crossover|pec.?deck|raise|curl|extension|kickback|preacher/.test(text) && !/\bpress\b|push|dip/.test(text)) {
      return 'isolation';
    }
    return 'push';
  }

  if (
    /plank|dead.?bug|bird.?dog|hollow|core|crunch|sit.?up|ab |pallof|rotation|anti.?rotat|side.?plank|superman|cat.?camel|thread|angel|stretch|mobility|yoga|pigeon|frog|couch|inchworm|bear.?crawl/.test(
      text
    )
  ) {
    return 'core';
  }

  if (
    /curl|raise|extension|isolation|kickback|preacher|lateral|front.?raise|rear.?delt.?fly|skull|tricep|bicep|hammer/.test(
      text
    )
  ) {
    return 'isolation';
  }

  // Muscle-group fallback
  const muscles = (ex?.muscleGroups ?? []).map((m) => m.toLowerCase());
  if (muscles.includes('chest') || muscles.includes('shoulders')) return 'push';
  if (muscles.includes('back')) return 'pull';
  if (muscles.includes('legs')) return 'squat';
  if (muscles.includes('core')) return 'core';
  if (muscles.includes('arms')) return 'isolation';
  if (muscles.includes('cardio') || muscles.includes('full body')) return 'loco';

  return null;
}

/** Resolve pattern media URL for an exercise that has no bespoke form SVG. */
export function resolvePatternMediaUrl(
  exerciseId: string,
  exercise?: Exercise | null
): string | null {
  const pattern = inferFormPattern(exerciseId, exercise);
  return pattern ? formPatternPath(pattern) : null;
}
