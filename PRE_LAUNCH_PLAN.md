# Pre-Launch Plan — Mission Winning

**Purpose:** Single checklist before `PRIVATE_MODE=false` and public launch.  
**Last updated:** 2026-06-29 (post Phase G PFT track, build `.45`)  
**Vision alignment:** [VISION_STATUS.md](VISION_STATUS.md) · **Build phases:** [PLAN.md](PLAN.md)

---

## Where we are now

### Shipped (feature-complete for private beta)

| Area | Status | Notes |
|------|--------|-------|
| **Free core** | ✅ | Train, Fuel, Move, Mind, Track, Learn — usable without premium |
| **Journey (F1–F3)** | ✅ | I-Day → Basic → Readiness → Commissioned; cloud sync |
| **Unified UI** | ✅ | One shell — no Simple/Pro; journey phase drives Today layout |
| **Auth & privacy** | ✅ | Google + email, consent gate, SignInPrompt on tool pages; Apple opt-in via env |
| **i18n Tier 1 (G1)** | ✅ | EN, ES, FR, PT, RU, DE, IT, KO, JA — nav, welcome, journey chrome |
| **i18n Tier 2 (G1b)** | ✅ | TH, VI, HI, ZH, ID — nav, welcome, journey chrome |
| **Welcome i18n (G2 partial)** | ✅ | Full I-Day flow: en, zh, id, th, es (`welcomeLocales.ts`) |
| **Today i18n (G2 partial)** | ✅ | Accordion chrome + main sections: en, es, zh, id, th (`todayLocales.ts`) |
| **Beta invite kit** | ✅ | `/beta` start guide + [BETA_INVITE.md](BETA_INVITE.md) |
| **Leaderboard i18n** | ✅ partial | Title, boards, scopes in EN/ES/FR/JA/DE/TH/ZH/ID |
| **Form guides (G2)** | ✅ | 50+ text-only exercise guides |
| **Legal (F4 partial)** | ✅ | `/privacy`, `/terms`, AppLegalFooter on Profile/Welcome/private |
| **Beta metrics (F4 partial)** | ✅ | `/api/beta/metrics`, founder panel on Profile |
| **Leaderboard** | ✅ | GT7-style scopes + 7 boards (incl. Presidential Fitness, night/dawn) |
| **PFT / America track (Phase G)** | ✅ | `/america`, `/fitness-test`, school classes, teacher dashboard, youth consent |
| **Supabase schema** | ✅ | profiles, journey_events, leaderboard_snapshots, school/PFT tables |
| **Build label** | ✅ | `2025.06-unified.45` on Profile footer |

### Open PR stack

