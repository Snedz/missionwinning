## 2026-08-12 — Restore /private access-code form for code-only invitees (`.684`)

W1 activation: `/private` session-unlock could hang forever on "Checking sign-in…"
(unbounded `getSession` / mint fetch) or soft-navigate invitees to marketing home via
`router.replace` before the httpOnly gate cookie was probe-confirmed. Bounded fail-open
session recovery, `confirmPrivateGateCookie()` probe, and hard `window.location.assign`
after unlock. Regression guards in `privateGateSessionUnlock.test.ts`.

Excellence-Override: restore /private access-code form for code-only invitees (W1 activation)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-658-for-684.md](docs/archive/log/LOG-rotate-658-for-684.md).
