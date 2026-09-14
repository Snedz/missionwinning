# Mission OS minis — architecture freeze (2026-09-14)

**Status:** FROZEN. This file is the plan. Do not implement until a follow-up says BUILD.  
**Class:** INTERNAL (canonical home: `mission-ops/memory/strategy/`). Paper architecture — not a product ship.  
**One concern:** host shell + mini manifest + capability bus. ClearShot is the first *utility* mini **later**, via `mission://minis/clearshot`.  
**Stamp:** **unstamped.** `.1067` is spent (CoachConcept, `#932`). Do not mint `.1068` on this plan PR. Reserve concept `.1068` Mission OS minis for the **implement** turn only if that turn touches `src|app|scripts|supabase`. Live www stays `2026.07-unified.697`. Paper craft tip stays `.1067`. `PRIVATE_MODE` stays on. `[skip vercel]`.  
**Horizon:** Types + stubs on implement; host chrome and ClearShot product UI stay later. L0 Mission OS stays invisible. L1 Health (Train + Mission Coach) stays the product.  
**Does not remake Mission Winning.** Does not replace Today / Train / Coach.

This freeze continues product `docs/contracts/MODULE.md` + `packages/mw-core/src/module/` (spec + types already). Ops sequence: `memory/OS_L2_SEQUENCE.md` (mini-programs after habit + ID + rail). This file is the **implementable contract** for the host kernel — not an L2 launch, not a six-tab house, not a WeChat costume.

---

## 1. Goal

Host a **WeChat-class mini** under one **Mission ID** without remaking the health app.

| Piece | Job | Now vs later |
|-------|-----|----------------|
| **Host shell** | Resolve `mission://minis/{id}`, load one registered manifest, deny undeclared scopes | Implement = types + registry + deny. No athlete-facing app grid. |
| **Mini manifest** | One closed shape: `id`, `name`, `scopes`, `entry`, `version` | Implement = schema + parse/assert + ClearShot reserved row |
| **Capability bus** | Host-owned doors: identity, billing, photos, storage | Implement = stubs that fail closed. No real camera UI. |
| **ClearShot** | First utility mini. Entry `mission://minis/clearshot` | **Later.** Standalone Play listing until a host exists. Same Kotlin module optional. |

**The one sentence to hold:** *Mission Winning stays the health app; minis are guests on Mission ID, not a second product and not a homepage.*

0.1 remains L1 Health. A mini never becomes a Today tab, a Train overlay, or a reason to gate `logSet`.

---

## 2. Manifest schema

Extend `ModuleManifest` in `packages/mw-core/src/module/types.ts`. Today the type has `id`, `version`, `scopes`, `surfaces`, `freeCore`, `entry` and requires `entry` to start with `/`. Implement adds **`name`** and allows a `mission://` entry for utility minis. Do not invent a second manifest type.

```yaml
mini:
  id: utility.clearshot          # reverse-dns; parseModuleId already requires ≥2 segments
  name: ClearShot                # athlete-facing label (i18n later; English stub on implement)
  version: 0.1.0                 # semver; assert /^\d+\.\d+\.\d+/
  scopes:
    - identity.read
    - photos.read
    - photos.write
    - storage.write
  entry: mission://minis/clearshot
  surfaces: [android]            # keep existing field; web host later
  free_core: true                # utility minis never paywall the logger
```

| Field | Rule |
|-------|------|
| `id` | `parseModuleId` — lowercase dotted segments, ≥2. First utility family is `utility.*`. Do not reuse `health.*` / `game.*` / `social.*` for ClearShot. |
| `name` | Non-empty trimmed string, max 40. Not a marketing sentence. |
| `scopes` | Closed set. Host **denies** anything not listed on the manifest. |
| `entry` | Host-relative `/…` **or** `mission://minis/{id}` where `{id}` is the last segment of the module id (`utility.clearshot` → `clearshot`). |
| `version` | Semver. Bump on any scope or entry change. |

Registered ids after implement (add rows to `docs/contracts/MODULE.md` + mw-core constants):

| Id | Name | Entry | Role |
|----|------|-------|------|
| `host.shell` | (n/a) | n/a | Future mini-host — already reserved. Types + registry only. |
| `utility.clearshot` | ClearShot | `mission://minis/clearshot` | First utility mini. Reserved. No product UI this freeze. |

