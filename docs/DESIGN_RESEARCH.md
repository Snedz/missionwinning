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
- Wave 8: trainerize.com + help center · truecoach.co + help center · everfit.io + help center · help.fitbod.me + sensai.fit · runna.com/support.runna.com + press.strava.com · joinladder.com + garagegymreviews.com · investor.onepeloton.com · Capterra/G2/GetApp/JustUseApp/Trustpilot review mining · quickcoach.fit pricing 2026 · Sheen et al. 2025 *BJHP* (58,881-post study, via UCL News) · RevenueCat State of Subscription Apps · Sensor Tower US charts
