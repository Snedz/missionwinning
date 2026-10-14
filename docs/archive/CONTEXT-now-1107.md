# CONTEXT Now — rotated `.1107`

Rotated by `.1134` to keep the Now bullet budget.

- **`.1107`:** (`2026.07-unified.1107`) **Photos remount after inject** — `injectPhotosSnapshot` on a live photos-scoped fake is per-instance. Unmount+remount binds the host stub snapshot again. Leftover inject dies. Sibling.read stays. After `storage_cap` + inject + remount, photos is still host-bound. ClearShot remount after inject rebinds its host snapshot (or stays `photos_stub` with no host row). Health / `test.billing` remount stay `scope_denied`. Distinct from live isolation (`.1095`) and billing remount (`.1103`). No ninth deny code. No UI / Stripe / camera. Paper only. `[skip vercel]`. No tip-promote. Live www stays `.697`. PRIVATE_MODE stays.