`health.train` stays `free_core: true`. A mini cannot override that.

Deep-link grammar (closed):

```text
mission://minis/{slug}
```

`{slug}` is `[a-z][a-z0-9]*`. Unknown slug → deny (no fallback to `/log` or `/active`). Host does not open arbitrary `https://` inside the mini frame on implement.

---

## 3. Capability bus stubs

Four doors. Host implements; minis **call**, they do not import product stores, Supabase, Stripe, or `safeStorage` directly.

New scopes (add to `ModuleScope` on implement). Existing scopes stay. Do not open `health.write` or `social.*` to ClearShot.

| Scope | Door | Stub behavior on implement |
|-------|------|----------------------------|
| `identity.read` | **identity** | Return `{ missionId: number \| null, callSign: string \| null }`. Guests have no Mission ID. Never mint an id. Never a second user id per mini. |
| `identity.write` | (not granted to ClearShot) | Deny. |
| `billing.read` | **billing** | Return `{ bundle: 'none' \| 'super', muted: true }`. Reads existing premium recognition only (`premiumServer` / Play entitlement). Mute-pay until founder rails. **Never** opens checkout. **Never** gates `logSet`. |
| `photos.read` / `photos.write` | **photos** | Fail closed: `{ ok: false, code: 'photos_stub' }`. No camera sheet, no upload, no cloud. Pattern later: on-device only (`src/lib/progressPhotos.ts` / Android MediaStore). |
| `storage.read` / `storage.write` | **storage** | In-memory or namespaced key-value keyed by `mini.id`. Not raw `localStorage`. Not Room SoT for workouts. Cap keys + bytes (implement picks one small cap and tests it). |

Bus rules:

1. **Deny undeclared.** A call whose scope is missing from the manifest returns a typed deny, not a throw into Train.  
2. **No I/O in mw-core.** Pure types + `assertCapability(manifest, scope)` live in `packages/mw-core`. Web/Android adapters are thin.  
3. **Planner stays blind.** Nothing under `src/lib/coach/` or `packages/mw-core/src/coach/` may import the bus.  
4. **Logger stays ungated.** `handleLogSet` / Active store must not import minis.  
5. **Today stays one Start.** `/log` does not mount a mini host or a ClearShot door.

Conceptual shape (implement; do not copy as a second source of truth later — the test file owns the closed set):

```ts
type MiniCapability = 'identity' | 'billing' | 'photos' | 'storage';

type CapabilityDeny = { ok: false; code: 'scope_denied' | 'stub' | 'unknown_mini' };
```

---

## 4. Files to touch on the implement turn

**Only these.** One PR, one concern. No product UI for ClearShot. No remake.

### Shared types (required)

| Path | Change |
|------|--------|
| `packages/mw-core/src/module/types.ts` | Add `name`; allow `mission://minis/{slug}` entry; add `photos.*` + `storage.*` + `billing.read` to `ModuleScope`; export `UTILITY_CLEARSHOT_MANIFEST` + `HOST_SHELL` constant |
| `packages/mw-core/src/module/types.test.ts` | Parse/assert; reject unknown scope; reject `mission://minis/other` when id is `utility.clearshot`; mutant: a `/active` entry on ClearShot dies |
| `packages/mw-core/src/module/capabilities.ts` | **New.** `assertCapability` + stub result types. Pure. |
| `packages/mw-core/src/module/capabilities.test.ts` | **New.** Deny undeclared; allow listed; unknown mini deny. Falsify by granting `health.write` to ClearShot. |
| `packages/mw-core/src/module/index.ts` | Re-export |
| `packages/mw-core/INDEX.md` | Row for capabilities + ClearShot reserved manifest |

### Product contracts (required)

| Path | Change |
|------|--------|
| `docs/contracts/MODULE.md` | Register `utility.clearshot` + `host.shell` runtime note; list new scopes; keep `health.train` free-core |
| `docs/contracts/INDEX.md` | One line: minis bus lives in mw-core `module` |

### Isolation (required)

| Path | Change |
|------|--------|
| `src/lib/domainBoundary.test.ts` **or** new `src/lib/minisIsolation.test.ts` | Discover: `src/lib/coach/`, `src/store/`, `ActiveWorkoutPage`, `HomePage` must not import `@/lib/minis` or `mw-core` capabilities adapters. Fail on an unreviewed importer. |
| `src/lib/domainBoundary.ts` | Comment-only door if a web adapter is added; no social read |

