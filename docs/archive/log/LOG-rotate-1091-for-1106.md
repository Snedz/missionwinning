Superseded live LOG section rotated 2026-09-16 for `.1106` split activeWorkoutHelpers behind a barrel.

## 2026-09-15 — Deeplink malformed / non-minis bad_deeplink (`.1091`)

Resolving a URI that is not a
well-formed `mission://minis/<segment>`
returns CapResult `{ ok: false,
code: 'bad_deeplink' }` — not a
throw, not a silent mount, not
`unknown_mini`. Accept: empty
string, `https://evil`,
`mission://other/x`,
`mission://minis` (no segment).
Well-formed
`mission://minis/totally-unknown`
stays `unknown_mini` (`.1090`).
Known `health` / `clearshot`
still mount. Mount / call /
unmount codes from `.1078`–`.1090`
stay unchanged. No UI. No Stripe.
No camera. Isolation: coach /
store / HomePage / ActiveWorkout
stay blind.

**Mutants killed:** empty /
wrong-scheme / wrong-path /
no-segment returning
`unknown_mini` or throwing;
listing a mount after a bad
URI; `totally-unknown` flipping
to `bad_deeplink`; `health` /
`clearshot` failing to mount;
mount / `already_mounted` /
unmount `not_mounted` / call
`not_mounted` regressing.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1091`.

Rotated LOG oldest → [docs/archive/log/LOG-rotate-1076-for-1091.md](docs/archive/log/LOG-rotate-1076-for-1091.md) (`.1076`).
