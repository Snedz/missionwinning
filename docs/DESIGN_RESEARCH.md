# Design research — Mission Winning

**Date:** 2026-07-10  
**Purpose:** Competitive steal/avoid matrices + MW gap analysis before the visual system refresh and surface rebuilds.  
**Companions:** [UX_UNIFIED_PLAN.md](../UX_UNIFIED_PLAN.md) · [ROADMAP_V4_EXPERIENCE.md](archive/ROADMAP_V4_EXPERIENCE.md) · [STRATEGY.md](STRATEGY.md) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)

**Brand lock:** Dark navy canvas · emerald = action · brass = honor/PR/rank. Steal structure and behavior — never competitor palettes (Hevy blue, WHOOP violet).

---

## 1. Pattern library

### Hero (marketing)
- Dark full-bleed brand field; **real product UI** in the first viewport
- Budget: brand · one headline · one supporting line · one CTA group · one product proof
- Proof (metric or short quote) **adjacent to CTA**, not three scrolls down

### Nav / shell
- Mobile: 5 primary tabs + intentional depth drawer (not junk)
- Glass chrome OK for overlays; content stays solid cards
- Thumb targets ≥44px; active state = emerald, not rainbow

### Rings / metrics
- Hierarchy: readiness/recovery first, then strain/load — not equal KPI soup
- Clinical tone: score + one coach line; tabular nums
- Differentiate from WHOOP trade dress (no clone of their 3-ring coaching box)

### Logger (Train)
- Set table as the atom: SET · PREV · weight · reps · ✓
- Tabular nums; completed row emerald wash; PR = brass chip
- Rest: auto-start pill or slim bar; ±15s; never a blocking modal

### Empty states
- Reason + one CTA + quiet visual — never “No data” void or mascot spam

### Paywall / Bundle
- Soft paywall after first win; under-promise depth (REDTEAM)
- Founders offer clear; proof near CTA

### SEO article
- Shared public header/footer; CTA → `/welcome`; readable without app chrome

---

## 2. Competitor matrices

### Hevy / Strong — set logger

| STEAL | AVOID |
|-------|--------|
| Flat set table; tabular nums | Card-per-set chrome |
| Emerald wash on completed rows | Rainbow set types / confetti |
| Rest pill auto-start; ±15s | Modal timer blocking log |
| PR = gold/brass chip + haptic | Competitor blue “record” badges |

**MW gap:** [`ActiveWorkoutPage.tsx`](../src/page-components/ActiveWorkoutPage.tsx) logger is strong; empty state is bespoke (not `EmptyState`); PR toast uses ad-hoc `fitness-gold`; rest chrome can match Hevy-grade clarity without rewriting set math.

### WHOOP / Bevel — metric home

| STEAL | AVOID |
|-------|--------|
| Metric-first hierarchy | Equal-weight dashboard grid |
| Clinical rings + one insight line | Streak flames, XP, loot |
| Glanceable status | Cloning WHOOP layout |

**MW gap:** Today already has Mission Score + rings ([`TodayDashboardHeader`](../src/components/today/TodayDashboardHeader.tsx)); competing CTAs remain (JOURNEY F2); `ScoreRing` vs `MetricRing` diverge visually from Fuel.

### Freeletics — one CTA + onboarding

| STEAL | AVOID |
|-------|--------|
| One Start for today’s session | Explore/library competing above fold |
| Session meta under CTA | Empty Start with no preview |
| Credible I-Day → plan beat | Instant paywall before value |

**MW gap:** [`JourneyHero`](../src/components/journey/JourneyHero.tsx) is the right pattern; Welcome still uses generic Card UI vs briefing type; Landing subtitle still leads with “everything app” (STRATEGY: lead with tracker).

### Nike Training Club — discovery polish

| STEAL | AVOID |
|-------|--------|
| Approachable class/card discovery | Replacing logger with video-first IA |
| Clear session preview | Feature icon grids as hero |

**MW gap:** Learn/Move presentation can borrow card polish; Train stays table-first.