### Web adapter (stubs only — no route chrome)

| Path | Change |
|------|--------|
| `src/lib/minis/INDEX.md` | **New** domain folder (one concern: web adapters). |
| `src/lib/minis/bus.ts` | Thin adapter: identity from existing identity helpers; billing from existing premium read; photos/storage stubs. |
| `src/lib/minis/bus.test.ts` | Guest → `missionId: null`; undeclared scope deny. |
| `src/lib/minis/registry.ts` | In-process map of manifests. Unknown id deny. |

**Do not add** `app/(app)/minis/` or a Today/More door on implement.

### Android / Play bridge (stubs + optional module — no store listing)

| Path | Change |
|------|--------|
| `apps/android/settings.gradle.kts` | `include(":minis:clearshot")` as **library** |
| `apps/android/minis/clearshot/` | Optional Kotlin library: manifest constant + bus interfaces. No Activity chrome required on implement if tests can see the interfaces. |
| `apps/android/clearshot-app/` **or** `apps/android/minis/clearshot-app/` | Optional `com.android.application` with `applicationId = "com.missionwinning.clearshot"`. **Not** `com.missionwinning.app`. Separate until host exists. |
| `apps/android/INDEX.md` | Rows for `:minis:clearshot` + standalone applicationId |
| `apps/android/ARCHITECTURE.md` | One paragraph: optional module; host later depends on the same library |

`:app` (`com.missionwinning.app`) does **not** merge ClearShot on implement. Wear / Play Billing on the health app stay untouched.

### Do not touch on implement

`HomePage.tsx`, `ActiveWorkoutPage.tsx`, `src/store/`, `src/lib/coach/planEngine.ts`, `src/lib/coach/adapt.ts`, `/log` first paint, `/server`, social components, `privateGate.ts`, `PRIVATE_MODE`, `sites/www`, EIN/legal, Stripe checkout, CONTEXT/LOG/build label **unless** the implement turn actually ships app code (then hard rule 5 + concept `.1068` only).

---

## 5. Standalone Play ClearShot → host later

ClearShot may ship as its **own** Play product so it can exist before `host.shell` is real.

| Rule | Detail |
|------|--------|
| **applicationId** | `com.missionwinning.clearshot` until a host exists. Never reuse `com.missionwinning.app` or `.wear`. |
| **Same Kotlin module** | `:minis:clearshot` is a **library**. Standalone app depends on it. Later, `:app` (host) may depend on the **same** module. Do not fork UI into two source trees. |
| **Mission ID** | When the athlete is signed in, identity.read returns the **same** server-minted Mission ID as Health. Guests stay local-only. No second account system. |
| **Deep link** | Host later opens `mission://minis/clearshot`. Standalone ignores that URI (or shows its own root). Do not deep-link standalone into `/log`. |
| **Data** | Photos and mini storage stay scoped to ClearShot. Do not write workout rows. Do not read Coach plans. |
| **Billing** | Optional Super Bundle recognition only. Mute-pay. Standalone must not invent a second SKU on implement. |
| **Listing** | Founder owns Play Console. Agents do not publish or flip listings. |

Bridge sequence (not this freeze):

```text
1. Library module + types     ← implement turn
2. Standalone APK (own id)    ← later, founder
3. host.shell loads the same library via mission://minis/clearshot
4. Only then consider folding the standalone listing
```

---

## 6. Refuse list (hard)

| Refuse | Why |
|--------|-----|
| **Remake MW** | Selective rebuild only. No second frontend, no new tab bar, no app grid on Today. |
| **Discord.com** | No Discord OAuth, widgets, “Open in Discord”, Discord purple. Native Garage is a different file (`CHAT_L2_PLAN.md` / `docs/MISSION_SERVER_MESSENGER_PLAN.md`). |
| **DMs / comments / workout-feed on Today / `/log`** | Isolation. Chat is not mounted on Today or Train. A mini is not a feed. |
| **Tip-promote** | Paper only. Do not promote production. Live www stays `.697`. |
| **`PRIVATE_MODE` flip** | Founder only. Agents never flip the gate. |
| **Invent traction** | No user counts, no week-4 claims, no fake Play installs. |
| **EIN in git** | Digits, bank, routing — never. Mute-pay stays founder rails. |
| Second user id per mini | One Mission ID. |
| `health.write` / Coach import from a mini | Planner and logger stay blind to standing and to mini output. |
| Games / metaverse / six-tab house | `game.*` stays reserved. Evict, don’t add tabs. |
| Raw `localStorage` | `safeStorage` / namespaced bus only. |
| Calendar dates from `toISOString()` | `localDateKey` if any date key is stored. |
| Cloud photo upload on implement | On-device stub. |
| Checkout / new Stripe SKU / Play Billing on ClearShot | Recognition only. |
| iOS before Android Accept B | Android lane only for the standalone stub. |
| Stamping this plan as `.1067` | Spent. Unstamped docs PR. `.1068` only if implement ships app code. |

