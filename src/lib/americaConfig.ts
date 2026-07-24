/** Feature flags for U.S. National Fitness track (optional; global app unchanged). */
import { isSurfaceEnabled } from '@/lib/surface';

export type CouncilStatus = 'aspirational' | 'pending' | 'member';

export function getCouncilStatus(): CouncilStatus {
  const raw = process.env.NEXT_PUBLIC_COUNCIL_STATUS;
  if (raw === 'pending' || raw === 'member') return raw;
  return 'aspirational';
}

/**
 * Opt-in for the global launch: the US/PFT side track stays parked until enabled
 * (see docs/STRATEGY.md — focus the core loop first; this track adds COPPA/teacher
 * support surface).
 *
 * Now a thin alias over the surface registry (`src/lib/surface.ts`) so parking is
 * expressed one way. The original env var still works.
 */
export function isAmericaTrackEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_AMERICA_TRACK_ENABLED === 'true') return true;
  return isSurfaceEnabled('america');
}

export function showMahaCopy(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_MAHA_COPY === 'true';
}

export type CouncilDeployWarning = {
  level: 'warn' | 'info';
  message: string;
};

/** Non-blocking production hints for council / MAHA env flags. */
export function getCouncilDeployWarnings(): CouncilDeployWarning[] {
  const warnings: CouncilDeployWarning[] = [];
  const status = getCouncilStatus();
  const maha = showMahaCopy();

  if (maha && status === 'aspirational') {
    warnings.push({
      level: 'warn',
      message:
        'NEXT_PUBLIC_SHOW_MAHA_COPY=true with COUNCIL_STATUS=aspirational — confirm legal review before production.',
    });
  }
  if (status === 'member' && !maha) {
    warnings.push({
      level: 'info',
      message: 'COUNCIL_STATUS=member — consider enabling NEXT_PUBLIC_SHOW_MAHA_COPY after legal sign-off.',
    });
  }
  if (status === 'member' && !process.env.RESEND_API_KEY) {
    warnings.push({
      level: 'warn',
      message: 'COUNCIL_STATUS=member but RESEND_API_KEY unset — youth parent emails will not send.',
    });
  }
  return warnings;
}
