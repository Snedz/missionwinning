# Mission Journey — Simple UI + Member Path (Pre-Public)

**Purpose:** Before Phase E (public launch), give every user one obvious path — like **I-Day at the U.S. Air Force Academy**: a clear beginning, staged training, standards, and commissioning into daily operations. The UI stays **simple enough that nobody gets lost** (one primary action per screen, plain language, progressive disclosure).

**Not official DoD product:** Mission Winning is a civilian health PWA. We borrow **structure and discipline** from military onboarding (in-processing → basic training → readiness → duty), not branding, rank, or endorsement.

Related: [vision.md](vision.md) · [PLAN.md](PLAN.md) · [PROTECTION.md](PROTECTION.md)

---

## Design principle: “Simple for stupidity”

Interpreted as **foolproof**, not insulting — minimum cognitive load, maximum follow-through.

| Rule | What it means in the app |
|------|---------------------------|
| **One boss screen** | `/log` (Today) always answers: *“What do I do right now?”* |
| **One primary button** | Each screen has exactly one green/hero CTA; everything else is secondary or hidden |
| **Five taps max** | Any daily habit (train, fuel, move, mind) completable in ≤5 taps from Today |
| **No wall of links** | Sidebar collapses to **Journey + 5 mobile tabs**; advanced tools behind “More” |
| **Plain words** | “Start workout” not “Initialize session”; “Your checklist” not “Onboarding pipeline” |
| **Progress always visible** | Journey stepper at top of Today until **Commissioned** |
| **Fail-safe defaults** | Skip sign-in until step 4; bodyweight program if no equipment chosen |

**Anti-patterns to remove before public:**
- 14+ sidebar links on desktop (overwhelming vs mobile’s 5 tabs)
- Mission Setup buried in Profile (should be **step 1 of Journey**, not optional)
- Multiple competing CTAs on HomePage (Quick start + Today’s workout + starters + sign-in banner)
- Premium/demo/sign-in forms repeated on Library, History, Nutrition

---

## The Mission Journey (DoD-inspired phases)

Analogous to **In-processing Day → Basic Training → Readiness → Commissioning → Operational Duty**.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  PHASE 0          PHASE 1           PHASE 2          PHASE 3            │
│  I-DAY            BASIC TRAINING    READINESS        COMMISSIONED       │
│  (Intake)         (First wins)      (Standards)      (Daily duty)       │
├─────────────────────────────────────────────────────────────────────────┤
│  Welcome          1st workout       PAR-Q /          Today Hub only     │
│  Name & goal      1st fuel log        Assessment       Journey = maint.   │
│  Equipment        1st move flow       7-day streak     Optional pillars  │
│  Optional sign-in 1st mind breath    Win Score ≥40    in “More”         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 0 — I-Day: *Where the Journey Begins*

*Like Academy in-processing: one queue, one checklist, no choices until each step is done.*

| Step | User sees | System does | Route / component |
|------|-----------|-------------|-------------------|
| 0.1 | “Welcome, Mission Member” + single **Begin** | Set `mw_journey_started` | New `/welcome` or modal on first visit |
| 0.2 | **Mission statement** (1 screen, scroll) + “I accept the path” | Log acceptance timestamp | Static copy from vision.md (short) |
| 0.3 | **3 questions only:** experience, equipment, primary goal | Writes `mw_experience`, `mw_equipment`, `mw_primary_goal` | Move from Profile → dedicated flow |
| 0.4 | **Gear check:** “What you have today” (bodyweight / dumbbells / full gym) | Filters Today’s workout + library | Same data, simpler UI |
| 0.5 | Optional: **Sign in for cloud** (skip allowed) | Magic link | One line, not a wall of text |

**Exit criteria:** I-Day complete → land on Today with Journey card showing Phase 1.

**Copy example (I-Day header):**  
> *Incoming members begin here. In-processing marks the start of your path toward lifelong health — one step at a time.*

---

### Phase 1 — Basic Training: *First wins in every pillar*

*Like BCT week 1: small achievable tasks, not the whole war.*

| Milestone | Action | Unlock |
|-----------|--------|--------|
| BT-1 | Complete **first workout** (guided 10-min bodyweight) | Train tab confidence badge |
| BT-2 | Log **protein once** in Fuel | Fuel tab |
| BT-3 | Finish **one Move flow** (4 min) | Move in “More” |
| BT-4 | **One breathing cycle** in Mind | Mind in “More” |
| BT-5 | Mark **one Learn lesson** done | Learn in “More” |

