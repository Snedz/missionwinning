# Mission Winning — Build Plan

Living roadmap for the **everything app** (Freeletics Super Bundle → one PWA). Filter every task through [vision.md](vision.md).

**Vision comparison:** [VISION_STATUS.md](VISION_STATUS.md) — pillar scorecard, gaps, priorities.  
**Rural equity & connectivity:** [RURAL_EQUITY_PLAN.md](RURAL_EQUITY_PLAN.md) — offline, Pathfinder, accessibility.

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
| **A** | Free core alignment (nutrition, streaks, challenges, today's workout, leads) | ✅ Done — [LOG.md](LOG.md) |
| **B** | Six working pillar free tiers (Move, Mind, Learn, Track) | ✅ Done |
| **C** | Super Bundle synergy + Supabase hardening | ✅ Done |
| **D** | Content scale (200+ exercises, Learn paths) | ✅ Done |
| **F** | Simple UI + Mission Journey (I-Day → Commissioned) | ✅ Done — [JOURNEY.md](JOURNEY.md) |
| **G** | PFT / America track (school, teacher, youth, leaderboard) | ✅ Done — build `.45` |
| **H** | Public launch + PWA + security P0 | ⬜ **Blocked** — [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md) |
| **I** | Premium depth + AI Coach + live payments | ⬜ Next after H |
| **J** | Rural equity — offline, Pathfinder, a11y, connectivity | ⬜ Planned — [RURAL_EQUITY_PLAN.md](RURAL_EQUITY_PLAN.md) |

> **Naming:** Journey “Phase 0–3” (JOURNEY.md) ≠ build phases here ≠ PFT sub-phases G1–G8 ≠ rural J1–J6.

---

## Phase G — PFT / America track (G1–G8) ✅

Optional US national-fitness side track (`NEXT_PUBLIC_AMERICA_TRACK_ENABLED`). Does not replace global mission.

| Sub | Deliverable | PR / build |
|-----|-------------|------------|
| **G1** | Presidential Fitness Test scoring, `/fitness-test`, `/america` | #52 |
| **G2** | School class codes, youth gate, PFT cloud sync | #53 |
| **G3** | Teacher dashboard, Week 1 printable, class API | #54 |
| **G4** | PFT leaderboard board, teacher PIN, verified youth consent | #55 |
| **G5** | Youth consent server sync, class leaderboard scope | #56 |
| **G6** | Teacher creator auth, print/CSV export, council hero tiers | #57 |
| **G7** | Hashed teacher PINs, council i18n (es/fr/ja/de/zh) | #58 |
| **G8** | HTML class report export, PFT gate-smoke, council env hints | #59 |

**Ops before prod:** Run Supabase migrations (`fitness_test_school`, `pft_leaderboard_teacher_pin`, `youth_consent_records`); set `RESEND_API_KEY`, `YOUTH_CONSENT_SECRET`; legal OK before `NEXT_PUBLIC_SHOW_MAHA_COPY=true`.

**Done when:** `/america` + `/fitness-test` pass gate smoke; teacher export works; build label on Profile matches deploy.

---

## Phase H — Launch & global accessibility ⬜

*Formerly “Phase E” in older docs.* See [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md) · [LAUNCH_DAY.md](LAUNCH_DAY.md) · `npm run phase-h-readiness`

### Product gates (F4 / JOURNEY)

| Gate | Target |
|------|--------|
| Beta cohort | ≥10 real users |
| I-Day completion | ≥80% |
| Basic Training 5/5 | ≥60% |
| Commissioned in 14 days | ≥25% stretch |

**Do not set `PRIVATE_MODE=false` until Basic Training ≥60% in beta.**

### Security & infra gates

| Task | Status |
|------|--------|
| Rotate `PRIVATE_ACCESS_SECRET` | ⬜ Vercel / GitHub Secrets |
| `DEMO_PREMIUM=false` in production | ⬜ |
| Supabase service role + migrations | ⬜ |
| GitHub → Vercel env sync workflow | ✅ #51 — run manually |
| Gate + PFT smoke (`npm run gate-smoke`) | ✅ script shipped |
| Privacy + Terms | ✅ |
| Enable PWA (`PRIVATE_MODE=false`) | ⬜ |

### Hero flow QA (mobile)

1. `/welcome` I-Day (≤3 min)
2. Today → Start first workout
3. Complete workout → Win Score updates
4. Sign in → cloud sync on Profile
5. Language switch → nav labels change

**Done when:** Public URL, installable PWA, premium API 403 without enrollment, beta gates pass.

---

## Phase I — Premium parity & synergy ⬜

Aligns revenue with [vision.md](vision.md) without gating free core.

| Sub | Deliverable | Vision link |
|-----|-------------|-------------|
| **I1** | Live Stripe bundle + verified webhook → `enrollments` | Super Bundle revenue engine |
| **I2** | AI Coach v1 — plan generator, premium-gated Train Coach | “Personal trainer in pocket” |
| **I3** | One pillar premium MVP (Track GPS, Mind audio, or Move video) | Replace Unlock placeholders |
| **I4** | i18n G2 — Today/Fuel/Active/Welcome body for Tier 1 + AR RTL | Global equity |
| **I5** | Cross-pillar recommendation depth (coach → multi-pillar CTAs) | 1+1+1 > sum |

**Done when:** Paying users get differentiated premium; free core unchanged; bundle LTV measurable.

---

## Phase J — Rural equity & connectivity ⬜

**Master plan:** [RURAL_EQUITY_PLAN.md](RURAL_EQUITY_PLAN.md)

For people **rural, offline, and far from a doctor** — complementary to telehealth/surgery (Musk thesis: expertise doesn’t scale; we scale **prevention**).

| Sub | Deliverable | Depends on |
|-----|-------------|------------|
| **J1** | PWA on + offline shell + connection stripe banner | Phase H |
| **J2** | IndexedDB `MissionLocalStore` + sync outbox | J1 |
| **J3** | Pathfinder Assessment — “no regular doctor access” path + low-impact gating | — |
| **J4** | a11y (text scale, focus audit) + PAR-Q i18n Tier 1 | — |
| **J5** | Rural/bodyweight preset chain (Welcome → Today → Library) | — |
| **J6** | Offline coach v2 + printable Village Health Card | J2 |

**Parallel with H:** J3–J5 can ship while still gated; J1–J2 need `PRIVATE_MODE=false`.

**Immediate next commits:** Pathfinder track · ConnectivityProvider · bodyweight default chain.

**Done when:** ≥40% sessions complete offline (target); Pathfinder path live; Tier 1 assessment i18n; bodyweight default for new users.

---

## Phase A–D + F (archive summary)

<details>
<summary>Phases A–D, F — completed (click to expand)</summary>

### Phase A — Free core ✅
Nutrition un-gated, challenges, Today's Workout, exercise library, leads API.

### Phase B — Pillar free tiers ✅
Move, Mind, Learn, Track usable free experiences.

### Phase C — Bundle & backend ✅
Win Score weighting, bundle page, Supabase schema, cloud merge.

### Phase D — Content ✅
200+ exercises, program tags, 8 Learn paths.

### Phase F — Journey & unified UI ✅
I-Day → Commissioned, 5-tab nav, More for everyone, beta metrics, legal pages. See [UX_UNIFIED_PLAN.md](UX_UNIFIED_PLAN.md).

</details>

---

## Recommended work order (now)

1. **Phase H prep** — beta invites, metrics, Supabase migrations, GitHub Secrets → Sync Vercel env
2. **Phase H launch** — gates pass → `PRIVATE_MODE=false` → PWA on
3. **Phase J3 + J5** (parallel with H) — Pathfinder assessment + bodyweight rural preset
4. **Phase J1–J2** — offline shell, IndexedDB, sync outbox (after H)
5. **Phase I1** — live payments (highest revenue impact)
6. **Phase I2 + J4** — AI Coach premium + a11y / assessment i18n (parallel)
7. **Phase I3 + J6** — one premium pillar proof + offline coach v2
8. **Open draft PRs** (#43–#48) — merge or close individually (train/fuel/i18n features, not PFT)

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

```bash
cd ~/missionwinning
git pull origin master
npm install
npm run dev
```

---

Last updated: 2026-06-29 (Phase G complete; Phase H/I/J roadmap; see VISION_STATUS.md + RURAL_EQUITY_PLAN.md)
