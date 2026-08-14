# Platform contracts

**Audience:** Agents + future module authors  
**Purpose:** Versioned interoperability for Mission OS — so health, identity, economy, and future games/mini-apps share one human without coupling planners to social standing.

| Contract | File | Code anchors |
|----------|------|----------------|
| Habit | [HABIT.md](HABIT.md) | `src/lib/habitWeekCount.ts`, Today `/log` header |
| Identity | [IDENTITY.md](IDENTITY.md) | `packages/mw-core/src/identity/`, `src/lib/identity/`, `/profile` + `/account` |
| Economy | [ECONOMY.md](ECONOMY.md) | `packages/mw-core/src/economy/`, `src/lib/rewards/`, [CLUB_PLAN.md](../CLUB_PLAN.md) · published on `/account/under-the-hood` |
| Module host | [MODULE.md](MODULE.md) | `packages/mw-core/src/module/` |
| AI interop | [AI_INTEROP.md](AI_INTEROP.md) | Domain `INDEX.md` resume cards, coach LLM client |
| Log ↔ Social | (enforced) | `src/lib/domainBoundary.ts` + [IDENTITY_SOCIAL_PLAN.md](../IDENTITY_SOCIAL_PLAN.md) C1–C9 |

**Rule:** Write contracts early; implement product surfaces only when the horizon gate allows. Types in `mw-core` are pure — no I/O.
