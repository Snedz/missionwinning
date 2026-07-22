# Mission Winning — Setup for the Free Global "Everything App" for Health (Freemium + Super Bundle Model)

**See vision.md first** — this is the guiding document. Core mission (tracker + fundamentals) is **free forever for everyone worldwide**. Revenue via premium modules + flagship Super Bundle (inspired by Freeletics: freemium core hook + discounted bundle of synergistic pillars for holistic value, 50% off promos, etc.). "Mainly a free app" serving the mission of global health equity. PWA primary for zero-fee accessibility.

## 1. Legal / Business Structure (Mission + Sustainable Revenue)

> **Superseded for live payments:** Prefer [docs/PRE_REVENUE_CHECKLIST.md](docs/PRE_REVENUE_CHECKLIST.md) + [docs/LLC_AND_PAYMENTS.md](docs/LLC_AND_PAYMENTS.md) + [docs/STRIPE_PREMIUM_SETUP.md](docs/STRIPE_PREMIUM_SETUP.md). This section still mentions PayPal-first demo flows; production is Stripe Checkout Sessions + `/refunds`.

- Form **Mission Winning LLC** (for-profit) — use your state or Delaware via attorney/services (~$100-500 + EIN). Owns app IP, runs payments (PayPal), pays owner (salary/draws) for sustainability while pursuing mission.
- **Optional/Parallel: Mission Winning Foundation (501(c)(3))** for pure mission impact: scholarships for free premium/bundle access in low-resource areas (Africa, etc.), grants, free global education/resources. LLC can donate % of profits or provide at-cost services. Common hybrid for impact orgs.
- Apple Developer: **Not needed** for PWA launch (primary model — zero $99 fees or 30% cuts). Core is free, so aligns with accessibility. If native iOS companion later (after revenue), pay $99 under LLC. Non-profit waiver only for 100% free apps — use PWA + foundation for mission scale instead.
- Get business bank (Mercury, Relay, or local). Connect to PayPal (or chosen processor for bundles/subs).

Support email: support@missionwinning.com (or hello@). Update in code. Reference vision.md in all legal/about pages.

## 2. Domain & Hosting
- Point missionwinning.com (or subdomains app./forge.) to Vercel (or your host).
- Deploy: `npm run build` then Vercel import or `vercel --prod`.
- PWA will be installable from the live URL (best for global zero-cut revenue).

## 3. Supabase (Auth + DB + Storage + Premium)
1. Create project at https://supabase.com (free tier fine to start).
2. Enable Email auth (Magic Links recommended for frictionless).
3. Create tables (SQL in Supabase SQL editor or migrations):

```sql
-- Profiles (linked to auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  locale text default 'en',
  units text default 'metric', -- or 'imperial'
  goals text,
  equipment text,
  created_at timestamptz default now()
);

-- Enrollments (one-time program purchases grant premium)
create table enrollments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  product_id text,
  purchased_at timestamptz default now(),
  premium_granted boolean default true,
  pdf_urls text[]
);

-- Leads (coaching inquiries, demo etc)
create table leads (
  id bigserial primary key,
  name text,
  email text,
  goals text,
  current_training text,
  package_interest text,
  created_at timestamptz default now()
);

-- Optional: workout sync, nutrition etc (jsonb for speed)
create table workout_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  data jsonb,
  created_at timestamptz default now()
);
```

4. Storage bucket "course-pdfs" (private). Upload your ISSA PDFs/workbooks here. On purchase, return signed URLs.

5. RLS policies: users can only read own profiles/enrollments/logs. Service role for webhooks.

6. Add `NEXT_PUBLIC_SUPABASE_*` to `.env.local` (copy from `.env.example`). See [ENV.md](ENV.md) for the full list including `PRIVATE_ACCESS_SECRET`.

**Phase C schema:** For a **fresh** Supabase project, run [supabase/migrations/20250629_complete_base_schema.sql](supabase/migrations/20250629_complete_base_schema.sql) (idempotent — safe if you only have partial tables). Full reference: [supabase/schema.sql](supabase/schema.sql).

## 4. Payments (Temporarily Demo / Request-Based)
Core mission (tracker + fundamentals) is **free forever for everyone worldwide** (see vision.md).

Premium access (individual pillars or the full Super Bundle) currently uses simple "Request Access" buttons:
- Grants demo premium locally (sets mw_premium and mw_bundle_active in localStorage).
- Shows a confirmation message and logs the request (for analytics / owner review).
- No real payment processor required right now.

This is temporary while finalizing business setup (LLC etc.). Once ready, we can plug in a real processor (PayPal, Stripe, Lemon Squeezy, etc.) with proper checkout + webhook fulfillment at /api/paypal-webhook (or equivalent).

