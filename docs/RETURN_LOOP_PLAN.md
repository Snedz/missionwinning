# RETURN_LOOP_PLAN.md — the return channel for athletes without accounts

**Lane:** Engineering-Web · **Horizon:** W (excellence criterion 4) · **Status:** **code shipped** (migration + subscribe + anonymous candidates + client; UI honest when push is dark as of `.267`) · **inert until founder ops** (VAPID, migration apply, `PRIVATE_MODE=false` for SW)
**Entry docs:** [CONTEXT.md](../CONTEXT.md) · [ORCHESTRATION.md](../ORCHESTRATION.md) · [src/lib/sync/INDEX.md](../src/lib/sync/INDEX.md)

---

## The problem in one line

The boss metric is **week-4 retained weekly loggers**. The headline promise is **no account**.
Every mechanism that could bring a lapsed athlete back **requires an account**.

## Five layers, one assumption

This is not a bug to patch. It is an architecture with no seat for the modal user — an
anonymous, offline athlete. Each layer is individually correct and all five assume a
`user_id`:

| Layer | File | The assumption |
|-------|------|----------------|
| UI | `src/page-components/ProfilePage.tsx:250` | Reminders card renders inside `{email && (…)}` |
| Client | `src/lib/pushClient.ts:57` | `getUser()` → `if (!user) return 'error'` |
| Schema | `supabase/migrations/20260719_push_subscriptions.sql:4` | `user_id uuid **not null** references auth.users` |
| RLS | same file | all four policies are `auth.uid() = user_id` |
| Server | `src/lib/pushServer.ts:29`, `src/lib/nudgeServer.ts:164` | `.eq('user_id', …)`; candidates selected `from('profiles')` |

**Consequence:** an athlete who logs six sessions without signing in, then goes quiet, is
unreachable forever. There is no channel to them and no row that knows they existed.

## Tone (status)

[`src/lib/reentry.ts`](../src/lib/reentry.ts) and [`src/lib/nudgeCopy.ts`](../src/lib/nudgeCopy.ts)
are the single tone contract. Streak-loss / absence-length language was removed from
live kinds; `nudgeCopy.test.ts` asserts the gate. Do not reintroduce.

---

## Scope

### 1. Anonymous push subscription

The device identity primitive **already exists** — `getOrCreateDeviceId()` in
[`src/lib/coach/storage.ts:9`](../src/lib/coach/storage.ts), a stable UUID at
`STORAGE_KEYS.deviceId`, already SSR-safe (returns `'server'` so a request never mints a
device). It is currently referenced in exactly two places. Plumb it; do not invent a
second identity.

- **Migration:** `user_id` nullable; add `device_id text`; keep `unique (endpoint)`;
  add `check (user_id is not null or device_id is not null)` so a row always has an owner.
- **RLS:** anonymous rows cannot be governed by `auth.uid()`. Insert/update for anonymous
  devices goes through a **service-role endpoint**, not the client — do not open a public
  RLS policy on this table.
- **New route:** `POST /api/push/subscribe` accepting `{ endpoint, p256dh, auth, deviceId }`
  with no session. Rate-limited. **Not** added to `PUBLIC_API_PATHS_WHILE_GATED` — an
  invited tester already carries the gate cookie, so listing it would only open row
  creation to people who cannot reach the app. Once `PRIVATE_MODE` is false the list
  stops applying anyway.
- **Client:** `subscribePush()` stops requiring a user. **Order matters** —
  `Notification.requestPermission()` must never be called down a path that cannot use the
  result. Today it is called at line 39 and the result discarded at line 59; that ordering
  is only unreachable because the UI hides the toggle. Fix the order anyway, because the
  UI guard is the only thing holding it.
- **UI:** the reminders card moves out from behind `{email && …}`. A signed-out athlete
  can turn on reminders; signing in later links the device row to the user.

### 2. Anonymous nudge candidates

`collectNudgeCandidates()` selects `from('profiles')`. Anonymous devices have no profile.

- Derive cadence from the device's own logging rhythm, **not** a fixed daily expectation.
  A 3×/week lifter's consecutive-day streak reads `1` forever — that is the target user.
  Use the same reasoning as `loadDaysPerWeek` and `weeklyGoalProgress`.
- **Privacy constraint (hard):** no workout history leaves the device. The server may hold
  cadence, weekday preference, time zone and a last-session date. Nothing else.
- **Nothing to cold devices (28+ days).** Continuing to push someone who left is how the
  channel gets blocked at the vendor level.

### 3. One tone, both channels

- Route all nudge copy through the rules in `reentry.ts`.
- Add the test that makes it a gate, not a principle: **no candidate body may name the
  length of the absence or use streak-loss language.** Assert by pattern across every
  `NudgeKind`, the way `coach-voice.spec.ts` asserts no raw translation key renders.

---

## Out of scope

- Email for anonymous users — there is no address, and asking for one is the account.
- Push/email copy that names how long someone has been gone. In-app Today may show the S7 quiet line (“Two days off. Here’s the 20-minute version.”); outbound channels still must not.
- Any pillar depth. This is Horizon W.

## Done when

1. A signed-out device can enable reminders, and a row exists for it.
2. `GET /api/cron/nudges?dryRun=1` lists anonymous device candidates alongside profile ones.
3. No nudge body names an absence length or a lost streak — asserted by test.
4. Nothing is sent to a device quiet for 28+ days.
5. Signing in links the existing device row rather than creating a duplicate.

## Founder setup — the code is inert without these

Shipped `.164`. None of it can fire until the founder does all four; agents own none
of them. Until then the toggle does not render (`isPushSupported()` is false without
a VAPID key) and the route answers `503 Sync not configured`.

| # | Step | Where |
|---|------|-------|
| 1 | Apply `supabase/migrations/20260728_anonymous_push.sql` | Supabase SQL editor or CLI |
| 2 | `npx web-push generate-vapid-keys` → set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Vercel Production + `.env.local` — [ENV.md](ENV.md) |
| 3 | Set `SUPABASE_SERVICE_ROLE_KEY` in Production (already on the Horizon 0 list) | [LAUNCH_RUNBOOK.md](LAUNCH_RUNBOOK.md) §2 |
| 4 | `PRIVATE_MODE=false` — the service worker never registers while gated, by design | Founder-only (hard rule 3) |

Verify with `GET /api/cron/nudges?dryRun=1` (`Authorization: Bearer $CRON_SECRET`):
the `anonymous` block reports the device cohort without sending anything.

## Why this is inside the horizon gate

[ORCHESTRATION.md](../ORCHESTRATION.md) Horizon W excellence criterion **4** is
*"Missed day → re-entry without shame."* The in-app half shipped in `.125` (`reentry.ts`).
The channel half was never built. This finishes the criterion; it does not open a new one.
