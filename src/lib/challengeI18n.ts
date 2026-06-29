import type { ChallengeId } from '@/lib/challenges';

const TITLE_KEYS: Record<ChallengeId, string> = {
  'train-7': 'challengeTrain7Title',
  'protein-5': 'challengeProtein5Title',
  'volume-10k': 'challengeVolume10kTitle',
};

const DESC_KEYS: Record<ChallengeId, string> = {
  'train-7': 'challengeTrain7Desc',
  'protein-5': 'challengeProtein5Desc',
  'volume-10k': 'challengeVolume10kDesc',
};

type TFn = (key: string, opts?: { defaultValue?: string }) => string;

export function localizedChallengeTitle(
  id: ChallengeId,
  fallback: string,
  t: TFn
): string {
  return t(TITLE_KEYS[id], { defaultValue: fallback });
}

export function localizedChallengeDesc(
  id: ChallengeId,
  fallback: string,
  t: TFn
): string {
  return t(DESC_KEYS[id], { defaultValue: fallback });
}