For now:
- No payment keys needed for core or demo unlocks.
- Buttons appear in /bundle, /learn, pillar pages, landing CTAs, etc.
- Super Bundle pricing shown for reference ($12/mo example, 50% intro promos).

See .env.example (PayPal section noted as skipped for now).
Later: easy to swap UnlockButton for real checkout flow.

## 5. Emails (Resend)
- Sign up resend.com, verify domain (or use onboarding).
- Add VITE_RESEND_API_KEY.
- For MVP, Stripe receipts + manual "here are your PDFs" works; upgrade to automated.

## 6. Run & Test (Free Core + Demo Premium)
```bash
cp .env.example .env.local
# No payment keys needed right now
npm install
npm run dev
```
- Visit / , use free core (tracker at /log, library, basic nutrition).
- Click "Request Access" / Super Bundle buttons → demo unlock + message.
- Premium status shows in Profile (demo).
- Test PWA install and offline use of core features.

## 7. i18n, Global, Content
- (Next) Add i18next. Default EN + ES/FR etc.
- Expand exercises from your PDFs (cues, corrective, bodybuilding variations, conditioning).
- Add nutrition page (log + targets).
- Keep PWA strong for offline global use (Africa, Russia, etc.).

## 8. First Launch Checklist (Free Core + Demo Premium)
- [ ] LLC formed (recommended for proper payments later).
- [ ] Supabase project + basic tables + RLS (optional for cloud sync).
- [ ] .env.local set (can run fully in demo mode).
- [ ] Free core tested (tracker, library, basics — no paywall).
- [ ] Request/Unlock buttons tested (demo premium + bundle flag).
- [ ] Rebuild + deploy to live domain (Vercel recommended).
- [ ] Update disclaimers, legal, support@.
- [ ] Tell 10 people / post / email list.
- [ ] (Later) Add real payment processor + update webhook / env vars.

## 9. Mission & Non-Profit Note
PWA = true global accessibility with zero fees/cuts for the free core. Use for-profit LLC for ops/revenue (Super Bundle sustains the mission). Add 501c3 Foundation later/parallel for scholarships (free premium access in low-resource areas), grants, pure mission work. Hybrid structure: LLC pays owner while funding impact. Apple waiver not needed (PWA primary; core free aligns with mission). "Mainly a free app" per vision.md.

## Local Development Environment (exact safe commands)

**Always open a new terminal tab and paste these blocks exactly.**

Block 1 (get into the folder):
```bash
cd ~/missionwinning
pwd
```

Block 2:
```bash
npm install
npm run dev
```

Visit http://localhost:3000.

Everything in the core (log workout, library, nutrition, calculators, benchmarks) is free for anyone. The Super Bundle and pillar "Request Access" buttons use a simple email form that unlocks demo premium locally for testing.

No payment keys are needed right now.

## Deployment to Production (Vercel Recommended)

Vercel is the best choice:
- First-class Next.js support (build, API routes for /api/paypal-webhook, previews).
- PWA works out of the box with our next-pwa config.
- Free tier generous for this scale.
- Easy custom domain setup for www.missionwinning.com.
- Env vars + logs + serverless functions perfect for webhook.

Steps:
1. `git push` (or `npx vercel` for direct).
2. Import to Vercel (vercel.com/new).
3. Set all NEXT_PUBLIC_* and server vars (RESEND if email, PayPal plan ID) in Project Settings > Environment Variables. Use production values (live PayPal client ID).
4. Deploy.
5. In PayPal dashboard: Update the webhook endpoint to your production URL (e.g. https://www.missionwinning.com/api/paypal-webhook). Add events: PAYMENT.CAPTURE.COMPLETED, BILLING.SUBSCRIPTION.ACTIVATED.
6. Add domain in Vercel: www.missionwinning.com + apex. Update DNS at registrar (CNAME/A records provided by Vercel).
7. Test: Free core everywhere, PWA install on mobile, bundle purchase flow (sandbox or live), webhook fires and grants access.

See vercel.json for redirects (old /programs -> /learn, /beta -> /bundle) and security headers.

Alternative production: Netlify (with functions) or self-host on Fly.io/DigitalOcean, but Vercel minimizes ops for Next.js + PWA + domain.

After deploy, monitor PayPal webhooks in dashboard, update client ID to live.

This keeps the free core globally accessible while enabling sustainable Super Bundle revenue.

Questions? Update plan or ask. This builds the free global everything-health super app (vision.md first) — core mission free for all, Super Bundle for synergy and sustainability. "Mainly a free app" making the world healthier.
