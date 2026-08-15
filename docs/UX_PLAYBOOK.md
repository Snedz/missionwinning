# UX playbook — the design operating system

**Status: ACTIVE (2026-08-06).** How design work runs at Mission Winning: real problems in, tested surfaces out. This doc owns the **process, the standards, and the problem register**. It points at the owners of everything else: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) (tokens + visual language) · [DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md) (program governance: waves, 8 quality bars, kill criteria) · [DESIGN_RESEARCH.md](DESIGN_RESEARCH.md) (competitor evidence) · [DESIGN_REVIEW.md](DESIGN_REVIEW.md) (audit checklist + dated log) · [ADAPTIVE_LAYOUT.md](ADAPTIVE_LAYOUT.md) (breakpoints + sheet anatomy) · [DESTRUCTIVE_UX.md](DESTRUCTIVE_UX.md) (confirmations) · [JOURNEY.md](JOURNEY.md) (macro journey) · [FLOW_ARCHITECTURE.md](FLOW_ARCHITECTURE.md) (IA floorplan) · [MOBILE_PLAYBOOK.md](MOBILE_PLAYBOOK.md) (native umbrella + the UX laws).

## 0. Answers up front

| Question | Answer |
|----------|--------|
| **Wireframe/mockup, or build the finished app?** | Dual-track. **Existing surfaces are live — treat them as the wireframe** and iterate in code through review waves. **New surfaces** (iOS wedge at gate, redesign waves) go: lo-fi flow spec (§5) → clickable **debug build on a real device** → founder test. High-fidelity static mockups are skipped on purpose. |
| **Do we use Figma?** | **Not as the source of truth.** Design-in-code with enforced tokens (`check-design-system`, `check-token-sync`) + visual e2e baselines beats mock-drift for a solo-founder + agent team: the "mockup" and the product can't diverge if they are the same artifact. Figma stays optional as a founder scratchpad or marketing canvas; anything adopted from it must be re-expressed in tokens/components the same week. |
| **Can the existing web / desktop / mobile experience be redesigned after this?** | **Yes — that is the standing machinery.** "Assume it's just a wireframe" is exactly the posture: current UI is the wireframe, waves ([DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md)) are the redesign vehicle, §11 sequences the surfaces. |
| **Where do the UX laws live?** | [MOBILE_PLAYBOOK.md](MOBILE_PLAYBOOK.md) §6 — the 10-law master table + further principles + verification ladder. Every review wave scores against it. |

## 1. Real problems first

**A login page is not a UX project.** Every design project starts from a register entry: *problem · evidence · hypothesis · metric · owning surface*. No register entry, no project.

