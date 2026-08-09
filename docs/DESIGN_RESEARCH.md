# Design research — Mission Winning

**Date:** 2026-07-10  
**Purpose:** Competitive steal/avoid matrices + MW gap analysis before the visual system refresh and surface rebuilds.  
**Companions:** [UX_UNIFIED_PLAN.md](archive/UX_UNIFIED_PLAN.md) · [ROADMAP_V4_EXPERIENCE.md](archive/ROADMAP_V4_EXPERIENCE.md) · [STRATEGY.md](STRATEGY.md) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)

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

## Wave 8 — Coach platforms + adaptive consumer + complaint mining (2026-08-06)

**Method:** live web — vendor sites/help centers, app-store listings, review aggregators (Capterra/G2/GetApp/JustUseApp/Trustpilot), Reddit roundups, press; quotes are close paraphrase of named sources. **Thesis:** the client experience of human-coach platforms is the bar Mission Coach must clear; the top-chart adaptive apps show exactly where trust breaks; and the category's complaint mine hands MW its positioning for free. Steal structure and behavior, never palettes (web is Modernist since D5). Umbrella: [MOBILE_PLAYBOOK.md](MOBILE_PLAYBOOK.md) · standards: [UX_PLAYBOOK.md](UX_PLAYBOOK.md).

### Coach-platform client apps — Trainerize · TrueCoach · Everfit (B2B, trainer pays)

All three client apps are locked shells without a coach invite; trainer pays ~$1–6/client/mo for software, client pays the human $150–400/mo for the part software doesn't do — reading logs, adjusting, noticing, answering. Every one of those loops terminates at a human dashboard; Mission Coach closes them in software at zero marginal cost. Their own AI (Trainerize/Everfit AI workout builders) drafts programs *for the coach* — conceding adaptation is the valuable act while keeping a human in the loop.

| Steal | Avoid |
|-------|--------|
| Everfit's 4-tab client IA: **Today / Coaching / Inbox / You** — maps ~1:1 onto an AI-coach app | Invite-gated brick (no coach = empty app; MW is self-serve from minute one) |
| Checkmark-per-set + **auto-popping prescribed rest timer** (Everfit); rest bound to the programmed sequence (Trainerize) | Notification overload — Trainerize clients turn all pushes off in month one |
| TrueCoach **Exercise History one tap from the exercise you're doing** — "what did I lift last time," when it matters | Data captivity — history lives in the trainer's account and dies with their subscription |
| Results-vs-prescription entry: the prescription *is* the form (TrueCoach) | Messaging as the weakest limb (stuck/unsent messages — Everfit's top client complaint) |
| Per-exercise comment threads + client notes (pain, machine settings, band color) — the AI's cues should live at exercise level | Habits crowding the workout calendar (TrueCoach complaint) |
| Compliance-drop trigger (TrueCoach: −20% → "Needs Attention") — a ready spec for Mission Coach's proactive check-in | Post-redesign navigation confusion — never rebuild the workout reader out from under users |
| Consultation/PAR-Q forms folded into first-run so day one feels personalized | Everfit's missing basic: **no auto-fill of previous weights** — a top store complaint |

### Adaptive consumer — Fitbod · Runna · Ladder (+ Peloton IQ, Centr)

Scale check: Ladder raised $105M+, ~$180/yr, no free tier, **no Android**; Fitbod ≈ #16 top-grossing US Health & Fitness (~$2M/mo est.), $15.99/mo *just to log*; Runna exited to Strava within ~3 years. **Nobody in the charts combines free permanent logger + individually adaptive weekly coaching + explanation-first UI + Android-native. That intersection is empty — it is MW's.**

| Steal | Avoid |
|-------|--------|
| Fitbod's paywall order: the full first workout is generated and visible **before** the ask (MW's free logger is the extreme version; show Coach week 1 rendered before any upsell) | Black-box adaptation — Fitbod's dominant complaint: selections read as random, early loads visibly wrong; an unexplained change reads as a bug even when correct |
| **State + intent, combined:** Fitbod shows recovery state (per-muscle %), Runna states session intent ("tempo, X pace, because Y") — nobody does both; MW's adapt beats should say *what changed and why* ("pull volume +10% — 3 clean pull sessions logged") | Overcooking from optimistic inputs — Runna's injury discourse (TechRadar, r/running) came from seeding intensity off best-case PBs; default conservative, deload built in |
| Runna's **rebase ritual**: one miss changes nothing; repeated misses → check-in that re-anchors the plan to where you are; illness window + gradual return phase | Hard paywall before durable value (Runna/Ladder/Fitbod all sub-only) — churned users have nothing to come back to |
| Ladder's zero-decision execution: open → today's session → press play; strict sequencing, auto-advancing rest, next move announced | **Expiring the user's own history** — Ladder's 3-replay favorites + weekly reset is the most user-hostile mechanic found; logged data is permanently the athlete's |
| Week-based streaks vs your own goal (Fitbod), points for *completing planned sessions* (Runna Levels) — celebrate log-proven facts only | Second-class second platforms — Ladder iOS-only; Peloton IQ locked to $2k hardware; Fitbod's Android lagged years. Android is MW's primary, not a port |

