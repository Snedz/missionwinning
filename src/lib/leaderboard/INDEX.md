# src/lib/leaderboard/

> Leaderboard boards, regional scopes, local stats, and ranking.

## Read order

1. `types.ts` — `LeaderboardBoardId`, `LeaderboardScope`, `LeaderboardEntry`
2. `boards.ts` — board definitions (PFT, volume, etc.)
3. `regions.ts` — geo scopes, scope labels
4. `computeLocalStats.ts` — score from local history / PFT
5. `computeStandingFromLogs.ts` — published standings from synced logs (no client scores)
6. `athleteCalendar.ts` — IANA-zone date/week/hour for the server snapshot
5. `demoPopulation.ts` — demo filler when sparse
6. `rank.ts` — `buildRankedLeaderboard`, `ClassLeaderboardRow`

## Sync (parent lib)

| File | Role |
|------|------|
| `../leaderboardSync.ts` | POST `/api/leaderboard/snapshot` after workout (display fields only) |
| `../leaderboardSnapshotServer.ts` | Service-role upsert of server-computed standings |
| `../schoolClassServer.ts` | Class cloud leaderboard (teacher-gated API) |

## UI consumers

- `LeaderboardPage.tsx` — board picker, scope tabs
- `src/components/leaderboard/*` — table, picker
- `FitnessTestRunner` — PFT tier → score

## Tests

Logic covered via `presidentialFitnessTest.test.ts`, `schoolClass*.test.ts`, and rank helpers.

## Related

- [../INDEX.md](../INDEX.md)
- [../../components/leaderboard/](../../components/leaderboard/) — UI only
