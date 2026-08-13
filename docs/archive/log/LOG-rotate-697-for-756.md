## 2026-08-12 — Session-expired fail-open for mid-set Log/rest (`.697`)

Kaizen Strong acceptance on F-001: auth session expiry / sync must not block
mid-set Log or rest. `#474` / `.696` shipped local-first copy; this closes the
fail-open hole on Active SignInPrompt + locks the path in guards.

**Ship:** `SignInPrompt` `.catch` → `signedIn=false` on rejected `getUser`
(expired JWT / offline). Today dashboard email + below-fold cloud load fail
open so local pillar wins still paint. `localFirstRestGuard` asserts
`handleLogSet` / `logSet` / `logSetAndAdvance` / `startRestTimer` never await
auth/sync; Log set button has no disabled/online gate. Free logger ungated.
One concern (no identity merge, no Coach force, no density rewrite).

Label `.697` (onto master `.696` / #474). Excellence-Override below.

Excellence-Override: MatrAIx F-001 session-expired fail-open mid-set Log/rest (RESULT unscored)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-668-for-697.md](docs/archive/log/LOG-rotate-668-for-697.md). · [`.696` for `.755`](docs/archive/log/LOG-rotate-696-for-755.md).
