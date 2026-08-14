# Rotated from LOG.md when `.784` landed

## 2026-08-14 — Done beta code works on Vercel Preview (`.770`)


Vercel env is per-environment. `PRIVATE_ACCESS_CODES` (the Done alias) lived
on Production; `scripts/sync-vercel-env.mjs` copied `PRIVATE_ACCESS_SECRET` to
Preview and left the alias behind. www accepted Done. Every `*.vercel.app`
401'd. A second spelling: dashboard paste of `"Done"` compared exact, so even
a Preview copy of the alias missed. A third: Set-Cookie with a Domain on the
`vercel.app` public suffix is rejected, so a 200 that did not stick bounced
silently back to `/private`.

A Vercel login page on Preview is Deployment Protection in the dashboard —
not the app gate. Done cannot unlock that.

**Ship:** `normalizePrivateAccessCode` (trim, BOM, wrapping quotes). Host-only
`attachPrivateAccessCookie` (no Domain; Secure on Vercel). Password unlock
probes `confirmPrivateGateCookie` before navigating. `PRIVATE_ACCESS_CODES`
sits next to SECRET in SYNC_KEYS and the GitHub workflow. Docs: Production
AND Preview. No hardcoded alias. `PRIVATE_MODE` unchanged. Preview stays
ungated at the proxy when `VERCEL_ENV=preview` (`.728`) — `/private` still
needs the same codes if you test the form there.

Mutants killed: quoted `"Done"` without quote-strip; `SYNC_KEYS` without
`PRIVATE_ACCESS_CODES`; workflow without the GitHub secret mapping.

Label `.770` (onto master `.769`).

Excellence-Override: preview Done beta code

Rotated LOG oldest → [docs/archive/log/LOG-rotate-755-for-770.md](docs/archive/log/LOG-rotate-755-for-770.md).