Peloton IQ (Oct 2025) validates AI strength coaching going mainstream — then tethers it to new hardware and raises prices; Centr is the everything-app warning label (broad, celebrity-fronted, zero adaptivity). Both are the inverse of "adapts from your logs alone, any gym, no device."

### Complaint taxonomy — review mining across the category (ranked by evidence volume)

| # | Theme | Exemplars | MW implication (register) |
|---|-------|-----------|---------------------------|
| 1 | **Paywall creep on retention primitives** | Hevy: history graphs >90 days paid; Strong: CSV export of your own logs paid; Boostcamp: exercise *swap* paid | Free logger never caps routines, history, or export — the hard rule is a market position (P5) |
| 2 | **Data loss / sync failure** | JEFIT user lost ~70 sessions; Strong's dual-SSO empty-account trap; Trainerize "didn't save the workout" | Offline-first + durable outbox + one identity across SSO + visible sync state (P3) |
| 3 | **Taps-per-set jank** | "finish a set, unlock, find exercise, tap, tap, save — half your rest is gone" | 1–2 taps per set, previous-set prefill, auto rest; instrument taps-per-set (P1) |
| 4 | **Adaptation feels random** | Fitbod progression criticism; Freeletics "carbon-copy weeks", repeats exercises users flagged impossible | Legible AI: every delta states its reason; veto levers; visibly reacts to feedback (P4) |
| 5 | **Trial/billing dark patterns** | Freeletics silent post-trial charge + countdown discounts; H&F refund rate 4.71% (2nd worst category) | No-card trial posture, one honest price, pre-charge clarity |
| 6 | **Notification spam + streak shame** | BJHP 2025 study (58,881 posts): streak resets "erase months of effort", guilt pushes → avoidance | No punitive streaks; opt-in, concrete notifications; warm re-entry (P2) — peer-reviewed backing |
| 7 | **Bloat / cluttered nav** | JEFIT ads + popups; TrueCoach redesign "floods with stimuli" | One job per tab; pillars stay out of the logging path |
| 8 | **Offline breakage** | JEFIT server-first, dead in dead zones; Fitness+ downloads that won't launch offline | MW home turf — "train-anywhere" is literal (P3) |
| 9 | **Ads in the training path** | JEFIT interstitials; even paid Ladder's self-promos draw complaints | Zero ads in the training path, ever |
| 10 | **Poor swap/scaling flows** | Boostcamp paywalls swap; Ladder assumes gym competency; Freeletics ignores "can't do this" | First-class free swap that remembers constraints |
| 11 | **Wearable integration jank** (not dependency) | Runna–Garmin mismatches, premium-gated sync; Strong's stagnant Watch app | "No watch required" sidesteps the whole failure class |
| 12 | **Trainer-platform quality floor** | TrueCoach/Everfit/Trainerize client apps crash mid-set; tolerated only because the *coach* chose them | An athlete-side app this good is a wedge into coached athletes later |

