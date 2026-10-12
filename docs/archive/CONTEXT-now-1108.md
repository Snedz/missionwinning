# CONTEXT.md `## Now` — `.1108` rotated for `.1129`

Rotated out of `CONTEXT.md` `## Now` on 2026-10-12 so the block stays within 25 bullets after `.1129` (plate Use beside the load). Full record remains in LOG.md.

- **`.1108`:** (`2026.07-unified.1108`) **Storage remount leftover old-fake writes** — `storage.set` / `remove` on a live fake is per-instance. Unmount+remount binds a new store. Leftover set/remove on the old fake does not write remounted. Sibling stays. After `storage_cap` + remount, old-fake set does not re-cap remounted. ClearShot remount: old-fake set does not occupy remounted. `test.nostorage` / `test.billing` remount stay `scope_denied`. Distinct from live isolation (`.1092`), remount-after-cap (`.1099`), and snapshot remount (`.1102` / `.1103` / `.1107`). No ninth deny code. No UI / Stripe / camera. Paper only. `[skip vercel]`. No tip-promote. Live www stays `.697`. PRIVATE_MODE stays.
