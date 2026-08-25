# PLAN.md — Custom exercise (`.990`)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). The living roadmap
gets a matching frozen section so agents following the boot order find this
ship; this file is the live-set named-custom freeze.
**Lane:** Engineering-Web · Train logger · **Horizon:** 0
**Label:** `2026.07-unified.992` (master is `.991` / `d561b8a5`
This session becomes a Start). Title stays **Custom exercise (.990)**.
Rebased onto that tip so Start this again `.991` still holds.
**Excellence-Override:** leftover local named custom on the live
picker (not a marketplace, not a video shop)

---

## 0. What this is

The live set picker already searches the static catalog. A library
miss ends the add: "No matches", and a session row whose id is not
in `EXERCISES` is dropped (`ActiveExerciseList` `if (!exercise)
return null`). They cannot name a movement during a live workout
and keep logging.

This ship is leftover, not a new marketplace. They type a name in
the existing Train add/swap picker, the name persists locally and
in the session, and they log sets without leaving Train. Unlimited.
Free. Guest. First set still ungated. Empty invents nothing.

Android already creates a custom during the live add sheet
(`custom-${uuid}`, Room, "free forever"). Web has the cloud table
and CSV slug leftover, not the live invent path.

`PRIVATE_MODE` stays on. Live www stays `.696`. Do not promote.

---

## 1. Investigate (done — hypothesis holds; Today leak is no)

Checked on `origin/master` `.989` (`adad3e58`).

| Claim | Verified |
|-------|----------|
| Live picker already has library search | **Yes.** `ExercisePicker` filters `EXERCISES` (cap 40). `AddExerciseSheet` / inline add / swap all mount it. E2E keeps `search exercises`, `option` rows, `add selected exercise`. |
| Named custom persists locally + in the session | **No on web.** Store `addExerciseToActive` accepts any id, but nothing mints a named leftover. No `mw_` notebook. |
| Library miss kills the log | **Yes, twice.** Empty query-miss copy is "No matches" (no invent). A session / Repeat-last / CSV slug id that `getExerciseById` misses is **unmounted** — the set row never paints. |
| CSV already slugs unknown names | **Yes.** `exerciseIdForName` → slug when catalog misses. Comment already calls that "how custom exercises already work." Display then dies on the live list. |
| Android already has live create | **Yes.** `CreateCustomExercise` from the add sheet. Id `custom-${UUID}`. No cap. Sync is Android / `/api/mobile/sync/customs`. |
| Web public Library is a catalog | **Yes.** `LibraryPage` is `EXERCISES`. Do not add a shop or a public custom feed. |
| Unlimited / free / guest | Web picker has no create, so no cap and no paywall — and no path. Android copy: free forever. Hevy free cap is 7; we do not copy that. |
| Today / door | Lean Today is date · pins · highlights · week strip · Show all · one `JourneyHero` `dock="start"`. Resume `.963`. `/private` is the tight `.957` lock. |

**Hypothesis (founder, non-binding):** the live set picker already
has a library search; a named custom that persists locally (and in
the session) is leftover, not a new marketplace.

**Verdict: keep.** The picker is the door. The notebook is local.
Do not build a shop. Do not require a video. Do not cap the 8th.

### Track trend `.989` — leaked last-vs-this onto Today's home?

**No. Nothing to unmount first.**

`.989` last-vs-this paints only inside the existing week-strip
cell (`data-testid="quiet-week-track-trend"`, 9px muted tabular).
Lean Today still one `dock="start"`. No `BodyMetricsCard`, no
`Sparkline`, no `TodayMetricsSparklineRow` on lean Today. Not a
pin. Not Highlights. Not a second Start. `/track` stays the diary.

Keep that lock in this PR's tests. Do not revert `.989`. Do not
lift last-vs-this onto a Today widget.

---

## 2. Lock (live name + local notebook)

| Slot | Empty / miss | Named |
|------|--------------|--------|
| Live add / swap / inline picker | Catalog search. Blank query invents nothing. Whitespace invents nothing. | Type a name that is not the catalog (and not a name they already keep) → one Use-this-name action. Persist. Select. Add selected exercise still confirms. Stay on Train. |
| Live set row | Catalog miss used to unmount the row. | Resolve catalog, then their notebook, then a leftover id so a real session row never vanishes. Log set stays ungated. No video required. |
| Repeat last / Start this again / diary | Ids already copy. Names died when catalog missed. | Same ids. Names come from the notebook (or leftover humanize). Not a public catalog. |
| Library page / `/private` / Today Start | Unchanged. | Unchanged. Customs are not a public catalog. Today stays one Start. |

Closed rules:

