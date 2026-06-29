# Beta Invite Kit — Mission Winning

Use this when inviting the first **10 private beta operators**. No Vercel changes required beyond existing `PRIVATE_ACCESS_SECRET`.

---

## Invite link format

Send each tester **one** of these (replace placeholders):

```
https://YOUR-DEPLOY-URL/?access=YOUR_PRIVATE_ACCESS_SECRET
```

After the first visit, a 30-day cookie is set — they can bookmark `/beta` or `/log` without the query param.

Alternative: send them to `/private` and share the access code separately.

---

## Suggested email (copy/paste)

**Subject:** You're invited — Mission Winning private beta

Hi [Name],

You're in the first cohort of **Mission Winning** — a free-core fitness app with a guided member journey (I-Day → training → rankings).

**Start here (2 minutes):**
1. Open: `https://YOUR-URL/?access=YOUR_CODE`
2. Read the beta guide: `/beta`
3. Complete **I-Day** at `/welcome`
4. Log one workout from **Today**
5. Optional: sign in on **Profile** for cloud sync

**What to try:**
- Tap **More** (green button above nav on phone) for Leaderboard, Move, Mind, Learn
- Language switch on Profile (Thai, Japanese, Spanish, etc.)

**Feedback:** Reply to this email or use in-app feedback. Confusing steps = exactly what we need to fix.

Thanks for helping us ship health for everyone.

— Mission Winning team

---

## Founder checklist (per invite)

| Step | Done |
|------|------|
| Access code shared securely (not in public repo) | ⬜ |
| Tester completed I-Day | ⬜ |
| Tester logged ≥1 workout | ⬜ |
| Tester signed in (optional) | ⬜ |
| Feedback captured | ⬜ |

---

## Measuring funnel

1. **Supabase** — `profiles` row count (signed-in users)
2. **Profile → Beta journey progress** (if `BETA_ADMIN_EMAILS` includes your email)
3. **`journey_events`** — `journey_phase_complete`, `journey_commissioned`

Launch gates (from [PRE_LAUNCH_PLAN.md](PRE_LAUNCH_PLAN.md)): ≥10 users, I-Day ≥80%, Basic Training ≥60% before `PRIVATE_MODE=false`.

---

## Supabase migrations (if tester hits errors)

Run in SQL Editor (idempotent):

1. `supabase/migrations/20250629_complete_base_schema.sql` — if tables missing
2. `supabase/migrations/20250629_journey_state.sql`
3. `supabase/migrations/20250629_journey_events.sql`
4. `supabase/migrations/20250629_leaderboard_squad_patch.sql` — fixes `squad_code` column error

---

## Pages to reference

| URL | Purpose |
|-----|---------|
| `/beta` | This guide (public during private mode) |
| `/private` | Access code gate |
| `/welcome` | I-Day onboarding |
| `/log` | Today hub |
| `/leaderboard` | Rankings |
| `/profile` | Sign in, language, journey edit |
