## 2026-08-12 — Preserve next= through private gate after I-Day (`.685`)

Gated `/log` and `/coach` set `?next=` in `proxy.ts`, but `app/private/layout.tsx`
redirected unlocked visitors to `/` and dropped it. Unlock redirect moved to
`app/private/page.tsx` with `privateGateReturnPath`; client unlock uses
`navigateAfterPrivateGateUnlock(privateGateReturnPath(...))`. Regression:
`privateGateReturn.test.ts`, `/coach` routetest.

Excellence-Override: preserve next= through private gate for post-I-Day wedge (W1)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-659-for-685.md](docs/archive/log/LOG-rotate-659-for-685.md).