Seed register (from shipped evidence — extend, don't reset):

| # | Problem | Evidence | Metric | Owning surface |
|---|---------|----------|--------|----------------|
| P1 | **First-session conversion** — a new athlete must reach a logged set before motivation decays | ≤6-tap budget enforced ([../tests/e2e/first-90.spec.ts](../tests/e2e/first-90.spec.ts)); I-Day finishes *into* a previewed session, no Today detour | I-Day completion ≥80% · first workout ≤24h ≥50% ([JOURNEY.md](JOURNEY.md) §Success metrics) | `/welcome` → `/active` |
| P2 | **Re-entry after a lapse, without shame** — a missed week must read as "behind you", never as debt | [../src/lib/reentry.ts](../src/lib/reentry.ts); red missed-day calendar marks refused in three separate design waves | Return-after-7-day-gap rate (instrument at invites) | Today |
| P3 | **Sync trust on gym wifi** — "losing a workout is not an option" | Durable outbox (never-drop, dead-letter + retry); Android `SyncMergeRules`; outbox status surfaced on Account | Zero lost-workout reports; stuck-op count | Logger + Account |
| P4 | **Coach adoption + comprehension** — athletes must understand *why* the plan changed | Coach invite mounts at sessions 1–3; adapt banner capped at 3 beats; victory prefers Coach for first 3 workouts | Coach plan generation rate · adapt-banner comprehension (walk test) | `/coach` + Today |
| P5 | **Premium clarity without gating** — the free logger is never paywalled, and the paid line must still be obvious | Hard rule 2; `Surface` union cannot express "logger off"; premium decided server-side only | Conversion without a single logger-gate complaint | Account / Bundle |

Confusing checkout, poor onboarding, messy dashboards — when one of these shows up in evidence (reviews, walks, funnels), it enters the register the same way.

## 2. The UX process (seven steps, mapped to this repo)

| Step | What it means here | Artifact |
|------|--------------------|----------|
| 1. Define the problem | Register entry (§1) | Problem row + short brief |
| 2. Research users | §3 tracks — competitor evidence, review mining, walks, telemetry when live | Wave section in [DESIGN_RESEARCH.md](DESIGN_RESEARCH.md) |
| 3. Map journeys | Macro journey is owned by [JOURNEY.md](JOURNEY.md) (I-Day → Basic → Readiness → Commissioned); per-problem maps live in the problem brief | Journey slice w/ emotion beats (Composure → Focus → Honor → Clarity) |
| 4. Create flows | Flow spec per §4 — all five paths, every screen's one action | Flow-spec table |
| 5. Wireframe | Lo-fi per §5 — structure only, tokens forbidden from debate | Markdown boxes or Compose/SwiftUI preview stub |
| 6. Prototype | **A debug build on a real device.** The prototype is the app skeleton, not a click-through | Installable build + walkthrough notes |
| 7. Test + improve | Founder device walks (the `FOUNDER_ACCEPT` scripts double as usability scripts), first-invitee sessions when invites open, e2e budgets; close with the §10 ritual | DESIGN_REVIEW log entry + register update |

## 3. Research program

Honest posture: **pre-launch, `PRIVATE_MODE` on, no user cohort yet** — so no invented "user interviews". Four tracks, strongest evidence first:

| Track | Source | Cadence |
|-------|--------|---------|
| **A — Competitor / market** | [DESIGN_RESEARCH.md](DESIGN_RESEARCH.md) waves: steal/avoid + MW gap + register updates. Wave 8 covers the coach-platform category (Trainerize, TrueCoach, Everfit) + adaptive consumer apps (Fitbod, Runna, Ladder…), **app-store review mining as the user-complaint / drop-off proxy**, pricing models, onboarding patterns, positioning angles, feature gaps | Per wave |
| **B — Own telemetry** | The moment invites open: I-Day completion funnel, first-workout-24h, week-4 wall ([POST_LAUNCH_CADENCE.md](POST_LAUNCH_CADENCE.md)). Metrics are already named; instrumenting the funnel is a listed code work item | Weekly once live |
| **C — Moderated walks** | Founder + first testers on device; [../apps/android/FOUNDER_ACCEPT.md](../apps/android/FOUNDER_ACCEPT.md) walk scripts double as usability scripts; note where the walker hesitates, not just where they fail | Per accept + per wave |
| **D — Heuristic audits** | Our own surfaces scored against [MOBILE_PLAYBOOK.md](MOBILE_PLAYBOOK.md) §6 laws + the 8 quality bars | Per wave |

Synthesis standard: every wave lands as **steal/avoid tables + "MW gap" lines + problem-register updates** — the existing DESIGN_RESEARCH format. An insight that names no register entry and no gap is trivia, not research.

## 4. Flow-spec standard

Every flow documents **five paths** before build:

| Path | Must answer | Existing enforcement |
|------|-------------|----------------------|
| Happy | Entry → exit in minimum taps; the one primary action per screen | first-90 tap budget (`@gate` e2e) |
| Alternate | Skips, backs, resumes, offline entry — every sanctioned detour | I-Day steps all skippable; resume flows |
| Error | What failed, what the athlete sees, what retries silently | Outbox absorbs sync errors; opaque API errors |
| Empty | Zero-data render: reason + one CTA, never a void | [../tests/e2e/zero-state.spec.ts](../tests/e2e/zero-state.spec.ts) |
| Success | The completion beat and the single next action | Victory strip; `pickVictoryNextAction` |

Template (copy per flow): `Flow: <name> · Register: P<n>` then one row per path: *path · entry · screens (each with its one action) · exit · notes*.

## 5. Wireframe + component-state standard

**Lo-fi means structure, not style:** markdown flow spec + labeled boxes, or a Compose/SwiftUI preview stub with placeholder content. Tokens are settled law ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)) — a wireframe review debates placement and hierarchy, never palette. No high-fidelity static mockups: fidelity comes from the debug build.

