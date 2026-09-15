Superseded live LOG section rotated 2026-09-15 for `.1085` CapResult unknown-method consistency.

## 2026-09-14 — Coverage untested floor 438 → 493 (`.1070`)

Ratchets Coverage floors red on
master: 493 untested vs floor
438 after #935 minis landed.
Floor raised to the measured
count. No invented unit tests.
#935 capability-bus / minis
stubs + existing UI
Playwright-covered debt.

HOLD follow-up: beachhead
`i18n:parity` (es/pt) under 40%
for today/nav/activeWorkout/learn.
`Alpha` allowlisted as stage
name. Pack overlays only — no
`export-locales` dump.

HOLD follow-up 2: catalog
`justGoTitle`, `justGoDesc`,
`justGoEyebrow` (today) and
`victoryNextEnvCite` (active
workout). es/pt translated so
beachhead stays ≤40%. No
TodayDesk craft.

HOLD follow-up 3: bundle
budget. `/` is cookie-dynamic
(no `index.html`) — measure
LandingPage + teaser + layout
+ page chunk, not every chunk
in the client-reference
manifest (that was 458.9 and
counted House on `/`). Caps:
`/` 351, `/log` 417,
`/active` 511. House chrome +
#935, not i18n keys. No size
pass.

HOLD follow-up 4: a11y
`GATED_ROUTES` listed
`/server` twice, so Playwright
minted two `axe … /server @a11y`
titles and Hero path E2E
failed at collection. Dropped
the tail duplicate. Same scan
once. List uniqueness throws.

HOLD follow-up 5: Hero E2E 37
fail was house leftover first
paint, not a cookie-gate.
CI already builds
`PRIVATE_MODE=false`. Start is
`today-start-cta`. Notify is
`/notify` +
`[data-mw-launch-notify]`.
Sitemap `/bundle` 307 →
`/notify` is FREE_BETA.
Floor rail is `nav.house-floor`,
not Primary/Search. Victory
docks Coach; Back to Today is
the quiet escape. Zero-state
red caps lowered (house-press
is not poster-red). Force
consent query wins over DNT.
Finish writes History on the
desk — not `today-score-band`
(`HomeTodayDashboard` is not
`/log`). `@gate` waits
`domcontentloaded`, not
`networkidle` (Turbopack hang).
Do not flip PRIVATE_MODE.

Paper only. `[skip vercel]`. No
tip-promote. Live www stays `.697`.
PRIVATE_MODE stays.

Label `2026.07-unified.1070`.

Rotated LOG oldest →
[docs/archive/log/LOG-rotate-1053-for-1070.md](docs/archive/log/LOG-rotate-1053-for-1070.md)
(`.1053`).
