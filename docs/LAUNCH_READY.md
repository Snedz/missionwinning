# Launch Ready — prepped items (Wave 2)

**Purpose:** What engineering has greened before public flip.  
**Does not flip:** `PRIVATE_MODE`, mass email send, social posts — founder-manual only.  
**Companions:** [PUBLIC_FLIP_CHECKLIST.md](PUBLIC_FLIP_CHECKLIST.md) · [LAUNCH_RUNBOOK.md](../LAUNCH_RUNBOOK.md) · [SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md) · [ENV.md](../ENV.md)

---

## Prepped (code / docs)

| Item | Evidence |
|------|----------|
| Lead `source` → `package_interest` fixed | `submitLead` + `leadsBodySchema` + `/api/leads` |
| Growth migration | `supabase/migrations/20260716_leads_growth_welcome_email.sql` |
| Waitlist confirm + unsub | `emailServer.ts`, `/api/leads`, `/api/leads/unsubscribe` |
| Landing email capture | `EmailCaptureBand` on `/` (`source: landing-updates`) |
| Welcome email (signed-in) | `/api/journey/welcome` + `syncJourneyOnSignIn` |
| Launch broadcast tool | `npm run launch-broadcast` (dry-run default) |
| Attribution first-touch | `attribution.ts` → leads + PostHog super-props |
| Canonicals + OG override | `publicPageMetadata` on public routes |
| JSON-LD | org/website/app/faq on `/`; Product on `/bundle`; breadcrumbs on guide/exercises |
| OG images | root + bundle + guide chapter + compare slug |
| Conversion i18n | ES (full conversion), PT/DE/FR landing + bundle partial |
| Env hygiene | `NEXT_PUBLIC_SITE_URL`, `RESEND_FROM`; `check-env --launch` warnings |

---

## Founder sequence (exact)

### 1. Database

Apply in Supabase SQL editor:

```bash
# contents of supabase/migrations/20260716_leads_growth_welcome_email.sql
```

### 2. Resend

1. Verify domain DNS (SPF/DKIM) for `missionwinning.com`
2. Set Vercel Production: `RESEND_API_KEY`, `RESEND_FROM=Mission Winning <hello@your-verified-domain>`
3. Confirm not `onboarding@resend.dev` via `npm run check-env -- --launch`

### 3. Site URL + public flip (when ready)

Vercel Production:

| Var | Value |
|-----|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.missionwinning.com` |
| `PRIVATE_MODE` | `false` |
| `NUDGE_SECRET` | dedicated HMAC secret |
| `SUPABASE_SERVICE_ROLE_KEY` | service role |

Redeploy. Then Search Console: property + sitemap `https://www.missionwinning.com/sitemap.xml`.

### 4. Broadcast

```bash
# Dry-run
npm run launch-broadcast

# Live smoke
npm run launch-broadcast -- --send --limit 1 --to you@example.com

# Full list
npm run launch-broadcast -- --send --limit 500
```

### 5. Social

Use [SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md) posts only after `PRIVATE_MODE=false`. Bio → `/welcome`.

---

## Verify before flip

```bash
npm run typecheck && npm run lint && npm test
npm run check-env -- --launch
# with server:
# curl -s localhost:3000/bundle | grep -o 'application/ld+json' | head
PRIVATE_MODE=false npm run build   # optional Lighthouse
```

---

*Last updated: 2026-07-16 (Wave 2 marketing & growth)*
