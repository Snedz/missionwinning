# Mission Server v1 — freeze (`.726`)

**Status:** CONTINUED by [MISSION_SERVER_MESSENGER_PLAN.md](MISSION_SERVER_MESSENGER_PLAN.md) (`.752`). Keep the store/route; do not implement Discord-shaped chrome from this file.
**Label:** `2026.07-unified.726` (do not steal `.698`–`.725`)
**Horizon:** Founder override 2026-08-13 — L2-shaped capability now, **parkable**, not Friday’s open-beta pitch, not a primary tab.
**Excellence-Override:** Mission Server v1 text rooms

This is the plan-then-build freeze for this ship. [docs/PLAN.md](PLAN.md) remains the A–I roadmap and is not rewritten here.

---

## 1. What this is

**Mission Server** is our own Discord-shaped **text rooms inside Mission Winning**. We do not embed or link discord.com. We do not use Discord OAuth.

| Steal | Do not steal |
|-------|----------------|
| Discord: one server, text channels, messages | Voice, video, LiveKit, announcements-as-product, roles, permissions UI |
| MySpace: authored identity already on Athlete Page | Top 8, feed of logs, DMs, likes, comments on sets |
| WeChat: **later OS module** | Order / payments / mini-app host on first paint |

**Product truth:** Mission Winning 0.1 (beta). L1 Health is Train + Today. This module is parkable L2. Today / Train first paint unchanged. Speech never owns this. Set-log table unchanged. Desktop = PWA. Mobile = same PWA.

---

## 2. Frozen v1 behavior

### 2.1 Garage server

- One free **Garage** server per athlete, created **locally on first open** of `/server`. No account required.
- Free limit: **1 server**, **4 channels**, local member = **self only**.
- No invented online counts. No presence dots that imply other people.
- Do not invent a second user id. Author identity = existing call sign (`STORAGE_KEYS.operatorName`) or the literal **Athlete** if unset. (Do not use `loadOperatorName()`’s `"Mission Operator"` fallback.)

### 2.2 Channels

Seed exactly three text channels (slugs frozen):

| slug | display |
|------|---------|
| `train` | train |
| `garage` | garage |
| `off-topic` | off-topic |

- Text only. No voice. No announcements product. If a fourth channel is ever added it is just another text channel; **v1 ships no channel-create UI**.
- Model enforces `MAX_CHANNELS = 4` so the free cap is real even without UI.
- Default selected channel: `train`.
- Channel switch must keep messages per-channel (no bleed).

### 2.3 Messages

Each message: `{ id, channelId, authorCallSign, body, createdAt }`.

- Body: trim; reject empty; max **2000** chars; **plain text** (no markdown renderer, no embeds).
- Time: store ISO instant; display local clock time. Do not derive a calendar date from `toISOString()`.
- Persist **device-local first** via existing `safeStorage` (not a new IndexedDB subsystem — none exists; `mw_*` backup already scans localStorage). Cap **200 messages per channel**, drop oldest.
- No likes. No comments on sets. No workout auto-post.

### 2.4 Sync (fail-closed)

- Local store is the source of truth always.
- Optional fan-out: `supabase.channel` **broadcast** only when **all** of:
  1. `isSupabaseConfigured()` is true
  2. a session exists (`getSession()`)
  3. subscribe / send does not throw
- If any of those fail: stay local, **do not crash**, do not toast a lie that “cloud chat is on”.
- **No WebSocket server on Vercel functions.** No new API route that upgrades sockets. No LiveKit. No postgres migration in this PR (9 already pending; broadcast is ephemeral).
- Do not claim cross-device history without a table. Broadcast is best-effort same-online fan-out; local persist is what survives reload.

### 2.5 Entry and parking

- Route: **`/server`** (not `/mission` — overloaded).
- **Not a primary tab** (C3). Not in `MOBILE_TAB_HREFS`. Not in `RAIL_GROUPS`.
- Entry: More sheet → **You** tier, after Profile, before Account.
- Surface id: **`server`**. Secondary (on by default, like Learn). Parkable via `NEXT_PUBLIC_SURFACES=wedge` or `-server`. Never claim a wedge path.
- No landing / www / “everything app” copy. `robots: noindex` on the route metadata.
- Not in the public sitemap.

