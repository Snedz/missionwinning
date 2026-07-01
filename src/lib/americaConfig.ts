/** Feature flags for U.S. National Fitness track (optional; global app unchanged). */

export type CouncilStatus = 'aspirational' | 'pending' | 'member';

export function getCouncilStatus(): CouncilStatus {
  const raw = process.env.NEXT_PUBLIC_COUNCIL_STATUS;
  if (raw === 'pending' || raw === 'member') return raw;
  return 'aspirational';
}

export function isAmericaTrackEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AMERICA_TRACK_ENABLED !== 'false';
}

export function showMahaCopy(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_MAHA_COPY === 'true';
}
