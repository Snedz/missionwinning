/**
 * Phrases this report must never use. We do not run a feed ranker and we
 * do not suppress other people's posts — claiming either would be a lie.
 *
 * The list is closed: each entry is an X-style visibility claim we refuse.
 * New spellings go here with a reason, not as one-off asserts in a test.
 */

export const TRANSPARENCY_FORBIDDEN_PHRASES: readonly {
  phrase: string;
  why: string;
}[] = [
  { phrase: 'shadowban', why: 'We do not hide other users; we are not a feed.' },
  { phrase: 'impressions', why: 'No For You ranker; we do not count post reach.' },
  { phrase: 'for you', why: 'No For You surface. Use “on this device” instead.' },
  { phrase: 'for-you', why: 'Same as For You — hyphenated spelling.' },
  { phrase: 'suppress posts', why: 'We do not suppress posts. Do not claim it.' },
  { phrase: 'we suppress', why: 'We do not suppress posts or accounts.' },
  { phrase: 'paying people', why: 'No paid talk / X-weights-as-XP.' },
  { phrase: 'x-weight', why: 'X ranking weights are not XP.' },
];

export function findForbiddenPhrases(text: string): string[] {
  return TRANSPARENCY_FORBIDDEN_PHRASES.filter((e) => {
    const escaped = e.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
  }).map((e) => e.phrase);
}

export function assertNoForbiddenPhrases(text: string, label: string): void {
  const hits = findForbiddenPhrases(text);
  if (hits.length > 0) {
    throw new Error(`${label} uses refused visibility language: ${hits.join(', ')}`);
  }
}