### 2.6 Domain boundary

- Chat lives under `src/lib/social/` (already a `SOCIAL_ROOT`) and `src/components/social/` (**add** to `SOCIAL_ROOTS`).
- Coach / logger / mw-core planner **must not** import chat.
- Chat **must not** import coach, workout logger, or set-log.
- No emit from log → chat (no auto-post). C2 stays emit-only through existing reward/leaderboard doors.

---

## 3. Explicit non-goals (this PR)

- Voice, video, LiveKit, screen share
- DMs, friend ranking, Top 8, squad, feed of logs
- Workout auto-post, likes, comments on sets
- WeChat order / payments / mini-app host
- Discord OAuth or discord.com links/embeds
- Channel create / delete / rename UI
- Multi-server, invites, roles, moderation queue
- Android Compose / Expo
- `PRIVATE_MODE` / `FREE_BETA` flip
- EIN / Stripe / Bundle UI
- New user id system
- Supabase migration / Realtime postgres table
- Speech input owning the composer

---

## 4. Contracts

### 4.1 `docs/contracts/MODULE.md`

Add row:

| Id | Role | Free core |
|----|------|-----------|
| `social.server` | Garage text server (one local server, text channels) | **yes** (`free_core: true` — garage itself is not a paywall) |

Add scope **`social.channel.write`**: append a local text message in a channel the athlete already belongs to. Local-only in v1.

### 4.2 mw-core

- Add `'social.channel.write'` to `ModuleScope`.
- Export `SOCIAL_SERVER_MANIFEST`: id `social.server`, version `1.0.0`, scopes `identity.read` + `social.channel.write`, surfaces `['web']` only, `freeCore: true`, entry `/server`.
- Do **not** put chat I/O in mw-core. Types + manifest only.

### 4.3 Identity

Reuse `deviceId` / optional `userId` / call sign. No second id. Public projection unchanged (C5). Chat free text stays **device-local** (C5 allows local-only free text).

---

## 5. File map (implement exactly these)

### New

| Path | Role |
|------|------|
| `src/lib/social/INDEX.md` | Domain resume |
| `src/lib/social/types.ts` | Server / channel / message / member types + caps |
| `src/lib/social/garage.ts` | Seed Garage + 3 channels + self member; clamp 1 server / 4 channels |
| `src/lib/social/store.ts` | Load/save via `safeStorage`; post message; list by channel |
| `src/lib/social/store.test.ts` | Persist, channel isolation, caps, empty-body reject |
| `src/lib/social/realtime.ts` | Fail-closed optional `supabase.channel` broadcast |
| `src/lib/social/realtime.test.ts` | No session / unconfigured → no throw, no subscribe |
| `src/lib/social/callSign.ts` | Read operator name or `"Athlete"` |
| `src/components/social/ChannelList.tsx` | Channel switcher |
| `src/components/social/MessageList.tsx` | Author · body · time |
| `src/components/social/MessageComposer.tsx` | Text + send (one red field = Send) |
| `src/components/social/MemberList.tsx` | Self only; no online count |
| `src/page-components/ServerPage.tsx` | `/server` UI |
| `app/(app)/server/page.tsx` | Thin wrapper + noindex metadata |
| `src/i18n/serverLocales.ts` | Strings; EN + spread for other `APP_LANGS` |

### Edit (wiring only)

