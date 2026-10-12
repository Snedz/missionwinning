# CONTEXT.md `## Now` — `.1102` rotated for `.1125`

Rotated out of `CONTEXT.md` `## Now` on 2026-10-12 so the block stays within 25 bullets after `.1125` (Next 16.4 prerender) landed. Full record remains in the LOG archive.

- **`.1102`:** (`2026.07-unified.1102`) **Identity remount after inject** — `injectIdentitySnapshot` on a live Health fake is per-instance. Unmount+remount binds the host snapshot again. Leftover inject dies. B.read stays. After `storage_cap` + inject + remount, identity is still host-bound. Distinct from live isolation (`.1093`) and storage remount-after-cap (`.1099`). No ninth deny code. No UI / Stripe / camera. Paper only. `[skip vercel]`. No tip-promote. Live www stays `.697`. PRIVATE_MODE stays.
