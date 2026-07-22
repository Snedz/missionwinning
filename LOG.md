# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep ≤15 entries / ≤20KB here. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22).

---

## 2026-07-22 — Android 1.18.0: Accept-unblock after hub UX

- **Accept truth:** FOUNDER_ACCEPT hub checks + Preferences U0a/U0b (Units/Equipment off Today); More row paths for Progress/Routines/Library.
- **Smoke:** `wedge-adb-walk.py` + Maestro Account tab round-trip before Start workout.
- **Polish:** Account unit/equipment feedback messages; hub tab TalkBack `selected`; localized Account tab strings (ES/PT/FR).
- Version `1.18.0` / versionCode 45. F7 Done; F5 gated. Verify: `./gradlew :app:assembleDebug`.

---

## 2026-07-22 — Beyond the Basics v1.4 (web `.96`)

- **Editorial:** seven free sections gained callout/table/checklist teaching blocks; all **18** free sections now have ≥1 block. Originality log v1.4 rows; `magazineMeta` → **1.4**.
- **Reader:** shared `renderMagazineBody` on public + in-app chapters; denser `relatedExerciseIds` / `relatedLearnPathId`; public-safe practice CTAs (`.95` groundwork).
- **PDF:** `MAX_PAGES` 28→36; regenerated `public/magazine/beyond-the-basics.pdf` (~23 pages / ~610KB).
- **i18n:** guidebook content keys filled for all APP_LANGS; `i18n:parity` green; `export-locales`.
- Build: `2026.07-unified.96`. Verify: `npm run typecheck` + `npm run i18n:parity` + PDF page gate.

---

## 2026-07-22 — Web .95: public guide practice CTAs + magazine body

- Wire `/guide` chapters through `publicGuidePracticeCta` (anonymous CTAs → `/welcome` / `/exercises`, not gated pillar routes) + shared `renderMagazineBody`.
- In-app guidebook chapter page uses the same body renderer.
- Sync CONTEXT after Android 1.17 overwrote `## Now` to stale `.93`; build `2026.07-unified.95`.
- Verify: `npm run typecheck` + `npm test`.

---

## 2026-07-22 — Horizon 0 residual (.94): invite smoke, hero e2e, landing density, week4-smoke

- Invite printer + gate-smoke invitee SSR (`data-mw-invitee`); Mission Score e2e fail-closed; landing hero density; `npm run week4-smoke`.
- Build: `2026.07-unified.94` (commit `036cb03`).

---

## 2026-07-22 — Android 1.17.0: hub UX polish (Today · Coach · Account)

- **Hub chrome:** 3-tab bottom nav with icons; Account first-class; peer tabs `launchSingleTop` + `popUpTo(Today) { saveState }`.
- **Today declutter:** Units/Equipment moved to Account Preferences; one primary Start; Quick log ghost; Progress/Routines/Library in compact More row.
- **Motion/insets:** tab fade (~200ms) vs stack slide; `MwScreenScaffold(applyNavBarPadding)`; hub screens skip double nav-bar padding; Coach dead `onBack` removed.
- **Flow:** Victory Coach/Routines/Today hub-safe pops; History soft-delete lands on Today with hub.
- Version `1.17.0` / versionCode 44. Verify: `./gradlew :app:assembleDebug` (JAVA_HOME=Android Studio JBR). F5 still gated; F6 Done in [apps/android/BACKLOG.md](apps/android/BACKLOG.md).

---

## 2026-07-21 — Horizon 0 web readiness: invite gate + launch-verify + wedge copy

- **Invite → gate:** links land on `/private?invite=…` (no prod `?access=` unless `PRIVATE_ALLOW_QUERY_ACCESS`); invitee expands access form; admin prefers API `row.link`; [docs/BETA_INVITE.md](docs/BETA_INVITE.md) aligned.
- **Wedge copy:** Beta guide steps + banner + `/beta` cards push I-Day → Train → Mission Coach; Coach empty-state matches Generate CTA; ES/FR/PT/DE gate subtitles drop “everything app”.
- **Launch tooling:** `launch-verify` chains growth-smoke + rate-limit-smoke (`LAUNCH_STRICT` requires them); CI gate-smoke hard-fails when secrets set; growth + soft rate-limit jobs added.
- **Docs:** VISION_STATUS build `.93`; PROTECTION P0 synced to LAUNCH_RUNBOOK §2; DESIGN_REVIEW pass logged; removed stray `_probe_sync.ts`.
- Build: `2026.07-unified.93`. Verify: `npm run typecheck` + `npm test`.

---

## 2026-07-21 — Horizon 0 sprint: dispute shield landed + founder checklists + CI sync types

