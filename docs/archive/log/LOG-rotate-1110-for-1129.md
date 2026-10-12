Rotated out of LOG.md on 2026-10-12 so the live log stays at 15 entries after `.1129` (plate Use beside the load).

## 2026-09-17 — Honest manifest description under PRIVATE_MODE (`.1110`)

Web-manifest `description`
claimed "works offline
anywhere" as a hard-coded
string. `PRIVATE_MODE` still
disables Serwist, so the
installable manifest advertised
a capability this build does
not ship. `manifestDescription()`
now keys on
`isOfflineInstallable()` — the
same flag as Serwist /
`NEXT_PUBLIC_PWA_ENABLED`.
Gated: "Free workout logger +
adaptive Mission Coach from
your logs — free core forever."
Installable: the offline
anywhere claim returns.
`start_url` / `id` untouched.
Companion lock:
`manifestOfflineHonesty.test.ts`.
Does not flip
`PRIVATE_MODE`. Does not
tip-promote.

**Mutants killed:** hard-coded
`description: '…works offline
anywhere…'`; dropping
`isOfflineInstallable()`;
dropping the named
`manifestDescription` helper.

`[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1110`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1095-for-1110.md](docs/archive/log/LOG-rotate-1095-for-1110.md) (`.1095`).
