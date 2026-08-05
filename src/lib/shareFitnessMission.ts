import { americaHomeOrFallback, isAmericaTrackEnabled, showMahaCopy } from '@/lib/americaConfig';
import { awardLabel, type FitnessTestSession } from '@/lib/presidentialFitnessTest';
import { classJoinUrl } from '@/lib/schoolClass';

const BASE_URL = 'https://www.missionwinning.com';

export type ShareLinkOpts = { refCode?: string };

function siteUrl(path: string, opts?: ShareLinkOpts): string {
  const base = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  try {
    const u = new URL(base);
    if (opts?.refCode) u.searchParams.set('ref', opts.refCode);
    else if (!u.searchParams.has('utm_source')) {
      u.searchParams.set('utm_source', 'share');
      u.searchParams.set('utm_medium', 'mission');
    }
    return u.toString();
  } catch {
    return base;
  }
}

/** Share landing for America track — never hard-code parked /america. */
function americaSharePath(): string {
  if (showMahaCopy() && isAmericaTrackEnabled()) return '/america';
  if (isAmericaTrackEnabled()) return americaHomeOrFallback();
  return '/fitness-test';
}

export function buildPftShareText(
  session: FitnessTestSession,
  classCode?: string | null,
  opts?: ShareLinkOpts
): string {
  const tier = awardLabel(session.overallTier);
  const mode = session.mode === 'mini' ? 'mini fitness test' : 'Presidential Fitness Test';
  const classLine = classCode ? ` Class: ${classCode}.` : '';
  const link = siteUrl(americaSharePath(), opts);

  if (showMahaCopy() && isAmericaTrackEnabled()) {
    return (
      `I earned ${tier} on the ${mode} with Mission Winning — inspiring kids to get moving and restoring a culture of strength, health, and fitness. Let's Make America Healthy Again!${classLine} ${link}`
    );
  }

  return `I earned ${tier} on the ${mode} with Mission Winning — free fitness for families and schools.${classLine} ${link}`;
}

export function buildCommissioningShareText(useMaha?: boolean, opts?: ShareLinkOpts): string {
  const maha = (useMaha ?? showMahaCopy()) && isAmericaTrackEnabled();
  if (maha) {
    return (
      `I completed Basic Training on Mission Winning — commissioned and ready to move every day. Let's Make America Healthy Again! ${siteUrl(americaHomeOrFallback(), opts)}`
    );
  }
  return `I completed Basic Training on Mission Winning — commissioned and on the path to health. ${siteUrl('/', opts)}`;
}

export function buildClassInviteShareText(
  classCode: string,
  className: string,
  opts?: ShareLinkOpts
): string {
  let link = classJoinUrl(classCode, BASE_URL);
  if (opts?.refCode) {
    try {
      const u = new URL(link);
      u.searchParams.set('ref', opts.refCode);
      link = u.toString();
    } catch {
      /* keep */
    }
  }
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
