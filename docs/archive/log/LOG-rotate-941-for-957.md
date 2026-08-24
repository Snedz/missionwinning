# Rotated from LOG.md for `.957`

## 2026-08-24 — Account-lite auth harden (`.941`)

Guest logs were wiped whenever Supabase emitted
`SIGNED_OUT` — boot with no session, expired JWT,
demo mode — not only Profile → Sign out.

**Ship:** wipe only after an explicit leave mark.
Returning guest keeps the same local log. F-017
first set stays ungated. Optional auth stays off
Train. Mission ID mint stays server-only.

Label `.941` (past master `.940` after #779; do
not steal `.935` #778). No `PRIVATE_MODE` flip.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-921-for-941.md](docs/archive/log/LOG-rotate-921-for-941.md).
