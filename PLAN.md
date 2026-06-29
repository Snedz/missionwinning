# Mission Winning — Build Plan

Living roadmap for the **everything app** (Freeletics Super Bundle → one PWA). Filter every task through [vision.md](vision.md).

## Design north stars (UI + product)

| Source | What we borrow |
|--------|----------------|
| **Bevel** | Dark premium UI, metric-first dashboard (Readiness / Strain / Recovery) |
| **Freeletics** | Freemium core, Coach, Super Bundle, streaks, challenges, pillar structure |
| **CrossFit app** | WOD logging, timers, daily workout rotation, benchmark culture |
| **Muscle & Fitness / Bodybuilding.com** | Exercise library depth, filters, programs, education tone |

Mission Winning is **none of these** — one unified super app, free core forever, global PWA.

---

## Phase status

| Phase | Focus | Status |
|-------|-------|--------|
| **A** | Free core alignment (nutrition, streaks, challenges, today's workout, leads) | ✅ Done — see [LOG.md](LOG.md) |
| **B** | Six working pillar free tiers (Move, Mind, Learn, Track) | ✅ Done — see [LOG.md](LOG.md) |
| **C** | Super Bundle synergy + Supabase hardening | ✅ Done — see [LOG.md](LOG.md) |
| **D** | Content scale (200+ exercises, Learn paths) | ✅ Done — see [LOG.md](LOG.md) |
| **F** | Simple UI + Mission Journey (I-Day → Commissioned) | **Next** — see [JOURNEY.md](JOURNEY.md) |
| **E** | Go public (Vercel env, PRIVATE_MODE=false) | After F + [PROTECTION.md](PROTECTION.md) P0 |

---

## Phase A — Free core alignment ✅

1. Un-gate basic nutrition (log, water, targets, 12 free recipes)
2. Weekly challenges + streak on `/log` dashboard
3. Today's Workout rotation (CrossFit / Freeletics feel)
4. Exercise library dedupe + 25 new bodyweight/global entries
5. Coaching + Feedback → Supabase `leads` (local fallback)

**Done when:** Zero premium required to train, log food, and see progress.

---

## Phase B — Pillar free tiers ✅

- **Move:** Timed flow step-through + completion log
- **Mind:** Breathing timer + daily check-in
- **Learn:** 5 free education paths with lesson cards
- **Track:** New `/track` route — manual activity log
- **Mobile nav:** Bottom tabs or collapsible sidebar for PWA

**Done when:** Each pillar has a usable free-tier experience, not just static lists.

---

## Phase C — Bundle & backend ✅

- Cross-pillar Win Score weighting (Train ~40%, Fuel ~15%, Move/Mind/Track/Learn ~45%)
- Bundle comparison UI on `/bundle` (“7 tools, 1 price” table + savings)
- Supabase schema + RLS in `supabase/schema.sql`
- Auto-merge cloud workout history (fingerprint dedup) on sign-in
- Stripe Payment Link hook + `/api/stripe-webhook` placeholder

---

## Phase D — Content ✅

- Exercise library expanded to 200+ with cues, alternatives, and program tags (strength / hypertrophy / conditioning / corrective)
- Library filters by style, equipment, and level; alternatives shown on each card
- Program templates tagged + 4 new templates (EMOM, Engine Builder, Desk Reset, PPL Hypertrophy)
- 3 new ISSA-aligned Learn paths (Corrective, Periodization, Coaching)

---

## Phase F — Journey & simple UI (before public) ← **NEXT**

Full spec: **[JOURNEY.md](JOURNEY.md)**

**Goal:** Foolproof UI + DoD-inspired member path (I-Day → Basic Training → Readiness → Commissioned).

| Sub-phase | Deliverable |
|-----------|-------------|
| **F1** | `missionJourney.ts`, `/welcome` I-Day flow, Today = one hero CTA |
| **F2** | Sidebar → 5 tabs + More; HomePage declutter; commissioning moment |
| **F3** | Journey sync to Supabase; beta metrics |
| **F4** | Phase E launch only after journey + PROTECTION P0 |

**Done when:** New user completes I-Day in &lt;3 min and always knows the next single action on Today.

---

## Phase E — Launch (after F + protection)

See **[PROTECTION.md](PROTECTION.md)** for inspection checklist and **[JOURNEY.md](JOURNEY.md)** for UX gates before setting `PRIVATE_MODE=false`.

1. Complete Phase F (Journey + simple UI) — [JOURNEY.md](JOURNEY.md)
2. Vercel: rotate `PRIVATE_ACCESS_SECRET`, Supabase keys, `DEMO_PREMIUM=false`
3. Run protection verification commands in PROTECTION.md
4. Beta testers (10–20) — track I-Day → Commissioned funnel
5. `PRIVATE_MODE=false` for public launch

---

## Git workflow (Mac + GitHub + Vercel)

```
GitHub (source of truth)
   ↑ push / merge
Cursor / Cloud Agent (implements)
   ↓ git pull
Your Mac (local dev: npm run dev)
   ↓ auto-deploy when Vercel connected
www.missionwinning.com
```

On your Mac after we push:

```bash
cd ~/missionwinning   # or your clone path
git pull origin master
npm install           # if package.json changed
npm run dev
```

Open http://localhost:3000

---

Last updated: 2026-06-29 (Phase F plan — JOURNEY.md)