---

## 7. Done-when (implement turn)

A follow-up BUILD is done when **all** of these are true:

1. `UTILITY_CLEARSHOT_MANIFEST` parses: `id`, `name`, `scopes`, `entry = mission://minis/clearshot`, `version`.  
2. `assertModuleManifest` accepts `mission://minis/{slug}` **only** when `{slug}` matches the id’s last segment; rejects `/active` on ClearShot; rejects unknown scopes.  
3. Capability bus stubs exist for **identity**, **billing**, **photos**, **storage**. Undeclared scope → typed deny. ClearShot cannot call `health.write`.  
4. Isolation test discovers (does not enumerate a silent two-file list): coach, workout store, `ActiveWorkoutPage`, `HomePage` do not import the minis adapter.  
5. `docs/contracts/MODULE.md` lists `utility.clearshot` and the new scopes. `health.train` still `free_core: true`.  
6. Android: `:minis:clearshot` library exists **or** is explicitly deferred in INDEX with a reason. If a standalone application module exists, its `applicationId` is `com.missionwinning.clearshot`, not `com.missionwinning.app`.  
7. No Today / `/log` / Train UI. No DMs, comments, or workout feed. No Discord.com.  
8. Tests: mw-core module + capabilities + isolation. Falsify at least one mutant (wrong entry, extra scope, or coach import) and record it.  
9. No `PRIVATE_MODE` flip. No tip-promote. No invented traction. No EIN digits. Live www stays `.697`.  
10. If the implement turn touches `src|app|scripts|supabase`, stamp concept **`.1068` Mission OS minis** (not `.1067`) and update LOG + CONTEXT + build label in that same commit. If it is still paper-only, stay unstamped.

**This turn is done when** this file exists, is the freeze, and no product code has shipped from it.

---

## 8. This turn (PLAN only)

| Do | Do not |
|----|--------|
| Freeze this file | Implement types, UI, routes, or Android modules |
| Draft paper-docs PR, unstamped | Mint `.1067` or `.1068` |
| Stop for freeze | Update `docs/harness/HOP.md` or `CONTEXT.md` `## Now` (docs-only; check-build-label skips) |

Follow-up command: **BUILD** — implement §4 against §7. Do not start ClearShot product UI until the stubs and isolation are green.

---

## Related

| Doc | Role |
|-----|------|
| Product `docs/contracts/MODULE.md` | Module host spec; `host.shell` reserved |
| Product `packages/mw-core/src/module/` | Manifest types + `health.train` / `social.server` |
| Product `docs/contracts/IDENTITY.md` | One Mission ID; no second account |
| Product `docs/contracts/ECONOMY.md` | No client mint; logger never gated by rank |
| `memory/OS_L2_SEQUENCE.md` | Mini-programs after habit + ID + rail; Friday ≠ L2 |
| `memory/CHAT_L2_PLAN.md` | Native Mission Server — not Discord.com; not this PR |
| Product `docs/MISSION_SERVER_MESSENGER_PLAN.md` | Garage isolation (Today/Train stay chat-free) |
| Product `src/lib/progressPhotos.ts` | On-device photo pattern ClearShot may reuse later |
| Product `apps/android/INDEX.md` | Play product `com.missionwinning.app` — do not steal that id |

---

## Change log

| Date | Change |
|------|--------|
| 2026-09-14 | First freeze — host + manifest + bus; ClearShot reserved at `mission://minis/clearshot`; standalone Play id until host exists; refuse remake / Discord.com / Today feed / tip-promote / PRIVATE_MODE / traction / EIN. PLAN only. |
