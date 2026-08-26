# PLAN.md — Export this diary (`.1011`)

**Freeze.** Implement only this file. Do not reopen refused items mid-build.
**Not** [docs/PLAN.md](docs/PLAN.md) (build phases A–I). The living roadmap
gets a matching frozen section so agents following the boot order find this
ship; this file is the export-this-diary freeze.
**Lane:** Engineering-Web · History · **Horizon:** 0
**Label:** `2026.07-unified.1011` (master is `.1010` / `4d128292`
Library skips deleted sessions). Title stays **Export this
diary (.1011)**. Same PR `#834`. Branch may stay
`feat/export-diary-1009`.
**Excellence-Override:** leftover file-out of the History
diary after import + backfill (not a Feed, not Today,
not Account interchange). Stamp collision: `#836` already
took `.1010`. This is the same export ship, retargeted.

---

## 0. What this is

Import + backfill dumped years into
the diary. Search finds a row.
Missing is a file they can take.

Strong/Hevy-class export of **their**
logs as CSV (JSON is the smaller
honest extra). History-only door.
Empty diary invents nothing
(disabled Save). Tombs stay out
unless they are already restored.
Guest. First set ungated. Today
stays one Start.

`PRIVATE_MODE` stays on. Live www
stays `.696`. Do not promote. Do
not merge.

Full lock: [docs/PLAN.md](docs/PLAN.md)
frozen section `.1011`.

---

## 1. Investigate (done — hypothesis holds)

Read tip `4d128292` / `.1010` on
`origin/master` (Library skips
deleted sessions, from `.1009` /
`20faec3a` Next cite is BW).
Confirmed:

| Claim | Verified |
|-------|----------|
| Search finds a row | **Yes.** `decideSearchHistory` matches title / template / date / lift / note. Empty query is the same live list. |
| A file they can take from History | **No.** History has search, name, restore, start-from, backfill, merge, delete. No download. |
| Account already exports CSV | **Yes — different door.** `buildWorkoutCsvDownload` is Account interchange (Strong / Hevy / MW). No `sessionTitle`. Strong flattens kinds. MW writes `durationSeconds` even when 0. Not History. Do not reuse as this door. |
| Start-from erases rows | **No.** Fold hides week-strip / Coach / streak. History list + live logs stay full. Export must ignore the fold. |
| Tombs in the live list | **No.** `liveSessionLogs` / `toSessionHistoryRow` skip `deletedAt`. Restore is a different door. Library count/spark now skip tombs too (`.1010`). |
| Untitled rows | Date label (`.1007`). Template stays `workoutName`. |
| `.1010` on master | **Library skips deleted sessions** (`4d128292` / `#836`). Do not smash it. |

**Hypothesis (founder, non-binding):**
`decideExportDiary(logs)` plus a History
overflow / History page action that
downloads one file.

**Verdict: keep.** The leftover is the
file. Do not rebuild search, name,
restore, start-from, Account
interchange, the live BW cite, or
Library tomb-skip. Do not rebuild
`.1000`–`.1010`.

---

## 2. Lock

Closed rules:

1. **One home.** `decideExportDiary` in
   `src/lib/history/exportDiary.ts`.
   No second private copy in the page /
   Account / importCsv dialects.
2. **File out.** Not a Feed. Not
   share-to-social. Not email. Not
   Discord. Client blob download.
3. **Full live diary.** Start-from fold
   does not erase rows. Search query
   does not shrink the file. Tombs
   stay out unless already restored.
4. **Columns are honest logged fields
   only:** date, sessionTitle,
   workoutName, lift, set type,
   kg / reps / RPE / tags / notes,
   duration if present. Do not invent
   1RM or duration. Empty cells stay
   empty.
5. **Empty / missing invents nothing.**
   No live sets → `{ kind: 'empty' }`.
   Save stays disabled. No header-only
   fake diary on this door (Account
   interchange may still be
   header-only).
6. **CSV is the file.** JSON is the
   smaller honest extra — same rows,
   same fields, no invented 1RM.
7. **Guest. First set ungated.** Export
   never paywalls. No account.
8. **Today still one Start.** Not a
   Today widget. Not on `/private`.
   Not a second Start.
9. **Do not smash** Library skip
   tombs `.1010` / BW cite `.1009` /
   search `.1008` / name `.1007` /
   restore `.1006` / start-from
   `.1005` / hide `.1004` / delete
   `.1003` / merge `.1002` / pause
   `.1001` / backfill `.1000`.
10. **Do not rewrite Android.** Web
    PWA only. Counsel-hold stays
    drafts. Mind stays deferred.

---

## 3. Ship (only this)

### 3.1 PLAN (this file + `docs/PLAN.md` section)

This freeze. Implement commit follows.
Plan commit is `[skip vercel]`. Every
later commit is `[skip vercel]`.

### 3.2 Pure helper — `src/lib/history/exportDiary.ts`

One module. Deterministic. No premium /
rewards / social / Health / speech /
wearables / `bodyMetrics`. No store
import. Does not read start-from
storage. Does not call
`decideSearchHistory`. Does not import
`workoutsToMwCsv` /
`workoutsToSetTableBCsv` /
`buildWorkoutCsvDownload`.

