## 2026-08-12 — Welcome Skip must not soft-bypass private gate (`.691`)

**Beta Field repro (live www `.618`, pre-fix):** `/welcome` → Begin → Continue → Skip — start training → lands `/active`; `/log` and `/coach` then render client-side; `curl -I /active` still 307→`/private`; localStorage holds `mw_journey_state`, **no Set-Cookie**. Root pattern: soft `router.push` after `completeIDay` bypasses `proxy.ts`.

**Fix:** `navigateAfterPrivateGateUnlock()` — when `NEXT_PUBLIC_PRIVATE_GATE=true`, gated destinations use `window.location.assign` so `/private?next=…` is required without a cookie; gate off keeps `router.push`. Source guard in `privateGateNavigate.test.ts` (includes `/coach` wedge route).

Excellence-Override: Welcome Skip must not soft-bypass private gate (W1 activation)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-662-for-691.md](docs/archive/log/LOG-rotate-662-for-691.md). · [`.690` for `.749`](docs/archive/log/LOG-rotate-690-for-749.md).
