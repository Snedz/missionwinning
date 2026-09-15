# packages/mw-core

> Shared pure TypeScript for web + Expo native. No `window`, `localStorage`, Next, or React Native imports.

## Exports

| Path | Contents |
|------|----------|
| `@missionwinning/mw-core` | Re-exports coach + workout + identity + economy + module |
| `@missionwinning/mw-core/coach` | Types, adapt summary, mergePlans, demo seed plan |
| `@missionwinning/mw-core/workout` | Victory next-action (Coach wedge) |
| `@missionwinning/mw-core/identity` | Athlete Card cosmetics / tier pure rules |
| `@missionwinning/mw-core/economy` | Points/inventory interop types (contracts) |
| `@missionwinning/mw-core/module` | Mini-app manifest types + `health.train` seed + `social.server` messenger + capability bus (`assertCapability`, `readIdentity`, `readBilling` / `checkoutBilling` / `portalBilling`, `readPhotos` / `writePhotos` (optional isolated `PhotosSnapshot`), `readStorage` / `writeStorage` / `removeStorage`, `listMountedInventory` / `peekMountedInventory` / `peekMountedScope`, deny codes frozen `.1098`: `scope_denied` / `unknown_method` / `unknown_capability` / `not_mounted` / `already_mounted` / `unknown_mini` / `bad_deeplink` / `storage_cap` plus scoped stubs `stub` / `photos_stub`) + reserved `UTILITY_CLEARSHOT_MANIFEST` (`mission://minis/clearshot`) + `HOST_SHELL` |

## Rule

New Coach / logger / **shared platform** logic lands here first; web (`src/lib/coach/`, `src/lib/identity/`) and `apps/mobile` both consume it (web may re-export until fully migrated).

Platform contracts (prose): [docs/contracts/](../../docs/contracts/INDEX.md).

## Do not put here

- Supabase clients, AsyncStorage, Stripe, UI components
- Files that import `@/data/exercises` or browser APIs