**Drop-off shape:** day-30 median 3–12% vs leaders ~25%; 38% of stated cancellations are motivational, 25% defect to a free alternative; lapse is seasonal and predictable (Strava's "Quitter's Day"). **The highest-leverage unowned retention feature is a designed comeback** — auto-deload, welcome-back session, zero guilt; only Fitbod quietly deloads after a break and nobody markets the grace. MW's re-entry work (`src/lib/reentry.ts`) is the right bet — say it out loud.

**Onboarding bar:** essentially nobody lets you train before an account (Strong iOS partially, local-only); Fitbod is the craft benchmark (3 questions → generated doable workout → projection → soft paywall); Freeletics is the cautionary tale (long quiz → hard paywall → countdown discount). MW's I-Day (3 questions, skippable sign-in, finishes *into* a session, ≤6 taps to a logged set) is already ahead of the field — protect it with the existing budgets.

### Competitor register (standing — future waves append rows)

| Name | Category | Positioning | Pricing model | Onboarding pattern | Complaint themes | Detail |
|------|----------|-------------|---------------|--------------------|------------------|--------|
| ABC Trainerize | Coach platform | "#1 personal training software" | Trainer pays $9–248/mo by roster + add-ons | Trainer invite email → forms → app | Crashes mid-log, sluggish UI, notification overload | Wave 8 |
| TrueCoach | Coach platform | Minimalist 1:1 strength coaching | Trainer pays $30–165/mo; no free tier | Invite → profile form; empty until programmed | Redesign confusion, video upload fails, message glitches | Wave 8 |
| Everfit | Coach platform | Automation-forward challenger | Trainer free ≤5 clients; $16–255/mo + modules | Public invite link → onboarding flow → populated Today | Stuck messages, no weight auto-fill, lag | Wave 8 |
| Fitbod | Adaptive consumer | Algorithmic gym planner | $15.99/mo · $95.99/yr; no free tier | 14 steps → generated workout → soft paywall | Black-box selections, erratic early loads, price | Wave 8 |
| Runna | Adaptive consumer (run) | "#1 running plans"; Strava-owned | $17.99/mo · ~$119.99/yr; hard paywall | Deep quiz → paywall → calendar plan | Aggressive paces/injury discourse, price, watch bugs | Wave 8 |
| Ladder | Coach-led consumer | Team strength, daily plan | $29.99/mo · $179.99/yr; no-card trial | 3-screen quiz → team → press play | Price, iOS-only, fixed programming, expiring history | Wave 8 |
| Peloton App | Content library | Classes + new AI (IQ) | $12.99–28.99/mo; IQ features hardware-gated | Class browse | AI locked to hardware; price raises | Wave 8 |
| Centr | Everything app | Celebrity → longevity content | $29.99/mo · $149.99/yr | Program pick | Broad, shallow, zero adaptivity | Wave 8 |
| JEFIT | Freemium logger | Big-library logger | Free + ads; Elite $69.99/yr | Short profile, ads day one | Server-first offline breakage, ads, clutter, sync loss | Wave 8 |
| Boostcamp | Program logger | Real programs catalog | Free; Pro $59.99/yr | Pick a program | Swap paywalled, analytics gated | Wave 8 |
| Caliber | Hybrid coaching | Free plans + human 1:1 | Free; humans $200–467/mo | Plan setup | Human tier = 10× app pricing | Wave 8 |
| Hevy · Strong · Freeletics · NTC · WHOOP/Bevel · Forge · TrainHeroic | Loggers / coach apps / metric homes | — | — | — | — | Waves 1–7 |

### Positioning angles (evidence-backed, for marketing surfaces)

1. **"Your history is yours. Free. Forever."** — strikes the category's monetization nerve (history caps, export paywalls, swap paywalls); converts the 25% defect-to-free churn flow into acquisition. Incumbents can't match it without detonating revenue.
2. **"Never lose a set."** — offline-first + outbox vs documented data-loss stories; a testable, reviewable promise.
3. **"A coach that shows its work."** — the white space is *legible* AI, not smarter AI; trust, not sophistication, is the retention variable.
4. **"Miss two weeks? We planned for that."** — no streaks to break, welcome-back that ramps down before up; peer-reviewed backing (BJHP 2025).
5. **"The coach is in the app, not behind it." / "The log is the check-in."** — vs the $150–400/mo human layer; adaptation tonight, not at next week's check-in form.
6. **"No watch. No ads. No card."** — three category irritants, one line.

### Register + guardrail updates

- Confirms [UX_PLAYBOOK.md](UX_PLAYBOOK.md) P1–P5 with external evidence (P1 onboarding bar · P2 BJHP shame study · P3 data-loss taxonomy · P4 black-box complaints · P5 paywall-creep taxonomy).
- Execution guardrails adopted: default-quiet notifications · never crash mid-set (category's worst reviews) · always prefill last weights · never redesign the workout reader abruptly · zero ads in the training path · no expiring history, ever.

---

## Wave 9 — Identity, social and the earned record (2026-08-08)

**Method:** live web — primary vendor pages (help centres, pricing tables, programme FAQs) preferred over aggregators; peer-reviewed sources for every behavioural claim. **Nine founder reference screenshots** seeded the wave: Freeletics Super Bundle · Williams F1 WClub · a step-challenge concept (Walk With Hood) · Runna · Everfit · HWPO · Bevel · and **two brand MySpace revivals** (Wendy's, Pizza Hut). **Thesis:** the founder's reference set is not asking for a feed. Read together it asks for one thing the product does not have — **a page that is unmistakably yours** — and the fitness-social literature says the feed is the part to leave behind. Companion plan: [IDENTITY_SOCIAL_PLAN.md](IDENTITY_SOCIAL_PLAN.md); economy: [CLUB_PLAN.md](CLUB_PLAN.md).

### 9.1 The finding that reframes the question

Kolnes et al. 2026 (*PMC12938745*, n=225 active club runners, mixed-methods, validated instruments) found that Strava's motivational impact is **context dependent** — it enhances training through feedback, routine and connection, *and* introduces pressure, comparison and stress, particularly during injury or reduced performance. One result matters more to this product than the headline:

> Runners who had **deleted training sessions** because they perceived their pace as slow scored higher on other-avoidance goals.

**In Strava a logged run is a post. In Mission Winning a logged set is the Coach's input.** [`src/lib/coach/`](../src/lib/coach/INDEX.md) derives the weekly plan from logs alone — there is no wearable to cross-check against. So an athlete who omits or deletes an unflattering session does not merely curate a profile; they feed the planner a false training history, and the planner then prescribes for an athlete who does not exist.

Social comparison is therefore not only off-brand here. It is an **input-integrity attack on the core algorithm**, and it is the reason the social layer needs an architectural boundary rather than a tone guideline. Contracts: [IDENTITY_SOCIAL_PLAN.md](IDENTITY_SOCIAL_PLAN.md) §Contracts.

### 9.2 Gamification — what the evidence actually supports

| Source | Finding | What it licenses |
|---|---|---|
| Mazeas et al. 2022, *JMIR* (16 RCTs, n=2407) | Gamification on PA behaviour **Hedges g=0.42** (95% CI 0.14–0.69); **g=0.23** (0.05–0.41) vs *active* controls running an equivalent non-gamified intervention; **g=0.15** (0.07–0.23) at follow-up averaging 14 weeks post-intervention | Build it — the effect is real, generalises across age/sex/BMI and chronic-disease status, and **persists after the intervention ends, so it is not a novelty effect**. But the durable effect is *small*. Points may support the habit loop; they may never be the retention thesis |

The confidence interval at follow-up (0.07–0.23) is the number to plan against, not the headline 0.42. It is consistent with [CLUB_PLAN.md](CLUB_PLAN.md)'s kill criteria being written *before* the mechanic ships, and it argues against ever moving budget from wedge excellence to reward surface.

### 9.3 The reference screenshots, decoded

| Reference | What it is actually demonstrating | Verdict |
|---|---|---|
| **Wendy's + Pizza Hut MySpace pages** | Two national brands paying for nostalgia for an **authored page** — profile-as-canvas, "in your extended network", Top 8, interests table. Neither revival features a feed | **Take the page.** The `You` surface becomes an authored Athlete Page |
| **MySpace Top 8** | Ranking your friends publicly. Documented as a status and drama device (*Us Weekly* 2024; *Metro* 2017; large anecdotal record) | **Refuse.** Same shape as the missed-day ✕ refused in D7, D8 and D11 |
| **Williams F1 WClub** | 4 tiers (Grid · Podium · Champion · Legend), points from engagement, Driver Card, arcade, collectibles | Already the basis of [CLUB_PLAN.md](CLUB_PLAN.md) — **with one correction below** |
| **Walk With Hood** (concept) | Squad step-challenge: QR/link invite, per-squad board, share-achievement card | Invite and share-card mechanics are usable; the ranked-friends board is C3-gated and stays off the logging path |
| **Freeletics Super Bundle** | Six-to-seven separate apps sold as one subscription (Calm, MapMyFitness, Skill Yoga, pliability, Waking Up, Freeletics Nutrition) at −50% | **MW's structural advantage, sharpened.** Their bundle is a billing wrapper over six logins; MW's six pillars share one Mission Score and one log. Their own forum carries users asking how to even access pliability |
| **Runna** | Goal-first plan picker (Marathon / Half / 10K / 5K / Get Fit) with duration + distance chips | The clearest IA for goal selection seen in the set; relevant to Coach onboarding, not to identity |
| **Everfit** | Meal-plan cards with per-item macros and check affordances | Fuel density reference; already covered Wave 8 |
| **HWPO** | "No magic. No lies. No shortcuts." — brand voice as the entire ad | Confirms the register MW already runs. No action |
| **Bevel** | **"$0 per year — best all-in-one health app"** | **A live threat to positioning angle 1. See below** |

### 9.4 Correction to Wave 8 — the free-forever line is no longer ours alone

Wave 8 (two days before this one) listed positioning angle 1 as *"Your history is yours. Free. Forever."*, on the reasoning that incumbents "can't match it without detonating revenue." **One did.** Verified at Bevel's own pricing page (`help.bevel.health/en/articles/11583937`):

- Free includes Recovery, Sleep, Strain, Stress, Nutrition Tracking, **Strength Builder (700+ exercises)**, Energy Bank, Fitness Tracking, Health Monitors, Cycle Tracking, Journal, Watch app, widgets — **and AI food logging and AI workout-template generation**.
- Paid (`Pro`, $14.99/mo · $99.99/yr) is only Bevel Intelligence, Health Records, Biological Age.
- They publish the **ratchet in writing**: *"any feature included in Free today will always remain free. We will never move an existing Free feature behind a paywall."* Existing annual subscribers keep their price in perpetuity.

That is the same structural promise MW makes, made first, in public, by a competitor with ~500k downloads and a 4.8 rating. **What survives, and is now the sharper claim:** Bevel is iOS + Apple Watch — it is a *wearable-derived* product, and its scores are computed from sensors MW deliberately does not require. MW's defensible line is not "free" on its own; it is **free, on Android, from logs alone, offline, with no watch and no account.** Angle 1 should be re-cut accordingly, and angle 6 ("No watch. No ads. No card.") promoted above it.

### 9.5 Correction to CLUB_PLAN — WClub tiers reset, and ours do not

[CLUB_PLAN.md](CLUB_PLAN.md) adopts WClub's ladder and adds a *"T4 season-start boost (positive-sum carryover)"*. Verified at `williamsf1.com/wclub-education`, the WClub FAQ states: **"Your tier resets at the start of each season"** and *"Users who reached legend tier will get a boost at the start of the next season as a reward for reaching the top."*

The boost exists **because everything resets** — it compensates a Legend for losing their ladder. CLUB_PLAN invariant 3 makes MW points **monotonic**: nothing resets, nothing is revoked. Importing the boost without the reset turns a compensation mechanic into a compounding head start for whoever ranked highest last season — rich-get-richer, in a product whose entire tone contract is anti-hierarchy. **Recommendation: strike the T4 season-start boost.** Positive-only double-points weeks (open to everyone) survive unchanged.

Also unverified: CLUB_PLAN's specific bands *"Grid 50–299 · Podium 300–699 · Champion 700–1499 · Legend 1500+"*. The education page names the four tiers and publishes **no thresholds**; a separate Williams article confirms **Podium = 300** only. Three of the four numbers are uncorroborated and should not be presented as sourced. They are in any case provisional at 0 users.

### 9.6 Source verification

Claims were checked at source, not accepted from search snippets. Recorded so the next wave does not re-litigate them.

| Claim | Source | Verdict |
|---|---|---|
| Gamification on PA: g=0.42; g=0.23 vs active control; g=0.15 at follow-up | Mazeas et al. 2022, *JMIR* 24(1):e26779 | **Verified** — primary, peer-reviewed, 16 RCTs |
| Strava use → deleted sessions over slow pace, ↑ other-avoidance goals | Kolnes et al. 2026, *PMC12938745*, n=225 | **Verified** — primary, peer-reviewed |
| Bevel free tier + never-repaywall promise + Pro pricing | `help.bevel.health` pricing article | **Verified** — vendor primary |
| WClub 4 tiers, seasonal reset, Legend boost, engagement-and-purchase earning | `williamsf1.com/wclub-education` | **Verified** — vendor primary |
| Freeletics Super Bundle = 6→7 apps, one subscription | `freeletics.com/en/` + vendor blog + own forum | **Verified** — vendor primary |
| MySpace Top 8 as status/drama device | *Us Weekly* 2024, *Metro* 2017, broad anecdotal record | **Weak-verified** — journalistic and anecdotal, no study found. Treated as a design caution, not evidence |
| CLUB_PLAN's Grid/Champion/Legend point bands | — | **Unverified** — see §9.5 |
| *"Strava Challenges (2022) improved 90-day retention 18% → 32%, +28% DAU, +15% subs"* | `lucid.now` blog | **REJECTED.** Uncited; Strava Challenges shipped years before 2022; supported by a quote attributed to an unlocatable "Dr. Emily Chen". **Do not cite this figure anywhere.** It is the most-repeated number in the fitness-retention content mill and it has no visible provenance |

**Standing rule this wave adds:** a retention statistic with no primary source is treated as absent. Vendor marketing blogs are not sources for competitor metrics.

---

## Wave 10 — The www quality bar, measured (2026-08-09)

**Method — measured, not eyeballed.** Founder supplied three reference sites (freeletics.com/en · callofduty.com/ca/en · lahuella.club/en) as the quality bar for a static marketing site, plus phone screenshots. Live browsing was **blocked by this session's egress policy** for all three hosts (and for awwwards.com, koto.com, brand.callofduty.com) — so the founder then supplied **ten desktop print-to-PDF captures at 1440pt**, including two TrainHeroic pages and both auth surfaces. Those were parsed with PyMuPDF: every text span's **font, point size and fill colour**, every block's y-extent, and page renders at 0.62×. Type scales, palettes and section gaps below are extracted values, not estimates. Companion proposal: [DESIGN_PROPOSAL_WWW.md](DESIGN_PROPOSAL_WWW.md).

### 10.1 The correction this wave exists to record

Reading the **phone** screenshots alone, the obvious conclusion was *"the references are one tier louder than us — go roughly 2× bigger."* A proposal was drafted on that reading, specifying a 168px poster tier.

**The measurements refute it.** At 1440pt, reference display type tops out at 70–100pt and section headings sit at 30–40pt. [`src/index.css`](../src/index.css) already ships `.display-hero` at 76px and `.display-section` at 48px — **at or above the reference median on both**. A phone capture compresses a 1440pt layout into 390pt and makes everything read as enormous; the ratio survives that transform, the absolute size does not.

The real gap is **not type size**. It is vertical rhythm (§10.4) and motion. Recorded because this is `.220`'s shape in a new place: a conclusion drawn from the artifact that was easiest to look at, rather than from the one that carries the number.

### 10.2 Type scale, extracted (all at 1440pt viewport)

| Site / page | Display max | Section head | Body | Micro | Display faces |
|---|---|---|---|---|---|
| Freeletics home | **74pt** (hero 48) | 40pt | 18 / 16 | 12pt **Iosevka-Semibold** caps | subsetted variable + AktivGroteskEx |
| Freeletics nutrition | 56pt | 40pt | 18 / 16 | 14pt | same |
| Freeletics log-in | 40pt | — | 16 | 12.8 / 12 | same |
| CoD home | 36pt | 36pt | 20 / 16 | 11 / 14.1 | **HitmarkerCondensed-Black** + HitmarkerText |
| CoD MW4 | **69.7pt** | 29.2 / 28.8 | 16 / 12 | 10 | same |
| CoD sign-in | 24pt | — | 13 / 16 | 12 | **DINNextLTPro** — a different family entirely |
| La Huella home | **96pt** | 30pt | 18 / 14 | 12 | **CWM-Bold** + **Inter18pt** for body |
| TrainHeroic | **100pt** (stat) · 70 (hero) | 32 / 23 | 20 / 18 | 13 / 14 | Poppins (Bold Italic caps) + Oswald |

**Median hero display ≈ 70pt · median section head ≈ 36pt · body 16–20pt · micro 10–14pt.** Mission Winning: 76 / 48 / 17 / 13. In band on all four.

Three observations that do transfer:

- **A stat tier above the headline tier.** TrainHeroic sets `500,000+` at **100pt** — larger than its own hero. La Huella's 96pt is likewise a statement, not a headline. MW's `.display-mega` caps at 72px, *below* its own `.display-hero` (76px). That inversion is the one genuine scale gap found.
- **A dedicated micro-label face.** Freeletics sets `GUNDULA, 37` in **Iosevka mono, caps, wide-tracked** — a monospace reserved for telemetry. MW achieves the same register with Archivo caps + `tnum` at 13px/0.08em, which is the cheaper and more system-consistent answer. No change needed.
- **Condensed display is 2-of-4, not universal.** CoD (Hitmarker Condensed) and La Huella (CWM) are condensed; Freeletics and TrainHeroic are normal width. Condensed is a legitimate option, not a requirement.

### 10.3 Palettes, extracted

| Site | Ground | Accent | Accent's job |
|---|---|---|---|
| Freeletics | `#161e21` | `#fe7413` orange | **Section headings only.** Buttons are white pills — the accent never becomes an action colour |
| Call of Duty | `#000000` | `#ffd000` yellow | **Actions, tags and carousel progress.** Nothing else is yellow |
| La Huella | `#0f0f0f` | `#fdca38` yellow | The accent *is* the ground — full-bleed yellow fields carrying black display type |
| TrainHeroic | `#050310` | `#f1fd53` + `#0a0eff` | Yellow as a **highlight marker behind display words**; blue as the button fill |

All four run **one dominant accent on a near-black ground**. MW inverts the ground (paper `#f3f2f2`) and keeps the one-accent rule — already the law, enforced at runtime by [`redActions.ts`](../tests/e2e/helpers/redActions.ts). La Huella's full-bleed accent field is the same idea as [`.poster-close`](../src/index.css); MW arrived there independently.

### 10.4 Vertical rhythm — the actual finding

Gap between consecutive text blocks, at 1440pt:

| Page | Median | p90 | Max | Gaps ≥60pt |
|---|---|---|---|---|
| CoD home | **144pt** | 643 | 832 | 12 |
| Freeletics home | 31pt | 186 | 540 | 13 |
| Freeletics nutrition | 41pt | 384 | 608 | 9 |
| TrainHeroic | 41pt | 411 | 769 | 11 |
| CoD MW4 (product page) | 27pt | 71 | 301 | 5 |

**The grammar is bimodal: clusters at 27–46pt, section boundaries at 190–450pt, statement boundaries at 540–830pt.** Nothing sits in between.

MW's marketing sections are `py-16 lg:py-20`, so a section boundary is **~160px** — below every reference's p90 and roughly half CoD's median. *This is the delta the phone screenshots were actually showing.* Cluster spacing (`space-y-6` = 24px) is already correct.

### 10.5 Text density — and the finding that decides our stack

Characters of rendered text per 1000pt of scroll:

| Page | Density |
|---|---|
| La Huella | **19** |
| CoD home | 226 |
| Freeletics nutrition | 306 |
| TrainHeroic | 371 |
| Freeletics home | 530 |
| CoD MW4 | 1172 |

La Huella's capture is **9109pt tall and contains two text blocks**, separated by a single **8365pt gap**. Its page renders essentially nothing without JavaScript — the entire document is GSAP scroll-triggered (Awwwards records the build as WordPress + GSAP + Next.js).

**This is the wave's most actionable result.** It is the visual bar the founder set *and* an architecture MW must not copy: the www surface carries ~250 SEO URLs and the free-calculator growth bet ([`seo/README.md`](../seo/README.md)), and a page whose content exists only after JS runs cannot serve either. **Take La Huella's rhythm; refuse its delivery.**

### 10.6 Steal · avoid · own

**Steal**
- **One CTA shape, contextual verb.** Freeletics repeats a white pill + `→` and changes only the verb: *Start now · Start your plan now · Got It Now · Start your transformation · Start eating clean now*. CoD repeats *PRE-ORDER* in nav, hero and vault band. MW's [`.primary-action`](../src/index.css) is already that shape.
- **A reassurance line under the CTA.** TrainHeroic: *"14-Day Free Trial. No Credit Card Required."* MW already writes these (*"Under three minutes to your first logged set"*, *"no account"*) — they belong under the button, not in a paragraph.
- **The statement gap.** 540–830pt around a single sentence, at the open and the close.
- **The peeking rail.** Freeletics cuts the 5th card at the viewport edge on desktop *and* mobile — the affordance is the crop, not an arrow.
- **Alternating one-third hero.** CoD's two stacked heroes put content in the right third, then the left third. Asymmetry without a layout change.
- **Colour picks one of three.** TrainHeroic's 3-up band makes only the middle cell yellow.

**Avoid**
- **Freeletics' purple-blue gradient promo band** and its centred hero — both are literally on the founder's ban list for this build.
- **CoD's auth break.** The sign-in page abandons Hitmarker for DIN Next and drops the yellow. One system to the edge of the funnel, then a different one at the moment of conversion.
- **La Huella's JS-only body** (§10.5).
- **Freeletics' before/after transformation grid.** Body-composition proof is a positioning MW has explicitly refused ([brand-guidelines](brand-guidelines.md) § Voice).

**Own**
- Paper ground. All four references are near-black; ink-on-paper is the differentiated register in this category, and it is already shipped.
- Sentence-case display. Two of four references are all-caps; `src/index.css:320` retired caps deliberately (*"the caps were Barlow's"*).
- 2px rules doing the organising, where the references use whitespace or hairlines.

### 10.7 Source verification

| Claim | Source | Verdict |
|---|---|---|
| Type scales, palettes, gap distributions, text density | 10 founder-supplied 1440pt PDF captures, parsed with PyMuPDF | **Verified — primary.** Extracted from the documents; reproducible from the same files |
| Hitmarker is bespoke (NaN × Koto, 2023), 3 widths × 5 weights + Text | Search summaries of nan.xyz, brand.callofduty.com, Design Week | **Weak-verified** — vendor pages were egress-blocked; the PDFs independently confirm the family names `HitmarkerCondensed-Black`, `HitmarkerText-*`, `HitmarkerNormal-Medium` |
| La Huella built with WordPress + GSAP + Next.js, by mortensen (Barcelona) | Awwwards nominee page via search | **Weak-verified** — aggregator; consistent with §10.5's measured JS dependence |
| Freeletics "60 million users", "450 million sessions", "700+ exercises" | freeletics.com home capture | **Verified as their claim** — not ours to repeat, and hard rule 3 forbids MW inventing any equivalent |
| Live rendering, hover/scroll behaviour, motion timings | — | **Unverified.** Print captures are static; every motion claim in the proposal is derived from the shipped MW tokens, not measured from the references |

**Standing rule this wave adds:** a reference screenshot taken at a different viewport than the one being designed is evidence of *proportion*, never of *size*. Measure at the target viewport before writing a number into a spec.

---

## Wave 11 — Composition, measured (2026-08-09)

### 11.1 Why this wave exists

Wave 10 measured type and spacing, `sites/www` was built to those numbers, and every guard on it is green. Rendered, it reads as **a wireframe with real copy in it**. So Wave 10 was not wrong; it was *incomplete*, and the missing axis turned out to be the dominant one.

The same ten captures were re-parsed with PyMuPDF for composition rather than typography: raster image area (union of `get_image_rects` on a 2pt grid, so stacked carousel layers count once), full-bleed counts, background fill sampled down the left margin, and text spans whose box falls inside an image box.

**This is the same failure shape as §10.1, one level up.** There, a number was written into a spec from a screenshot taken at the wrong viewport. Here, an entire axis was left out of the spec — and because nothing measured it, nothing could go red.

### 11.2 The gap

| Capture | Type | Page H (pt) | **Image area** | **Fold image area** (first 900pt) | Full-bleed | Ground changes | Text inside image |
|---|---|---|---|---|---|---|---|
| CoD home | home | 4675 | **76.3%** | 100.0% | 7 (677–1135pt) | 1 | 51 / 77 (66%) |
| TrainHeroic B | home | 6259 | **76.5%** | 90.6% | 7 (88–1122pt) | 6 | 75 / 112 (67%) |
| TrainHeroic A | home | 810 | **81.0%** | 81.0% | 2 | 3 | 29 / 29 (100%) |
| Activision Sign-in | landing | 1118 | **100.0%** | 100.0% | 2 | 0 | 27 / 27 (100%) |
| Freeletics Nutrition | landing | 4578 | **67.2%** | 95.8% | 2 (810pt) | 5 | 18 / 66 (27%) |
| CoD MW4 pre-order | landing | 2367 | 29.6% | 71.7% | 1 (530pt) | 1 | 4 / 102 (4%) |
| Freeletics home A | home | 4990 | ≥29.4% † | ≥12.7% † | 0 † | 5 | 16 / 119 (13%) |
| Freeletics home B | home | 9839 | ≥10.7% † | 93.1% | 1 (1019pt) | 2 | 48 / 119 (40%) |
| Freeletics Log-in | landing | 831 | 0.44% | 0.4% | 0 | 0 | 0 |
| La Huella | home | 9109 | 0.02% ‡ | 0.2% ‡ | 0 ‡ | 0 ‡ | 0 ‡ |
| **`sites/www` `/`** | **home** | **7074px** | **~4%** | **~0%** | **0** | **1** | **0** |

† **Floors, not readings.** Freeletics home A's hero is an unrendered `<video>` (the flat `#909799` band at y=250–950); home B has 8750pt of flat `#253137` below y=1100 where lazy-loaded content never printed.
‡ **Excluded from every conclusion.** La Huella's capture is near-empty because the page is GSAP-driven and renders nothing without JS — §10.5 already recorded this. Its numbers measure the capture, not the design.

Also excluded from area conclusions: CSS gradients, SVG and vector artwork are drawing operators rather than image XObjects, so **every image percentage here is a lower bound.**

### 11.3 What the numbers say

**The fold is the target, not the page.** Of the captures that rasterised, page-wide coverage is 76.3 / 76.5 / 81.0 / 100%, and above-the-fold coverage is starker still: **six of ten put an image under 80–100% of the first 900pt.** Our homepage is ~20× below the fully-rendered homepage median (52.8%) and effectively zero at the fold.

**Full-bleed is the mechanism.** Every capture that reads as designed carries full-width images **480–1135pt tall** — 0.5 to 1.25 viewport heights each, stacked 1–7 per page. The two captures with zero full-bleed rects are the two that render as flat colour.

**Type sits on the image; it does not sit beside it.** 100 / 100 / 67 / 66 / 40% of text spans fall inside an image box. Matching the area ratio while keeping photographs in cards next to copy would match the number and miss the register.

**Ground changes are deliberate and rare — 0 to 6 per page, never per section.** CoD holds one flat black for 1950pt across eight section boundaries. The two pages that change ground most each do it to introduce **exactly one** inverted field: Freeletics Nutrition a `#f5f8fa` light band at y=2550–3350, TrainHeroic B a `#0a0eff` accent band at y=3150–3500.

> **This extends §10.3's one-accent rule: the accent gets a *ground*, not just a heading colour.** And it kills an idea that looked obviously right — alternating paper / ink / photo / red per section. No reference does that. It would have read as a theme demo rather than a page.

### 11.4 Homepage vs dedicated page — the difference is CTA discipline, not stripping

| | Homepages | Dedicated pages |
|---|---|---|
| Distinct CTAs | **4–5, none repeated** | **2** |
| Most-repeated CTA | none | *"Start eating clean now"* **×4** (y=648 · 2388 · 3136 · 3867) |
| Total links | 42–45 | 24–38 · auth surfaces **3–15** |
| Nav items in top 120pt | 5–10 | 6 (Nutrition) · **0** (MW4, both auth pages) |
| Section boundaries ≥190pt | 6–8 | 8 (Nutrition) · 1 (MW4) · 0 (auth) |

**Freeletics Nutrition is the case that decides it.** It keeps the full site nav, runs 4578pt — as long as the homepage — and has the same eight section boundaries. Nothing structural marks it as a landing page. What marks it is **two distinct CTAs against the homepage's five, and one string repeated four times, once every 740–1000pt.**

So: a dedicated page does not have to be shorter or nav-less. **Stripping navigation is what auth and checkout surfaces do** — all three nav-less captures (MW4 pre-order, Freeletics Log-in, Activision Sign-in) sit in that group, and an invite capture belongs with them.

Worth recording against the brief: *"one CTA, repeated"* on every page is landing-page behaviour applied to a homepage. It is a deliberate founder choice, not what the references do.

### 11.5 The floors this wave commits to

Written here **before** the page that has to meet them, so the numbers are argued from the captures rather than fitted to whatever gets built. `scripts/www-composition.mjs` implements exactly these; each is set below the measured band so it fails on regression rather than dictating art direction — the same reasoning that kept §10.4's cluster band out of the rhythm guard.

| Floor | Value | Reference band |
|---|---|---|
| Image coverage, first 900px at 1440 | **≥ 60%** | 81–100% (six captures) |
| Image coverage, whole page | **≥ 35%** | 52.8% homepage median |
| Full-bleed images (≥90% viewport width) | **≥ 1** | 1–7 per page |
| Text blocks set over an image | **≥ 1** | 40–100% of spans |

**What this cannot measure, stated so it is not assumed:** it counts raster boxes at one viewport. It has no opinion on whether a photograph is any good, and a page could satisfy every floor with twelve bad images. It closes the axis that was missing, not the one that matters most.

### 11.6 Source verification

| Claim | Source | Verdict |
|---|---|---|
| Image area, full-bleed counts, ground sequences, text-in-image counts | The same 10 founder-supplied 1440pt PDF captures, re-parsed with PyMuPDF | **Verified — primary.** Reproducible from the same files |
| CTA counts, repeat cadence, nav/link counts | Same captures; CTA identified by span text + fill colour | **Verified with a caveat** — a rasterised button carries no text span, so MW4's nav count (0) was confirmed visually rather than by extraction |
| Freeletics home A/B image coverage | Same captures | **Floors only** — unrendered `<video>` and lazy-loaded content, §11.2 † |
| La Huella composition | Same capture | **Rejected** — measures an unrendered document, §11.2 ‡ |
| Motion, hover, scroll-triggered reveal, parallax | — | **Unverified**, as in §10.7. Print captures are static |
| Ground sampling | Left margin (x=3–15pt) only | **Partial** — a centred light panel on a dark ground would read as unchanged |

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
- Wave 9: Mazeas et al. 2022 *JMIR* 24(1):e26779 · Kolnes et al. 2026 *PMC12938745* · help.bevel.health pricing · williamsf1.com/wclub-education · freeletics.com + forum.freeletics.com · Us Weekly / Metro on MySpace Top 8 · nine founder reference screenshots. **One source rejected** — see §9.6
- Wave 11: the **same ten captures**, re-parsed for composition rather than typography — image-rect unions, full-bleed counts, left-margin ground sampling, text-span/image-rect intersection. No new sources; the finding is that Wave 10 measured the wrong axis, not that it measured wrongly
- Wave 10: **ten founder-supplied 1440pt desktop PDF captures** — freeletics.com (home ×2, nutrition, log-in) · callofduty.com (home, MW4 pre-order, Activision sign-in) · lahuella.club · trainheroic.com (×2) — parsed with PyMuPDF for font/size/colour/geometry. Live sites were **egress-blocked**; awwwards.com, koto.com and brand.callofduty.com likewise, so their claims are search-sourced and marked weak-verified in §10.7
- Wave 8: trainerize.com + help center · truecoach.co + help center · everfit.io + help center · help.fitbod.me + sensai.fit · runna.com/support.runna.com + press.strava.com · joinladder.com + garagegymreviews.com · investor.onepeloton.com · Capterra/G2/GetApp/JustUseApp/Trustpilot review mining · quickcoach.fit pricing 2026 · Sheen et al. 2025 *BJHP* (58,881-post study, via UCL News) · RevenueCat State of Subscription Apps · Sensor Tower US charts
