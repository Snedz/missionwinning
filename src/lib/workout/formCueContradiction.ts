/**
 * Detect opposite form cues on the same lift.
 * A contradiction needs one shared tag and exactly one negating cue.
 * Both cues negating is the same claim, so it is not a contradiction.
 */

export type Confidence = 'low' | 'mid' | 'high';

export type FormCue = {
  cueId: string;
  text: string;
  confidence: Confidence;
  tags: readonly string[];
  lift: string;
};

export type ContradictionOutcome =
  | { kind: 'none' }
  | {
      kind: 'flag-lower';
      lowerCueId: string;
      higherCueId: string;
      sharedTag: string;
      lift: string;
    }
  | {
      kind: 'equal-confidence';
      cueIds: [string, string];
      sharedTag: string;
      lift: string;
    }
  | { kind: 'self-noop'; cueId: string };

const CONFIDENCE_RANK: Record<Confidence, number> = {
  low: 0,
  mid: 1,
  high: 2,
};

/** ASCII apostrophe in don't. Non-global so repeated test() calls do not skip. */
const NEGATION = /\b(do not|don't|avoid|never)\b/i;

export function sharedTags(a: FormCue, b: FormCue): string[] {
  const other = new Set(b.tags);
  const shared = new Set<string>();
  for (const tag of a.tags) {
    if (other.has(tag)) shared.add(tag);
  }
  return [...shared].sort();
}

export function oppositeClaims(aText: string, bText: string): boolean {
  return NEGATION.test(aText) !== NEGATION.test(bText);
}

export function detectContradiction(a: FormCue, b: FormCue): ContradictionOutcome {
  if (a.cueId === b.cueId) {
    return { kind: 'self-noop', cueId: a.cueId };
  }

  const tags = sharedTags(a, b);
  const sharedTag = tags[0];
  if (
    a.lift !== b.lift ||
    sharedTag === undefined ||
    !oppositeClaims(a.text, b.text)
  ) {
    return { kind: 'none' };
  }

  if (a.confidence === b.confidence) {
    const cueIds: [string, string] =
      a.cueId < b.cueId ? [a.cueId, b.cueId] : [b.cueId, a.cueId];
    return { kind: 'equal-confidence', cueIds, sharedTag, lift: a.lift };
  }

  const aIsLower = CONFIDENCE_RANK[a.confidence] < CONFIDENCE_RANK[b.confidence];
  return {
    kind: 'flag-lower',
    lowerCueId: aIsLower ? a.cueId : b.cueId,
    higherCueId: aIsLower ? b.cueId : a.cueId,
    sharedTag,
    lift: a.lift,
  };
}
