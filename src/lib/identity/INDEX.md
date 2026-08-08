# src/lib/identity/

> One concern: Mission Identity on the web — call sign, Athlete Card storage, and share data. Pure rules live in `packages/mw-core/src/identity/`.

## Agent resume card

- **Purpose:** Athlete Page identity (You), card cosmetics, display-name validation — social **projection**, not log authority.
- **Non-goals:** Feeds, DMs, Top-8, planner reads of rank, free-text on public cards.
- **Entry files:** `displayName.ts`, `athleteCard.ts` · core: `packages/mw-core/src/identity/athleteCard.ts`
- **Tests to run:** `src/lib/identity/*.test.ts`, `src/lib/domainBoundary.test.ts`
- **Forbidden:** Importing this module from `src/lib/coach/` for planning decisions; gating the free logger on identity.
- **Horizon gate:** S2 shipped (Account/You). S3 page kits / table need founder go. Public projection = S4 + Club C2.
- **Upstream contracts:** [docs/contracts/IDENTITY.md](../../../docs/contracts/IDENTITY.md), [docs/IDENTITY_SOCIAL_PLAN.md](../../../docs/IDENTITY_SOCIAL_PLAN.md), domain boundary C1–C7.
- **Downstream consumers:** `ProfilePage`, share card painters, leaderboard name field.

## Read order

1. `displayName.ts` — call sign rules  
2. `packages/mw-core/src/identity/athleteCard.ts` — tier → cosmetics  
3. `athleteCard.ts` — localStorage + `ShareCardData` builder  

## Related

| Path | Role |
|------|------|
| `/profile` | Athlete Page |
| `/account` | Settings (was old profile) |
| `src/lib/careerLine.ts` | The line (derived totals) |
| `src/lib/rewards/` | Badges / XP shelf |
| `src/lib/domainBoundary.ts` | Log ↔ Social contracts |