**UI:** Today shows **only the next incomplete BT step** as the hero CTA. Other cards collapsed.

**Exit criteria:** All BT-1…BT-5 done → Phase 2.

---

### Phase 2 — Readiness: *Standards before full access*

*Like fitness assessment / PAR-Q before full program — safety and baseline.*

| Requirement | App feature | Notes |
|-------------|-------------|-------|
| Health screen | `/assessments` PAR-Q (existing) | Required once; store `mw_parq_date` |
| Baseline | First **Win Score** computed | Show on Today |
| Commitment | **7-day training streak** OR 5 workouts in 14 days | Uses existing streak logic |
| Accountability | Enable **daily Mind check-in** prompt (1 tap dismiss) | Optional but encouraged |

**Exit criteria:** PAR-Q complete + streak/commitment met + Win Score visible → **Commissioning ceremony** (short animation + badge).

---

### Phase 3 — Commissioned: *Operational duty*

*Like commissioning: you know the job; Today is command center.*

- Journey stepper **minimized** to a thin progress ring (“Day 47 · Mission Operator”).
- Full **5-tab mobile nav** + **More** drawer for Move, Mind, Learn, Builder, Library, History, Bundle.
- Sidebar on desktop **mirrors mobile** (not 14 links) — see § Navigation simplification.
- Weekly **commander's intent** line on Today (one sentence from coach rules, not AI yet).

**Optional advanced path (premium):** “Specialist track” in Learn / Super Bundle — never blocks free core.

---

## Navigation simplification (Phase F1)

### Mobile (keep — already good)

| Tab | Role |
|-----|------|
| Today | Command center |
| Train | Active workout + quick start |
| Fuel | Nutrition log |
| Track | Activity |
| You | Profile, Journey status, settings |

### Desktop / “More” menu

Replace 14 sidebar items with:

```
TODAY | TRAIN | FUEL | TRACK | YOU
                              └─ More ▾
                                   Move · Mind · Learn · History
                                   Library · Builder · Assessments
                                   Super Bundle · Vision
```

**Implementation:** `AppLayout` — collapsed sidebar mode + `MoreSheet` component.

---

## Today Hub redesign (Phase F2)

**Current problem:** HomePage stacks metrics, challenges, today’s workout, hero CTA, starters, sign-in, pillar wins — too many decisions.

**Target layout (top → bottom):**

1. **Journey strip** — “Phase 1 · Step 2 of 5 · Log your first meal” + progress bar  
2. **ONE hero button** — context from journey engine  
3. **Mission Score** — single number + tap for pillar breakdown (existing)  
4. **Readiness row** — 3 rings (existing MetricsRow), collapsed on mobile if not commissioned  
5. **Everything else** — accordion “Details” (challenges, coach insight, starters)

**Rule:** If journey phase &lt; 3, hide Builder, Benchmarks, and secondary starters.

---

## Journey engine (Phase F2 — technical)

New module: `src/lib/missionJourney.ts`

```typescript
type JourneyPhase = 'i-day' | 'basic' | 'readiness' | 'commissioned';

interface JourneyState {
  phase: JourneyPhase;
  iDayComplete: boolean;
  basic: { workout: boolean; fuel: boolean; move: boolean; mind: boolean; learn: boolean };
  readiness: { parq: boolean; streak: boolean; winScoreSeen: boolean };
  commissionedAt?: string;
}

function getNextAction(state: JourneyState): { label: string; href: string; phase: JourneyPhase };
```

**Persistence:** `localStorage` + optional Supabase `profiles.journey_state` jsonb (Phase F3).

**Hooks:** `useMissionJourney()` drives Today hero + welcome flow.

---

## DoD / military-adjacent requirements (civilian app)

What we **should** incorporate (structure, not affiliation):

| Theme | Civilian implementation |
|-------|-------------------------|
| Clear entry | I-Day welcome + checklist |
| Standards | PAR-Q, readiness score, streak |
| Progressive training | BT milestones before full app |
| Accountability | Streaks, check-ins, history |
| Single chain of command | Today tells you the next step |
| Physical readiness | Win Score + assessments |

What we **must not** do:

