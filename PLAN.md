# PLAN.md — Quiet Track trend (`.989`)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). The living roadmap
gets a matching frozen section so agents following the boot order find this
ship; this file is the week-strip Track glance freeze.
**Lane:** Engineering-Web · week strip · **Horizon:** 0
**Label:** `2026.07-unified.989` (master is `.988` / `277b55d3`
EMOM/AMRAP timer). Title stays **Quiet Track trend (.989)**.
**Excellence-Override:** muted last-vs-this on the existing week-strip
day (not a Today widget, not rings, not Bevel strain)

---

## 0. What this is

Track `.976` already logs weight and tape on `/track`. Week-strip
quiet row `.977` already lets one optional Fuel / Walk / Scale row
sit on an empty rest day. Missing: they logged weight (or tape)
twice and cannot see last-vs-this without leaving Train-as-home
for the Track diary.

This ship folds one muted last-vs-this into the **existing** strip
day, from Track diary data. Empty invents nothing. `/track` stays
the diary. Today stays one Start. Not Today-as-dashboard. Not
rings. Not a shame slope. Not body photos.

`PRIVATE_MODE` stays on. Live www stays `.696`. Do not promote.

## 1. Investigate (done — hypothesis holds, with a diary gap)

Checked on `origin/master` `.988` (`277b55d3`).

| Claim | Verified |
|-------|----------|
| `.977` already hosts Fuel / Walk / Scale on an empty rest day | **Yes.** `decideQuietWeekRow` + `TodayQuietWeekStrip`. Empty day is a quiet tap. One chooser. Outline Log. Train Done stays Done. A second row that day refuses. Quiet does not score `thin`. |
| Track day on the strip already shows last-vs-this | **No.** A `quiet === 'track'` cell paints the kind label **Scale** only. No previous number. No sparkline. |
| `/track` already has a two-log chart | **Yes.** `BodyMetricsCard` draws recharts when `series(metric).length >= 2`. Empty copy: "Log at least two entries to see a trend." That chart is the diary, not the strip. |
| Track diary is `bodyMetrics` | **Yes.** `saveBodyMetric` / `loadBodyMetrics`. Strip write-through already calls `saveBodyMetric` for a Track row. `/track` writes the same store. |
| Glance reads the Track diary | **No.** `quietWeekGlance` takes `history` + `quietRows` only. A `/track` log with no strip write does not paint the day. |
| `bodyMetrics.delta` / `series` exist | **Yes.** `delta` uses `Date.now()` + a days cutoff (fixture-expiry shape). Do **not** reuse it on the strip. New helper takes injected entries + dates. |
| Today already has sparkline chrome | **Yes.** `Sparkline.tsx` + `TodayMetricsSparklineRow` live under dashboard / health. Lean Today does not mount them. Using them here would be Today-as-dashboard. |
| Today / door | One `dock="start"`. Resume `.963`. `/private` is the tight `.957` lock. Surface lock: Today tree must not mount `BodyMetricsCard` / photos / rings. |

**Hypothesis (founder, non-binding):** `.977` already lets one optional
Fuel / Walk / Scale row sit on an empty rest day. Fold a quiet
last-vs-this (or tiny sparkline) into that existing strip day
using Track diary data, without a new Today Start or a Health gate.

**Verdict: keep.** The strip day is the surface. Track diary is the
source. Do not add a Today widget. Do not add a Health gate.

**Lock last-vs-this, not a sparkline.** Two numbers and a neutral
arrow fit the 44px cell and match Train vs-last grammar. A two-point
sparkline on this strip would reuse dashboard chart chrome and read
as a ring segment. `Sparkline.tsx` / `TodayMetricsSparklineRow` /
recharts stay off the strip.

**Diary gap (close it):** a rest day with a Track diary number and
no other quiet kind paints as Scale, the same as a strip write.
Otherwise two `/track` logs never appear on This week.

## 2. Lock (strip day + diary)

| Slot | Zero / one log | Two logs, same metric |
|------|----------------|------------------------|
| Rest day with a Track number | Kind label **Scale** (`.977`). No invented last. | Weekday + muted **last → this**. Kind is implicit. |
| Rest day Fuel / Walk | Kind label only. No Track overlay. | Fuel / Walk still wins that day. No mixed trend. |
| Train Done | **Done.** No quiet. No trend. | **Done.** Diary stays on `/track`. |
| Empty rest day, no diary | Empty. Optional `.977` offer. | — |

