# Flow architecture — chip floorplan

**Audience:** Founder + agents  
**Baseline:** web `2026.07-unified.502`+  
**Lens:** Two dies, power domains, buses, critical path, dual-pad hazards  
**Related:** [JOURNEY.md](JOURNEY.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [YC_THESIS.md](YC_THESIS.md) · [vision.md](../vision.md)

This is the **information / navigation flow** of missionwinning.com — not visual tokens ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)) and not build phases ([PLAN.md](PLAN.md)).

---

## 1. Die floorplan

```text
PACKAGE (missionwinning.com)
├── DIE A: Marketing / SEO     MarketingNav + Footer
│     /  /guide  /exercises  /paths  /compare  /about  /vision  /press  /beta  legal
└── DIE B: App habit shell     AppLayout + 4 tabs + More
      /log  /active  /coach  /nutrition  + MoreSheet / rail peripherals
```

| Die | Job | Chrome | Success |
|-----|-----|--------|---------|
| **A** | Acquire, educate, legal | Marketing | Land → first free set (or beta path) |
| **B** | Habit loop | Today · Train · Coach · Fuel · More | Week-4 retained weekly loggers |

**Rule:** SEO density stays off the habit critical path. Habit tools on marketing need one clear **Start free** pin (`/welcome`).

### Power domains

| Domain | Effect |
|--------|--------|
| `PRIVATE_MODE` | Prod can serve mostly `/private` until founder flip |
| `FREE_BETA` | Bundle muted; depth unlocked |
| `isPathEnabled` | Parks America / leaderboard / wearables, etc. |
| Journey phase | Today: Lean (`i-day`/`basic`) vs Dashboard (`readiness`+) |

Agents never flip `PRIVATE_MODE` or invent traction.

---

## 2. Buses

### Mobile tab bus (highest current)

```text
Today /log │ Train /active │ Coach /coach │ Fuel /nutrition │ More (sheet)
```

Source: [`src/lib/primaryNav.ts`](../src/lib/primaryNav.ts) — `MOBILE_TAB_HREFS` + More. `PRIMARY_NAV` still registers You (`/profile`) for the rail.

### Desktop rail

| Group | Routes |
|-------|--------|
| Train | `/log` `/active` `/coach` `/history` |
| Pillars | `/nutrition` `/move` `/mind` `/track` `/learn` |
| Toolkit | `/assessments` `/library` `/builder` `/profile` |

Source: [`src/lib/navConfig.ts`](../src/lib/navConfig.ts) `RAIL_GROUPS`.

### Marketing footer

| Product | Learn | Company | Legal |
|---------|-------|---------|-------|
| Start free, Compare, How Coach adapts (, Bundle) | Guide, Exercises, Paths, Beta | About, Press, Vision, Feedback | Privacy, Terms, DMCA, Refunds |

Source: [`src/components/marketing/footerLinks.ts`](../src/components/marketing/footerLinks.ts).

### Journey phase clock

```text
i-day → basic → readiness → commissioned
```

Today mux: `HomeTodayLean` vs `HomeTodayDashboard` ([`HomePage.tsx`](../src/page-components/HomePage.tsx)). Full ladder: [JOURNEY.md](JOURNEY.md).

---

## 3. Critical path (only net with hard timing)

Horizon W: Train → Today → Victory → Coach excellence.

```text
[SEO or /private]     [returning]
        │                   │
        ▼                   ▼
   /welcome or /log ──── /log (Today) ── one boss CTA
        │
        ▼
   /active ── log set ── rest ── victory ── /log or /coach adapt
```

| Stage | Route | Boss pin |
|-------|-------|----------|
| Intake | `/welcome` | Begin / Continue |
| Command | `/log` | Start / resume |
| Execute | `/active` | Log set |
| Reward | Victory | Done (one primary) |
| Adapt | `/coach` | Week / adjust |

**Naming trap:** Mission Coach = AI weekly plan (`/coach`). Human 1:1 = `/coaching`. Footer “How Coach adapts” = landing `/#coach`, not human coaching.

---

## 4. Dual-pad hazards (do not reintroduce)

| Concept | SEO / marketing | In-app | Bridge rule |
|---------|-----------------|--------|-------------|
| Exercises | `/exercises` | `/library` | SEO CTA → free logger / welcome |
| Guide | `/guide` | `/learn/guide` | Prefer one content body; public magazine canonical for SEO |
| Paths | `/paths` | `/learn` | Teaser → in-app learn |
| Coach | `/#coach` landing | `/coach` app | Never conflate with `/coaching` |
| Today | `/` landing | `/log` | Landing acquires; `/log` is daily command |

---

## 5. Improvement backlog (ships)

| ID | Theme | Status |
|----|--------|--------|
| **Flow-0** | This doc + INDEX routing | **done `.494`** |
| **Flow-1** | Footer Product: Start free first; Coach → “How Coach adapts” | **done `.494`** |
| **Flow-2** | Exercises → Train bridge (`/active?exercise=`) | **done `.495`** |
| **Flow-3** | Guide + Paths single content handoff | **done `.496`** |
| **Flow-4** | More sheet tiers (Wedge / Pillars / You) | **done `.497`** |
| **Flow-5** | Founder phone dogfood critical path only | founder |
| **Flow-6** | Readiness Today boss = train-first (not PAR-Q / guidebook) | **done `.499`** |
| **Flow-7** | Coach invite mounts early readiness (sessions 1–3) | **done `.499`** |
| **Flow-8** | Library chrome “Today Hub” → “Today” | **done `.499`** |
| **K1** | Product language: no user-facing “Today Hub” | **done `.500`** |
| **K2** | JOURNEY readiness boss = train-first (doc pin) | **done `.500`** |
| **K4** | Active empty: Today outline > Builder quiet | **done `.500`** |
| **K3** | Coach invite vs week strip (no dual generate CTA) | **done `.501`** |
| **K5** | Week-1 contract: readiness primary = train | **done `.501`** |
| **K6** | Basic complete branch no longer bosses Coach | **done `.502`** |
| **K7** | History “Train this again” → `/active` | **done `.502`** |

Defaults until founder overrides: keep full free-beta More depth; public `/guide` stays magazine home; early-journey pillar hide deferred.

**Readiness boss rule (Flow-6):** while `!streakMet`, JourneyHero primary is train (`/active`, week-1 session-2 copy at exactly one log). PAR-Q remains required to *commission*; guidebook stays First Steps / Learn / More — never Today primary on the open commitment window.

---

## 6. Non-goals

New pillars · America · locale farms · rebrand · `PRIVATE_MODE` flip · inventing traction · “everything hub” pages (more fan-out).

---

## 7. Code entry points

| Concern | Path |
|---------|------|
| Tabs | `src/lib/primaryNav.ts` |
| Rail + More registry | `src/lib/navConfig.ts` |
| Footer / public nav | `src/components/marketing/footerLinks.ts` |
| More sheet tiers | `src/lib/moreSheetTiers.ts` |
| Journey | `src/lib/missionJourney.ts`, `docs/JOURNEY.md` |
| Surface parking | `src/lib/surface.ts` |
| Private gate | `src/lib/privateGate.ts`, `src/lib/publicRoutes.ts` |
| Route shells | `app/INDEX.md` |
