## 2026-08-12 — Admin invite share link lands on /private (`.690`)

Beta Field P0: founder-copied links from the admin panel pointed at `/?access=…&invite=…`
while the shipped email used `/private?invite=…`. On preview (or anywhere
`PRIVATE_ALLOW_QUERY_ACCESS=true`), query unlock set the gate cookie and redirected
back to `/` — marketing, not `PrivateTeaserClient` — so `data-mw-invitee` stayed 0
and "You're invited" never rendered. `buildInviteShareLink` now matches the email
and `print-beta-invite.ts`: `/private?invite=…`, with `?access=` only when query
unlock is explicitly allowed. Regression guards in `inviteShareLink.test.ts`,
`privateGateRedirect.test.ts`, and `privateGateRedirect.routetest.ts`.

Excellence-Override: preserve ?invite= through gate for beta activation (W1)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-661-for-690.md](docs/archive/log/LOG-rotate-661-for-690.md). · [`.689` for `.748`](docs/archive/log/LOG-rotate-689-for-748.md).
