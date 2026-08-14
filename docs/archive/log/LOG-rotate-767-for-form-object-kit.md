# Rotated from LOG.md when form object kit landed

## 2026-08-14 — Dependabot security/quality batch, Cursor-local (`.767`)

GitHub’s Security and quality tab listed ~46 Dependabot findings “not ready” —
alerts, not mergeable PRs. Opening 46 bot PRs would burn Actions minutes and
Hobby Previews. Same vehicle as `.766`: one Cursor branch.

**Ship:** `overrides` pin `axios@1.19.0` (Phantom still nested 1.15.1) and
`nanoid@3.3.18`. Eight high axios GHSAs gone. Security ratchet 9 → 1
(`bigint-buffer` via `@solana/spl-token` remains — no non-breaking fix).
Expo `image-size` / uuid stay; those need an Expo 53 major, and the Expo app
is flow reference only. No Dependabot PRs opened. `PRIVATE_MODE` unchanged.

Label `.767` (onto master `.766`).

Excellence-Override: dependabot security/quality batch (alerts, not 46 PRs)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-752-for-767.md](docs/archive/log/LOG-rotate-752-for-767.md).
