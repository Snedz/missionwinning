## 2026-08-09 — You S2.5: the page that looks like yours (`.620`)

**S2.5 of [IDENTITY_SOCIAL_PLAN.md](docs/IDENTITY_SOCIAL_PLAN.md)** — composition, not kits. `/profile` still had the inventory of identity (call sign · career line · card · shelf) as four settings-shaped cards; MySpace's magic is an *authored page*, and inventory is not authorship.

**Shipped:** first-viewport **hero** (display name + optional **00–99** call-sign number + derived **signature** from the career line) · live Athlete Card preview strip · number on the share PNG title (`07  Name`) · clamp never invents or paints out-of-range numbers · `ATHLETE_CARD_CHANGED` keeps identity editor and card editor in step · still **0 red actions** on `/profile` (Save outline).

**Not shipped (still gated):** interests table · page kits (S3 + C6 + design proposal 3) · public projection (S4 + CLUB C2) · squad (S5).

**Why the number is not tier-gated.** CLUB_PLAN's Athlete Card already specs 00–99 as identity gear; locking it behind rank would make first-session athletes look like account leftovers again. Frames/backdrops stay tier-clamped.

**Guards:** `clampCallSignNumber` · `formatAthleteCardTitle` · `careerSignature` (counts only — never rank/XP) · share-title tests for forged 100. Tests +2302 suite green on touched modules.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-620.md](docs/archive/log/LOG-rotate-620.md).