Closed rules:

1. **Lives on the week strip day.** Not a new Today widget. Not a
   pin. Not a Start. Not on Train. Not on `/private`.
2. **Two logs or nothing.** Weight or the same tape key, twice.
   Zero or one finite number invents nothing. Date-only rows do
   not count (`.976`).
3. **Same metric.** Prefer `weightKg` when both this and last have
   it. Else first overlapping tape key in `BODY_METRIC_KEYS` order
   (`waistCm` → `chestCm` → `armCm` → `hipCm`). `bodyFatPct` is
   not tape — skip it on the strip. No overlap ⇒ no trend.
4. **This day is the later log on this week's strip.** Last is the
   previous same-metric diary row (any earlier date). Last week →
   this week is valid. Two logs last week and nothing this week
   invents no cell.
5. **Diary paints Scale.** A rest day with `entryHasLoggedNumber`
   and no Fuel / Walk row gets `quiet: 'track'`. One row per day
   still holds. Train Done still wins.
6. **No shame slope.** Neutral muted `last → this`. No green/red.
   No up/down verdict. No "lost" / "gained" / "%". Flat two-log
   (`81 → 81`) is honest, not empty.
7. **Not rings. Not photos. Not Bevel strain.** No `ScoreNumeral`.
   No `ProgressPhotosCard`. No Health permission. No sparkline
   on the strip.
8. **Honesty `.971` still scores Train only.** Quiet + trend do
   not set `done`, `streak`, `onTrack`, or `consistency`.
9. **Today still one Start** (Resume when live). Strip Log stays
   outline. Guest. First set ungated.
10. **`/track` stays the diary.** Do not move the card, the chart,
    or Log onto Today. Do not mount `BodyMetricsCard` on the strip.

## 3. Ship (only this)

### 3.1 PLAN (this file + `docs/PLAN.md` section)

This freeze. Implement commit follows. Plan commit is `[skip vercel]`.
Every later commit is `[skip vercel]`.

### 3.2 Pure helper — `src/lib/today/quietWeekTrackTrend.ts`

One module. Deterministic. No store. No DOM. No premium / rewards /
social / Health / speech / wearables. Injected entries so fixtures
do not expire. Do **not** call `bodyMetrics.delta` (it uses
`Date.now()`).

| Export | Rule |
|--------|------|
| `QuietWeekTrackTrend` | `{ date, metric, last, thisValue }` — `metric` is `weightKg` or a tape key. |
| `decideQuietWeekTrackTrend({ entries, date })` | Entries with a logged number, newest first or any order. Find the entry on `date`. Find the previous entry (strictly earlier date) that shares a metric per §2.3. Both values finite and > 0. Else `null`. Invalid date ⇒ `null`. |
| `trackQuietDateKeys(entries)` | Local `YYYY-MM-DD` keys that have a logged number. Used by glance to paint Scale from the diary. |

Do not import this from Train, `/private`, Coach, or www.

### 3.3 Glance — fold diary into the existing day

`quietWeekGlance` accepts optional `trackEntries`.

- Rest day + diary number + no Fuel / Walk row ⇒ `quiet: 'track'`
  (same as a strip write).
- That day + `decideQuietWeekTrackTrend` ⇒ optional `trackTrend`.
- Train Done ⇒ no `quiet`, no `trackTrend`.
- Fuel / Walk that day ⇒ no `trackTrend`.
- Empty days without a diary number keep the four keys
  (`dateKey`, `done`, `isToday`, `offset`).
- `thin` unchanged (Train history only).

`HomeTodayLean` passes `trackEntries: loadBodyMetrics()` on the
same refresh that already reloads `quietRows`. After a strip Track
log, refresh both (write-through already saved the diary).

### 3.4 Strip paint

On a Track day with `trackTrend`, replace the **Scale** label with
muted tabular `last → this` (`text-muted-foreground`, `text-[9px]`).
Weight uses display units (`kgToDisplay` + existing unit hook) —
numbers only, no unit suffix (cell is tight). Tape is the raw cm
number. `data-testid="quiet-week-track-trend"` on that cell.

