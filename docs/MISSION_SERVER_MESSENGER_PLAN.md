# Mission Server messenger — freeze (`.752`)

**Status:** FROZEN 2026-08-13. Implement this file only.
**Label:** `2026.07-unified.752` (master is `.751`. Prompt asked `.748`; that label already shipped as exercise notes. Do not steal `.697`–`.730`.)
**Horizon:** Founder override — native messenger now. Games (AoE2 / Pokémon GO / Clash of Clans) are a later horizon — **one-line OS contract comment, no UI**.
**Excellence-Override:** Mission Server messenger (MSN rooms)
**Preview:** `[skip vercel]` on every commit. Hobby quota is burned. Do not flip `PRIVATE_MODE`. Do not promote production.

This is the plan-then-build freeze for this ship. [docs/PLAN.md](PLAN.md) remains the A–I roadmap. Product rooms: [IA_SKELETON.md](IA_SKELETON.md) (GARAGE loop). Continue [#518](https://github.com/Snedz/missionwinning/pull/518) (`docs/MISSION_SERVER_V1_PLAN.md`, `.726`) — do not restart.

---

## 1. Investigation (done — do not restart #518)

Hypothesis was: *#518 already has rooms; the gap is presence + window chrome + local persist.*

**Conclusion — keep the store, reframe the product.**

| Already on #518 (`cursor/mission-server-v1-e72a`) | Gap this PR closes |
|---------------------------------------------------|--------------------|
| One local Garage + 3 text rooms (`train` · `garage` · `off-topic`) | Presence on the Mission ID (available / away / offline) |
| `safeStorage` persist (`mw_mission_server`), 200 msgs/channel, reload-safe | Messenger **window** chrome (title bar, compose, timestamps) — not Discord channel chrome |
| Fail-closed optional `supabase.channel` broadcast | Feature-flag Realtime; fail **open** to local (same helper, honest copy) |
| Route `/server`, More → You, not a tab | Isolation test: chat is **not** mounted on Today / Train |
| Domain `src/lib/social/` + `src/components/social/` | Display name from profile + Mission ID (call-sign `00`–`99`) if set |
| Product copy: “Discord-shaped text rooms” | Steal **MSN Messenger’s product**, not Discord.com |

Port #518’s store / garage / realtime / route wiring onto this branch, then deepen. Do not open a second store or a second route.

Ops #8 already locked native-not-discord.com. Honour it: no Discord OAuth, widgets, or “Open in Discord”.

---

## 2. What we steal from MSN (product, not branding)

| MSN move | Mission Server v1 |
|----------|-------------------|
| Presence: available / away / offline | Local on this device’s Mission ID. Manual picker. Never invent other people’s dots. |
| Buddy list | Rooms + members. Rooms feel like groups in a contact list. **Not** a social graph, not Top 8. |
| Simple chat window | Title (room name) · messages · local clock time · compose · Send. |
| Display name | `mw_operator_name` if set, else the literal **Athlete**. Never `loadOperatorName()`’s `"Mission Operator"` fallback. |
| Mission ID | Athlete Card call-sign number `00`–`99` when set; omit when unset. |
| Offline-capable | Local store is source of truth. Reload keeps rooms + messages + presence. |
| Quiet nudge (optional) | One local system line in the open room. **No sound.** Not a push. Not on Today. |
| Classic messenger chrome | Ruled window: list | conversation. Ink-panel title bar (`neutral-900` / `neutral-100` — already sanctioned for rest-dock / flow runner). Metric-quiet. |

**Craft, not a theme flip.** Design gate is paper / ink, radius 0, Archivo, light-only. Steal a metric-quiet health app’s *metric-quiet density*, not a dark-mode product. Not Clippy. Not Discord purple. Not a game HUD. One red field per page = **Send**.

---

## 3. What we refuse (hard)

- 1:1 DMs
- Comments on workouts
- A workout activity feed
- Public ranks / likes-for-logs
- Top 8 / friend ranking
- Gym wars / GTA clone / Age of Empires 2 / Pokémon GO / Clash of Clans **UI** (later horizon — one-line comment in `docs/contracts/MODULE.md` only)
- Discord.com — OAuth, widgets, “Open in Discord”, Discord purple
- Anything on `/active`, `/log`, or Today first paint. No chat tab on Today. No messages under the set-log table. Speech never owns first paint; speech never replaces the set-log table.
- Vercel Hobby sockets. No new API that upgrades WebSockets.
- `PRIVATE_MODE` flip. Production promote. Super Bundle as a logger gate.
- Geo-blocks in `src/lib/legal/supportedRegions.ts`
- #505 field test, #519 PT warning, #536 pregnancy (counsel-hold)
- Invented traction. Android Compose / Expo. Channel-create UI. Multi-server. Invites. Roles. Voice.

---

## 4. Frozen behavior

### 4.1 Rooms (from #518, keep)

- One free **Garage** per athlete, seeded locally on first open of `/server`. No account.
- Caps: **1 server**, **4 channels**, **200 messages/channel**, body max **2000**, plain text.
- Seed slugs: `train` · `garage` · `off-topic`. Default selected: `train`.
- Channel switch must not bleed messages.
- Free text stays **device-local** (C5).

### 4.2 Presence (new)

- States: `'available' | 'away' | 'offline'`.
- Stored on `MissionServerState.presence` (self only). Default `'available'` when the page is open and no saved value.
- Persist with the same `mw_mission_server` blob. Reload restores it.
- UI: quiet status control in the messenger chrome (list footer or title). Three choices, no green “online count”, no fake other athletes.
- Member row for **self** shows the chosen state. Do not paint other members as online.

### 4.3 Chat window

- Left: room list (buddy-list feel: room name + optional last-line preview).
- Right (phone: below): one window — title bar (room) · message list · composer.
- Each message: display name · optional Mission ID · body · local clock time. Store ISO instant; **do not** derive a calendar date from `toISOString()`.
- Enter sends (Shift+Enter newline) on desktop; phone uses Send.
- Empty: one honest line — messages stay on this device.
- Optional nudge: button in the window chrome writes a local system message (`kind: 'nudge'`). No `Audio`, no vibration required.

### 4.4 Sync (fail open to local)

- Local store is always the source of truth on the device.
- Signed-in persist (`.775`): outbox → `POST /api/social/messages` → `social_messages`. Guests never enqueue. Missing table fail-opens to local.
- Realtime is **off unless** all of: `isSupabaseConfigured()`, a session exists, and subscribe does not throw. Prefer `postgres_changes` on `social_messages`; broadcast on shared topic `mw-garage` is extra fan-out.
- Feature flag: treat missing/unconfigured Realtime as local-only. Never crash. Never toast “cloud chat is on”.
- No Vercel sockets. The pending founder pack does **not** block writing the next migration.

### 4.5 Entry and parking

- Route: **`/server`**. `robots: noindex`. Not in sitemap.
- **Not a primary tab** (C3). Not in `MOBILE_TAB_HREFS`. Not in `RAIL_GROUPS`.
- Entry: More sheet → **You** tier, after Profile, before Account. Quiet OS door.
- Surface id: **`server`**. Secondary (on by default). Parkable via `NEXT_PUBLIC_SURFACES=wedge` or `-server`.
- Chat locale bodies **must not** ride the root-layout / bootstrap path (Today/Train first paint). Nav label may live in `navLocales` / `BOOTSTRAP_EN` (`navServer`). Full strings hydrate via `serverLocales.ts`.

### 4.6 Domain boundary

- Chat under `src/lib/social/` and `src/components/social/` (add the component root to `SOCIAL_ROOTS`).
- Coach / logger / mw-core planner **must not** import chat.
- Chat **must not** import coach, workout logger, or set-log.
- No emit from log → chat (no auto-post).
- Isolation test discovers Today (`HomePage.tsx` + `src/components/today/`) and Train (`ActiveWorkoutPage.tsx` + `src/components/workout/` logger files) and fails if they import `social`.

---

## 5. Contracts

### 5.1 `docs/contracts/MODULE.md`

Keep / add:

| Id | Role | Free core |
|----|------|-----------|
| `social.server` | Garage messenger (rooms + local presence) | **yes** |

Scope **`social.channel.write`**: append a local text message in a room the athlete already belongs to. Local-only in v1.

**One-line later-horizon comment (no UI):** future `game.*` modules (Age of Empires 2 / Pokémon GO / Clash of Clans analogues) bind the same Mission ID — host runtime is post-PMF.

### 5.2 mw-core

- `'social.channel.write'` on `ModuleScope`.
- `SOCIAL_SERVER_MANIFEST`: id `social.server`, version `1.1.0` (messenger deepen of #518’s 1.0.0), scopes `identity.read` + `social.channel.write`, surfaces `['web']`, `freeCore: true`, entry `/server`.
- Types + manifest only. No chat I/O in mw-core.

### 5.3 Identity

Reuse `deviceId` / optional `userId` / operator name / call-sign number. No second id. Public projection unchanged (C5).

---

## 6. File map

### New / port from #518 then deepen

| Path | Role |
|------|------|
| `src/lib/social/INDEX.md` | Domain resume |
| `src/lib/social/types.ts` | Rooms, messages, **presence**, caps |
| `src/lib/social/garage.ts` | Seed + clamp (preserve messages; default presence) |
| `src/lib/social/store.ts` | Load/save; post; presence set; persist |
| `src/lib/social/store.test.ts` | Persist, isolation, caps, presence round-trip, reload |
| `src/lib/social/realtime.ts` | Fail-open optional broadcast |
| `src/lib/social/realtime.test.ts` | Unconfigured / no session → local, no throw |
| `src/lib/social/callSign.ts` | Display name **Athlete** fallback + optional Mission ID |
| `src/lib/social/isolation.test.ts` | Chat not imported from Today / Train first-paint trees |
| `src/components/social/BuddyList.tsx` | Room list (replaces Discord-shaped ChannelList as the list chrome) |
| `src/components/social/ChatWindow.tsx` | Window chrome: title, messages, compose, optional nudge |
| `src/components/social/MessageList.tsx` | Author · Mission ID · body · time |
| `src/components/social/MessageComposer.tsx` | Text + Send |
| `src/components/social/PresenceControl.tsx` | available / away / offline |
| `src/page-components/ServerPage.tsx` | `/server` |
| `app/(app)/server/page.tsx` | Thin wrapper + noindex |
| `src/i18n/serverLocales.ts` | Messenger strings; EN + spread |
| `docs/help/mission-server.md` | Plain language; not a pitch |

Keep #518 `ChannelList` / `MemberList` only if the messenger chrome still needs them as internals; otherwise delete so we do not ship Discord clone chrome.

### Edit (wiring)

- `docs/contracts/MODULE.md`, `packages/mw-core/src/module/types.ts` (+ test + index)
- `src/lib/domainBoundary.ts` — `src/components/social/` in `SOCIAL_ROOTS`; C3 social hrefs include `/server`
- `src/lib/surface.ts` — `server` secondary + `SURFACE_PATHS.server = ['/server']`
- `src/lib/excellenceGate.ts` — `app/(app)/server`, `src/lib/social`, `src/components/social` as **surface**
- `src/lib/navConfig.ts` `MORE_NAV` — `/server`
- `src/lib/moreSheetTiers.ts` — You: `/profile`, `/server`, `/account`
- `src/lib/pageTitles.ts`, `src/lib/routeMetadata.ts`
- `src/lib/primaryNav.ts` — **do not** add a tab
- `src/i18n/navLocales.ts` + `bootstrapResources.ts` (`navServer` only)
- `src/i18n/hydrateResources.ts`, `src/lib/exportLocales.ts`, `src/i18n/localeExportManifest.ts`, `src/i18n/INDEX.md`
- `src/lib/storage/keys.ts` — `missionServer: 'mw_mission_server'`
- INDEX files: `app/`, `src/lib/`, `src/components/`, `src/page-components/`, `packages/mw-core/`, root `INDEX.md`, `docs/INDEX.md`, `docs/help/INDEX.md`
- `src/lib/buildInfo.ts` → `2026.07-unified.752`
- `LOG.md` + `CONTEXT.md` `## Now` (rotate to stay ≤15 / ≤25)
- `docs/PLAN.md` freeze pointer (this file)

### Do not touch

- `src/components/workout/SetLogRow.tsx` and the set-log table
- `src/lib/coach/**`, `src/store/workoutStore.ts` logger path
- `src/page-components/HomePage.tsx` / `ActiveWorkoutPage.tsx` except to **not** import chat
- `app/page.tsx` / landing copy
- `PRIVATE_MODE`, `FREE_BETA`, Android, `apps/mobile`
- `src/lib/speech/**`
- `src/lib/legal/supportedRegions.ts`
- #505 / #519 / #536 paths

---

## 7. Tests (this ship)

| Test | Asserts |
|------|---------|
| `src/lib/social/store.test.ts` | Seed; persist round-trip; channel isolation; cap; reject empty; author Athlete when name unset; **presence survives reload**; nudge is a local system line |
| `src/lib/social/realtime.test.ts` | Unconfigured / no session → `{ ok: false, reason }`, no throw |
| `src/lib/social/isolation.test.ts` | Discover `HomePage.tsx`, `src/components/today/`, `ActiveWorkoutPage.tsx`, logger files in `LOGGER_FILES` — none import `src/lib/social` or `src/components/social`. Fail on a new importer. |
| `domainBoundary.test.ts` | C1/C2 green; C3 lists `/server` as social (not a tab); social roots include components |
| `surface.test.ts` | `/server` parks with wedge; on by default |
| `moreSheetTiers.test.ts` | You hrefs include `/server`; still not a tab |
| mw-core module types | `SOCIAL_SERVER_MANIFEST` valid, `freeCore`, `social.channel.write` |
| `check-build-label` | `.752` in `buildInfo`, LOG heading, CONTEXT |

No `@gate` e2e. No visual snapshots. No Discord strings in product UI.

---

## 8. Ship protocol

- Build label `2026.07-unified.752`
- LOG heading `## 2026-08-13 — Mission Server messenger (MSN rooms) (`.752`)`
- Trailer: `Excellence-Override: Mission Server messenger (MSN rooms)`
- CONTEXT `## Now`: one `.752` bullet; rotate oldest shipped to stay ≤25
- Draft PR title: `Mission Server messenger: MSN rooms + presence (.752)`
- PR body states **Preview will not deploy** (`[skip vercel]`).
- Every commit: `[skip vercel]`.
- Do not flip `PRIVATE_MODE` / `FREE_BETA`. Do not force-push `master`.

---

## 9. Implementation order (after this freeze)

1. Port #518 contracts + mw-core types + local store (adapt clamp for presence).
2. Presence + display-name helpers + store tests (including reload).
3. Fail-open realtime + tests.
4. Surface / nav / C3 / excellence map. Isolation test **before** UI so Today/Train cannot grow a chat import.
5. Messenger UI + i18n + `/server` route.
6. INDEX / help / LOG / CONTEXT / label.
7. `npm test` (social + domainBoundary + surface + moreSheet + module types + isolation) + `npm run typecheck` + `npm run lint` on touched paths.
