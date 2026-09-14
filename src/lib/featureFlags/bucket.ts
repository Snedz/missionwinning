import { createHash } from 'node:crypto';

/**
 * Stable 0–99 bucket for one (flag, subject) pair.
 *
 * Percent `n` means buckets `0 .. n-1` are on. Raising n therefore only adds
 * people — 10% is always a subset of 20% for the same subject ids. Lowering
 * percent can drop people; that is documented on the console, not hidden.
 */
export function flagBucket(flagKey: string, subjectId: string): number {
  const hex = createHash('sha256').update(`${flagKey}:${subjectId}`, 'utf8').digest('hex');
  const n = Number.parseInt(hex.slice(0, 8), 16);
  return n % 100;
}