No `Sparkline`. No recharts. No `.primary-action`. No ✕. No
Health copy. Offer / Log / dismiss stay `.977`.

### 3.5 Surfaces that do not change

- `/track` first paint stays `BodyMetricsCard`. Chart stays there.
- Today lean stays date · pins · highlights · strip · Show all ·
  one `JourneyHero` `dock="start"`.
- `/private` stays the tight `.957` lock.
- Honesty `.971`, resume `.963`, first set ungated, EMOM `.988`,
  drop-set `.986`, warmup `.985` stay.

### 3.6 Tests

- 0 logs / 1 log / date-only ⇒ `null` trend. Mutant that invents
  a last from one row dies.
- Two weights ⇒ last / this on the later date. Earlier date has
  no trend (it is not "this").
- Two waists, no weight ⇒ waist trend.
- This has weight, last has only waist ⇒ no overlap ⇒ `null`.
- Prefer weight when both days have it.
- Invalid / non-local date invents nothing.
- Glance: diary-only rest day paints `quiet: 'track'`. Two diary
  weights attach `trackTrend` on the later rest day. Train Done
  swallows quiet + trend. Fuel that day swallows trend. 1–2 Train
  sessions still `thin: true`. No `streak` / `onTrack` /
  consistency. Empty days without a diary number keep four keys.
- Strip source: paints `quiet-week-track-trend`. No
  `Sparkline` / `recharts` / `BodyMetricsCard` / `ProgressPhotos` /
  `primary-action` / rings / Health / shame words (`lost`,
  `gained`, `strain`). Today lean still one `dock="start"`.
- `firstSetUngated` stays green. No Feed / Discord.com / likes /
  XP / login wall / Force Sync / Session Expired / four-scene
  door.
- `/track` surface lock stays: card + chart remain on Track.
  Today does not import `BodyMetricsCard`.

### 3.7 Help / i18n / INDEX

- Help one-liner: if they logged scale or tape twice, that rest
  day on This week can show last → this. Today stays Start
  workout. Empty invents nothing.
- i18n via `t(key, { defaultValue })` — no shame.
- Folder INDEX if the file list changes (`src/lib/INDEX.md`,
  `src/components/today/INDEX.md`).

## 4. Refuse

WeChat home. Four-scene door. Feed / DMs / marketplace. Health
gate before Train. Body photos. Shame slope. Bevel strain /
rings. Counsel-hold. Promote. `PRIVATE_MODE` flip. Merge.
Second Today Start. Discord.com. Mind. Sparkline / recharts on
the strip. `TodayMetricsSparklineRow` on lean Today. Moving
Track onto Today. Inventing a last from one log.

Do not smash `.988` / `.986` / `.985` / `.983` / `.981` /
`.980` / `.978` / `.977` / `.976` / `.974` / `.973` / `.971` /
`.970` / `.967` / `.965` / `.963` / `.961` / `.957`.

## 5. Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.989`
- LOG heading `## 2026-08-25 — Quiet Track trend (\`.989`)` +
  rotate oldest live entry so LOG stays ≤15
- `CONTEXT.md` `## Now` one-line `.989` citing the full label;
  keep `.988` … `.970`; rotate oldest shipped Now bullet
  (`.967`) so the block stays ≤25
- Plan commit `[skip vercel]`. Implement commits `[skip vercel]`.
- One draft PR against master. Title: `Quiet Track trend (.989)`.
  Do not merge. Do not promote. Live www stays `.696`.
- `tsc --noEmit` clean. `check-build-label` `.989` > master `.988`.

## 6. Done when

- If they have two Track weight (or tape) logs, the week strip
  day can show one muted last → this on that day. Empty invents
  nothing.
- Lives on the week strip, not a new Today widget. Not rings.
  Not a shame slope. Not body photos.
- Today still one Start (Resume when live). `/private` stays
  the tight `.957` lock.
- Guest. First set still ungated. Honesty `.971` still scores
  Train only.
- `/track` itself stays the diary. Do not move Track onto Today.
- Unit tests. tsc clean. Label `.989`. Draft PR against master.
  Title: `Quiet Track trend (.989)`.
