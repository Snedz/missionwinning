# RETURN_LOOP_PLAN.md — the return channel for athletes without accounts

**Lane:** Engineering-Web · **Horizon:** W (excellence criterion 4) · **Status:** proposed, not started
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

## The second defect: two channels, opposite tones

[`src/lib/reentry.ts`](../src/lib/reentry.ts) is deliberate and well-judged — no shame,
dose scaled to 0.5–0.7, *"rest days are part of training"* (`REENTRY_MIN_DAYS = 4`).

The email channel says the opposite, at the moment of highest churn risk:

- `nudgeServer.ts:93` — **"Your N-day streak ends tonight"** (streak-loss language)
- `nudgeServer.ts:139` — **"it's been N days"** (names the length of the absence)

Both are live today for signed-in users. The in-app principle exists in prose and in one
module; nothing makes the email obey it.

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
- Changing what `reentry.ts` shows in-app. That half shipped and is correct.
- Any pillar depth. This is Horizon W.

## Done when

1. A signed-out device can enable reminders, and a row exists for it.
2. `GET /api/cron/nudges?dryRun=1` lists anonymous device candidates alongside profile ones.
3. No nudge body names an absence length or a lost streak — asserted by test.
4. Nothing is sent to a device quiet for 28+ days.
5. Signing in links the existing device row rather than creating a duplicate.

## Why this is inside the horizon gate

[ORCHESTRATION.md](../ORCHESTRATION.md) Horizon W excellence criterion **4** is
*"Missed day → re-entry without shame."* The in-app half shipped in `.125` (`reentry.ts`).
The channel half was never built. This finishes the criterion; it does not open a new one.
