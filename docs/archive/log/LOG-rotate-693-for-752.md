Superseded live LOG entry rotated 2026-08-13 for `.752` Mission Server messenger.

## 2026-08-12 — Coach log-cited why-this-week / adapt rationale (`.693`)

Athletes could see that Coach adapted, but not inspect **why** in a structured way
grounded in logs — Alpha Progression’s inspectability edge. Existing adapt beats
were one prose blob; generate weeks had dose but no input → rule → effect story.

**Ship:** pure `weekRationale.ts` builds one shame-free rationale from signals the
adapt/generate path already computes (missed days, readiness swaps, logged done,
dominant progression `whyKey`, load-band hold, schedule/gear). Surfaces on
`CoachAdaptBanner` (full: three lines; compact Today: one line) and always on the
Coach week after generate via `showWeekRationale` + `ctx.history` / `loadZone`
hints. No new chat widgets; free logger untouched.

Guards: unit coverage for each story kind + wiring on banner/page; copy honesty
extended. Label `.693`.

Excellence-Override: Coach log-cited why-this-week / adapt rationale (W1 inspectability; RESULT unscored)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-664-for-693.md](docs/archive/log/LOG-rotate-664-for-693.md). · [`.692` for `.751`](docs/archive/log/LOG-rotate-692-for-751.md).
