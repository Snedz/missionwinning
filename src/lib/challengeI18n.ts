import type { ChallengeId } from '@/lib/challenges';

const TITLE_KEYS: Record<ChallengeId, string> = {
  'train-7': 'challengeTrain7Title',
  'protein-5': 'challengeProtein5Title',
  'volume-10k': 'challengeVolume10kTitle',
  'move-4': 'challengeMove4Title',
  'mind-4': 'challengeMind4Title',
  'learn-4': 'challengeLearn4Title',
  'guide-3': 'challengeGuide3Title',
  'track-5': 'challengeTrack5Title',
};

const DESC_KEYS: Record<ChallengeId, string> = {
  'train-7': 'challengeTrain7Desc',
  'protein-5': 'challengeProtein5Desc',
  'volume-10k': 'challengeVolume10kDesc',
  'move-4': 'challengeMove4Desc',
  'mind-4': 'challengeMind4Desc',
  'learn-4': 'challengeLearn4Desc',
  'guide-3': 'challengeGuide3Desc',
  'track-5': 'challengeTrack5Desc',
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
