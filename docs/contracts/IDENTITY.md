# Contract: Mission Identity

**Version:** 1.0.0  
**Status:** Partially implemented (Athlete Card, display name, Account/You split)  
**Horizon:** Kernel — safe to deepen types anytime; public projection gated (S4)

---

## Purpose

One portable athlete identity across health, club standing, share-out cards, and future mini-apps/games. Identity is **authored locally** and **projected outward only as picks-from-sets + derived numbers** — never as a feed of raw logs.

## Non-goals

- In-app social feed, comments, DMs, Top-8 friend ranking  
- Planner or logger reading rank/points while deciding what to train  
- Free-text fields on any public projection (C5)  
- Profile step in onboarding (C7)

## Identifiers

| Id | Scope | Notes |
|----|--------|--------|
| `deviceId` | Local | Offline athlete; see coach types `DEVICE_ID_KEY` |
| `userId` | Cloud (Supabase auth) | Optional until sign-in |
| Call sign / `operatorName` | Local (+ board when projected) | 24 chars; validated — see `src/lib/identity/displayName.ts` |
| Athlete Card config | Local picks | Frames/backdrops/badges clamped by tier — `mw-core` `resolveCardCosmetics` |

## Surfaces

| Surface | Route / path | Domain |
|---------|--------------|--------|
| Athlete Page (You) | `/profile` | Social (derived) |
| Account settings | `/account` | Admin |
| Athlete Card share | PNG via `shareCard` | Social OUT |
| Leaderboard row | Parkable | Social — name rules only |

## Privacy classes

| Field | Public projection | Share card | Local only |
|-------|-------------------|------------|------------|
| Call sign | When boards/S4 | Yes | Yes |
| Career line (derived) | Optional later | Optional | Yes |
| Badge shelf (owned ids) | Picks only | Picks only | Yes |
| Free-text bio | **Never** | **Never** | Allowed later under C5 |
| Workout log rows | **Never** | Session share is separate deliberate act | Yes |

## Crossing rules

Log domain may **emit** identity-relevant events (workout finished → rewards).  
Log domain may **not read** standing to change plans or set logging.  
Enforced: [`src/lib/domainBoundary.ts`](../../src/lib/domainBoundary.ts).

## Types

Canonical pure types: `@missionwinning/mw-core` → `identity` (`AthleteCardConfig`, tiers, frames).  
Web storage: `src/lib/identity/athleteCard.ts`.

## Agent resume

- **Entry:** `src/lib/identity/INDEX.md`  
- **Do not:** add social imports under `src/lib/coach/` or logger path readers  
- **Tests:** `domainBoundary.test.ts`, `athleteCard*.test.ts`, `displayName.test.ts`
