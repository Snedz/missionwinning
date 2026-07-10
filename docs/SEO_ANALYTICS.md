# SEO & analytics — growth loop

Companion to [ROADMAP_V4_EXPERIENCE.md](ROADMAP_V4_EXPERIENCE.md) Phase 3–4. Code ships the routes and events; this doc is the founder setup checklist.

---

## PostHog public funnel

**Prerequisite:** `NEXT_PUBLIC_POSTHOG_KEY` set in Vercel Production + Preview ([ENV.md](../ENV.md)).

### Events (typed in [`src/lib/analytics.ts`](../src/lib/analytics.ts))

| Event | When fired |
|-------|------------|
| `guide_read` | Public guide chapter viewed |
| `exercise_page_viewed` | Public exercise page viewed |
| `public_cta_clicked` | CTA on public SEO pages |
| `iday_started` / `iday_completed` | Journey onboarding |
| `first_workout_completed` / `workout_completed` | Train retention |
| `coach_taster_locked` | Free Coach week exhausted → upgrade moment |
| `checkout_completed` | Return from Stripe on `/bundle?checkout=success` |

### Suggested funnel (PostHog → Insights → Funnel)

1. `$pageview` where path starts with `/guide` or `/exercises`
2. `public_cta_clicked`
3. `iday_started`
4. `iday_completed`
5. `first_workout_completed`

**Retention:** weekly cohort on `workout_completed` (repeat training).

---

## Google Search Console

1. Add property: `https://www.missionwinning.com`
2. Verify via DNS TXT or HTML tag (Vercel domain settings)
3. Submit sitemap: `https://www.missionwinning.com/sitemap.xml`
   - Includes `/guide/*`, `/exercises/*` (~217 exercise URLs), muscle/equipment hubs, `/paths/*` (10 Learn teasers), `/compare` + Forge/Freeletics/spreadsheet stories ([`app/sitemap.ts`](../app/sitemap.ts))
4. Monitor weekly: indexed pages, impressions, top queries ("how to squat", etc.)

**Approx public SEO surface (Wave 4):** ~217 exercises + ~6 guide chapters + ~12–20 hubs + 10 path teasers + compare index/stories + marketing (`/`, `/welcome`, `/bundle`, `/compare`).

**Note:** While `PRIVATE_MODE=true`, `/` redirects to `/private` — public SEO pages `/guide`, `/exercises`, `/paths`, and `/compare` remain indexable.

---

## Lighthouse baselines

See [LIGHTHOUSE_BASELINE.md](LIGHTHOUSE_BASELINE.md) for route table and snapshot process.

Capture after each experience PR:

```bash
npm run build && npm run start &
SMOKE_BASE_URL=http://localhost:3000 LIGHTHOUSE_SNAPSHOT=1 node scripts/lighthouse-budget.mjs
```

Targets (mobile): performance, accessibility, best-practices ≥ 90 on `/`, `/log`, `/guide/human-performance`, `/exercises/squats`.

CI runs the same script as a **soft warning** (`.github/workflows/ci.yml` → `lighthouse-budget` job).

---

## Internal link mesh (ongoing)

- Landing [`GuideTeaser`](../src/components/landing/GuideTeaser.tsx) → `/guide/*`
- Exercise pages → "Track this exercise free" → `/welcome` or `/log`
- Guide chapters → inline CTAs to app onboarding
- `/compare` cross-links from marketing pages when expanded