### Linear / Arc — density & empties

| STEAL | AVOID |
|-------|--------|
| Interaction-dense, visually sparse | Dashboard wallpaper of cards |
| Designed empty = reason + CTA | Gray void |
| Match chrome weight to task | Same card treatment everywhere |

**MW gap:** Fuel stacks many `content-card`s; EmptyState not on Active/Coach/Leaderboard; unused `.score-tick` in CSS.

### Wellness landings (CRO)

| STEAL | AVOID |
|-------|--------|
| Product-in-hero; low-friction CTA | Stock athlete + abstract blobs |
| Proof beside CTA | Stat strips in viewport 1 |
| Dark sensory brand | Cream/serif/terracotta AI defaults |

**MW gap:** Landing has `HeroDemo` (good); hero copy still “everything app” first; Bundle/Compare sit in AppLayout (marketing feel drop).

---

## 3. Non-negotiable MW differentiators

Per [`STRATEGY.md`](STRATEGY.md):

1. **Lead with the free workout tracker** — offline, no account, no store
2. Six pillars + Win Score are the **second sentence**, not the first
3. Premium adds depth; never gates core logging
4. Signature UX: **command-briefing Today** (mono eyebrow → display → one emerald CTA) — not a generic dashboard

---

## 4. Aesthetic direction (one-pager)

| Role | Choice |
|------|--------|
| Canvas | Near-black navy `hsl(222 24% 5%)` |
| Action | Emerald `hsl(158 64% 42%)` |
| Honor | Brass `hsl(42 48% 58%)` |
| Warn / info | Named tokens `--status-warn`, `--status-info` (not random amber/blue skins) |
| Display | Barlow Condensed (`font-display`) |
| Body | Inter (`font-sans`) |
| Telemetry | IBM Plex Mono (`font-mono` / `.eyebrow`) |
| Signature | Mission briefing: eyebrow → display title → one primary CTA; brass only when earned |

**Avoid:** cream+serif+terracotta, purple glow, broadsheet hairlines, competitor blue/violet identity.

---

## 5. Rebuild priority (from research)

1. System: one header, one ring, status tokens, EmptyState rollout  
2. P0: Landing → Welcome → Today → chrome → Active polish → Bundle  
3. P1: SEO public chrome + Fuel/You/Track/Builder/Library/Coach  
4. P2: secondary pillars + info pages (tokens only)

---

## 6. Wave 2 competitors (2026-07-10)

