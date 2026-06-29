# Mission Winning — Environment Setup

This guide gets **www.missionwinning.com** running with the **private development gate** active so the public only sees the `/private` teaser until they have your access code.

For the full pre-launch security inspection checklist and competitive readiness review, see **[PROTECTION.md](PROTECTION.md)**.

## Quick start (local)

```bash
cd missionwinning
cp .env.example .env.local
# Edit .env.local — at minimum set PRIVATE_ACCESS_SECRET and Supabase keys
npm install
npm run dev
```

Visit http://localhost:3000. With `PRIVATE_MODE=true` in `.env.local`, you should be redirected to `/private` unless you use your access code.

---

## Vercel environment variables (REQUIRED for live gate)

Open **Vercel → your project → Settings → Environment Variables**.

Add these for **Production** and **Preview**:

| Variable | Required | Example / notes |
|----------|----------|-----------------|
| `PRIVATE_ACCESS_SECRET` | **Yes** | Run `openssl rand -base64 32` — pick one strong secret and save it somewhere safe |
| `PRIVATE_MODE` | Yes | `true` while in private dev; set `false` when launching publicly |
| `NEXT_PUBLIC_SUPABASE_URL` | Recommended | `https://YOUR-PROJECT.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Recommended | From Supabase → Project Settings → API |

After adding or changing env vars: **Deployments → Redeploy** (env changes do not apply until redeploy).

### How you unlock the site (after deploy)

1. **Password:** Go to https://www.missionwinning.com/private and enter `PRIVATE_ACCESS_SECRET`.
2. **URL shortcut:** Visit `https://www.missionwinning.com/?access=YOUR_SECRET` once — sets a 30-day httpOnly cookie.
3. **Sign in:** After unlocking, use magic link sign-in inside the app (Profile / Sidebar) for cloud sync.

---

## Why the gate may have looked “broken”

Three things caused the full site to appear public even when the gate was deployed:

1. **Loose Supabase bypass (fixed):** Any cookie whose *name* looked like a Supabase auth cookie bypassed the gate — even invalid values. Magic link sign-in from `/private` also let anyone with any email through.
2. **Your browser cookie:** If you previously used `?access=SECRET` or signed in, your browser bypassed the gate while anonymous visitors were blocked.
3. **PWA cache:** An installed PWA may serve an old cached landing page. Clear site data or uninstall the PWA after enabling the gate.

The gate now requires the **`mw_private_access` cookie** (from password or `?access=`) unless you explicitly set `PRIVATE_ALLOW_AUTH_BYPASS=true`.

---

## Verify the gate is working

From a terminal (no cookies):

```bash
curl -sI https://www.missionwinning.com/ | grep -i location
# Expected: location: /private
```

In a **private/incognito** browser window, visit https://www.missionwinning.com — you should only see “Private Development”, not the landing page or tracker.

---

## Supabase project

Your project ref from the saved config: `tnzauplicgfrozvnowqp`

- URL: `https://tnzauplicgfrozvnowqp.supabase.co`
- Run the SQL in `SETUP.md` (profiles, enrollments, leads, workout_logs + RLS)
- Enable Email auth → Magic Link
- Add the same URL + anon key to Vercel env vars

---

## Going fully public (later)

When ready to launch:

1. Set `PRIVATE_MODE=false` in Vercel (Production)
2. Redeploy
3. Optionally remove or keep `proxy.ts` — with `PRIVATE_MODE=false` it is a no-op

---

## Checklist

- [ ] `PRIVATE_ACCESS_SECRET` set in Vercel Production + Preview
- [ ] `PRIVATE_MODE=true` in Vercel
- [ ] Redeployed after env changes
- [ ] Verified in incognito → `/private` only
- [ ] Unlocked with `?access=SECRET` for your own browsing
- [ ] Supabase URL + anon key set (optional but needed for magic link sync)
- [ ] Cleared old PWA install on your phone if you tested before the gate

See also: `SETUP.md` (full business + Supabase schema), `README.md` (dev commands).
