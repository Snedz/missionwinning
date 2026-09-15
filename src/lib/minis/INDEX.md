# src/lib/minis/

> One concern: web adapters for the Mission OS capability bus. Pure rules live in `packages/mw-core/src/module/`.

## Agent resume card

- **Purpose:** Resolve a registered mini manifest and call host-owned doors (identity, billing, photos, storage). Deny undeclared scopes. Unknown id → `unknown_mini`.
- **Non-goals:** ClearShot product UI, Today/More door, `app/(app)/minis/`, camera, checkout, cloud photos, raw `localStorage`.
- **Entry files:** `registry.ts`, `bus.ts`
- **Tests to run:** `src/lib/minis/bus.test.ts`, `src/lib/minisIsolation.test.ts`, `packages/mw-core/src/module/*.test.ts`
- **Forbidden:** Import from `src/lib/coach/`, `src/store/`, `HomePage`, `ActiveWorkoutPage`. Do not import `loadOperatorName` (social) or `premiumServer` (server-only). Never gate `logSet`.
- **Horizon:** Types + stubs. Host chrome later.

## Doors

| Door | Stub |
|------|------|
| identity | Injected `{ missionId, callSign }`. Guests are `null`. Never mint. Unscoped → `scope_denied` (same CapResult deny as billing). |
| billing | Injected `{ bundle, muted: true }`. Never checkout. |
| photos | `photos_stub` when scoped. Unscoped → `scope_denied` (same CapResult deny as billing). |
| storage | In-memory map keyed by mini id. Cap 32 keys / 4KB. Unscoped → `scope_denied` (does not write). Scoped Health stub success; ClearShot write-only. |

## Related

| Path | Role |
|------|------|
| `packages/mw-core/src/module/` | Manifest + `assertCapability` |
| `src/lib/mission-os/` | Named doors + in-memory fakes (`MiniHost.mount` / `unmount` / `listMounted`, `.1072` / `.1078` / `.1081`) + Health stub (`l1.health` at `mission://minis/health`, `.1074`) + ClearShot stub (`utility.clearshot` at `mission://minis/clearshot`, `.1075`) + mount isolation tests (`.1076`) + last-segment deeplink (`mission://minis/clearshot` → `utility.clearshot`, `.1077`) + unmount leftover isolation (`.1078`) + billing CapResult deny consistency (`.1079`) + photos CapResult deny consistency (`.1080`) + listMounted CapResult inventory (`.1081`) + identity CapResult deny consistency (`.1082`) + storage CapResult deny consistency (`.1083`) |
| `docs/contracts/MODULE.md` | Contract |
| `src/lib/minisIsolation.test.ts` | Coach / logger / Today stay blind |
