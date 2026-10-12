# CONTEXT.md `## Now` — `.1103` rotated for `.1126`

Rotated out of `CONTEXT.md` `## Now` on 2026-10-12 so the block stays within 25 bullets after `.1126` (Next 16.4 initial JS) landed. Full record remains in the LOG archive.

- **`.1103`:** (`2026.07-unified.1103`) **Billing remount after inject** — `injectBillingSnapshot` on a live `test.billing` fake is per-instance. Unmount+remount binds the host muted snapshot again. Leftover inject dies. B.read stays. After `storage_cap` + inject + remount, billing is still host-bound. ClearShot remount after inject rebinds its host billing snapshot. Health remount stays `scope_denied`. Distinct from live isolation (`.1094`) and identity remount (`.1102`). No ninth deny code. No UI / Stripe / camera. Paper only. `[skip vercel]`. No tip-promote. Live www stays `.697`. PRIVATE_MODE stays.