1. **Lives on the live Train picker.** Not a Library shop. Not a
   Builder-only form. Not on Today. Not on `/private`.
2. **Name is enough.** No muscle, equipment, or video required.
   Empty cues stay empty (`.973` invents nothing).
3. **Empty invents nothing.** Blank / whitespace → no write, no
   fake library row. Empty query → no invent action. Do not seed
   a starter custom list.
4. **Catalog wins.** A typed name that matches a catalog name
   (trim, case-insensitive) picks the catalog id. Do not mint a
   custom "Bench Press".
5. **Reuse their name.** Same notebook name (trim, case-insensitive)
   reuses that id. Unlimited means no cap, not eight copies of
   one name.
6. **Unlimited. Free. Guest.** No 7-cap. No premium. No account.
   First set still ungated. The 8th named custom still creates.
7. **Theirs, not a catalog.** Local `mw_custom_exercises` via
   `safeStorage`. Repeat last / Start this again / History /
   Victory resolve the name. `LibraryPage` stays `EXERCISES`.
8. **Id shape.** New rows: `custom-` + uuid (Android leftover).
   CSV slug leftovers already in a session still resolve so the
   row is not killed.
9. **No video. No paywall. No invented library-size traction.**
   Do not add a new `300+` / count boast. Existing Library
   subtitle stays put; do not restamp it.
10. **Today still one Start** (Resume when live). `/private`
    stays the tight `.957` lock. `.989` last-vs-this stays on
    the strip cell only.
11. **No PWA → mobile customs sync this ship.** Guest local is
    the path. Do not call `/api/mobile/sync/customs` from web.
    Do not rewrite Android.

---

## 3. Ship (only this)

### 3.1 PLAN (this file + `docs/PLAN.md` section)

This freeze. Implement commit follows. Plan commit is `[skip vercel]`.
Every later commit is `[skip vercel]`.

### 3.2 Pure helper — `src/lib/workout/customExercise.ts`

One module. Deterministic create/reuse/resolve. Persist through
`safeStorage` + `STORAGE_KEYS.customExercises` (`mw_custom_exercises`).
No premium / rewards / social / Health / speech / wearables.
No store import. Injectable `now` / `id` / storage for tests so
fixtures do not expire.

| Export | Rule |
|--------|------|
| `CustomExercise` | `{ id, name, createdAt }` — name is trimmed, non-empty. |
| `normalizeCustomName(raw)` | Trim + collapse inner space. Blank → `''`. |
| `decideNamedCustom({ name, catalog, existing })` | `null` if blank. `{ kind: 'catalog', id }` on catalog name match. `{ kind: 'reuse', id }` on existing custom name match. Else `{ kind: 'create', name }`. |
| `mintCustomId()` | `custom-` + uuid. |
| `upsertCustomExercise(name)` | `decideNamedCustom` then persist only on `create`. Catalog / reuse / blank write nothing new. Returns `{ id, name }` or `null`. |
| `loadCustomExercises()` | Valid rows only. Drop blank names / bad ids. Empty storage → `[]`. |
| `resolveExercise(id)` | Catalog `getExerciseById` first. Then notebook. Then leftover synthetic `{ id, name: humanize(id), muscleGroups: [] }` so a live row is never unmounted. Unknown empty id → `null`. |
| `exercisesForPicker(catalog)` | Catalog plus **their** notebook rows as `Exercise`s. Do not invent leftovers that were never named. |

Do not import this from `/private`, Coach plan engine, www, or
`LibraryPage` as a public catalog.

### 3.3 Picker — invent on a typed miss

`ExercisePicker` (so add sheet, inline add, and swap all get it):

- Search list = `exercisesForPicker` then existing `filterExercises`.
- Their named customs may appear when the query matches **or**
  when the query is empty and they already named some (theirs,
  not fake).
- When `decideNamedCustom` is `create`, show one invent action
  `data-testid="exercise-picker-use-name"`. Copy via
  `t('exercisePickerUseName', { defaultValue: 'Use "{{name}}"' })`.
- Click persist + `onChange(id)`. Footer **Add selected exercise**
  stays the confirm (e2e contract).
- Keep `search exercises` placeholder and `option` rows.
- Blank query: no invent action.

`ActiveInlineAddExercise` / add sheet confirm resolve via
`resolveExercise`, not catalog-only `getExerciseById`.

### 3.4 Live list + diary names

`ActiveExerciseList` uses `resolveExercise`. **Delete**
`if (!exercise) return null` as the catalog-miss kill.

`ActiveWorkoutPage` name resolvers, History / Victory / Builder
display of a logged or saved id, and Repeat last / honor-saved
start use `resolveExercise` so the name they typed stays theirs.

