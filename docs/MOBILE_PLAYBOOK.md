# Mobile playbook — native Android + iOS

**Status: ACTIVE planning umbrella (2026-08-06).** One rule: this doc points; owning docs decide.
**Owners it points at:** [ANDROID_NATIVE.md](ANDROID_NATIVE.md) (Android build) · [IOS_PLAYBOOK.md](IOS_PLAYBOOK.md) (iOS stack + gate) · [openapi-mobile.yaml](openapi-mobile.yaml) (client contract) · [API_MOBILE.md](API_MOBILE.md) (contract prose) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) (tokens) · [UX_PLAYBOOK.md](UX_PLAYBOOK.md) (UX process + standards) · [../ORCHESTRATION.md](../ORCHESTRATION.md) (sequencing authority) · [../apps/android/FOUNDER_ACCEPT.md](../apps/android/FOUNDER_ACCEPT.md) (acceptance — founder-only).

## 0. Answers up front

| Ask | Answer | Detail |
|-----|--------|--------|
| Best stack — Android | **Kotlin + Jetpack Compose, Android Studio** — already shipping (`apps/android`: 14 Gradle modules, Room source of truth, Hilt, WorkManager sync outbox) | §2 · [ANDROID_NATIVE.md](ANDROID_NATIVE.md) |
| Best stack — iOS | **Swift + SwiftUI, Xcode, iOS 17+**, `apps/ios/` — locked; built only when the iOS gate opens; SwiftData vs GRDB decided at open | §2 · §8 · [IOS_PLAYBOOK.md](IOS_PLAYBOOK.md) |
| Cross-platform runtime | **None.** No React Native, Flutter, KMP, or WebView shells — decision record in §2 | §2 |
| How we develop | Thin native clients on one server contract; one Issue / one screen per agent PR; founder accepts on device; named gates **Accept B → week-4 retention → iOS lane open** | §7–§9 · [UX_PLAYBOOK.md](UX_PLAYBOOK.md) |
| 10 UX laws | Each law → the MW mechanism that embodies it → the native requirement → the check that verifies it | §6 |

## 1. What this doc owns

