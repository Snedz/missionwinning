/**
 * Pure classifier for progress/PR/streak phrases.
 * Distinguishes allowed evidence-backed copy from refused invented traction or plan text masquerading as results.
 */

export type PhraseKind = 'allowed' | 'refused' | 'estimate';

export type PhraseVerdict = {
  kind: PhraseKind;
  reason: string;
};

const REFUSED_TOKENS = [
  'guaranteed',
  'viral',
  'exploding',
  'undisputed pr',
  'fake pr',
  'invented streak',
] as const;

const EVIDENCE_KEYWORDS = [
  'logged',
  'from logs',
  'completed sets',
  'session receipt',
] as const;

const RANKING_CLAIM_REGEX = /\b(#?1|number one)\b/i;

/**
 * Classify a progress/PR/streak phrase.
 * Never treats plan text as logged results.
 */
export function classifyProgressPhrase(text: string): PhraseVerdict {
  const trimmed = text.trim();

  // 1. Empty check
  if (trimmed === '') {
    return { kind: 'refused', reason: 'empty' };
  }

  const lower = trimmed.toLowerCase();

  // 2. Refused invented-traction tokens (whole-word scan)
  for (const token of REFUSED_TOKENS) {
    // Use word boundary check for multi-word tokens
    if (token.includes(' ')) {
      const words = token.split(' ');
      // Check if all words appear consecutively
      const regex = new RegExp(`\\b${words.join('\\s+')}\\b`, 'i');
      if (regex.test(trimmed)) {
        return { kind: 'refused', reason: 'invented traction' };
      }
    } else {
      // Single word - use word boundary
      const regex = new RegExp(`\\b${token}\\b`, 'i');
      if (regex.test(trimmed)) {
        return { kind: 'refused', reason: 'invented traction' };
      }
    }
  }

  // 3. Estimate-labeled (check before ranking claim to allow "about #1 (estimate)")
  // Match "est." or "estimate" case-insensitively, with word boundary to avoid partial matches
  if (/\best\.?\b/i.test(lower) || /\(estimate\)/i.test(lower) || lower.startsWith('about ')) {
    return { kind: 'estimate', reason: 'labeled estimate' };
  }

  // 4. Evidence-backed (check before ranking claim to allow "from logs" evidence)
  for (const keyword of EVIDENCE_KEYWORDS) {
    if (lower.includes(keyword)) {
      return { kind: 'allowed', reason: 'evidence-backed' };
    }
  }

  // 5. Ranking claim without evidence
  if (RANKING_CLAIM_REGEX.test(trimmed)) {
    return { kind: 'refused', reason: 'invented traction' };
  }

  // 6. Default refuse: plan text masquerading as result
  return { kind: 'refused', reason: 'plan text as result' };
}

/**
 * Returns true if the phrase is honest progress copy (allowed or estimate).
 */
export function isHonestProgressCopy(text: string): boolean {
  const verdict = classifyProgressPhrase(text);
  return verdict.kind === 'allowed' || verdict.kind === 'estimate';
}
