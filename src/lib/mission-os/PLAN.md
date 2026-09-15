# Paper .1077 — ClearShot mini deeplink last-segment

ONE hop. Mirror Health. Stubs stay stubby — no real Photos / Billing /
Android. ClearShot Android cash stays Next ONE. No tip-promote.
`PRIVATE_MODE` stays.

## Claim

Last-segment `clearshot` is the ClearShot entry, so the deep link is
`mission://minis/clearshot` (not a long opaque path). That route
resolves to the reserved `utility.clearshot` mount on existing MiniHost
+ bus fakes.

Health already uses this grammar: last-segment `health` →
`mission://minis/health` → `l1.health`. ClearShot joins the same
closed last-segment table.

## Accept

1. `parseMissionMiniEntry('mission://minis/clearshot')` is `clearshot`.
2. `miniSlugFromId('utility.clearshot')` is `clearshot`.
3. `mountMiniByDeeplink(host, 'mission://minis/clearshot')` mounts
   `utility.clearshot` (same reserved row as `mountClearShotMini`).
4. Long / opaque last-segments fail `unknown_mini`:
   `mission://minis/utility.clearshot`, `mission://minis/utilityclearshot`,
   `/minis/clearshot`, `mission://minis/mini`.
5. Last-segment `health` still resolves to `l1.health`, not ClearShot.

Judge ≠ builder: expected id / deny code are hardcoded in the test.

## Non-goals

No ClearShot / Health UI. No Android `:minis:clearshot`. No Photos /
Billing wiring. No Today / Train door. No Stripe. No `PRIVATE_MODE`
flip. No tip-promote. Live www stays `.697`.