**Every interactive component documents 8 states:**

| State | Rule |
|-------|------|
| Default | Tokens only; flush-left labels on actions |
| Hover | **Desktop surface only** — the compact app is touch-first (two-designs rule, §7) |
| Focus | The one global `:focus-visible` (2px ring, offset 2) — never per-component rings; `.primary-action` uses its documented 3px ink override |
| Active / pressed | Press feedback on every tappable surface (`.pressable-card`, active scale); Android ripple; reduce-motion respected |
| Disabled | Visibly inert, still ≥44px/48dp; never removes layout space (no shift) |
| Loading | Skeletons + `tabular-nums` reserve exact space — zero layout shift; spinners only inside the control that was pressed |
| Error | Inline, plain words, next step included; destructive confirmation = hold-to-confirm ([DESTRUCTIVE_UX.md](DESTRUCTIVE_UX.md)) |
| Success | Quiet inline confirmation; the *big* success beat belongs to Victory, not to every button |

Anchors that already implement this: `.primary-action` spec, `EmptyState`, `OnlineStatusBanner` / Android `MwOfflinePill`, sheet anatomy in [ADAPTIVE_LAYOUT.md](ADAPTIVE_LAYOUT.md) (85–88% max height, pinned footer holding **one** primary action).

## 6. Content + data rules

- **Voice:** field manual — plain words, sentence case, no hype, no exclamation theater. Strings live in `src/i18n/*Locales.ts` only; native chrome keeps its 4-locale split; `ar` is RTL on web.
- **Realistic content is mandatory in specs:** longest catalog exercise names, 3-digit weights, kg **and** lb, superset labels, a 7-day-stale re-entry state. A spec that only shows "Bench Press 60kg" hides its own bugs.
- **Truncation:** one line + ellipsis for names in rows (full name in the sheet/detail); never truncate numbers — reflow instead; tab labels fit ~10ch at the 78px slot or get a shorter label (`TAB_LABEL_OVERRIDES` pattern).
- **Dates + numbers:** calendar dates only via `localDateKey` (`src/lib/time/localDate.ts`) — never `toISOString()` (shipped defect east of UTC); all metrics `tabular-nums`; units always attached (kg/lb, min, ISO week for telemetry).
- **Missing data renders an em-dash, never a zero** — `ScoreNumeral` rule: "a 0 reads as failure on day one". Below-measurement states say what unlocks them ("Needs 3 sessions").
- **Long values:** design for the 99th percentile (a 40-char custom exercise, a 4-digit volume); wrap labels, never controls.

## 7. Responsive + adaptive rules

- **The two-designs rule:** compact ≤767px **is** the product; desktop is a *different design*, not a reflow. `useIsCompact` chooses a branch — never render both and hide one. Desktop e2e runs only `surface-split.spec.ts`; review on 390×844 first.
- Breakpoints, stacking, size classes, sheet anatomy → [ADAPTIVE_LAYOUT.md](ADAPTIVE_LAYOUT.md) (owner). Android: `MwWindowSize` classes + landscape compaction.
- **Chrome is in flow:** the tab bar and the screen dock reserve their own height (`pb-[env(safe-area-inset-bottom)]`) — nothing overlaps content, ever.
- Floors: 44px web · 48dp Android · 44pt iOS. Min/max widths and fixed elements are per-surface decisions recorded in that surface's handoff notes.

## 8. Interaction-spec standard

A static screen is an incomplete spec. Every interaction spec documents:

| Aspect | Rule |
|--------|------|
| Tap/click actions | Each control's action + destination; one primary per screen |
| Transitions | 150ms press · 200–250ms state change · 300–450ms entrance; `ease-out`/`ease-in-out`; opacity/transform only; **no spring in-app**; one entrance stagger per screen |
| Keyboard + screen readers | Web: global focus ring, logical order, axe-tested (incl. sheets *open*). Android: TalkBack on primaries. iOS: VoiceOver at gate |
| Sticky / docked | Dock behavior is exclusive (rest dock takes over the log console — never both); document what takes over and when |
| Confirmations | Destructive = hold-to-confirm + DangerZone geography ([DESTRUCTIVE_UX.md](DESTRUCTIVE_UX.md)); never a routine "are you sure?" on reversible actions |
| Time-based feedback | Rest timer (auto-start, ±15s, never a blocking modal); `score-tick` 400ms; session-lock beat |
| Haptics | Earned moments only: session lock, PR. Never on every tap |