Most core work is merged to `master` (through PR #59 / build `.45`). Remaining **draft PRs** (#43–#48, #9) are separate train/fuel/i18n features — review individually; not required for Phase H launch.

When Vercel access is restored: GitHub Secrets → run **Sync Vercel env** → redeploy → verify build label → `npm run gate-smoke` (optional `SMOKE_ACCESS_SECRET` for `/fitness-test`).

### While Vercel is blocked — continue locally

| Priority | Task | Status |
|----------|------|--------|
| 1 | Today i18n + HomePage refactor | ✅ `todayLocales.ts`, `TodayWeekSection`, `TodayProgressSection`, `starterPrograms.ts` |
| 2 | Fuel i18n + SignInPrompt | ✅ `fuelLocales.ts` (en/es/zh/id/th) + SignInPrompt |
| 3 | Challenge copy i18n | ✅ `challengeI18n.ts` + `todayLocales` keys |
| 4 | Customizable Today cards | ✅ show/hide + reorder (`todayDashboardPrefs` v2) |
| 5 | Photo log → local estimate stub | ✅ `estimateMealFromPhoto.ts`, `PhotoLogStub` |
| 6 | Wins badge i18n | ✅ `todayLocales` + `TodayProgressSection` |
| 7 | Staggered Today hero animations | ✅ `StaggerReveal` on HomePage |
| 8 | Security P1 (PayPal sig, CSP) | ✅ PayPal verify + CSP enforce in prod (`next.config.js`) |
| 9 | Leads API rate limit | ✅ `/api/leads` + `submitLead` via server |
| 10 | Pro program templates server-split | ✅ `premiumProgramTemplates.ts` |
| 11 | Arabic locale + RTL | ✅ `meaLocales.ts`, welcome/today/fuel ar |
| 12 | Nav + Fuel science i18n | ✅ `navLocales.ts`, header dropdown, muscle groups |
| 13 | Readiness + coach insight i18n | ✅ status keys, metrics rings, coach card, focus line |
| 14 | Pillar score i18n + Today cleanup | ✅ pillar breakdown; dev-only founder tools |
| 15 | CI + core unit tests | ✅ GitHub Actions; score + PayPal parse tests |
| 16 | Goal presets i18n + locale JSON export | ✅ journeyGoals, welcome chips, export-locales |
| **Build label** | ✅ | `2025.06-unified.17` on Profile footer |

### While Vercel is blocked

Ship locally on branch stack `#22`–latest; merge to `master` when ready. No deploy until 2FA reset — use `npm run dev` + Profile build label to verify. See [VERCEL_DEPLOY_CHECKLIST.md](VERCEL_DEPLOY_CHECKLIST.md) for env + curl steps on day one of access.

---

## Launch gates (must pass before public)

From [JOURNEY.md](JOURNEY.md) and [PROTECTION.md](PROTECTION.md):

### Product gates (F4)

| Gate | Target | How to measure |
|------|--------|----------------|
| Beta cohort | ≥10 real users | Supabase `profiles` count |
| I-Day completion | ≥80% | `journey_events` + founder panel |
| Basic Training 5/5 | ≥60% | Launch gate on Profile beta panel |
| Commissioned in 14 days | ≥25% (stretch) | `journey_commissioned` events |
| “Where do I start?” support | →0 | Manual feedback |

**Do not set `PRIVATE_MODE=false` until Basic Training ≥60% in beta.**

### Security gates (PROTECTION P0)

| Task | Status | Blocker |
|------|--------|---------|
| Rotate `PRIVATE_ACCESS_SECRET` | ⬜ | Needs Vercel |
| `DEMO_PREMIUM=false` in production | ⬜ | Needs Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` in Vercel | ⬜ | Needs Vercel |
| `STRIPE_WEBHOOK_SECRET` (if Stripe live) | ⬜ | Payment setup |
| `BETA_ADMIN_EMAILS` for founder panel | ⬜ | Needs Vercel |
| Gate curl verification | ⬜ | Needs deployed URL |
| Premium API 403 without enrollment | ⬜ | Verify after deploy |
| Privacy + Terms linked | ✅ | Done |
| Supabase schema + RLS | ✅ | You ran migrations |

### Hero flow (manual QA before public)

One polished path on **mobile**:

1. `/welcome` I-Day (≤3 min)
2. Today → Start first workout
3. Complete workout → Win Score updates
4. Sign in → cloud sync visible on Profile
5. Language switch → nav labels change (Tier 1)

---

## i18n roadmap — Tier 2 languages (Thai, etc.)

### Current coverage

| Tier | Languages | What's translated |
|------|-----------|-------------------|
| **Tier 1** | EN, ES, FR, PT, RU, DE, IT, KO, JA | Nav, welcome, journey, form UI, profile chrome (~40 keys) |
| **Full `i18n.ts`** | EN + partial ES/FR/PT/RU | ~100+ keys per language (Today, nutrition, assessments…) |
| **Not translated** | — | ~90% of page copy (HomePage body, Builder, Library, leaderboard, legal pages) |

### Tier 2 — next languages (priority order)

| Priority | Code | Language | Region rationale |
|----------|------|----------|------------------|
| 1 | **th** | Thai | Southeast Asia; large mobile fitness market |
| 2 | **vi** | Vietnamese | SEA growth |
| 3 | **hi** | Hindi | India — huge bodyweight/home gym audience |
| 4 | **zh** | Chinese (Simplified) | Global reach (zh-CN) |
| 5 | **ar** | Arabic | MEA; RTL layout required |
| 6 | **id** | Indonesian | SEA |
| 7 | **tr** | Turkish | Europe/MEA bridge |
| 8 | **pl** | Polish | EU |
| 9 | **nl** | Dutch | EU |
| 10 | **sv** | Swedish | Nordic |

### Tier 2 implementation pattern (per language)

**Phase G1b — one branch per language or batch of 3:**

1. Add to `TIER2_LANGS` in `src/i18n/tier2Locales.ts` (same keys as Tier 1 core)
2. Profile language picker + `lang_xx` native name
3. `regions.ts` locale → country mapping (e.g. `th` → Thailand, Asia-Pacific)
4. Merge into `i18n.ts` resources loop
5. **Do not** translate full `i18n.ts` inline yet — use EN fallback for body copy

**Phase G2 — extract & translate (post-beta):**

1. Move strings to `public/locales/{lang}/common.json`
2. Priority pages: `/welcome`, `/log`, `/active`, `/nutrition`, `/profile`
3. Arabic: add `dir="rtl"` via `HtmlLangSync` + CSS
4. Form guides: translate top 20 exercises per language (not all 50+ at once)

### Thai (th) — first Tier 2

Scaffold added in `src/i18n/tier2Locales.ts` with full Tier-1-equivalent core strings. Body copy remains English until G2 extraction.

---

## What to build next (recommended order)

See [PLAN.md](PLAN.md) Phase **H** (launch) and **I** (premium). Summary:

### Now — Phase H (private beta → public)

| # | Task |
|---|------|
| 1 | Beta cohort 10+ users; track I-Day / BT funnel on Profile |
| 2 | GitHub Secrets + **Sync Vercel env** ([ENV.md](ENV.md)) |
| 3 | Run all Supabase migrations (incl. PFT/school) |
| 4 | `npm run gate-smoke` on production URL |
| 5 | Pass beta gates → `PRIVATE_MODE=false` + PWA enable |

### After launch — Phase I (vision revenue + depth)

| # | Task |
|---|------|
| 1 | Live Stripe Super Bundle checkout |
| 2 | AI Coach v1 (premium-gated plan generator) |
| 3 | i18n G2 body copy (Tier 1 languages) |
| 4 | One premium pillar MVP (Track / Mind / Move) |

---

## Supabase migrations checklist

Run in SQL Editor (idempotent where noted):

| Migration | Purpose |
|-----------|---------|
| `20250629_complete_base_schema.sql` | Full base if starting fresh |
| `20250629_journey_state.sql` | Journey sync columns (if profiles existed without them) |
| `20250629_journey_events.sql` | Analytics events |
| `20250629_leaderboard.sql` | Leaderboard snapshots |
| `20250629_leaderboard_squad_patch.sql` | Squad code + night/dawn columns |
| `20250629_fitness_test_school.sql` | School classes + fitness_test_results |
| `20250629_pft_leaderboard_teacher_pin.sql` | PFT scores on leaderboard + teacher_pin |
| `20250629_youth_consent_records.sql` | Verified youth consent (signed-in athletes) |

Verify tables: `profiles`, `workout_logs`, `nutrition_logs`, `enrollments`, `leads`, `journey_events`, `leaderboard_snapshots`, `school_classes`, `fitness_test_results`, `youth_consent_records`.

---

## Explicitly defer until post-public

- Video form guides / CDN
- AI Coach v1
- GPS / activity import
- PayPal webhook env setup when LLC + PayPal dashboard ready (verify code shipped)
- Full 9-language body copy (100% UI)
- Apple native app
- `PRIVATE_MODE=false` before beta gates

---

## Success definition for “ready to go public”

```
✅ Beta: 10+ users, I-Day ≥80%, BT ≥60%
✅ PROTECTION P0: secrets rotated, DEMO_PREMIUM=false, curl checks pass
✅ Hero mobile flow QA’d end-to-end
✅ Supabase migrations applied
✅ Privacy + Terms live
✅ Tier 1 (+ Tier 2 priority langs) nav/welcome work
✅ Vercel deployed with correct env
→ Set PRIVATE_MODE=false
```

---

## Quick reference docs

| Doc | Use |
|-----|-----|
| [JOURNEY.md](JOURNEY.md) | Member path + F4 gates |
| [PROTECTION.md](PROTECTION.md) | Security P0/P1/P2 |
| [ENV.md](ENV.md) | Vercel env vars |
| [PLAN.md](PLAN.md) | Phase A–I roadmap |
| [VISION_STATUS.md](VISION_STATUS.md) | Vision vs reality scorecard |
| [LOG.md](LOG.md) | Shipped changelog |

---

*Next implementation: **Phase H** beta cohort + Vercel env sync — see [PLAN.md](PLAN.md).*
