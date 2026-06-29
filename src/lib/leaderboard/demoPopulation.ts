import type { LeaderboardEntry, LeaderboardSnapshot } from './types';
import type { MacroRegion } from './regions';

/** Deterministic pseudo-random from seed string. */
function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const CALLSIGNS = [
  'Iron Dawn', 'Night Vector', 'Steel Horizon', 'Pacific Ghost', 'Atlas Run',
  'Monsoon Six', 'Arctic Pulse', 'Desert Wind', 'Blue Anchor', 'Red Ledger',
  'Echo Trail', 'Foxtrot Line', 'Grid Runner', 'Harbor Light', 'Indigo Wing',
  'Jade Circuit', 'Keystone', 'Lunar Path', 'Meridian', 'North Star',
  'Orbit Nine', 'Phantom Step', 'Quartz Field', 'Ridge Walker', 'Summit Zero',
  'Tidal Forge', 'Umbra', 'Vanguard', 'Waypoint', 'Zenith',
  'Boxer Ready', 'Venom Dawn', 'Indian Ocean', 'Night Deck', 'Helo Line',
  'Amphib Six', 'Surface Watch', 'Deck Run', 'Hangar Light', 'Rotor Echo',
];

const REGIONS: MacroRegion[] = ['Americas', 'Europe', 'Asia-Pacific', 'Middle East & Africa'];

const COUNTRIES: { code: string; name: string; region: MacroRegion }[] = [
  { code: 'US', name: 'United States', region: 'Americas' },
  { code: 'BR', name: 'Brazil', region: 'Americas' },
  { code: 'MX', name: 'Mexico', region: 'Americas' },
  { code: 'CA', name: 'Canada', region: 'Americas' },
  { code: 'GB', name: 'United Kingdom', region: 'Europe' },
  { code: 'DE', name: 'Germany', region: 'Europe' },
  { code: 'FR', name: 'France', region: 'Europe' },
  { code: 'IT', name: 'Italy', region: 'Europe' },
  { code: 'ES', name: 'Spain', region: 'Europe' },
  { code: 'RU', name: 'Russia', region: 'Europe' },
  { code: 'JP', name: 'Japan', region: 'Asia-Pacific' },
  { code: 'KR', name: 'South Korea', region: 'Asia-Pacific' },
  { code: 'IN', name: 'India', region: 'Asia-Pacific' },
  { code: 'AU', name: 'Australia', region: 'Asia-Pacific' },
  { code: 'SG', name: 'Singapore', region: 'Asia-Pacific' },
  { code: 'AE', name: 'UAE', region: 'Middle East & Africa' },
  { code: 'ZA', name: 'South Africa', region: 'Middle East & Africa' },
  { code: 'NG', name: 'Nigeria', region: 'Middle East & Africa' },
];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

/** Seeded demo operators — fills global boards until cloud data grows. */
export function buildDemoPopulation(count = 96): LeaderboardSnapshot[] {
  const out: LeaderboardSnapshot[] = [];

  for (let i = 0; i < count; i++) {
    const seed = hashSeed(`mw-demo-${i}`);
    const country = pick(COUNTRIES, seed);
    const callsign = pick(CALLSIGNS, seed + i * 7);

    const missionScore = 28 + (seed % 72);
    const trainingStreak = Math.min(21, (seed >> 3) % 14);
    const weeklyVolume = 800 + (seed % 9200);
    const nightSessions = (seed >> 5) % 12;

    out.push({
      operatorName: callsign,
      missionScore,
      trainingStreak,
      weeklyVolume,
      nightSessions,
      region: country.region,
      countryCode: country.code,
      countryName: country.name,
      locale: 'en',
    });
  }

  // Featured high performers for "Under the Stars" flavor
  out[0] = {
    ...out[0],
    operatorName: 'Night Vector',
    nightSessions: 14,
    missionScore: 91,
    region: 'Asia-Pacific',
    countryCode: 'IN',
    countryName: 'Indian Ocean Sector',
  };

  return out;
}

export function snapshotToEntry(
  snap: LeaderboardSnapshot,
  boardId: import('./types').LeaderboardBoardId,
  opts?: { isYou?: boolean; id?: string; delta?: number }
): LeaderboardEntry {
  const score = (() => {
    switch (boardId) {
      case 'mission-score':
        return snap.missionScore;
      case 'training-streak':
        return snap.trainingStreak;
      case 'weekly-volume':
        return snap.weeklyVolume;
      case 'under-the-stars':
        return snap.nightSessions;
    }
  })();

  return {
    id: opts?.id ?? snap.userId ?? `demo-${snap.operatorName}`,
    operatorName: snap.operatorName,
    score,
    region: snap.region,
    countryCode: snap.countryCode,
    countryName: snap.countryName,
    locale: snap.locale,
    isYou: opts?.isYou,
    delta: opts?.delta,
    userId: snap.userId,
    detail:
      boardId === 'under-the-stars'
        ? `${snap.nightSessions} night ops`
        : `${snap.countryName}`,
  };
}

export function demoEntriesForBoard(
  boardId: import('./types').LeaderboardBoardId
): LeaderboardEntry[] {
  return buildDemoPopulation().map((s, i) =>
    snapshotToEntry(s, boardId, { id: `demo-${i}` })
  );
}
