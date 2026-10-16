## 2026-10-15 — Review fixes on the gated site (`.1135`)

Today's empty week cell opens the free logger on `/active`. `/coach` stays gated, so Just Go no longer lands on `/private`. Generate this week still links `/coach`.

Refunds states that payments are not live. The planned web checkout is PayPal: Pro at $19.99 per month or $119.99 per year, and Founder Lifetime at $299. Account has no billing screen while payments are off. The page does not name Stripe, Phantom, USDC, or Super Bundle.

A signed-out `week.logged` post is skipped when this device has no push subscription. The server still returns 403 `consent_required` if a post arrives. Language and country are fields on the onboarding profile step; the sheet does not auto-open. Train gives the weight field a wider column, puts Plates on their own line, shows the percent box only when a percent or a known max exists, and lets the session title wrap. Units stay on the Settings default (metric) until the athlete changes them. `/credits` lists the AGPL-3 program, the Unlicense exercise snapshot, and the MIT body-diagram package, linked from About and the footer. `/settings` redirects to `/account`. About cites the 2024 BMJ review for the exercise-and-mood sentence.

**Mutants killed:** an unlogged Just Go session kept over a different Coach card; a logged set replaced; a guest without push still posted; geo units written on boot; the locale sheet auto-opening off the first-set path.

`[skip vercel]`. No tip-promote. Live www stays `.697`. PRIVATE_MODE stays.

Label `2026.07-unified.1135`.

Rotated LOG → [docs/archive/log/LOG-rotate-1123-for-1135.md](docs/archive/log/LOG-rotate-1123-for-1135.md) (`.1123`). `.1113` stays the live floor.