- DoD seals, “official” claims, rank insignia without permission  
- Stolen military UI that implies government endorsement  
- Overly aggressive “boot camp” tone that conflicts with inclusive global mission  

**Tone:** Disciplined, welcoming, plain — *“The path forward is clear.”*

---

## Implementation plan (Phase F)

Work **before** `PRIVATE_MODE=false`. Can overlap with PROTECTION P0.

### F1 — Foundation (1 branch)

- [x] `missionJourney.ts` + `useMissionJourney()`  
- [x] `/welcome` I-Day flow (3–5 screens, skippable sign-in)  
- [x] Redirect first-time users: no `mw_journey_started` → `/welcome`  
- [x] Today hero driven by `getNextAction()`  
- [x] Remove duplicate sign-in blocks from Library, History, Nutrition (link to You tab)

### F2 — Simplify chrome (1 branch → split per UX_GLOBAL_PLAN.md)

- [ ] **Simple / Pro Mode** toggle in Profile (`mw_ui_mode`) — Lite = one CTA + 5 tabs; Pro = full dashboard + More sheet
- [ ] Sidebar → 5 primary + More sheet (Pro only; Simple matches mobile)
- [ ] HomePage accordion for secondary content (Pro); Simple = hero + streak only
- [ ] Profile: Mission Setup becomes “Edit Journey Profile” (link back to I-Day fields)
- [ ] Commissioning moment (modal + `mw_commissioned_at`)
- [ ] Copy pass: short labels everywhere (see glossary below + UX_GLOBAL_PLAN §5.5)

### G1 — Global languages (parallel track)

- [ ] Extract i18n to JSON namespaces; dynamic `<html lang>`
- [ ] Tier 1: DE, IT, KO + existing EN/ES/FR/PT/RU
- [ ] Translate journey, nav, and all primary CTAs

### G2 — Form Guides (“Warrior Stance” model)

- [ ] `FormGuide` schema + bottom sheet in Active Workout / Library
- [ ] 50 priority exercises: setup → execute → errors → breath + poster image
- [ ] Optional: licensed loop MP4 via CDN (MoveKit/GymVisual)

### F3 — Persist & polish (1 branch)

- [ ] Supabase `profiles.journey_state` + sync on sign-in  
- [ ] Journey badge on Profile (“Mission Operator · Day N”)  
- [ ] Optional: email nudge via Resend (“Complete BT-2: log protein”)  
- [ ] Analytics events: `journey_phase_complete`  

### F4 — Then Phase E (public)

- [ ] PROTECTION.md P0 checklist  
- [ ] Beta with **10 users** — measure: % who finish I-Day, % commissioned in 14 days  
- [ ] `PRIVATE_MODE=false` only if I-Day → BT completion ≥60% in beta  

---

## Copy glossary (plain language)

| Avoid | Use |
|-------|-----|
| Dashboard | **Today** |
| Initialize / commence | **Start** |
| Onboarding | **I-Day** or **First steps** |
| Macro logging | **Log food** |
| Pillar win | **Done ✓** |
| Super Bundle synergy | **Unlock all tools** |
| Mission Setup | **Your profile** |

---

## Success metrics (pre-public beta)

| Metric | Target |
|--------|--------|
| I-Day completion (started → finished) | ≥80% |
| First workout within 24h of I-Day | ≥50% |
| Basic Training complete (5/5) | ≥40% within 7 days |
| Commissioned within 14 days | ≥25% |
| Support tickets “where do I start?” | →0 |

---

## Relationship to other docs

| Doc | Role |
|-----|------|
| **JOURNEY.md** (this file) | UX + member path before public |
| **UX_GLOBAL_PLAN.md** | Competitive UX research, Simple/Pro mode, i18n, Form Guides |
| **PROTECTION.md** | Security + competitive gaps |
| **PLAN.md** | Phase A–F roadmap |
| **vision.md** | Mission and pillars (unchanged) |

---

## Next step for implementation

**Review [UX_GLOBAL_PLAN.md](UX_GLOBAL_PLAN.md)** — competitive research (Bevel, Freeletics Super Bundle, crypto Lite/Pro), global i18n, Form Guide system.

Then start **F2a** (Simple/Pro Mode toggle) on branch `cursor/simple-pro-mode-699d` after plan approval.

*Last updated: 2026-06-29*