| Export | Rule |
|--------|------|
| `decideExportDiary(logs)` | Missing / non-array / no live sets → `{ kind: 'empty' }`. Else `{ kind: 'ready', rows, csv, json, count }`. Tombs skipped. One row per logged set. Date is `localDateKeyFromIso` (never `toISOString()` as a calendar day). Duration cell only when session `durationSeconds > 0` or the set stored `durationSeconds`. RPE is `rpe10` if they logged it, else categorical `rpe` if they logged it. Tags are W / D / F from `kind` plus side if present. Notes are exercise note and/or session note when present. Lift is `humanizeExerciseId`. Empty invents nothing. |

### 3.3 History door

Chrome on **History** only.

- Overflow / page action
  (`data-testid="session-history-export-open"`).
  `min-h-[44px]`. Not `primary-action`.
- Dialog Save CSV
  (`data-testid="session-history-export-save"`).
  JSON is a second control on the same
  door
  (`data-testid="session-history-export-json"`).
- Empty live diary: Save stays
  disabled. Do not mint a file.
- Download is a local blob. No API.
  No mailto. No navigator.share.

### 3.4 Surfaces that do not change

- Today lean stays date · pins ·
  highlights · strip · Show all · one
  `JourneyHero` `dock="start"`.
- `/private` stays the tight `.957`
  lock.
- Account Strong / Hevy / MW
  interchange stays on Account.
- Search / name / restore / start-from
  / hide / delete / merge stay.
- Library tomb-skip `.1010` stays.
- Live BW cite `.1009` stays.
- Android Room path stays. No F5.
- Honesty `.971`, resume `.963`, first
  set ungated stay.

### 3.5 Tests (write before product edit)

- Empty / missing / non-array → empty.
- Tomb out. Restored row in.
- Start-from date in the fixture does
  not drop older live rows.
- Search query is not an input.
- Duration 0 / missing → blank cell.
  Logged duration stays.
- No `e1RM` / `1RM` / invented
  duration from start/end.
- CSV header is the locked columns.
  JSON is the same rows.
- Mutant that imports Account
  `buildWorkoutCsvDownload` /
  `workoutsToMwCsv` dies.
- Surface: History mounts the door.
  Lean Today and `/private` do not
  import `exportDiary`.
- Today lock: lean still one
  `dock="start"`.
- `firstSetUngated` stays green.
- No Feed / Discord.com / likes / XP /
  four-scene door / counsel-hold /
  WeChat / Mind / UnlockButton /
  `isPremium`.

### 3.6 Help / i18n / INDEX

- Help one-liner: on History they can
  save their live diary as a CSV
  (JSON if they want the same rows).
  Empty invents nothing. Deleted
  sessions stay out.
- i18n: add keys to
  `historyLocales.ts` +
  `t(key, { defaultValue })` matching
  EN. Coverage cap stays 0.
- Folder INDEX if the file list
  changes (`src/lib/INDEX.md`,
  `src/lib/history/INDEX.md`,
  `src/page-components/INDEX.md`,
  `src/components/INDEX.md`).

## 4. Refuse

Feed / DMs / marketplace /
Discord.com / shame / four-scene
door. Email the file. Share-to-
social. Counsel-hold (field test /
PT / pregnancy). Flip
`PRIVATE_MODE`. Promote live off
`.696`. Merge. Paywall export.
Android rewrite. Second Today
Start. Rebuild `.1000`–`.1010`.
Reuse Account Strong/Hevy/MW as
this door. Filter the file by
start-from or search. Invent 1RM
or duration. Put tombs in unless
restored.

Do not smash `.1010` / `.1009` /
`.1008` / `.1007` / `.1006` /
`.1005` / `.1004` / `.1003` /
`.1002` / `.1001` / `.1000` /
`.999` / `.998` / `.997` /
`.971` / `.963` / `.957`.

## 5. Docs / ship protocol

- `APP_BUILD_LABEL` →
  `2026.07-unified.1011`
- LOG heading
  `## 2026-08-26 — Export this diary (\`.1011`)`
  + rotate oldest live entry so LOG
  stays ≤15
- `CONTEXT.md` `## Now` one-line
  `.1011` citing the full label;
  keep `.1010` … rotate oldest
  shipped Now bullet so the block
  stays ≤25
- Plan commit `[skip vercel]`.
  Implement commits `[skip vercel]`.
- Same PR `#834` against master. Title:
  `Export this diary (.1011) [skip vercel]`.
  Do not merge. Do not promote. Live
  www stays `.696`.
- `tsc --noEmit` clean.
  `check-build-label` `.1011` >
  master `.1010`.

## 6. Done when

- History can save the live diary as
  a file.
- Empty invents nothing. Tombs stay
  out. Start-from does not shrink
  the file.
- Today still one Start. First set
  ungated.
- `/private` stays the tight `.957`
  lock.
- Search / name / restore /
  start-from / Library skip tombs
  `.1010` / BW cite `.1009` still
  hold.
- Label `2026.07-unified.1011`.
  Same PR against master. Title:
  `Export this diary (.1011) [skip vercel]`.