- The cross-platform **stack decision record** (§2) — why native twice, not one runtime.
- The **10 UX laws mapping** (§6) — the only home for UX-law language in the repo.
- **Sequencing across platforms** (§7–§8) and the mobile **risk register** (§10).
- Never owned here (point, don't restate): Android build detail → [ANDROID_NATIVE.md](ANDROID_NATIVE.md) · iOS stack lock + trigger gate → [IOS_PLAYBOOK.md](IOS_PLAYBOOK.md) · API contract → [openapi-mobile.yaml](openapi-mobile.yaml) · tokens → [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · UX process, standards + problem register → [UX_PLAYBOOK.md](UX_PLAYBOOK.md) · acceptance → [../apps/android/FOUNDER_ACCEPT.md](../apps/android/FOUNDER_ACCEPT.md) (founder-only) · sequencing authority → [../ORCHESTRATION.md](../ORCHESTRATION.md).

## 2. Stack decision record

**Chosen:**

| Platform | UI | State / DI | Local store | Network | Toolchain |
|----------|----|-----------|-------------|---------|-----------|
| Android (shipping) | Jetpack Compose + Mw designsystem | ViewModel + `StateFlow` (UDF) · Hilt | Room (SoT) + sync outbox | OkHttp + kotlinx-serialization against [openapi-mobile.yaml](openapi-mobile.yaml) | Android Studio · Gradle (versions: `apps/android/gradle/libs.versions.toml`) |
| iOS (at gate) | SwiftUI, iOS 17+ | `Observable` state → view (UDF) | SwiftData or GRDB (decided at open) + outbox port | Client generated from [openapi-mobile.yaml](openapi-mobile.yaml) (`swift-openapi-generator`) | Xcode · SwiftPM |

**Rejected — reopening any of these requires a founder-amended decision record here:**

| Option | Why not |
|--------|---------|
| React Native / Expo | We built it (`apps/mobile`) and deliberately demoted it to flow reference ([NATIVE_MOBILE.md](NATIVE_MOBILE.md)). A JS bridge and a third ecosystem fight the thin-client goal; one dependency owning both platforms is concentration risk. |
| Flutter | Foreign renderer, zero reuse of the shipped Compose wedge and its 14 stable Gradle modules; a second UI language for the same thin client. |
| Kotlin Multiplatform | The only layer KMP would share — domain logic — is the layer MW deliberately keeps **server-side** (planEngine is never ported; sync semantics live behind the contract). It buys ~nothing and taxes the stable Android build. |
| TWA / Capacitor WebView | Packaging, not product. TWA stays an optional **web** PWA package ([TWA_MOBILE_PLAYBOOK.md](TWA_MOBILE_PLAYBOOK.md)); an iOS WebView shell is superseded by the native SwiftUI lock. |

**Why native twice works here:** the server owns intelligence — Coach planEngine, adaptation, premium truth and sync conflict rules are server-side; clients are thin, offline-first views over one contract. The shareable artifacts are the **OpenAPI contract** and the planned **token source**, not a UI runtime. Jakob's and Doherty's laws (§6 rows 1 and 9) are the UX halves of the same argument.

## 3. Current state

| Surface | State | Owner |
|---------|-------|-------|
| Android Compose app | Shipping the wedge (I-Day → Today → Active → Victory → Coach) + Wear tile, widgets, Play Billing, Health Connect | [ANDROID_NATIVE.md](ANDROID_NATIVE.md) · `apps/android/INDEX.md` · `apps/android/ARCHITECTURE.md` |
| Mobile API | 10 `/api/mobile/*` paths live | [openapi-mobile.yaml](openapi-mobile.yaml) · [API_MOBILE.md](API_MOBILE.md) |
| Expo prototype | Flow reference only — never built or submitted | [NATIVE_MOBILE.md](NATIVE_MOBILE.md) |
| TWA | Optional web packaging, dormant | [TWA_MOBILE_PLAYBOOK.md](TWA_MOBILE_PLAYBOOK.md) |
| iOS | `apps/ios` does not exist; lane closed until gate | [IOS_PLAYBOOK.md](IOS_PLAYBOOK.md) |
| Web PWA | Stays live for SEO, demos, pillars not yet native | repo root |

## 4. Shared backbone — one of each

| One… | Is | Reference |
|------|----|-----------|
| Contract | [openapi-mobile.yaml](openapi-mobile.yaml) — canonical for every native client; batch ≤50; additive evolution only | [API_MOBILE.md](API_MOBILE.md) |
| Auth | Supabase Auth REST email OTP → Bearer JWT; sign-in optional; **the free offline logger never requires an account** | Android `SupabaseAuthClient` (iOS mirrors it with Keychain storage) |
| Sync pattern | Revision + tombstones + cursor pull; local pending wins until push ACK; bounded attempts then dead-letter; single-flight | Android `SyncEngine` + `SyncMergeRules` — the reference implementation; iOS ports the *pattern*, not the code |
| Premium truth | Server decides: `GET /api/mobile/premium/status`. Play Billing → `play-purchase`; StoreKit 2 → reserved `/api/mobile/premium/appstore-purchase` (`enrollments.provider='appstore'`, API lane at gate). **The free logger is never gated.** | `src/lib/premiumServer.ts`, via the API |
| Telemetry | Anonymous heartbeat `/api/mobile/telemetry` (opaque install id + ISO week); crashes via Sentry | `apps/android` `CrashReporting.kt` |
| Perimeter | Surface parking + `PRIVATE_MODE` run **before** any route — see risk **R1** | `proxy.ts` |

## 5. Design + token strategy

- **Target for both native apps: the Modernist system** — paper/ink ground, exactly three reds, Archivo, radius 0, light-only ([DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)).
- **Today:** Android intentionally ships the interim navy/emerald/brass identity (founder override 2026-07-25; the color half of `check-token-sync` is paused, **motion tokens stay pinned** web ↔ Android). The Android **rebrand is a founder-scheduled program after web settles — never before Accept B.**
- **iOS starts Modernist directly at gate** — it never adopts the interim palette, so it never needs a rebrand ([IOS_PLAYBOOK.md](IOS_PLAYBOOK.md) token line amended 2026-08-06 by this doc's PR).
- **Single source (code work item):** create `packages/mw-core/tokens/brand.json`, then generate all three surfaces — web CSS vars (`src/index.css`), Kotlin `MwColors`/`MwMotion`, iOS asset catalog — and point `check-token-sync` at one file instead of pinned literals.
- Parity rule stays: **emotion and tokens match; IA may differ** per surface (wedge-first native vs full-pillar web). Never port web dashboard chrome onto native Today.

## 6. The 10 UX laws — mapped, not decorative

MW treats the classic UX laws as executable checks, not decoration. Units per platform: web **44px** ([../tests/e2e/helpers/thumbSweep.ts](../tests/e2e/helpers/thumbSweep.ts)) · Android **48dp** (`apps/android/UX.md` — "One thumb") · iOS **44pt** (HIG). Platform *behaviors* follow the platform (law 1); *visual language* stays the Mw design system — never stock Material or Cupertino chrome.

| # | Law | Meaning for MW mobile | Already embodied | Native requirement (Android / iOS) | Verified today → proposed |
|---|-----|----------------------|------------------|-----------------------------------|---------------------------|
| 1 | **Jakob's law** — users import expectations from the apps they live in | Feel like a first-class platform citizen *and* like the loggers athletes already know | The native-Compose decision itself (Expo demoted); Hevy/Strong set-table conventions via the steal/avoid tables in [DESIGN_RESEARCH.md](DESIGN_RESEARCH.md) | Android: predictive back, system share sheet, notification channels. iOS: edge swipe-back, HIG nav bar, native share sheet. No hamburger menus. | Founder device accept + Maestro wedge → **UXL-V1** explicit back-gesture step in `wedge.yaml`; XCUITest swipe-back at gate |
| 2 | **Hick's law** — decision time grows with options | One decision per screen; alternatives one layer down | ≤1 red control per screen (`tests/e2e/helpers/redActions.ts`); Today ≤6 blocks (`src/lib/today/todayBlockBudget.ts`); I-Day asks exactly 3 questions | Wedge-only nav (Android 3-tab hub); one primary CTA per screen; Coach shows one next session, the rest behind a sheet | Web unit + e2e → **UXL-V2** Compose UI test: ≤1 primary-emphasis button per screen |
| 3 | **Fitts's law** — big, close targets; thumbs live at the bottom | Primary actions docked in the thumb arc; minimum target sizes everywhere, including open sheets | 44px sweep incl. sheets tested open (`thumbSweep.ts`); bottom `ScreenDock`; 52px primary actions | 48dp / 44pt minimums; rest timer + set-complete docked at the bottom; immersive Active keeps the log button under the thumb | Web enforced → **UXL-V3** Compose semantics sweep asserting ≥48dp clickable bounds in `:feature:active`; XCUITest frame asserts at gate |
| 4 | **Miller's law** — working memory ≈ 7±2 | Chunk everything: onboarding, plans, scores, summaries | 3 onboarding questions; ≤6 Today blocks; ≤6 taps to the first logged set (`tests/e2e/first-90.spec.ts`); Mission Score = 4-numeral band with the six-pillar detail one tap behind a disclosure | Active shows the current set + previous-set ghost, never the whole plan; Victory summarizes ≤3 numbers; Coach explains in one line with "why" behind a tap | Web budgets → **UXL-V4** tap-count budget step in the Maestro/adb wedge walk |
| 5 | **Law of Proximity** — things placed together are read as related; grouping comes from spacing, not boxes | In a radius-0, no-shadow system, **spacing and 2px rules ARE the grouping mechanism** | The card tier ladder (`card-section` = 2px top rule, no fill); the ink log console groups weight/reps/log as one surface; superset groups A–D visually bound in the logger; More-sheet tiers (Wedge / Pillars / You); Android `MwSpace` scale | One spacing scale per platform (`MwSpace` dp; SwiftUI spacing tokens at gate); group by whitespace + rules, never nested boxes; related controls share a surface, unrelated ones are separated by a full section gap | Design-system gate blocks off-system one-offs (web) → spacing-scale conformance added to the native design-review checklist (rebrand + iOS gate) |
| 6 | **Von Restorff effect** — the different element is the one remembered | Spend visual difference on exactly one thing per screen | The exactly-three-reds token rule; ≤1 red control (`redActions.ts`); honor accent earned-only | One accent CTA per screen (emerald today on Android; poster red after the rebrand); the Victory honor moment is the sole isolated element | Web e2e → covered by **UXL-V2** |
| 7 | **Serial position effect** — first and last positions are remembered and reached best; the middle is lost | Anchor what matters at the edges of every sequence: tabs, lists, summaries, sessions | Tab order pins **Today first, More last** (`MOBILE_TAB_HREFS` in `src/lib/primaryNav.ts`); Today's block priority puts "what to do now" first and archives overflow behind the trailing "Today details" disclosure; the adapt banner leads with its most important beat (≤3); Victory orders stats first, **next action last** (the exit) | Keep the primary tab first + utility last on every platform (Android hub: Today first, Account last); never bury a primary action mid-list; the week strip anchors today visually; session summaries open with the headline number and end with the one next action | Tab order pinned by unit test (web) + asserted in the Maestro wedge (Android); Victory strip order folds into the **UXL-V2** screen assertions |
| 8 | **Tesler's law** — complexity is conserved; our server absorbs it | The athlete never inherits our complexity — and neither do the clients | planEngine is server-only and never ported (locked in [ANDROID_NATIVE.md](ANDROID_NATIVE.md) + [IOS_PLAYBOOK.md](IOS_PLAYBOOK.md)); one sync engine owns conflict rules; the plate calculator does the math | New intelligence lands in `/api/mobile/*` plus a local seed fallback; if a native screen needs an explainer paragraph, the complexity is in the wrong place | Lane rules make the port a named forbidden pattern; the OpenAPI file is the reviewable boundary |
| 9 | **Doherty threshold** — answer in <400ms or lose flow | Every tap answers from local state; the network is strictly background | Offline-first Room source of truth; optimistic writes + outbox; baseline profiles; MwMotion ≤200ms interaction tier | Reads never wait on the network; sync never blocks logging; cold start budgeted (baseline profile; XCTest metrics at gate); iOS mirrors with its local store | Architecture guarantee + founder feel-test → **UXL-V6** Macrobenchmark startup/frame timing in the weekly `android` CI lane |
| 10 | **Peak-End rule** — sessions are remembered by their peak and their ending | Engineer Victory (the peak); never let infrastructure be the ending | Victory "Session locked" + exactly one next action (`packages/mw-core` `pickVictoryNextAction`); honor tier earned-only; emotion arc Composure → Focus → **Honor** → Clarity | Victory is the most-crafted native screen; session-lock haptics (Android `VibrationEffect` / iOS `UINotificationFeedbackGenerator`); a failed sync is never the ending — the outbox absorbs it and Victory renders from the local store | Maestro asserts the Victory copy → haptics check added to the founder accept walk |

**Further principles we also hold** (good UX principles beyond the 10):

| Principle | MW application |
|-----------|----------------|
| **Postel's law** — liberal in what you accept, conservative in what you send | Clients never crash on server evolution (Kotlin `Json { ignoreUnknownKeys = true }`; `SyncMergeRules` tolerates replays/out-of-order; iOS uses a lenient generated client) and send only contract-shaped payloads (batch ≤50, Zod-validated server-side, honor `Retry-After` — **UXL-V5**). |
| **Aesthetic-Usability effect** — polish buys forgiveness and perceived speed | The 8 surface quality bars + design-system gate keep hero surfaces engineered (one typeface, tabular numerals, nothing floats); native heroes re-pass the 8 bars; baseline profiles keep polish honest at startup. |
| **Zeigarnik effect** — open loops pull people back | An in-progress session is never lost: pulse dot on the Train tab, session restore after process death (Android foreground service + Room draft), resume copy on Today's hero. Open loops are honest — no fake "you almost…" theater. |
| **Goal-gradient effect** — motivation rises near completion | Week strip progress, streak-to-readiness requirement, `MeterBar` budgets — always real progress from real logs; never inflated starting progress. |
| **Nielsen's heuristics** ride along in reviews | Error prevention → hold-to-confirm for destructive actions ([DESTRUCTIVE_UX.md](DESTRUCTIVE_UX.md)); recognition over recall → previous-set ghost in the logger; user control → sign-in and every I-Day step skippable; visibility of system status → offline pill + outbox status. The [DESIGN_REVIEW.md](DESIGN_REVIEW.md) checklist is the enforcement vehicle. |

**Verification ladder (honest split).**
*Enforced today* — web: thumbSweep 44px · redActions ≤1 · first-90 ≤6 taps · Today block budget · design-system/token/display gates. Android: JVM unit suite (incl. sync merge) · Maestro wedge + adb walk · motion token pinning · founder accept walk.
*Proposed (code work items, listed not done):* **UXL-V1** back-gesture step in the wedge walk · **UXL-V2** ≤1-primary Compose test · **UXL-V3** 48dp semantics sweep · **UXL-V4** tap budget in the wedge walk · **UXL-V5** contract-drift + Retry-After tests · **UXL-V6** startup/frame Macrobenchmark in weekly CI — all Android/API lane now; iOS equivalents (XCUITest swipe-back, 44pt frames, XCTest metrics) **at gate only**.

## 7. Android — path through Accept B

No new phase numbers — Android's horizons live in [ANDROID_NATIVE.md](ANDROID_NATIVE.md); its backlog in `apps/android/BACKLOG.md`.

1. **Now:** wedge polish + phone excellence toward **Accept B** — the founder-only decision table in [../apps/android/FOUNDER_ACCEPT.md](../apps/android/FOUNDER_ACCEPT.md). Agents prep evidence; agents never mark Pass.
2. **After Accept B:** Play internal → production per `apps/android/PLAY_LISTING.md`; invites; the week-4 retention wall ([POST_LAUNCH_CADENCE.md](POST_LAUNCH_CADENCE.md)).
3. **Later (founder-gated):** the Android **Modernist rebrand program** (§5) and the `apps/android/BACKLOG.md` gated bucket — closed until their gates open.

## 8. iOS — before and at the gate

**Before the gate (allowed now — `apps/ios` stays nonexistent):**

- Keep [openapi-mobile.yaml](openapi-mobile.yaml) the single contract as Android evolves — every contract improvement is free iOS work.
- Land perimeter fix **R1** and `Retry-After` hardening **R3** — server/client work that benefits iOS before it exists.
- `brand.json` groundwork (§5) so the iOS asset catalog is generated, not hand-ported.
- Keep [IOS_PLAYBOOK.md](IOS_PLAYBOOK.md) current.

**At gate open** — all three IOS_PLAYBOOK triggers hold (**Accept B** ∧ **week-4 retention** ∧ **founder opens the lane**, Apple Developer account founder-owned):

- SwiftUI wedge only: I-Day → Today → Active → Victory → Coach. Nothing else in v1.
- An `ios` CI job (xcodebuild + unit tests) modeled on the `android` job, **before the first merge**.
- One Issue / one screen per PR; founder accepts on simulator/device; TestFlight → App Store with privacy labels from [LEGAL_SAFETY.md](LEGAL_SAFETY.md).

**Forbidden pattern (unchanged):** "iOS before Android Accept B" ([../ORCHESTRATION.md](../ORCHESTRATION.md)).

## 9. Engineering practices

| Practice | Rule |
|----------|------|
| Cadence | One Issue / one screen per agent PR → founder accepts on device → next screen. No "build the whole app" prompts. |
| Lanes | Engineering-Android `apps/android/**` · Engineering-iOS closed until gate (`apps/ios/**`) · API lane owns `/api/mobile/**` + the OpenAPI file. Cross-lane changes go through the owning lane. |
| CI honesty | PR CI runs **web only**; the `android` job is weekly/dispatch in `ci-extended.yml` (metered minutes, private repo) — an `apps/android/**` PR gets no automated Android verification unless dispatched. **Work item:** decide pre-GA whether `assembleDebug` + unit joins PR CI (paths-filtered) or stays weekly + the local gradle gate. `ios` job added at gate. |
| Testing pyramid | Web: unit + route contract + Playwright budgets (§6). Android: JVM unit (incl. `SyncMergeRules`) + Maestro wedge/adb walk + the §6 UXL items. iOS at gate: XCTest + an XCUITest mirror of the wedge walk. |
| Versioning / release | Web: `APP_BUILD_LABEL` ship protocol (docs-only branches exempt). Android: `versionName`/`versionCode` + Play tracks. iOS at gate: TestFlight → phased release. Store metadata: `apps/android/PLAY_LISTING.md` / [LEGAL_SAFETY.md](LEGAL_SAFETY.md). |

## 10. Risks + open work items

| # | Risk / item | Owner | Note |
|---|-------------|-------|------|
| R1 | ~~Perimeter: Bearer rejected at proxy~~ | — | **Mitigated `.539`:** verified Bearer or cookie JWT via `getUser()`. Bake-cookie = dev only — never Play release. |
| R2 | Per-IP rate limits vs carrier CGNAT (many users, one egress IP) | API lane | Review before invites |
| R3 | Clients don't honor `Retry-After` on 429 | Android lane | → UXL-V5 |
| R4 | Expo `app.json` claims `com.missionwinning.app` — the Compose release applicationId | Hygiene | Never build/submit Expo; rename or drop the prototype's ID |
| R5 | Gradle catalog `targetSdk = 35` is dead (app hardcodes 36) | Android lane | Clean up with the next Android PR |
| R6 | `packages/mw-core/tokens/brand.json` doesn't exist — blocks token generators + the iOS asset catalog | Design + web lane | §5 work item |
| R7 | Android CI not on PRs | Founder (minutes) + Android lane | §9 |
| R8 | IOS_PLAYBOOK palette line predated the Modernist rebrand | — | Fixed 2026-08-06 (this doc's PR) |

## 11. Explicitly not doing

- No React Native / Flutter / KMP / Capacitor — reopening requires a founder-amended §2 decision record.
- No `apps/ios` scaffolding, branches, or "prep code" before the gate; agents never fill `FOUNDER_ACCEPT.md`.
- No planEngine port to Kotlin or Swift. No Expo store submission. No TWA as the product.
- No new numbered phase namespace — named gates only (**Accept B** · **week-4** · **iOS lane open**).
- No Android visual rebrand before the founder opens that program; no new capability surfaces (watch/widget expansion) pre-Accept-B — shipped surfaces are maintained, not extended.

## 12. Doc governance

| Fact | Home |
|------|------|
| Android stack + horizons | [ANDROID_NATIVE.md](ANDROID_NATIVE.md) |
| iOS stack lock + trigger gate | [IOS_PLAYBOOK.md](IOS_PLAYBOOK.md) |
| Client contract | [openapi-mobile.yaml](openapi-mobile.yaml) |
| Tokens + design language | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) |
| UX process, standards, problem register | [UX_PLAYBOOK.md](UX_PLAYBOOK.md) |
| Acceptance | [../apps/android/FOUNDER_ACCEPT.md](../apps/android/FOUNDER_ACCEPT.md) (founder-only) |
| Sequencing authority | [../ORCHESTRATION.md](../ORCHESTRATION.md) |
| Cross-platform decision record · UX-laws mapping · mobile risk register | **this doc** |

Changelog: `2026-08-06 — created (founder ask: stack, process, 10 UX laws + UX program).`
