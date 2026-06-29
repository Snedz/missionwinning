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
| **A** | Free core alignment (nutrition, streaks, challenges, today's workout, leads) | ✅ In progress — see [LOG.md](LOG.md) |
| **B** | Six working pillar free tiers (Move, Mind, Learn, Track) | Planned |
| **C** | Super Bundle synergy + Supabase hardening | Planned |
| **D** | Content scale (200+ exercises, Learn paths) | Ongoing |
| **E** | Go public (Vercel env, PRIVATE_MODE=false) | Blocked on Vercel 2FA reset |

---

## Phase A — Free core alignment ✅

1. Un-gate basic nutrition (log, water, targets, 12 free recipes)
2. Weekly challenges + streak on `/log` dashboard
3. Today's Workout rotation (CrossFit / Freeletics feel)
4. Exercise library dedupe + 25 new bodyweight/global entries
5. Coaching + Feedback → Supabase `leads` (local fallback)

**Done when:** Zero premium required to train, log food, and see progress.

---

## Phase B — Pillar free tiers (next)

- **Move:** Timed flow step-through + completion log
- **Mind:** Breathing timer + daily check-in
- **Learn:** 5 free education paths with lesson cards
- **Track:** New `/track` route — manual activity log
- **Mobile nav:** Bottom tabs or collapsible sidebar for PWA

---

## Phase C — Bundle & backend

- Cross-pillar Win Score weighting
- Bundle comparison UI (“7 tools, 1 price”)
- Supabase schema + RLS + auto-merge cloud history
- Stripe Payment Links when LLC ready

---

## Phase D — Content

- Exercise library → 200+ with cues and alternatives
- Program tags (strength, hypertrophy, conditioning, corrective)
- Original Learn content from ISSA-aligned materials

---

## Phase E — Launch

1. Vercel: `PRIVATE_ACCESS_SECRET=Done`, `PRIVATE_MODE=true`, Supabase keys
2. Beta testers (10–20)
3. `PRIVATE_MODE=false` for public launch

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

Last updated: 2026-06-29 (Phase A)
