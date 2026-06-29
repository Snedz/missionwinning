# Pre-Launch Plan — Mission Winning

**Purpose:** Single checklist before `PRIVATE_MODE=false` and public launch.  
**Last updated:** 2026-06-29  
**Vercel access:** Deferred — local + Supabase work can continue without it.

---

## Where we are now

### Shipped (feature-complete for private beta)

| Area | Status | Notes |
|------|--------|-------|
| **Free core** | ✅ | Train, Fuel, Move, Mind, Track, Learn — usable without premium |
| **Journey (F1–F3)** | ✅ | I-Day → Basic → Readiness → Commissioned; cloud sync |
| **Simple / Pro UI (F2)** | ✅ | 5-tab Simple default; Pro = full Today + More tools |
| **i18n Tier 1 (G1)** | ✅ | EN, ES, FR, PT, RU, DE, IT, KO, JA — nav, welcome, journey chrome |
| **Form guides (G2)** | ✅ | 50+ text-only exercise guides |
| **Legal (F4 partial)** | ✅ | `/privacy`, `/terms`, linked from `/about` |
| **Beta metrics (F4 partial)** | ✅ | `/api/beta/metrics`, founder panel on Profile |
| **Leaderboard** | ✅ | GT7-style scopes + 6 boards (incl. Under the Stars, By Dawn's Early Light) |
| **Supabase schema** | ✅ | profiles, journey_events, leaderboard_snapshots, logs, RLS |

### Open PR stack (merge in order)

| PR | Branch | Content |
|----|--------|---------|
| #8 | `cursor/journey-i-day-699d` | F1 journey + I-Day |
| #9 | `cursor/ux-global-plan-699d` | UX plan doc |
| #10 | `cursor/simple-pro-mode-699d` | F2a Simple/Pro |
| #11 | `cursor/f2d-g1-form-guides-699d` | F2b commissioning, G1/G2 |
| #12 | `cursor/f3-journey-sync-699d` | F3 sync + Japanese |
| #13 | `cursor/f3-analytics-nudge-699d` | Analytics + email nudge |
| #14 | `cursor/f4-beta-launch-699d` | Beta funnel + legal |
| #15 | `cursor/leaderboard-gt7-699d` | Leaderboard base |
| #17 | `cursor/leaderboard-dawn-stars-699d` | Night + dawn boards, deep links, Today wins |

**Recommendation:** Squash-merge or rebase stack into `master` in one integration pass before beta invites, then deploy from a single release tag.

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

Work **without Vercel** until access is restored.

### Now — private beta prep

| # | Task | Branch idea | Effort |
|---|------|-------------|--------|
| 1 | **Merge PR stack** to `master` locally; fix conflicts | `cursor/release-integration-699d` | Integration |
| 2 | **Tier 2 i18n:** Thai + Vietnamese + Hindi core chrome | `cursor/i18n-tier2-sea-699d` | Small |
| 3 | **Leaderboard SQL** if not run: `20250629_leaderboard.sql` | — | 5 min |
| 4 | **Beta invite kit:** 10 users, private gate code, 1-page “start here” | doc or `/beta` | Small |
| 5 | **Extract Today + Welcome strings** to JSON for ES/FR/TH | `cursor/i18n-extract-today-699d` | Medium |
| 6 | **Simple mode leaderboard link** (streak chip → `/leaderboard`) | small | Tiny |

### When Vercel access returns — deployment

| # | Task |
|---|------|
| 1 | Set env vars per [ENV.md](ENV.md) + [PROTECTION.md](PROTECTION.md) |
| 2 | Redeploy; verify gate in incognito |
| 3 | Enable PWA (`PRIVATE_MODE=false` only after beta gates) |
| 4 | `RESEND_API_KEY` for journey nudge emails (optional) |
| 5 | Custom domain DNS check |

### After beta metrics pass — Phase E (public)

| # | Task |
|---|------|
| 1 | `PRIVATE_MODE=false` |
| 2 | Stripe live + verified webhook |
| 3 | PROTECTION P1 (PayPal verify, CSP, leads rate limit) |
| 4 | App Store / PWA install prompt on landing |
| 5 | Tier 2 full page translation rollout |

---

## Supabase migrations checklist

Run in SQL Editor (idempotent where noted):

| Migration | Purpose |
|-----------|---------|
| `20250629_complete_base_schema.sql` | Full base if starting fresh |
| `20250629_journey_state.sql` | Journey sync columns (if profiles existed without them) |
| `20250629_journey_events.sql` | Analytics events |
| `20250629_leaderboard.sql` | Leaderboard snapshots |

Verify 6+ tables: `profiles`, `workout_logs`, `nutrition_logs`, `enrollments`, `leads`, `journey_events`, `leaderboard_snapshots`.

---

## Explicitly defer until post-public

- Video form guides / CDN
- AI Coach v1
- GPS / activity import
- PayPal webhook (until signature verify)
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
| [PLAN.md](PLAN.md) | Phase A–F roadmap |
| [LOG.md](LOG.md) | Shipped changelog |

---

*Next implementation suggestion: **Tier 2 Thai/Vietnamese/Hindi** (G1b) + **beta invite doc** — no Vercel required.*
