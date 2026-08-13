## 2026-08-12 — Demote six-pillar chrome until first workout (`.695`)

MatrAIx N=5 / Kaizen F-004: I-Day and early Basic still painted a six-item First
Steps wall (Fuel · Mind · Move · Learn · PAR-Q beside the first log) and the More
sheet / desktop rail always showed the Pillars tier. That is the options-before-start
wall ORCHESTRATION C5 (≤90s) forbids — not a missing feature.

**Ship (progressive disclosure, one concern):**
- `getFirstSteps` — before `basic.workout`, checklist is **workout only**; session2
  + optional pillars return after the first log (same gate as Basic Training /
  `allBasicDone`).
- `moreSheetTiersForNav` / `railGroupsForNav` — drop `pillars` when
  `hasFirstWorkout: false`; MoreSheet + Sidebar pass `workoutHistory.length > 0`
  (the signal `detectBasicMilestones` already uses). No AppLayout/shell redesign,
  no landing rewrite, no new pillar chrome.
- **Hevy acceptance:** I-Day finish lands on **Today (`/log`)** with one
  JourneyHero Start (no auto-started Active dump). Resume `/active` only when
  `hasLoggedWork`. first-90 / hero-flows updated (Still ≤6 taps).
- Guards: `firstSteps.test.ts` + `moreSheetTiers.test.ts` + `pillarChromeGate.test.ts`
  (pure demotion + wiring + Welcome→`/log` source-scan).

Label `.695` (rebases onto master `.694` / #475 F-003). Excellence-Override below.

Excellence-Override: demote six-pillar until first workout (F-004 C5≤90s)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-666-for-695.md](docs/archive/log/LOG-rotate-666-for-695.md). · [`.694` for `.753`](docs/archive/log/LOG-rotate-694-for-753.md).
