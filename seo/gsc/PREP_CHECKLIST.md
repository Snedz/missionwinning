# Search Console prep checklist — PRIVATE_MODE

**Status:** draft 2026-08-12 — prep only. Not a live SEO report.
**PRIVATE_MODE:** ON. Do **not** claim organic traction, impressions growth, or rankings.

Companion: [docs/SEO_ANALYTICS.md](../../docs/SEO_ANALYTICS.md) · index: [../PREP_INDEX.md](../PREP_INDEX.md)

---

## MatrAIx / honesty gates (copy that touches SEO CTAs)

| Gate | Rule for Growth copy |
|------|----------------------|
| **F-005** | Pitch Train+Coach / free forever offline logger only. No in-app social Feed / community / everything-app merchandising on SEO pages or launch kits. |
| **F-016** | Do not lead with Super Bundle / checkout. Free forever offline logger is the wedge; Bundle never gates the logger. |
| **F-008** | While gated: invite-only / private beta framing only. No open-beta or "we're live/public" status claims. |

---

## Property setup (founder-owned, can prep offline)

- [ ] Property: `https://www.missionwinning.com` (or `sc-domain:missionwinning.com`)
- [ ] Verify via DNS TXT or HTML tag (Vercel domain settings)
- [ ] Confirm OpenSEO already connected to Search Console if using OpenSEO pulls (see `seo/README.md`)
- [ ] Bookmark sitemap URL: `https://www.missionwinning.com/sitemap.xml`

**Do not** invent indexed-page counts or impression baselines while gated.

---

## What is indexable while PRIVATE_MODE is ON

`/` serves the private teaser (`/private`). Treat **marketing `/` as gated**, not a public SEO landing.

**Expect / treat as public SEO surfaces (when in sitemap + noindex-free):**

| Surface | Notes |
|---------|--------|
| `/guide/*` | Guidebook chapters — wedge CTAs to logger + Coach |
| `/exercises/*` | Exercise pages + hubs |
| `/calculators/1rm` | Live |
| `/calculators/tdee` | Live |
| `/calculators/strength-standards` | Live |
| `/paths` | Learn teasers |
| `/press` | Brand |
| `/welcome` | I-Day — soft CTA target |

**Not live / do not pitch as SEO URLs:**

| Surface | Notes |
|---------|--------|
| `/compare` (+ stories) | Removed — craft re-ship gate (see compare brief) |
| `/bundle` | Absent during free beta; do not list as public SEO surface |

---

## Sitemap / robots smoke (after flip or on Preview when quota allows)

- [ ] Fetch `/sitemap.xml` — confirm guide / exercises / calculators present
- [ ] Confirm `/compare` is **absent** (or redirects) until craft re-ships
- [ ] Confirm `/bundle` is **absent** while free beta
- [ ] Fetch `/robots.txt` — allow public SEO paths; no accidental block of `/guide`
- [ ] Spot-check 3 URLs: one guide, one exercise, one calculator — 200 + sensible title/canonical

Hobby note: no Growth Preview burns while deploy quota is 0. Checklist prep is offline-ok.

---

## Weekly monitor recipe (post-flip only)

Start **after** `PRIVATE_MODE=false`. Until then, record "N/A — gated" rather than fabricating numbers.

1. Coverage: indexed vs submitted (no panic on pre-flip zeros)
2. Top queries + pages for `/guide`, `/exercises`, `/calculators`
3. CTR on calculator + beginners content
4. Soft CTA path: organic landing → `/welcome` / I-Day (via PostHog after consent — see SEO_ANALYTICS)

**Boss metric reminder:** week-4 retained weekly loggers — not impressions vanity.

---

## Explicit non-goals

- No fake traction screenshots or "we're ranking for X" claims pre-flip
- No Feed / community / everything-app merchandising on SEO CTAs (F-005)
- No Bundle-as-hero on SEO pages (F-016)
- No open-beta status language while PRIVATE_MODE on (F-008)