- Confirmed entity/dispute shield already on `master`; [CONTEXT.md](CONTEXT.md) boot file + `## Now` updated (founder still enables Dashboard dispute events / refunds custom text / Accept B).
- Founder clarity: [docs/LAUNCH_RUNBOOK.md](docs/LAUNCH_RUNBOOK.md) §4 webhook events + `/refunds` custom text + digest email; [apps/android/FOUNDER_ACCEPT.md](apps/android/FOUNDER_ACCEPT.md) Accept B → Play Internal pointer.
- CI: typed `RequireUserResult` on mobile sync prefs (+ workouts/customs/routines) so `npm run typecheck` stays green.
- Agents: no F5 / new pillars; founder beta + Stripe Dashboard + Play remain founder-owned.

---

## 2026-07-21 — Android 1.16.0: PR chip, soft-delete, Baseline Profile

- **F2.4:** In-session e1RM PR detect (`Progression.isPersonalRecord`) + brass “New PR” chip; patterned rest/PR haptics (`VibrationEffect` waveform); `VIBRATE` permission
- **F3.4:** History soft-delete → Room `deletedAt` + outbox tombstone; push queries include pending deletes (workouts/routines/customs)
- **F2.5:** `:benchmark` Macrobenchmark + `BaselineProfileGenerator`; `profileinstaller` + `:app:generateBaselineProfile`; CI `:benchmark:assemble`
- **Docs:** [BACKLOG.md](apps/android/BACKLOG.md) F2.4/F2.5/F3.4 Done; ARCHITECTURE/SHIP_INTERNAL Baseline notes
- Verify: `cd apps/android && ./gradlew :app:assembleDebug testDebugUnitTest :core:model:testDebugUnitTest :benchmark:assemble`

---

## 2026-07-21 — Repo operating system: boot file, doc consolidation, iOS playbook, departments

- **CONTEXT.md** (new, root): universal boot file — `## Now` status block (now the ONLY status home; ORCHESTRATION `## Where we are` points there), trap terms, hard rules. Update `## Now` on every ship, same commit as the LOG entry.
- **Tool pointers:** `CLAUDE.md`, `GEMINI.md` (root) + `apps/android/GEMINI.md` — thin pointers into CONTEXT → AGENTS → INDEX; Cursor rule updated. Never duplicate spine content into tool files.
- **Root consolidation (20 → 11 .md):** STRATEGY/PLAN/REDTEAM/JOURNEY/LAUNCH_RUNBOOK/ENV/PROTECTION/BETA_INVITE/VISION_STATUS/VERCEL_DEPLOY_CHECKLIST → `docs/`; ACCEPTABLE_USE → `docs/legal/`; SETUP → `docs/archive/` (stale banner). Full link sweep across md/ts/mjs/mdc/yaml incl. `docs/compliance/controls.yaml` evidence paths + compliance test. INDEX §4 lists the moves.
- **LOG rotation:** ≤15 entries at root (rule in header); 75 older entries → [docs/archive/log/LOG-2026-06_to_2026-07-20.md](docs/archive/log/LOG-2026-06_to_2026-07-20.md).
- **iOS:** `docs/IOS_DEFERRED.md` → [docs/IOS_PLAYBOOK.md](docs/IOS_PLAYBOOK.md) — still deferred; now a full open-the-lane spec (SwiftUI, OpenAPI contract, StoreKit→enrollments, wedge scope, lane rules).
- **Departments:** agent-lane table in [ORCHESTRATION.md](ORCHESTRATION.md) (Web/Android/iOS-closed/Design/Content-Book/Growth/Ops/Data — owner, entry doc, allowed paths).
- **Vision/book:** `vision.md` Decade map (metrics-gated); Beyond the Basics book plan in [docs/STRATEGY.md](docs/STRATEGY.md) (locale PDFs → premium cadence → KDP at Horizon 3).
- **Design:** [docs/DESIGN_REVIEW.md](docs/DESIGN_REVIEW.md) hero-flow audit checklist; DESIGN_SYSTEM `## Motion & interaction` expanded (duration tiers, no-CLS, Android parity).
- Verify: `npm run typecheck` + `npm test` green; stale-link grep clean; root .md count = 11.

---

## 2026-07-21 — Android platform rebuild (Hilt / UDF / feature modules)

- **Architecture:** [apps/android/ARCHITECTURE.md](apps/android/ARCHITECTURE.md); horizons A–E in [docs/ANDROID_NATIVE.md](docs/ANDROID_NATIVE.md)
- **Spine:** Hilt (`@HiltAndroidApp`, `AppModule`); ViewModels + `StateFlow` UiState; Room v2 (`set_logs`, `sync_outbox`); finish workout atomic + outbox flush
- **Logger craft (`:feature:active`):** exercise×sets, previous performance row, rest −15/+15, keep-screen-on, editable weight/reps
- **Modules:** `:feature:{active,today,coach,iday,victory}` + `:core:{common,model,data,network,designsystem}`
- **CI:** `.github/workflows/ci.yml` `android` job — `assembleDebug` + Active unit tests + Maestro file gate
- **API:** Production `/api/mobile/*` returns private-gate JSON (routes live); client uses Room when unauthorized
- Verify: `cd apps/android && ./gradlew :app:assembleDebug :feature:active:testDebugUnitTest`

