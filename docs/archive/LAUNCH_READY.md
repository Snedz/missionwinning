> Superseded by [LAUNCH_RUNBOOK.md](../LAUNCH_RUNBOOK.md) as of 2026-07-19 (Wave 9).

# Launch Ready — prepped items (Wave 2)

**Purpose:** What engineering has greened before public flip.  
**Does not flip:** `PRIVATE_MODE`, mass email send, social posts — founder-manual only.  
**Companions:** [PUBLIC_FLIP_CHECKLIST.md](archive/PUBLIC_FLIP_CHECKLIST.md) · [LAUNCH_RUNBOOK.md](../LAUNCH_RUNBOOK.md) · [SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md) · [ENV.md](../ENV.md)

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

Apply in Supabase SQL editor (copy file contents):

```sql
-- supabase/migrations/20260716_leads_growth_welcome_email.sql
alter table public.leads add column if not exists utm jsonb;
alter table public.leads add column if not exists referrer text;
alter table public.leads add column if not exists confirmed_at timestamptz;
alter table public.leads add column if not exists launch_email_sent_at timestamptz;
alter table public.leads add column if not exists unsubscribed_at timestamptz;
create index if not exists leads_email_lower_idx on public.leads (lower(email));
alter table public.profiles add column if not exists welcome_email_sent_at timestamptz;
```

**Verify columns exist:**

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name in ('leads', 'profiles')
  and column_name in (
    'utm', 'referrer', 'confirmed_at', 'launch_email_sent_at',
    'unsubscribed_at', 'welcome_email_sent_at'
  )
order by table_name, column_name;
```

Expect 6 rows. Until applied, leads still save (`package_interest`); utm/stamps may be ignored.

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

# Against a running deploy (local or prod):
SMOKE_BASE_URL=http://localhost:3000 npm run growth-smoke
SMOKE_BASE_URL=https://www.missionwinning.com npm run gate-smoke

# JSON-LD:
# curl -s localhost:3000/bundle | grep -o 'application/ld+json' | head

PRIVATE_MODE=false npm run build   # optional Lighthouse
# after start: npm run lighthouse-budget
```

### Ordered flip day (single sequence)

1. Migration applied + verified (above)  
2. Resend domain + `RESEND_FROM` not resend.dev  
3. Vercel: `NEXT_PUBLIC_SITE_URL`, secrets, Stripe webhook  
4. `LAUNCH_STRICT=true npm run launch-verify` (with prod URL + access)  
5. `PRIVATE_MODE=false` + redeploy  
6. PUBLIC_FLIP_CHECKLIST smoke (SW, `/`, Search Console)  
7. `npm run growth-smoke` against prod  
8. Broadcast dry-run → smoke `--to` → full send  
9. Social posts ([SOCIAL_LAUNCH.md](SOCIAL_LAUNCH.md))

---

*Last updated: 2026-07-16 (Wave 3 launch verification)*
