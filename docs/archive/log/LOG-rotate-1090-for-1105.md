Superseded live LOG section rotated 2026-09-16 for `.1105` unlocked comment deslop.

## 2026-09-15 — Deeplink unknown last-segment unknown_mini (`.1090`)

Resolving `mission://minis/<segment>`
when `<segment>` is not in the
closed last-segment deeplink
table returns the same CapResult
deny shape as mount unknown_mini
(`.1087`): `{ ok: false, code:
'unknown_mini' }` — not a throw,
not a silent mount. Accept:
`mission://minis/totally-unknown`.
Known `health` / `clearshot`
still mount. Host-allowlisted
test-fixture slugs (`billing`,
`granted`, …) stay out of the
deeplink table. Mount / call /
unmount codes from `.1078`–`.1089`
stay unchanged. No UI. No Stripe.
No camera. Isolation: coach /
store / HomePage / ActiveWorkout
stay blind.

**Mutants killed:** unknown
last-segment returning `ok` or
throwing; listing a mount after
`totally-unknown`; a valid slug
not in the table mounting; a
test-fixture slug resolving via
deeplink; `health` / `clearshot`
failing to mount; mount /
`already_mounted` / unmount
`not_mounted` / call
`not_mounted` regressing.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1090`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1075-for-1090.md](docs/archive/log/LOG-rotate-1075-for-1090.md) (`.1075`).
