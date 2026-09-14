# src/lib/featureFlags/

> One concern: Closed catalog of staged-rollout flags. The logger never reads this.

Runtime overrides (percent, allowlist, kill) live in Postgres and are edited from the founder console at `/account/flags`. Keys are minted in code, never from the UI.

Deploy-time parking (`PRIVATE_MODE`, `NEXT_PUBLIC_SURFACES`) is a different switch — the proxy runs before any DB. Do not fold those into this catalog.

## Read order

1. `catalog.ts` — typed keys. Adding a key is a PR.
2. `bucket.ts` — stable `0..99` from `sha256(flagKey + ":" + subjectId)`
3. `evaluate.ts` — kill → allowlist → percent. Unknown key / no subject → off
4. `featureFlagsServer.ts` — service-role read/write (admin + evaluate GET)

## Invariants

- Kill beats allowlist.
- Raising percent is monotonic (10% ⊂ 20%). Lowering can drop people.
- Subject is signed-in `userId`, else `mw_device_id`. Guests do not match email allowlists.
- `src/lib/workout/`, `src/store/`, and `ActiveWorkoutPage` must not import this folder.
- Catalog forbids keys named `logger`, `private_mode`, `log_set`.
