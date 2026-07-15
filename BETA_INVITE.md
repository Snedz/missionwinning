# Beta Invite Kit — Mission Winning

Use this when inviting the first **10 private beta operators**. Prod is live at **https://www.missionwinning.com** (private gate on). Share the access code from Vercel `PRIVATE_ACCESS_SECRET` / `PRIVATE_ACCESS_CODES`.

**Current status (2026-07-11):** 0 signed-in profiles in Supabase — recruiting is the critical path before `PRIVATE_MODE=false`.

---

## Invite link format

Send each tester **one** of these (replace `YOUR_CODE` with the invite code):

```
https://www.missionwinning.com/?access=YOUR_CODE
```

After the first visit, a 30-day cookie is set — they can bookmark `/beta` or `/log` without the query param.

Alternative: send them to `/private` and share the access code separately.

---

## Suggested email (copy/paste)

**Subject:** You're invited — Mission Winning private beta

Hi [Name],

You're in the first cohort of **Mission Winning** — a free-core fitness app with a guided member journey (I-Day → training → rankings).

**Start here (2 minutes):**
1. Open: `https://www.missionwinning.com/?access=YOUR_CODE`
2. Read the beta guide: `/beta`
3. Complete **I-Day** at `/welcome`
4. Log one workout from **Today**
5. Optional: sign in on **Profile** for cloud sync

**What to try:**
- Tap **Mission Winning** in the top header to open the menu (Move, Mind, Leaderboard, Learn, etc.)
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

## Day-2 and day-7 follow-ups (copy/paste)

**Day 2**

```
Hey [Name] — did you get a workout logged in Mission Winning?

What almost stopped you (confusing screen, too many steps, something else)?
```

**Day 7**

```
Quick check-in: are you still opening the app this week?

One thing you'd change about the first 3 minutes?
```

After each reply: fix the #1 confusion within 48h if it's a real bug/UX issue, then reply “fixed — try again?”

---

## Invite tracker (first 10)

| # | Name | Invited | I-Day | Workout | Signed in | Day-2 DM | Day-7 DM | Notes |
|---|------|---------|-------|---------|-----------|----------|----------|-------|
| 1 | | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 2 | | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 3 | | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 4 | | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 5 | | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 6 | | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 7 | | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 8 | | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 9 | | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |
| 10 | | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | |

Watch for A1 signal: “is there an app?” / won’t install PWA — log in Notes ([REDTEAM.md](REDTEAM.md)).

Social/recruiting angle: [docs/SOCIAL_LAUNCH.md](docs/SOCIAL_LAUNCH.md).

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
