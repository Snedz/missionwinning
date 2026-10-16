/**
 * Earn-back offer copy guard — flags "free", "win", and "prize" wording
 * in pay-upfront earn-back plan copy (ASA compliance + Stripe gaming rules).
 *
 * No UI, no file I/O. Pure logic.
 */

export type RiskyWord = 'free' | 'win' | 'prize';

export type CopyFinding = {
  word: RiskyWord;
  match: string;
  index: number;
};

const WORD_PATTERNS: { words: readonly string[]; target: RiskyWord }[] = [
  { words: ['free', 'freely'], target: 'free' },
  { words: ['win', 'wins', 'winner', 'winners', 'winning'], target: 'win' },
  { words: ['prize', 'prizes'], target: 'prize' },
];

const BRAND_NAME = 'mission winning';

/**
 * Find risky offer words in text, ignoring "Mission Winning" brand name.
 * Case-insensitive, whole-word matching only.
 *
 * @param text - The copy to scan
 * @returns Array of findings, ordered by index ascending
 */
export function findRiskyOfferWords(text: string): CopyFinding[] {
  if (typeof text !== 'string' || text === '') {
    return [];
  }

  // Replace brand name with same-length spaces so indexes stay correct
  const placeholder = ' '.repeat(BRAND_NAME.length);
  const brandRegex = new RegExp(BRAND_NAME, 'gi');
  const textWithoutBrand = text.replace(brandRegex, placeholder);

  const findings: CopyFinding[] = [];

  for (const { words, target } of WORD_PATTERNS) {
    for (const word of words) {
      // Whole-word match: word boundary before and after
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      let match: RegExpExecArray | null;

      while ((match = regex.exec(textWithoutBrand)) !== null) {
        findings.push({
          word: target,
          match: match[0],
          index: match.index,
        });
      }
    }
  }

  // Sort by position in original string
  return findings.sort((a, b) => a.index - b.index);
}

/**
 * Determines whether the copy contains no risky offer words.
 *
 * @param text - The copy to validate
 * @returns true only when the copy is clean
 */
export function offerCopyIsClean(text: string): boolean {
  return findRiskyOfferWords(text).length === 0;
}
