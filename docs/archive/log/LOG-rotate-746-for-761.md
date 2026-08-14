## 2026-08-13 — F-017 first set without an account (`.746`)

A cold invited phone could already log a set (Skip existed; `handleLogSet` never
awaits auth), but the first-set path was still a signup wall: I-Day step 3 was
Sign in, the app header chipped Sign in, Train mounted `SignInPrompt` under the
logger, and Today Lean always painted a Sign-in link.

**Ship:** I-Day is welcome → profile only; Continue calls `finish()` (Today `/log`,
F-004). Train does not mount `SignInPrompt`. Header Sign in uses
`showHeaderSignInChip` — off until the first workout, never on `/active`, and
`getUser` stays off the cold path. Today header Sign-in link only after
`workoutHistory.length > 0`. first-90 tap budget 5 (no Skip-sign-in). Free
logger ungated. No account required for a set.

Label `.746` (onto master `.745`). Originally reserved `.730`; landed as `.746` past master `.745`.
Excellence-Override below.

Excellence-Override: F-017 first set without account

Rotated LOG oldest → [docs/archive/log/LOG-rotate-684-for-746.md](docs/archive/log/LOG-rotate-684-for-746.md). · [`.745` for `.760`](docs/archive/log/LOG-rotate-745-for-760.md).