| App | What they nail | Steal for MW | Avoid |
|-----|----------------|--------------|-------|
| **[RepStack](https://rep-stack.com/)** | Exact next weight/reps from last session; one-tap fill; Strength Score; recovery heatmap; offline/no-account | Auto **next-set targets** + one-tap apply on `/active`; surface e1RM/prev more prominently | Copy Strength Score branding; Pro paywall on core logging |
| **[IntervalCoach](https://www.intervalcoach.app/en)** | Daily briefing = readiness + coach note + today’s session; post-workout analysis | Tighten Today into a true **daily briefing**; Victory “what changed” strip | Wearable/HRV dependency; Coach+ chat as v1 |
| **[0xCal](https://0xcal.app/)** | Chat/NL meal log; photo; dark minimal; one job | **Natural-language quick log** on Fuel; densify above-fold to one boss action | Full chat AI product; Apple-only widgets |
| **[Bevel](https://www.bevel.health/)** | Metric-first home; Strain/Sleep/Recovery hierarchy; liquid polish | Keep Mission Score + rings clinical; reduce card wallpaper | Clone WHOOP/Bevel ring layout trade dress |
| **Freeletics Super Bundle** | One next-workout CTA; partner-app depth story | MW advantage: **pillars in one app** — Bundle copy louder; Landing tracker-first | Multi-app email unlock UX |
| **CrossFit / Daily WOD / EVOX** | Glanceable timers; auto-save results; benchmark history | Oversized rest clock; glanceable Victory summary | OCR whiteboard (later) |
| **Hevy / Strong** (prior) | Set table, rest pill, PR gold | Finish rest-pill polish + emerald completed-row wash | Hevy blue |

### Wave 2 MW gaps (cite)

| Gap | Path |
|-----|------|
| Today competing CTAs (JOURNEY F2) | [`HomePage.tsx`](../src/page-components/HomePage.tsx) |
| Train missing auto next-set targets | [`ActiveWorkoutPage.tsx`](../src/page-components/ActiveWorkoutPage.tsx), [`SetLogRow.tsx`](../src/components/workout/SetLogRow.tsx) |
| Fuel card stack density | [`NutritionPage.tsx`](../src/page-components/NutritionPage.tsx) |
| Landing proof weak vs CRO | [`LandingPage.tsx`](../src/page-components/LandingPage.tsx) |
| Bundle checkout-dense; under-sell one-app vs multi-app | [`BundlePage.tsx`](../src/page-components/BundlePage.tsx) |

### Wave 2 ship order

1. UI polish: Today one-CTA · Train wash/rest · Fuel density · Landing/Bundle copy  
2. Feature: next-set targets (RepStack)  
3. Feature: NL meal log (0xCal-lite)  
4. Feature: daily briefing densification + Victory body-score delta  

---

## 7. Wave 3 — Forge Fitness (2026-07-10)

Source: [forgefitnessapp.com](https://forgefitnessapp.com/) — FORGE Workout OS (iPhone beta; BYOK AI).

| Forge nails | Steal for MW | Avoid |
|-------------|--------------|-------|
| **Just Go** — one tap builds today’s workout | Free **rule-based** Just Go from readiness + starters / coach session (no API key) | BYOK Claude/ChatGPT/Gemini; Pro-only generation |
| Double progression auto-fills next weights | **Auto-seed** empty set inputs from `nextSetTargets` (Apply optional) | Paywall progression (Forge Pro) |
| Today: muscle chips “CHEST 5d · REC” + score + Just Go | Above-fold **muscle freshness strip** (data already in readiness) | Clone FORGE Score branding / violet UI |
| Trophy PR banners | **Brass PR chip** on completed set row + haptic | Confetti / Hevy blue |
| Meal tracker: cal left, macro bars, saved meals, NL | **Cal left + denser bars**; **saved meal presets** | Full camera AI scan; supplement TAKE ALL domain |
| Post-workout insight cards | Victory **progression line** + existing body delta | Wearable HRV insights |
| “0 data on our servers” / privacy | Marketing: offline-first **without** requiring an AI key | Claiming we never use cloud when signed-in sync exists |
| Free vs Pro gates rest/PRs/timer | Keep rest, PRs, targets, Just Go **free forever** | Forge’s free-tier gutting |

### Wave 3 MW gaps (cite)

| Gap | Path |
|-----|------|
| Just Go missing as primary CTA path | [`JourneyHero.tsx`](../src/components/journey/JourneyHero.tsx), [`HomePage.tsx`](../src/page-components/HomePage.tsx) |
| Targets require Apply | [`ActiveWorkoutPage.tsx`](../src/page-components/ActiveWorkoutPage.tsx) |
| Muscle freshness buried in accordion Progress | [`TodayProgressSection.tsx`](../src/components/today/TodayProgressSection.tsx) |
| No saved meals | [`NutritionPage.tsx`](../src/page-components/NutritionPage.tsx), [`nutritionQuickLog.ts`](../src/lib/nutritionQuickLog.ts) |
| PR = toast only | [`SetLogRow.tsx`](../src/components/workout/SetLogRow.tsx) |

### Wave 3 ship order

1. Research § Forge  
2. Just Go rule session + Today wire  
3. Auto-seed targets + PR chip  
4. Muscle freshness strip  
5. Fuel cal-left + saved meals  
6. Victory insight + Landing/Compare proof  

---

## Wave 4 — Inspire + volume (2026-07-10)

**Thesis:** Landing is cinematic; Welcome/Bundle/Compare and ~160 thin exercise pages were not. Highest leverage is **volume on URLs you already own** + **inspire the conversion path** (Landing → Welcome → Just Go → Victory) — not a website teardown. Keep `app/(app)/` → page-components, Zustand logger, Mission Coach, tokens. Build `2026.07-unified.52`. Do not flip `PRIVATE_MODE`.

### Volume (acquisition)

| Ship | Notes |
|------|--------|
| Internal link mesh | Related exercises + guide links on public exercise/chapter pages; CTA → `/welcome` |
| Top-50 enrichment | `exercisePublicEnrichment.ts` — cues / alternatives / form tips for compounds |
| Muscle / equipment hubs | `/exercises/muscle/*`, `/exercises/equipment/*` + sitemap |
| Public Learn teasers | `/paths` + `/paths/[id]` (10 paths; in-app `/learn` unchanged) |
| Compare stories | `/compare/forge`, `/compare/freeletics`, `/compare/spreadsheet` |

### Inspire (conversion)

| Ship | Notes |
|------|--------|
| Welcome cinematic | Briefing typography, atmosphere, Today/Just Go preview — not card-wizard |
| Bundle story scroll | Six pillars narrative **before** plan tabs (REDTEAM under-promise) |
| Landing / Compare CRO | Tracker-first + 217-page library line; proof chips + story links |

### Delight (retention)

| Ship | Notes |
|------|--------|
| Library sparkline | Real volume series from `workoutHistory` in detail sheet |
| History mission story | Briefing header + empty → Today |
| Today motion | `ring-draw-in` + `score-tick` + `animateCount` (reduced-motion safe) |
| Builder chips | Category chips on template pick |
| EmptyState audit | History/Train invitation CTAs |

### Explicit do-not

Teardown · PRIVATE_MODE flip · BYOK AI · gate Just Go/rest/PRs · mass i18n · video as primary

---

## Wave 5 — Integrity + density (2026-07-10)

**Thesis:** After Wave 4 volume, the product must be *trustworthy to tap* and *scannable*. Fix dead CTAs first; then collapse + search the longest lists. Reuse `TodaySection` / `<details>` and `filterExercises`. No cmdk. Build `2026.07-unified.53`. Do not flip `PRIVATE_MODE`.

### Integrity

| Ship | Notes |
|------|--------|
| Library alternatives | Open alt exercise in sheet (not `/library` reload) |
| Mind EmptyState | CTA scrolls to guided sessions |
| Public practice CTAs | Guarded deep-links remap to `/welcome` or `/exercises` |
| Path teaser copy | “Start free — Begin I-Day” |
| Footer `/paths` | PublicSeoFooter + Landing |
| e2e | Compare/paths/exercise public CTA smoke |

### Density + search

| Ship | Notes |
|------|--------|
| Builder | Collapsed program sessions; template search; saved truncate; `ExercisePicker` |
| Active | Searchable add/swap picker |
| History | Name search + 7/30/All; trends accordion; compact rows |
| Fuel | Meal-group accordion; recipe expand-on-tap |
| Library | Filter sheet + all muscles; active pills; shared `FilterChip` |
| Learn | Default collapsed + path search |
| Move / Mind | Premium preview collapsed for free users |

### Explicit do-not

Teardown · PRIVATE_MODE · cmdk · virtualize entire Library · gate free tracker

---

## Wave 6 — TrainHeroic athlete inspiration (2026-07-19)

Source: [trainheroic.com/athlete](https://www.trainheroic.com/athlete/) + coach platform marketing.  
**Thesis:** Steal gym-floor clarity and personal % programming. Do **not** build coach SaaS (teams, marketplace, messaging). Horizon 0: one thin slice now; Wave A/B after public gate.

### Steal / avoid

| Steal | Avoid |
|-------|--------|
| % of working max → auto weight on the set row | Cloning TH blue / lime marketing identity |
| Session intent line above the logger | Coach command-center / team boards |
| In-session cues without leaving the set (extend form guide) | Video-first IA that buries the set table |
| AMRAP / EMOM modes on the existing rest chrome | New timer product surface |
| Cumulative tonnage milestone on Victory / History | “Millionaire club” copy/branding |
| Soft reschedule on Coach week strip | Full calendar product / team calendars |
| Personal % + RPE prescriptions on Coach / Builder | Multi-athlete scaling / marketplace |

### Now (shipped thin slice)

| Ship | Path |
|------|------|
| `loadPct` on Coach `PlanExercise` + Active chip | [`percentLoad.ts`](../src/lib/workout/percentLoad.ts), [`progression.ts`](../src/lib/coach/progression.ts), [`ActiveExerciseCard.tsx`](../src/components/workout/ActiveExerciseCard.tsx) |

### Post-launch Wave A — athlete gym UX

1. Session brief (intent + note) at top of Active  
2. In-logger form-cue peek for unfamiliar exercises  
3. AMRAP / EMOM on `RestTimerBar`  
4. Tonnage milestone on Victory / History (MW voice)  
5. Soft reschedule on Coach `WeekStrip`

### Post-launch Wave B — personal programming depth

1. `rpeTarget` on `PlanExercise`  
2. Multi-week % waves (3–4 week personal block)  
3. Builder templates store `loadPct` + resolve at start

---

## Wave 7 — Design Excellence OS synthesis (2026-07-22)

**Thesis:** Mission Winning already owns the brand lane (mission briefing · navy/emerald/brass · free offline logger · log-based Coach). Excellence is **execution craft**, not a redesign. Operating system: [DESIGN_ORCHESTRATION.md](DESIGN_ORCHESTRATION.md).

### Steal / avoid / own

| Peer | Steal | Avoid | MW owns |
|------|-------|-------|---------|
| **Hevy / Strong** | Set table atom, previous-set ghost, 2-tap complete, rest that doesn’t fight the row | Hevy blue, social PR feeds | Free forever + offline PWA/Compose |
| **Freeletics** | One Start for today; credible plan after light I-Day | 25-step quiz → hard paywall before value | Logger free without Coach lock-in |
| **Bevel / WHOOP** | Metric hierarchy + one insight line | Ring-dashboard clone; wearable as home hero | Mission Score from **logs**, not sensors |
| **NTC / Fitness+** | Discovery polish on Learn/Move later | Video/class chrome inside the set row | Train stays table-first |
| **Linear / Arc** | Chrome recedes; match UI weight to task | Decorative card wallpaper | Briefing density on Today |
| **RepStack / Forge** | Next-set auto-seed; Just Go | Paywall progression / BYOK as product | Targets + Just Go stay free |

### Emotional arc (product loop)

Composure (Today) → Focus (Active) → Honor (Victory) → Clarity (Coach) → next session.

### Craft waves (horizon-gated)

| Wave | Horizon | Focus |
|------|---------|--------|
| **D0** | 0 | Today one-CTA · Active rest/PR craft · Android Accept-blocker · this OS |
| **D1** | 1 | Landing / Welcome / Bundle conversion craft |
| **D2** | 2 | Victory ritual · Today coach-line · retention kill criteria |
| **D3** | 3 | Token sync tooling · pillar polish · iOS inherit |

### Non-goals

Brand palette swap · WHOOP clone · Hevy social · Horizon-0 teardown · gating logger/rest/PRs/Just Go · confetti/XP theater.

---

## Sources folded in

- Internal: UX_UNIFIED_PLAN (Bevel/Freeletics), ROADMAP_V4_EXPERIENCE (no teardown)  
- External: Hevy/Strong DESIGN.md, WHOOP clinical metrics, wellness CRO, Linear density  
- Wave 2: RepStack, IntervalCoach, 0xCal, Bevel, Freeletics Super Bundle, CrossFit/WOD loggers  
- Wave 3: Forge Fitness / FORGE Workout OS
- Wave 4: SEO volume + marketing inspire
- Wave 5: CTA integrity + list density/search
- Wave 6: TrainHeroic athlete gym + % load (not coach SaaS)
- Wave 7: Design Excellence OS — steal/avoid/own synthesis + craft waves D0–D3
