# Mission Winning — Setup for Revenue (Mission Winning)

## 1. Legal / Business Structure (Do This Week for "Paid to Survive")
- Form **Mission Winning LLC** (for-profit) — use your state or Delaware via Stripe Atlas / Clerky / attorney (~$100-500 + EIN free).
  - This owns the app, Stripe account, contracts, pays you (salary + draws).
- (Optional later) Form **Mission Winning Foundation** 501(c)(3) for mission work, grants, free global programs/scholarships.
  - Hybrid: LLC runs revenue products; Foundation gets donations/grants and can receive % from LLC.
- Apple Developer: Not needed for PWA launch (current model). If native iOS later, pay $99 under LLC. Waiver only for 100% free apps under qualifying nonprofit — not compatible with revenue IAP/subs.
- Get business bank (Mercury, Relay, or local). Connect to Stripe.

Support email: support@missionwinning.com (or hello@). Update in code where placeholder.

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

6. Add VITE_SUPABASE_* to .env (copy .env.example).

## 4. Stripe (Real Revenue — Hours to First $)
1. Create Stripe account (stripe.com).
2. Create Products + Prices:
   - One-time: PT+Nutrition $497, Bodybuilding $297, etc.
   - Recurring: Premium Monthly $9.99 (or your price).
3. Create Payment Links for each (easiest, hosted, no code change needed beyond the links in .env).
4. (Recommended for auto-fulfill) Set up webhooks to your Supabase Edge Function (or a small server) on `checkout.session.completed`:
   - Look up/create user by email.
   - Insert enrollment.
   - Send email via Resend with signed PDF links + "premium granted — open Forge app".
5. Put the buy.stripe.com/... links into .env VITE_STRIPE_LINK_* .
6. Test with Stripe test cards. Real mode when ready (KYC etc).

In code, buy buttons now call redirectToCheckout which goes straight to your live Payment Link → customer pays → you get notified → grant access.

## 5. Emails (Resend)
- Sign up resend.com, verify domain (or use onboarding).
- Add VITE_RESEND_API_KEY.
- For MVP, Stripe receipts + manual "here are your PDFs" works; upgrade to automated.

## 6. Run & Test Revenue Flow
```bash
cp .env.example .env
# fill keys
npm install
npm run dev
```
- Visit / , click a program "Enroll" → goes to your Stripe link (or demo grants local premium).
- Sign up (will add UI soon), see premium in app.
- After real purchase, use Supabase dashboard or webhook to set premium_granted.

## 7. i18n, Global, Content
- (Next) Add i18next. Default EN + ES/FR etc.
- Expand exercises from your PDFs (cues, corrective, bodybuilding variations, conditioning).
- Add nutrition page (log + targets).
- Keep PWA strong for offline global use (Africa, Russia, etc.).

## 8. First Revenue Checklist
- [ ] LLC + bank + Stripe account live.
- [ ] 1-2 Payment Links created + env set.
- [ ] Supabase project + basic tables + RLS.
- [ ] Buy button tested end-to-end (test mode).
- [ ] PDFs uploaded to Storage, test signed URL delivery.
- [ ] Rebuild + deploy to live domain.
- [ ] Update disclaimers, legal, support@.
- [ ] Tell 10 people / post / email list.

## 9. Non-Profit Note
PWA + web payments = no need for Apple fee waiver to launch and get paid. Use for-profit LLC. Add 501c3 later for mission scale (free tiers in low-resource areas, scholarships).

Questions? Update plan or ask. This gets you paid fast while building the global winning health tool.