Rule: **if behavior isn't obvious from the spec, attach a debug-build walkthrough or an explicit behavior note.** Drag-and-drop, swipe affordances, and multi-step gestures always get a note.

## 9. Assets + handoff references

| Resource | Home |
|----------|------|
| Color + motion tokens | `src/index.css` `:root` (web) · `MwColors.kt` / `MwMotion.kt` (Android) · planned `packages/mw-core/tokens/brand.json` single source ([MOBILE_PLAYBOOK.md](MOBILE_PLAYBOOK.md) §5) |
| Type styles | Archivo scale + `.display-*` classes ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)) · Android `Type.kt` |
| Icons | lucide on web (no emoji as UI); committed vectors on Android |
| Illustration / mascot | Kalligator, sparingly — social · one empty state · Victory only, never mascot spam ([MASCOT.md](MASCOT.md)) |
| Fonts | Committed files (web Archivo; Android TTFs under `core/designsystem/res/font/`) |
| Reusable components | `src/components/*` folder INDEX files; Android debug `DesignSystemGalleryScreen` |
| Export formats | webp for raster; SVG/vector-first; no new binary formats without need |

**Reuse before create.** A new component must name the existing one it extends or state why none fits — same rule as code.

## 10. Design org + standing ritual

- **Principal designer** = the orchestrating agent session; **founder** = accept authority (device walks, FOUNDER_ACCEPT — never delegated).
- The agent bench, by altitude: **lead** = research/audit agents that frame problems and evidence · **senior** = flow + wireframe drafters and build agents inside the existing eng lanes · **mid/junior** = teardown collectors, review miners, consistency checkers · **critique panel** = design-review agents scoring against the §6 laws + 8 quality bars. Multi-round campaigns run under [GAUNTLET_LOOP.md](GAUNTLET_LOOP.md). Lanes and gates in [../ORCHESTRATION.md](../ORCHESTRATION.md) always win.
- `.claude/skills/` tooling may support design work (repo rule: design/marketing/SEO tooling only — never app architecture).
- **Standing ritual:** every wave closes by answering, in one short block appended to [DESIGN_REVIEW.md](DESIGN_REVIEW.md)'s dated log: **how do we design better · think better · communicate better · create more impact** — plus the one thing the next wave does differently.

## 11. Redesign track

Order of surfaces once Wave 8 + a register review land (current UI = the wireframe; every wave must pass the 8 quality bars + the §6 laws):

1. **Web mobile app** (the product surface) — wave-sized passes per screen, hero flows first.
2. **Desktop app** — its own design per the surface split; never the mobile app reflowed.
3. **Marketing** — landing + SEO surfaces (own handoff scope).
4. **Android Modernist rebrand** — founder-gated program, after web settles, never before Accept B ([MOBILE_PLAYBOOK.md](MOBILE_PLAYBOOK.md) §5).
5. **iOS** — no redesign ever needed if it ships Modernist from day one at its gate.

## 12. Documentation map

| Record | Home |
|--------|------|
| Problem register + UX standards | **this doc** |
| UX decisions + wave critiques | [DESIGN_REVIEW.md](DESIGN_REVIEW.md) dated log |
| Assumptions under audit | [REDTEAM.md](REDTEAM.md) |
| Feature specs | Per-PR Issue + the §4 flow spec |
| Research insights | [DESIGN_RESEARCH.md](DESIGN_RESEARCH.md) |
| Status ("where we are") | [../CONTEXT.md](../CONTEXT.md) `## Now` (the only such block) |
| Ship history | [../LOG.md](../LOG.md) |

Changelog: `2026-08-06 — created (founder ask: UX process, standards, research program, Figma stance, redesign track).`
