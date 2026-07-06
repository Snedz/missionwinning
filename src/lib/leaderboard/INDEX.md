# src/lib/leaderboard/

> Leaderboard boards, regional scopes, local stats, and ranking.

## Read order

1. `types.ts` — `LeaderboardBoardId`, `LeaderboardScope`, `LeaderboardEntry`
2. `boards.ts` — board definitions (PFT, volume, etc.)
3. `regions.ts` — geo scopes, scope labels
4. `computeLocalStats.ts` — score from local history / PFT
5. `demoPopulation.ts` — demo filler when sparse
6. `rank.ts` — `buildRankedLeaderboard`, `ClassLeaderboardRow`

## Sync (parent lib)

| File | Role |
|------|------|
| `../leaderboardSync.ts` | Push local snapshot after workout |
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