Cues / form still / Info stay empty when there is no catalog
media. Hide never blocks Log set.

### 3.5 Surfaces that do not change

- Today lean stays date · pins · highlights · strip · Show all ·
  one `JourneyHero` `dock="start"`. `.989` trend stays in the
  strip cell.
- `/private` stays the tight `.957` lock.
- `LibraryPage` stays the static catalog. No shop. No video
  required. No custom marketplace.
- Android Room path stays. No F5. No Expo.
- Honesty `.971`, resume `.963`, first set ungated, EMOM `.988`,
  drop-set `.986`, warmup `.985` stay.

### 3.6 Tests

- Blank / whitespace / empty query → no create, no notebook write.
  Mutant that seeds a fake library row dies.
- Catalog name (any case) → catalog id, no write.
- New name → `custom-` uuid, persist, resolve by id.
- Same name again → reuse, notebook length unchanged.
- Eight distinct names all persist (no cap). Mutant that refuses
  the 8th dies.
- `resolveExercise` catalog hit / notebook hit / leftover slug
  still returns a paint-able `Exercise` (live list must not
  `return null` on miss).
- Picker source: invent action only on a create miss. Keeps
  search placeholder + add-selected-exercise. No `UnlockButton`
  / `/bundle` / `isPremium` / video-required / `300+` new boast.
- Live list source: `resolveExercise`; no catalog-miss unmount.
- Repeat-last / honor-saved / History / Victory resolve the
  typed name. `LibraryPage` does not import the notebook as a
  public catalog.
- Today lock: lean still one `dock="start"`. No
  `BodyMetricsCard` / `Sparkline` / `TodayMetricsSparklineRow`
  on lean Today. `quiet-week-track-trend` stays on the strip
  only.
- `firstSetUngated` stays green. Custom path never mounts
  SignInPrompt / login wall / Force Sync / Session Expired.
- No Feed / Discord.com / likes / XP / four-scene door /
  Health / counsel-hold / WeChat home / Mind.

### 3.7 Help / i18n / INDEX

- Help one-liner (getting-started Train): during a live session
  they can type a name the library does not have and keep
  logging. Unlimited. Free. Stays on this device. Empty
  invents nothing. Today stays Start workout.
- i18n: add keys to `libraryLocales.ts` + `t(key, { defaultValue })`
  matching EN. Coverage cap stays 0.
- Folder INDEX if the file list changes (`src/lib/INDEX.md`,
  `src/lib/workout/INDEX.md`, `src/components/workout/INDEX.md`,
  `src/store/INDEX.md`, `src/lib/storage` keys).

## 4. Refuse

Paywall custom. Marketplace exercise shop. Require a video.
Invented library-size traction. Cap the 8th. WeChat home.
Four-scene door. Feed / DMs. Health gate. Counsel-hold.
Promote. `PRIVATE_MODE` flip. Merge. Second Today Start.
Discord.com. Mind. PWA customs cloud sync. Android rewrite.
Seeding fake library rows. Lifting `.989` last-vs-this onto
a Today widget.

Do not smash `.991` / `.989` / `.988` / `.986` / `.985` / `.983` /
`.981` / `.980` / `.978` / `.977` / `.976` / `.974` / `.973` /
`.971` / `.970` / `.967` / `.965` / `.963` / `.961` / `.957`.

## 5. Docs / ship protocol

- `APP_BUILD_LABEL` → `2026.07-unified.990`
- LOG heading `## 2026-08-25 — Custom exercise (\`.990`)` +
  rotate oldest live entry so LOG stays ≤15
- `CONTEXT.md` `## Now` one-line `.990` citing the full label;
  keep `.989` … `.971`; rotate oldest shipped Now bullet
  (`.970`) so the block stays ≤25
- Plan commit `[skip vercel]`. Implement commits `[skip vercel]`.
- One draft PR against master. Title: `Custom exercise (.990)`.
  Do not merge. Do not promote. Live www stays `.696`.
- `tsc --noEmit` clean. `check-build-label` `.990` > master `.989`.

## 6. Done when

- During a live session they can name a custom exercise and log
  sets on it without leaving Train.
- Unlimited. Free. Guest. First set still ungated. Empty invents
  nothing (no fake library entries).
- Custom they named stays theirs on Repeat last / Start this
  again / the local diary. Not a public catalog.
- Today still one Start (Resume when live). `/private` stays
  the tight `.957` lock. `.989` last-vs-this stays on the strip
  cell only.
- No video required. No paywall. No invented traction on
  library size.
- Unit tests. tsc clean. Label `.990`. Draft PR against master.
  Title: `Custom exercise (.990)`.
