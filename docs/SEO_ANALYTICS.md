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
   - Includes `/guide/*` and `/exercises/*` (217+ exercise URLs from [`app/sitemap.ts`](../app/sitemap.ts))
4. Monitor weekly: indexed pages, impressions, top queries ("how to squat", etc.)

**Note:** While `PRIVATE_MODE=true`, `/` redirects to `/private` — public SEO pages `/guide` and `/exercises` remain indexable.

---

## Lighthouse baselines

Capture after each experience PR:

```bash
npm run build && npm run start &
SMOKE_BASE_URL=http://localhost:3000 node scripts/lighthouse-budget.mjs
```

Targets (mobile): performance, accessibility, best-practices ≥ 90 on `/` and `/log`.

CI runs the same script as a **soft warning** (`.github/workflows/ci.yml` → `lighthouse-budget` job).

---

## Internal link mesh (ongoing)

- Landing [`GuideTeaser`](../src/components/landing/GuideTeaser.tsx) → `/guide/*`
- Exercise pages → "Track this exercise free" → `/welcome` or `/log`
- Guide chapters → inline CTAs to app onboarding
- `/compare` cross-links from marketing pages when expanded
