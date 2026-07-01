import { showMahaCopy } from '@/lib/americaConfig';
import { awardLabel, type FitnessTestSession } from '@/lib/presidentialFitnessTest';
import { classJoinUrl } from '@/lib/schoolClass';

const BASE_URL = 'https://www.missionwinning.com';

export function buildPftShareText(session: FitnessTestSession, classCode?: string | null): string {
  const tier = awardLabel(session.overallTier);
  const mode = session.mode === 'mini' ? 'mini fitness test' : 'Presidential Fitness Test';
  const classLine = classCode ? ` Class: ${classCode}.` : '';

  if (showMahaCopy()) {
    return (
      `I earned ${tier} on the ${mode} with Mission Winning — inspiring kids to get moving and restoring a culture of strength, health, and fitness. Let's Make America Healthy Again!${classLine} ${BASE_URL}/america`
    );
  }

  return `I earned ${tier} on the ${mode} with Mission Winning — free fitness for families and schools.${classLine} ${BASE_URL}/fitness-test`;
}

export function buildCommissioningShareText(useMaha?: boolean): string {
  const maha = useMaha ?? showMahaCopy();
  if (maha) {
    return (
      `I completed Basic Training on Mission Winning — commissioned and ready to move every day. Let's Make America Healthy Again! ${BASE_URL}/america`
    );
  }
  return `I completed Basic Training on Mission Winning — commissioned and on the path to health. ${BASE_URL}`;
}

export function buildClassInviteShareText(classCode: string, className: string): string {
  const link = classJoinUrl(classCode, BASE_URL);
  return `Join our ${className} fitness challenge on Mission Winning — Presidential Fitness Test prep, free for students. Code: ${classCode}. ${link}`;
}

export async function shareText(text: string, title = 'Mission Winning'): Promise<'shared' | 'copied' | 'failed'> {
  if (typeof navigator === 'undefined') return 'failed';
  try {
    if (navigator.share) {
      await navigator.share({ title, text });
      return 'shared';
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return 'copied';
    }
  } catch {
    return 'failed';
  }
  return 'failed';
}
