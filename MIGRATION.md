# Using v2 alongside Mission Winning

This build does not replace the production app, change its data, or redirect installed clients. Use a separate origin for evaluation. In the existing app, download a Mission Winning backup, then open **You → Import backup** in v2. Check History, an in-progress workout, and units before relying on the new copy. Export from v2 to take the data back. Keep the original file until you've verified both copies.

The portable envelope is unchanged: `{ app: "mission-winning", version: 1, exportedAt, workoutStore, localKeys }`. The restore routine merges workout IDs and revisions and retains populated device keys on conflict. Older feature data under `mw_*` can round-trip even when no v2 screen reads it. An existing destination session takes precedence over an imported one. Use a fresh destination to restore the source session.

## Accounts and notebook sync

With no Supabase settings, v2 is a local notebook. For a pilot, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` before building, and allow the pilot origin's `/profile` in Supabase Auth. In **You**, an existing user can request a PKCE email link and open it in the same browser. This does not provision new users or carry over a session or device storage from another origin. The first eligible account merges a copy of guest workout history without removing the guest copy; sign-out returns to the guest notebook.

No v2 migration changes the existing schema or RLS. Completed workouts use `workout_logs`; `mapCloudToLocal` reads nested web and flat Android sets, and `mergeWorkoutHistories` reconciles client IDs, revisions, and tombstones. Explicit set units take precedence over the workout unit. History, Train's previous-set hint, and Coach use converted copies without rewriting the original numbers. An untagged legacy backup inherits its stored preference when available; otherwise its original unit cannot be recovered.

Coach plans use `profiles.coach_plan`. The higher revision wins, with the cloud plan winning a tie. Writes leave profile preferences and the taster flag untouched. Saved templates use `routines`: Train can start saved Android routines and imported web templates; new imports preserve per-set details for v2 while providing the existing summary fields to Android. A native edit or tombstone owns its existing row. V2 does not provide a cloud routine editor. Account writes use a durable outbox scoped to the signed-in user. Active sessions and general device preferences remain local. **You** accepts the backup envelope, not raw database rows.

## Compose Android HTTP contracts

The following paths are implemented in v2. Keep installed clients on their existing backend until an installed build has passed staging verification.

| Path | V2 behavior |
|---|---|
| `/api/mobile/coach/plan`, `/api/mobile/coach/adapt` | Legacy seed/adapt DTOs; unauthenticated bootstrap when the mobile perimeter is public |
| `/api/coach/trainer` | Existing Compose request and `{ text, source, model? }` response; no account or purchase required on the public perimeter. Groq → compatible coach LLM → OpenRouter free model → deterministic set guidance, with safety fallback. |
| `/api/mobile/workouts` | Legacy optional-auth logging; public unauthenticated requests receive `synced: false` |
| `/api/mobile/sync/workouts` | Supabase Bearer auth, push/pull, native flat sets; preserve client IDs, revisions, tombstones, and idempotency |
| `/api/mobile/sync/routines`, `/api/mobile/sync/customs`, `/api/mobile/sync/prefs` | Supabase Bearer auth and existing DTOs/tables; these endpoints do not add web UI for those settings |
| `/api/mobile/premium/status`, `/api/mobile/premium/play-purchase` | Legacy premium source response and payments-off purchase response (`410` after auth and validation); no purchase processing |
| `/api/mobile/telemetry` | Legacy heartbeat response; stores a valid heartbeat only when the server's Supabase service role is configured and storage succeeds |

In private mode, the API perimeter checks the gate cookie before route-level auth; a Bearer token alone does not bypass it. V2 applies this perimeter to the mobile and Trainer APIs, not the web notebook. Confirm the intended flag, cookie distribution, rate-limit configuration, and optional Trainer provider settings on staging.

## Verification and next gates

- **Fixture/contract-tested:** unchanged v1 backup envelope and recovery, synthetic nested web and flat Android rows, and HTTP behaviors derived from the old routes and Kotlin DTOs. The [shared Coach fixtures](packages/core/src/fixtures/COACH_PARITY.md) compare complete cold-start and mixed-unit plans against the core planner used by web. They document Compose DTO consumption; the current mobile seed endpoint is not a history-aware planner. These tests do not run the Kotlin client.
- **Verified locally:** local Supabase with the original base, Coach plan, workout-sync, routines, customs/prefs, and telemetry migrations plus Mailpit. Browser tests covered sign-in, guest merge, account isolation, mixed-unit history display, offline workout and plan recovery, routine import and native tombstones, and sign-out. HTTP tests covered Bearer sync, RLS, heartbeat storage, free-beta status, payments-off, and Trainer validation, throttling, and no-provider fallback. Live Trainer providers were not exercised.
- **Mobile web:** 390px Chromium and axe checked the six notebook screens, empty and error states, and the account panel. The suite verified warm offline logging and exercised the app's install button with a simulated browser event, not a real OS install.

Before any cutover, verify the real coaching/API origin and redirect allowlist, stage with non-customer data, and run an installed Compose build against the intended host and access settings. Compare history across actual clients, including mixed units, simultaneous edits, retries, and deletes. Validate production entitlements, provider reconciliation, service-worker updates, monitoring, and rollback. Production accounts, Android devices, hosted routing, and billing have not been verified.

## Deliberately left out

Production migration, Android binaries, analytics dashboards, payment processing, wearables, Fuel, Move, Mind, Track, Learn, leaderboards, social, and marketing pages. Nothing in the existing product, including its provider records, was removed by v2.