---

## 2026-07-20 — Pre-revenue entity + Stripe dispute shield

- **Entity pack:** [docs/legal/ENTITY_RESEARCH.md](docs/legal/ENTITY_RESEARCH.md), [docs/legal/OPERATING_AGREEMENT_DRAFT.md](docs/legal/OPERATING_AGREEMENT_DRAFT.md), [docs/PRE_REVENUE_CHECKLIST.md](docs/PRE_REVENUE_CHECKLIST.md) (take-a-dollar gate)
- **Refunds visibility:** `UnlockButton` → 14-day + `/refunds`; Stripe Checkout custom-text steps in [docs/STRIPE_PREMIUM_SETUP.md](docs/STRIPE_PREMIUM_SETUP.md)
- **Dispute alerts:** webhook `charge.dispute.*` → `FOUNDER_DIGEST_EMAIL` via `stripeDisputeNotify`; [docs/STRIPE_DISPUTE_OPS.md](docs/STRIPE_DISPUTE_OPS.md); setup script event list updated
- **Evidence pack:** [docs/legal/STRIPE_DISPUTE_EVIDENCE_PACK.md](docs/legal/STRIPE_DISPUTE_EVIDENCE_PACK.md) — no auto-fight
- Founder: add dispute events on existing Stripe webhook; set `FOUNDER_DIGEST_EMAIL`; Dashboard Checkout custom text → `/refunds`

---

## 2026-07-20 — Android UX craft pass

- **Design system:** bundled Barlow Condensed / Inter / IBM Plex Mono; `MwScreenScaffold` navy+emerald glow; branded buttons, `MwSetRow`, `MwRestTimer`, enter fade + reduce-motion
- **Screens:** I-Day hero (no roadmap copy), Today one-job next session, Active Strong-like logger, Victory lock metrics, Coach briefing rows + refined adapt banner
- Wedge Maestro strings preserved (`Start mission`, `Start workout`, `Finish workout`, `Session locked`, …)
- Verify: `./gradlew :app:assembleDebug` · `python3 apps/android/scripts/wedge-adb-walk.py`

---

## 2026-07-20 — Android emulator QA + Play path complete (agent)

- Emulator: `assembleDebug` + `installDebug` on `Pixel_10_Pro`; MainActivity launched; adb UIAutomator wedge I-Day→Today→Active→Victory→Coach **passed** (Room offline). Prefer mid-range AVD (`MW_Phone_API36`) on 8GB hosts — Pixel 10 Pro warns for 16GB RAM.
- Network: www `/api/mobile/*` returns gate 403 / HTML 404 until routes deploy; `MwRepository` Room seed fallback confirmed; optional `mw.apiBaseUrl` / `mw.privateAccessCookie` in `local.properties`; `mobileCoachApi` tests green.
- Release: `assembleRelease` + `bundleRelease` green (versionCode 2, minify + ProGuard keeps); AAB at `app/build/outputs/bundle/release/app-release.aab` (debug-signed until founder runs `create-upload-keystore.sh`).
- Play Internal: PLAY_LISTING Data safety + founder checklist; `store-assets/README.md` for screenshots — Console upload remains founder-owned.

---

## 2026-07-20 — Android release signing + Play Internal plumbing

- **`apps/android`:** optional `keystore.properties` → `signingConfigs.release`; release minify on; `versionCode` 2 / `versionName` 1.0.0; debug signing fallback for local `bundleRelease` smoke
- Templates/scripts: `keystore.properties.example`, `scripts/create-upload-keystore.sh`, `scripts/wedge-adb-walk.py` (Maestro wedge via adb UIAutomator; no airplane mode)
- Docs: PLAY_LISTING (Data safety from LEGAL_SAFETY §2, screenshots, founder checklist), INDEX emulator commands, ANDROID_NATIVE API 34+ system image note
- Founder: create real upload keystore locally → Internal AAB; emulator QA still via installDebug + Maestro/adb walk

---

## 2026-07-20 — Android-first native (Compose)

- **`docs/ANDROID_NATIVE.md`:** get-started + AI lane orchestration; **`docs/IOS_DEFERRED.md`**
- **`docs/openapi-mobile.yaml`** + `/api/mobile/coach/plan|adapt` + `/api/mobile/workouts` (mw-core seed/adapt)
- **`apps/android`:** multi-module Compose (designsystem/data/network/app) — I-Day → Today → Active → Victory → Coach; Room offline; Maestro + PLAY_LISTING
- Expo demoted to UX prototype; Play product path is Compose (`assembleDebug` green)
- Founder: emulator QA + Play Internal when ready

