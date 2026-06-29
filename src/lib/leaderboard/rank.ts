import type {
  LeaderboardBoardId,
  LeaderboardEntry,
  LeaderboardScope,
  LeaderboardSnapshot,
  RankedLeaderboard,
} from './types';
import { boardById } from './boards';
import { scopeLabel, resolveGeoFromLocale } from './regions';
import { buildDemoPopulation, snapshotToEntry } from './demoPopulation';
import { detailForBoard, scoreForBoard } from './computeLocalStats';

function filterByScope(
  entries: LeaderboardEntry[],
  scope: LeaderboardScope,
  you: LeaderboardSnapshot
): LeaderboardEntry[] {
  if (scope === 'global') return entries;
  if (scope === 'friends') return entries.filter((e) => e.isYou);

  return entries.filter((e) => {
    if (e.isYou) return true;
    switch (scope) {
      case 'regional':
        return e.region === you.region;
      case 'national':
        return e.countryCode === you.countryCode;
      case 'local':
        return e.countryCode === you.countryCode && e.locale === you.locale;
      default:
        return true;
    }
  });
}

function rankEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const sorted = [...entries].sort((a, b) => b.score - a.score || a.operatorName.localeCompare(b.operatorName));
  return sorted.map((e, i) => ({
    ...e,
    rank: i + 1,
    delta: e.delta ?? (hashDelta(e.id) % 7) - 3,
  }));
}

function hashDelta(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function buildRankedLeaderboard(
  boardId: LeaderboardBoardId,
  scope: LeaderboardScope,
  you: LeaderboardSnapshot,
  cloudSnapshots: LeaderboardSnapshot[] = []
): RankedLeaderboard {
  const board = boardById(boardId);
  const geo = resolveGeoFromLocale(you.locale);

  const demo = buildDemoPopulation();
  const cloudEntries = cloudSnapshots
    .filter((s) => s.userId !== you.userId)
    .map((s, i) =>
      snapshotToEntry(s, boardId, {
        id: s.userId ?? `cloud-${i}`,
        delta: 0,
      })
    );

  const demoEntries = demo.map((s, i) => snapshotToEntry(s, boardId, { id: `demo-${i}` }));

  const youEntry: LeaderboardEntry = {
    id: you.userId ?? 'you',
    operatorName: you.operatorName,
    score: scoreForBoard(you, boardId),
    region: you.region,
    countryCode: you.countryCode,
    countryName: you.countryName,
    locale: you.locale,
    isYou: true,
    delta: 0,
    userId: you.userId,
    detail: detailForBoard(you, boardId),
  };

  const merged = new Map<string, LeaderboardEntry>();
  for (const e of [...demoEntries, ...cloudEntries]) {
    if (!merged.has(e.id) || e.score > (merged.get(e.id)?.score ?? 0)) {
      merged.set(e.id, e);
    }
  }
  merged.set(youEntry.id, youEntry);

  let filtered = filterByScope(Array.from(merged.values()), scope, you);

  if (scope === 'friends' && filtered.length <= 1) {
    filtered = [youEntry];
  }

  const ranked = rankEntries(filtered);
  const yourRow = ranked.find((e) => e.isYou);

  return {
    board,
    scope,
    scopeLabel: scopeLabel(scope, geo),
    entries: ranked.slice(0, 100),
    yourRank: yourRow?.rank ?? null,
    totalPlayers: ranked.length,
    updatedAt: new Date().toISOString(),
  };
}
