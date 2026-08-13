# src/lib/identity/

> One concern: Mission Identity on the web — call sign, Athlete Card storage, Mission ID display, and share data. Pure card rules live in `packages/mw-core/src/identity/`. Mission ID mint is server-side (`missionIdServer.ts`).

## Agent resume card

- **Purpose:** Athlete Page identity (You), card cosmetics, display-name validation, Mission ID display — social **projection**, not log authority.
- **Non-goals:** Feeds, DMs, Top-8, planner reads of rank or Mission ID, free-text on public cards, client mint of Mission ID.
- **Entry files:** `displayName.ts`, `athleteCard.ts`, `missionId.ts` · core: `packages/mw-core/src/identity/` · server mint: `src/lib/missionIdServer.ts`
- **Tests to run:** `src/lib/identity/*.test.ts`, `src/lib/missionIdServer.routetest.ts`, `src/lib/careerLine.test.ts`, `src/lib/domainBoundary.test.ts`
- **Forbidden:** Importing this module from `src/lib/coach/` for planning decisions; gating the free logger on identity; writing `mission_ids` from the client.
- **Horizon gate:** S2–S4a shipped (table, kits, page share-out, private note). Public URL = S4b + Club C2. Mission ID `.732` is signed-in display only.
- **Upstream contracts:** [docs/contracts/IDENTITY.md](../../../docs/contracts/IDENTITY.md), [docs/IDENTITY_SOCIAL_PLAN.md](../../../docs/IDENTITY_SOCIAL_PLAN.md), domain boundary C1–C7.
- **Downstream consumers:** `ProfilePage`, `AccountPage`, share card painters, leaderboard name field.

## Read order

1. `displayName.ts` — call sign rules  
2. `packages/mw-core/src/identity/athleteCard.ts` — tier → cosmetics · 00–99 number clamp  
3. `athleteCard.ts` — localStorage + `ShareCardData` builder · `ATHLETE_CARD_CHANGED`  
4. `missionId.ts` — Mission ID display + founder-is-1 claim *decision* (server executes)  
5. `packages/mw-core/src/identity/athleteTable.ts` · `pageKits.ts` · `athleteProfile.ts`  
6. `athleteProfile.ts` (web) — page storage · `pageKitsContract.test.ts` (C6)  
7. `src/lib/careerLine.ts` — The line + signature counts  

## Related

| Path | Role |
|------|------|
| `/profile` | Athlete Page |
| `/account` | Settings (was old profile) |
| `src/lib/careerLine.ts` | The line + signature (derived totals) |
| `src/lib/rewards/` | Badges / XP shelf |
| `src/lib/domainBoundary.ts` | Log ↔ Social contracts |
| `GET /api/account/mission-id` | Server claim — GET only |