- `docs/contracts/MODULE.md`, `packages/mw-core/src/module/types.ts` (+ test + index export)
- `src/lib/domainBoundary.ts` — add `src/components/social/` to `SOCIAL_ROOTS`; C3 social hrefs include `/server`
- `src/lib/surface.ts` — `server` secondary + `SURFACE_PATHS.server = ['/server']`
- `src/lib/excellenceGate.ts` — `app/(app)/server`, `src/lib/social`, `src/components/social` as **surface**
- `src/lib/navConfig.ts` `MORE_NAV` — `/server`
- `src/lib/moreSheetTiers.ts` — You tier: `/profile`, `/server`, `/account`
- `src/lib/pageTitles.ts`, `src/lib/routeMetadata.ts`
- `src/lib/primaryNav.ts` — **do not** add a tab
- `src/i18n/navLocales.ts` + `bootstrapResources.ts` (`navServer`)
- `src/i18n/hydrateResources.ts`, `src/lib/exportLocales.ts`, `src/i18n/localeExportManifest.ts`, `src/i18n/INDEX.md`
- `src/lib/storage/keys.ts` — `missionServer: 'mw_mission_server'`
- INDEX files: `app/`, `src/lib/`, `src/components/`, `src/page-components/`, `packages/mw-core/`, root `INDEX.md`, `docs/INDEX.md`, `docs/help/INDEX.md`
- `src/lib/buildInfo.ts` → `2026.07-unified.726`
- `LOG.md` + `CONTEXT.md` `## Now` (rotate to stay ≤15 / ≤25)
- `docs/help/mission-server.md` — plain language; not a pitch

### Do not touch

- `src/components/workout/SetLogRow.tsx` and set-log table
- `src/lib/coach/**`, `src/store/workoutStore.ts` logger path
- `app/page.tsx` / landing copy
- `PRIVATE_MODE`, `FREE_BETA`, Android, `apps/mobile`
- `src/lib/speech/**`

---

## 6. UI (Modernist, not Discord chrome)

Paper / ink, radius 0, Archivo, light-only, 2px rules. **One red field** = Send. No purple, no pills, no glow, no online-green dots, no nitro/boost copy.

Layout:

- **≥ md:** left channel list · center messages + composer · right member (self)
- **Phone:** channel chips/list above messages; member line in the header (“1 member”) — never “online”

Kicker: `GARAGE` → display title `Garage` → channel `#train`. Empty channel: one honest line (“No messages yet. They stay on this device.”).

Composer: textarea + Send. Enter sends (Shift+Enter newline) on desktop; phone uses the button.

---

## 7. Tests (this ship)

| Test | Asserts |
|------|---------|
| `src/lib/social/store.test.ts` | Seed Garage; persist round-trip; channel switch isolation; cap 1 server / 4 channels / 200 msgs; reject empty; author Athlete when name unset |
| `src/lib/social/realtime.test.ts` | Unconfigured / no session → `connect` returns `{ ok: false, reason }` and does not throw |
| `domainBoundary.test.ts` | C1/C2 still green; C3 lists `/server`; `src/lib/social/` and `src/components/social/` are no longer the “declared ahead” skip |
| `surface.test.ts` | `/server` parks with wedge; stays on by default |
| `moreSheetTiers.test.ts` | You hrefs include `/server`; still not a tab |
| `packages/mw-core/src/module/types.test.ts` | `SOCIAL_SERVER_MANIFEST` valid, `freeCore`, `social.channel.write` in scope set |
| `check-build-label` | `.726` in `buildInfo`, LOG heading, CONTEXT |

No e2e required for v1 (not `@gate` hero). No visual snapshots.

---

## 8. Ship protocol

- Build label `2026.07-unified.726`
- LOG heading `## 2026-08-13 — Mission Server v1: garage text channels (`.726`)`
- Trailer: `Excellence-Override: Mission Server v1 text rooms`
- CONTEXT `## Now`: one `.726` bullet; rotate oldest shipped bullet to stay ≤25
- Draft PR title: `Mission Server v1: garage text channels (.726)`
- Plan commit carries `[skip vercel]`. Implementation is the one Preview.
- Do not flip `PRIVATE_MODE` / `FREE_BETA`. Do not force-push `master`.

---

## 9. Implementation order (after this freeze)

1. Contracts + mw-core types
2. `src/lib/social/` store + tests (local, no UI)
3. Fail-closed realtime helper + tests
4. Surface / nav / C3 / excellence map
5. UI + i18n + route
6. INDEX / help / LOG / CONTEXT / label
7. `npm test` (social + domainBoundary + surface + moreSheet + module types) + `npm run typecheck` + `npm run lint` on touched paths
