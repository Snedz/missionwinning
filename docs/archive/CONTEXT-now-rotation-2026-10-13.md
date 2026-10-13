# CONTEXT-now rotation — 2026-10-13 (`.1130`)

Four shipped entries left `## Now` so the orphaned 2026-10-09 wave could land.

The wave was authored against `.1123`, never merged, and `master` moved five waves
past it (`.1125`–`.1129`) without it. Landing it needed four bullets, and `## Now`
was already at its 25-bullet cap. `.1107` and `.1109` are the tail of the retired
extension-semantics cluster; `.1110` and `.1111` are the next oldest shipped work.

Nothing was deleted — the full record is [LOG.md](../../LOG.md) and its archives.

- **`.1107`:** (`2026.07-unified.1107`) **Photos remount after inject** — `injectPhotosSnapshot` on a live photos-scoped fake is per-instance. Unmount+remount binds the host stub snapshot again. Leftover inject dies. Sibling.read stays. After `storage_cap` + inject + remount, photos is still host-bound. ClearShot remount after inject rebinds its host snapshot (or stays `photos_stub` with no host row). Health / `test.billing` remount stay `scope_denied`. Distinct from live isolation (`.1095`) and billing remount (`.1103`). No ninth deny code. No UI / Stripe / camera. Paper only. `[skip vercel]`. No tip-promote. Live www stays `.697`. PRIVATE_MODE stays.

- **`.1109`:** (`2026.07-unified.1109`) **Leftover Health extras cannot grant billing** — Bind copies + freezes scopes. Leftover extras on a Health-shaped manifest cannot grant `billing.read` / checkout / portal. Live push, first-mount extras, and remount of the mutated document stay `scope_denied`. Granted sibling stays. After `storage_cap` + extras + remount, billing is still denied. Distinct from live isolation (`.1094`), billing remount (`.1103`), and leftover storage writes (`.1108`). No ninth deny code. No UI / Stripe / camera. Paper only. `[skip vercel]`. No tip-promote. Live www stays `.697`. PRIVATE_MODE stays.

- **`.1110`:** (`2026.07-unified.1110`) **Honest manifest description** — `app/manifest.ts` `description` is gated on `isOfflineInstallable()` so we do not claim works offline anywhere while `PRIVATE_MODE` disables Serwist. Named `manifestDescription()`. `start_url` / `id` untouched. One concern. `[skip vercel]`. No tip-promote. Live www stays `.697`. PRIVATE_MODE stays.

- **`.1111`:** (`2026.07-unified.1111`) **Library absorbs a free-exercise-db subset** — 120 strength movements (`fedb-` ids) from yuhonas/free-exercise-db (Unlicense) splice into the catalog `ensureFullExerciseCatalog()` already loads. House names win. No images. No AGPL. Public exercise-page floor stays 228. `[skip vercel]`. No tip-promote. Live www stays `.697`. PRIVATE_MODE stays.
