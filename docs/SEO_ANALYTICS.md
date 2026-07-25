# SEO & analytics — growth loop

Companion to [ROADMAP_V4_EXPERIENCE.md](archive/ROADMAP_V4_EXPERIENCE.md) Phase 3–4. Code ships the routes and events; this doc is the founder setup checklist.

---

## PostHog public funnel

**Prerequisite:** `NEXT_PUBLIC_POSTHOG_KEY` set in Vercel Production + Preview ([ENV.md](ENV.md)).

**Privacy default (July 2026):** PostHog only initializes after the user allows product analytics (first-visit banner or Profile → Privacy & analytics). Do Not Track forces off. Undecided = no capture. See `src/lib/analyticsOptOut.ts`.

### Events (typed in [`src/lib/analytics.ts`](../src/lib/analytics.ts))

| Event | When fired |
|-------|------------|
| `guide_read` | Public guide chapter viewed |
| `exercise_page_viewed` | Public exercise page viewed |
| `public_cta_clicked` | CTA on public SEO pages |
| `waitlist_joined` | Landing capture / waitlist (`product: landing`) |
| `iday_started` / `iday_mission_accepted` / `iday_profile_completed` / `iday_completed` | I-Day funnel (per-step drop-off) |
| `first_workout_completed` / `workout_completed` | Train retention |
| `coach_session_adjusted` | Free “adjust today” coach action |
| `coach_chat_opened` / `coach_chat_message_sent` | Premium coach chat (never content) |
| `push_subscribed` | Web push device opt-in |
| `referral_landed` | `?ref=` stored in first-party attribution |
| `referral_attributed` | Sign-in redeem succeeded |
| `referral_link_shared` | Profile invite share/copy |
| `workout_shared` | Victory sheet share |
| `mission_shared` | PFT / class / commissioning share |
| `class_joined` | School class join |
| `checkout_clicked` | Bundle / Unlock checkout start (inherits UTM super-props) |
| `coach_taster_locked` | Free Coach week exhausted → upgrade moment |
| `checkout_completed` | Return from Stripe on `/bundle?checkout=success` |

### Primary funnel (PostHog → Insights → Funnel) — build once post-flip

**Founder-owned:** create the Insight in PostHog UI after `NEXT_PUBLIC_POSTHOG_KEY` is live. Agents do not invent funnel numbers.

**Server retention smoke (agent):** `npm run week4-smoke` (digest dryRun + optional `mw_week4_retention`) — see [POST_LAUNCH_CADENCE.md](POST_LAUNCH_CADENCE.md).

**Setup checklist (&lt;15 min):**

1. Confirm `NEXT_PUBLIC_POSTHOG_KEY` on Production + users can **Allow analytics** (privacy default is off until allow).
2. Insights → New funnel → ordered steps:

| Step | Event / filter |
|------|----------------|
| 1 | `$pageview` (optional: path = `/` or starts with `/guide`) |
| 2 | `waitlist_joined` **or** `iday_started` (two funnels if you want split: list vs product) |
| 3 | `iday_mission_accepted` |
| 4 | `iday_profile_completed` |
| 5 | `iday_completed` |
| 6 | `first_workout_completed` |
| 7 | `workout_completed` (repeat) for retention |

**I-Day diagnosis funnel (public-flip gate ≥80% complete):**  
`iday_started` → `iday_mission_accepted` → `iday_profile_completed` → `iday_completed` → `first_workout_completed`.

**Money funnel (separate):**

1. `bundle_viewed`  
2. `checkout_clicked`  
3. `checkout_completed`  

**Attribution:** first-touch `utm_source` / `utm_medium` / `utm_campaign` / `landing_path` are PostHog super-properties after consent (`attribution.ts`). Breakdown funnels by `utm_source`.

**Retention:** weekly cohort on `workout_completed` (repeat training) — year-one #1 metric.

**Push attribution:** notification open URLs use `?src=push` (e.g. `/log?src=push`). There is no SW-side analytics; PostHog pageviews pick up the query when the user lands after `notificationclick`.

**SEO organic funnel (optional):**

1. `$pageview` where path starts with `/guide` or `/exercises`  
2. `public_cta_clicked`  
3. `iday_started`

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

CI runs the same script as a **soft warning** (`.github/workflows/ci-extended.yml` → `lighthouse-budget` job, manual/weekly).

---

## Internal link mesh (ongoing)

- Landing → `/about`, `/vision`, `/compare/*` (the `GuideTeaser` band was cut in `.104` and the component removed in `.126`; `/guide/*` is reached from `/learn` and the footer)
- Exercise pages → "Track this exercise free" → `/welcome` or `/log`
- Guide chapters → inline CTAs to app onboarding
- `/compare` cross-links from marketing pages when expanded


---

## Structured data & canonicals (Wave 2)

- **Helper:** [`src/lib/seoMetadata.ts`](../src/lib/seoMetadata.ts) — `publicPageMetadata` sets title, description, relative canonical, and openGraph/twitter overrides (root layout OG is not enough alone).
- **Host:** `NEXT_PUBLIC_SITE_URL=https://www.missionwinning.com` (www). Non-www defaults break sitewide canonicals.
- **JSON-LD:** Organization + WebSite (no SearchAction) + SoftwareApplication ($0) + FAQ on `/`; Product offers on `/bundle`; Article/HowTo + Breadcrumb on guide/exercise pages. See `src/lib/publicSeo.ts`.
- **hreflang:** not emitted — language is client-side on one URL. Add only if locale-prefixed routes ship later.
- **Attribution:** first-touch UTMs in `localStorage` (`mw_attribution`) attach to leads and, when analytics allowed, PostHog super-properties. Funnel: visit (+utm) → `waitlist_joined` / `iday_*` → `checkout_clicked` → `checkout_completed`. `class_joined` for school join.

