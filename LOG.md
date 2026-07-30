# Mission Winning — Development Log

Chronological record of shipped work. Newest first.

**Rotation rule:** keep ≤15 entries / ≤20KB here. When over, move the oldest entries (whole `##` sections, order preserved) to `docs/archive/log/` and list the file in [docs/archive/INDEX.md](docs/archive/INDEX.md). Archive: [2026-06 → 2026-07-20](docs/archive/log/LOG-2026-06_to_2026-07-20.md) · [2026-07-20 tail](docs/archive/log/LOG-2026-07-20_tail.md) (incl. Accelerator sprint kit rotated 2026-07-22) · [2026-07-20 → 2026-07-29 (`.179` and earlier)](docs/archive/log/LOG-2026-07-20_to_2026-07-29.md) (rotated 2026-07-30).

---

## 2026-07-30 — Twelve questions, each with its receipts (`.190`)

First PR of the behavior-journal wave. WHOOP's journal offers 300+ trackable
behaviors and then advises tracking no more than ten; that tension is their
defect, and their loudest review complaint — "every positive action seemed to
have negative impacts" — is what a low significance bar over dozens of
behavior×outcome pairs produces. So this ships **twelve**, chosen on evidence,
each carrying a tier (A/B/C) and a one-sentence receipt the athlete can open.

New pure [`behaviors.ts`](src/lib/behaviors.ts): nine new fields (bed/wake time
at quarter-hour resolution, protein target, caffeine servings + time of last,
creatine, hydration, alcohol servings, screen-in-bed, late meal, rest day) —
sleep quality, soreness and stress already exist as 1–5 ratings and stay where
they are. Two things in the registry exist to make the correlations honest
later: **one pre-registered outcome per behavior** (you cannot fish for the
metric that happens to move) and **a declared lag** (alcohol tonight is a claim
about tomorrow's session). The C-tier receipt on late meals says outright that
the research is unsettled — grading our own questions is the point.

**The dangerous half was the storage.** `normalizeCheckIn` and
`upsertTodayPartial` are whitelist reconstructions: they rebuild a check-in
field by field, and every read passes through the first while every
victory-sheet reply chip passes through the second. A field added to one and not
the other is destroyed with no error anywhere. Both were edited together, and
both mutants are killed (`field-dropped-on-read`,
`partial-upsert-wipes-behaviors` — the latter is the real scenario: log
behaviors in the morning, tap a reply chip that evening, lose the morning).
`MAX_ENTRIES` 30→90, because a thirty-day window could never fill a correlation
that needs paired observations on both sides — the cap would have quietly capped
the feature (`history-truncated-at-30`).

Counts are not ratings: zero servings is a real answer, eight is eight, and the
1–5 clamp guarding the rating fields would have rewritten both
(`count-clamped-to-five`). The journal footer renders them as "Caffeine 2", never
"2/5" (`count-rendered-as-N-of-5`). Also killed: `bad-time-string-throws`,
`receipt-missing-for-behavior`, `weak-evidence-relabelled-strong`.

Everything is optional, free, and device-only; the pre-session sheet is
deliberately untouched — an athlete standing at a barbell is not asked how much
coffee they drank. Deliberately absent: medication, reproductive and
recreational-substance categories, which are special-category data and a surface
this app has no reason to hold. Tests 835→862. Next: `.191` sleep consistency.

## 2026-07-30 — The untestable half, tested (`.189`)

`.188` shipped with an honest gap in its own PR body: the spend routes
transitively import `server-only`, which throws under plain `tsx`, so the
*wiring* went untested while only the pure decisions were falsified. That gap
was in the worst possible place — the difference between "quota refuses" and
"quota refuses **and the athlete still gets the free product**" is invisible to
every pure test in the repo.

Node's own exports map had the answer: `server-only` resolves to an empty module
under the `react-server` condition. New lane `npm run test:routes`
(`tsx --conditions=react-server`), wired into `gate.mjs` and `ci.yml` beside the
unit tests; `*.routetest.ts` deliberately does not match the `*.test.ts` glob, so
the two lanes stay separate (835 unit, 7 route).

Seven contracts pinned, all on the degrade path: an exhausted daily-insight quota
still answers **200 with the rules insight** (not 429); a dark LLM env never
consults the quota and never says "quota"; a signed-out visitor always gets the
plan-voice rules briefing; chat's 429 `coach_quota` is the deliberate exception
(no rules engine to answer with) and unconfigured still reads `coach_offline`,
because a founder who never set keys must never be told they hit a spending limit
they never had. Determinism without a network or a shared bucket: caps driven to
`0`, whose kill switch refuses before the limiter is consulted, and a unique IP
per case.

**The mutant `.188` could not run now runs and dies**: `quota-blocks-rules-path`
(wire the quota as a route-wide 429) passes every pure test in the repo and fails
here. Also killed: `plan-voice-gate-moved-up` (cost gate back in front of the free
briefing — the exact defect the route's comment exists to prevent) and
`dark-env-reads-as-quota`. Tests 835→842.

## 2026-07-30 — The meter exists now (`.188`)

Per-user LLM metering + spend hardening — the PR every paid LLM feature was gated
on ("per-user spend metering does not exist"). It could not exist: both LLM
clients discarded the provider's `usage` block, no usage table existed, all rate
limits were per-IP 60-second windows, and the free-beta premium bypass returned
**before user resolution** — the exact branch that spends money was the one branch
that never knew who it was spending on. Worse, two routes spent with **no premium
check at all**: `daily-insight` and `estimate-meal` would run paid inference for
any holder of the gate cookie.

What ships: `parseLlmUsage`/`estimateLlmUsage` (provider meter or char estimate,
*marked* estimated — an estimate presented as a measurement poisons every cost
decision built on it); both clients return `usage` (stream via
`stream_options: include_usage`, defensive any-chunk parse + estimate fallback);
new `llm_usage` migration (dual identity per the anonymous-push precedent, no
insert policy — a client that can insert its own meter rows can forge its own
spend); pure `quota.ts` (user > device > **ip floor**, env caps with `'0'` kill
switch, day window, fail-open — ZDR stays the one fail-closed check);
`identity.ts` resolves the user *before* the premium answer; all five routes
record via `after()` and gate their LLM branch on premium + quota. Degrade rules:
every route except chat falls to its rules/heuristic answer (plan-voice's
signed-out contract untouched); chat 429s honestly ("daily limit, resets
tomorrow") because it has no rules engine to lie with.

**Provably dark in prod today**: LLM env unset → `unconfigured` → rules,
quota never consulted (tested per route decision), nothing recorded; free beta →
premium branches unchanged. Arms when the founder sets `COACH_LLM_*` /
`MEAL_VISION_*`, applies `20260731_llm_usage.sql`, sets Upstash env (without it
daily windows are per-instance memory — soft), and picks real `LLM_DAILY_CAP_*`
numbers. Falsified: usage-discarded, quota-never-exceeds, anonymous-unmetered,
minute-window (killed only after pinning the literal — asserting against the
imported constant let the shrunken window pass), unowned-row-forged,
ip-in-ledger — all killed. Tests 812→835.

## 2026-07-30 — Impacts (`.187`)

Final PR of Field Notes — the WHOOP payoff without the strap. The most-loved
element of WHOOP's journal is the "your data shows" report; this delivers it free,
on-device, from data both stores already hold: mind check-ins joined to session
load by local date. *"Sessions on sleep ≤ 2 days: load −33% vs your other days
(4 vs 6 sessions)."* Surfaces as a dense Impacts row in the weekly Mission Debrief.

Pure [`impacts.ts`](src/lib/journal/impacts.ts). The refusals carry the feature,
each a killed mutant: **minimum 8 paired observations or silence** (the `.127`
principle) plus ≥3 sessions on each side of the split (min-pairs-2); effects under
5% are noise, not insight (noise-as-insight); a field the athlete does not fill
never speaks — absence is not a rating (absent-field-speaks); stress flags HIGH
ratings per the readiness rule direction (stress-direction-flip); the line
describes and stops, no injury/risk/causal words per LEGAL_SAFETY §3a
(causal-wording, the band-line grep pattern); tombstoned logs are deleted content
(tombstones-count).

One rule table: "flagged day" thresholds are identical to `READINESS_RULES`
(sleep ≤2, energy ≤2, stress ≥4, soreness ≥4) — the `.178` lesson again: the
sentence the athlete reads and the adjustment the engine makes must not sit on
different definitions of the same word. Session counts print in the line so the
athlete can weigh the evidence themselves.

Tests 803→812. **Field Notes plan complete** (`.184`–`.187`): notes persist and
sync, the session entry composes, the coach remembers cues, and the journal pays
the athlete back.

## 2026-07-30 — Cue & tweak memory (`.186`)

PR 3 of Field Notes — the coach remembers. Paper-logbook lifters flip back pages
for exactly this: "machine 3, seat 4", "tuck elbows". Notes have been stored on the
completed log (and synced — an Android note surfaces here too) since day one; `.184`
made them readable, this makes them useful. Opening an exercise the athlete has
noted before shows **Last note (date): "tuck elbows"** right in the logger card.

Pure [`cueMemory.ts`](src/lib/journal/cueMemory.ts): `lastNotesFor(exerciseId,
history, n)` — newest first with a defensive sort (a cloud merge can perturb array
order, and a stale cue presented as current is a silent lie), tombstoned logs are
silent, text returned verbatim. Refusals kept as named mutants, all killed:
another exercise's note never appears (any-exercise-note), oldest-as-newest fails
(stale-note-first), empty history is silence not a placeholder
(placeholder-on-empty), deleted logs do not speak (deleted-log-speaks).

Every note written now raises the value of the next session — the retention loop
this feature exists for. Tests 797→803. Next: `.187` Impacts.

## 2026-07-30 — The session entry (`.185`)

The Granola moment of the Field Notes plan: the athlete's scrappy fragments steer,
the machine's context fills, one step fuses them — and the entry still reads as the
athlete's own.

**The jot field.** The logger gains a collapsed one-row "Field note"
([`SessionJotField`](src/components/workout/SessionJotField.tsx)) — the rest window
is dead air, and "knee twinge set 3" is five words that are only true while they are
true. It lives on `ActiveWorkout.sessionNote`, so it survives a refresh with the
session, and it is deliberately NOT copied onto `CompletedWorkoutLog` — exercise
notes sync as workout content; the journal never leaves the device.

**The compose step.** Pure [`composeEntry.ts`](src/lib/journal/composeEntry.ts):
`collectFragments` gathers the session jot plus per-exercise notes (attributed by
exercise name, one fragment per line — `.184`'s per-set fold arrives multi-line),
`composeSessionEntry` puts the athlete's words **first and verbatim**, the debrief
after, the check-in strip as footer. The binding rule, tested as a named mutant:
**empty fragments → the entry is exactly the debrief.** Strava's Athlete
Intelligence became a meme by generating reflection where the athlete offered none;
the variant that invents a line here fails `composeEntry.test.ts`, as do the ones
that reword a fragment, drop attribution, or reorder the athlete behind the machine.

**The journal surface.** `/history` splits into **Sessions | Journal**.
[`JournalTimeline`](src/components/history/JournalTimeline.tsx) interleaves session
entries with mind check-in notes by date, searchable by text, privacy said out loud
on the surface ("stays on this device — never uploaded"). Fragments are editable
after the fact (Granola's post-hoc edit) via `updateJournalFragments` — the
machine's lines are not, because an edited debrief would claim the rules said
something they did not; editing a session with no entry mints nothing. The victory
sheet renders fragments above the debrief and says "Saved to your journal."

Tests 787→797 (falsification: invented-reflection, reworded-fragment,
lost-attribution, order-flip — all killed). Next: `.186` cue memory ("Last note on
bench: 'tuck elbows'"), `.187` on-device Impacts.

## 2026-07-30 — Notes stop vanishing (`.184`)

First PR of the Field Notes plan — the Granola of training journals: the athlete's
scrappy fragments steer, the machine's context fills, and the entry stays the
athlete's own. Before any of that can exist, the notes that already exist have to
stop dying, and they were dying in three places.

**The note nobody could re-read.** The logger has had a per-exercise note field since
the beginning ("felt heavy", "machine 3, seat pos 4"). It was written into the
completed log, synced to the cloud — and then never displayed again anywhere:
`grep note` on HistoryPage returned zero hits. A note nobody can re-read is a note
nobody writes. History's detail dialog now shows it.

**The boundary that ate notes in both directions.** Android stores a note per set;
web stores one per exercise; and the seam between them dropped the field both ways —
`flattenExercises` never emitted it (web notes never reached the phone) and
`mobileSyncSetSchema` never declared it, so zod stripped what Android sent (its set
notes never reached the cloud). Now per-set notes fold into the exercise note
(distinct, first-seen order, newline-joined — two different notes both arrive), and
the exercise note rides the first set on the way out. Reverting either direction
fails the round-trip test.

**The debrief that evaporated.** `buildDebrief` composes tone-tested prose at finish,
the victory sheet shows it once, and nothing persisted it — re-opening a session could
never show the entry it was given. New device-only `journal/journalStore.ts`
(`mw_session_journal`, capped 200, upsert by workout id so re-completing replaces
rather than duplicates, swept into device backup free via the `mw_` prefix scan)
saves it, and History renders it. This is the machine half of every future journal
entry — in the Granola analogy, the transcript — and it no longer evaporates when the
sheet closes.

**Device-only, deliberately.** Journal content is the data class users have
historically 1-starred apps over (Day One shipped E2EE after years of exactly that).
Workout data already syncs; the composed journal does not, and if it ever does it
will be its own decision with its own encryption, not a side effect of a storage key.

Falsified: dropping the note in either boundary direction fails 1 test each;
removing persistence fails all 4 store tests. Tests **782→787**.

## 2026-07-29 — The coach reads it out (`.183`)

Phase 0 of voice, and the whole point is what it does **not** add: no API key, no
vendor, no network, no LLM in the path. `speechSynthesis` reads the debrief lines
`coach/debrief.ts` already composed and `reentryTone` already tested, so a listener
and a reader get the same facts and the tone tests that guard the text guard the audio
for free. The `.173` doctrine holds exactly — **rules are the source, speech is only
presentation**.

Researching Grok Voice is what produced this. xAI does expose a real voice stack (Voice
Agent API at $0.05/min, TTS at $4.20/M chars) and the repo is already pointed at
`grok-4.5` with a ZDR header check that matches xAI's actual contract — but a realtime
voice coach is ~$1.20/user/month against a $11.99 tier, needs per-user spend metering
that does not exist yet, and means streaming gym audio to a third party from an app
whose position is that workout content never leaves the device. On-device TTS delivers
the "coach speaks" moment for **$0** and ships today. The paid tiers stay on the plan
behind metering and a founder key.

**Two kinds are deliberately never spoken**, and both refusals are tests:

- **The closing question.** Its answer is a *tap* on a reply chip that writes today's
  check-in. Speaking a question the voice cannot hear the answer to invites the athlete
  to talk to a wall.
- **The action line.** A next step is something to re-read while deciding what to do,
  not to half-remember mid-rack. It stays on screen.

Order is the debrief's own — effort, record, band, plateau, readiness. Re-ranking for
the ear would silently escape the tone tests written against that sequence, so the
reordered variant fails a test. Nothing sayable means **silence**, not filler; the
invented-encouragement variant fails too. And speaking everything fails four.

Every caller is a button press, because iOS Safari silently drops `speak()` outside a
user gesture — a timer-driven briefing would appear to work in Chrome and do nothing on
an iPhone. Verified the whole path in a real browser by intercepting the utterance:
support detected, question and action absent, punctuation joined so facts do not run
together. Tests **774→782**.

## 2026-07-29 — The growth loop a privacy-first app is allowed to have (`.182`)

Hevy's moat is an in-app social feed. We cannot build that without breaking the one
promise the product is positioned on — workout content never leaves the device — so
this is the other half of the loop: **share OUT**. A PNG rendered on this device,
sent only when the athlete decides to send it, carrying their referral link.

Two cards from data that already existed: the session (`WorkoutVictorySummary` +
the debrief's `records`) and the week (`WeeklyDebrief.train`, which has counted PRs
since `.173` with nothing reading the number). 1080×1350 portrait, paper ground,
ink type, one poster-red band.

**The honesty rules follow the card onto the image**, because a share card is
exactly where a product starts flattering its user:

- **No records → no line.** A first-ever entry has `previous: null` and is *not* a
  record broken — the same rule `recordLine` enforces in the debrief. Falsified:
  counting first-evers fails a test.
- **Zero PRs is silence**, not "0 personal records!". Falsified: printing the zero
  fails a test.
- **A one-day streak is not a streak** worth printing.
- Contrast carries over too: poster red `#ec3013` is 3.78:1 on paper, so it is used
  only for the large kicker band with paper text on it; the PR line uses
  `--primary` `#ae1800`. The rule `index.css` documents is not suspended because the
  surface is a canvas.

Split on the usual seam — the card *data* builders are pure and tested; the canvas
painter is a thin DOM-only function, following `progressPhotos.ts`'s
`canvas.toBlob` pattern (the only client-side image code that already existed).
Sharing prefers `navigator.canShare({files})` and degrades to download + clipboard,
so a desktop browser without a share sheet still produces the image.

Brand hexes are duplicated from `check-token-sync`'s `BRAND_HEX` by necessity — a
detached canvas cannot read CSS custom properties — and that script is the guard if
the brand ever moves.

**Then I rendered one, and it was broken.** Four stats plus a PR line put the record
text at y=1280 against a footer at y=1270: they printed **on top of each other** — in
exactly the best case, a streak *and* a record, which is the session most worth
sharing. Every unit test passed the whole time, because all of them asserted the
card's *data*. This is the eighth sighting of the repo's oldest defect class: a green
suite only proves something about what it was pointed at.

Fixed by extracting `computeCardLayout` as pure and laying stats out in **two
columns**, so four fit in two rows instead of a column that walks off the bottom. The
invariant is now a test: across 1–6 stats × with/without a PR, nothing is ever
positioned below the footer baseline. Verified by rendering the real bundled source
in a real browser and **looking at the PNG** — the same way the bug was found.
Tests **766→774**.

## 2026-07-29 — The percentages were prose (`.181`)

Famous free programs, with the wave maths finally executable. The catalog already
held StrongLifts, Texas Method and Madcow free — and 5/3/1 BBB and GZCLP locked in
the premium server-only file. Meanwhile every percentage in every program lived as
**prose in `notes`** ("Ramp sets: 40%, 60%, 80%…"), because nothing had ever
materialized a percent into a weight: a famous program loaded from the catalog
prescribed `0 kg` and the wave lived in a sentence the logger cannot read.

**Promoted free:** 5/3/1 Boring But Big (new `free-531-bbb`, 4 lifts × 3 wave weeks,
12 sessions), GZCLP Linear, and the r/Fitness Basic Beginner Routine (net-new — the
most-recommended first barbell program on the internet). The deep premium catalog
(nSuns, Smolov, Sheiko) stays paid: famous entry points free, depth paid, which is
exactly the split that grew Boostcamp. New ids avoid the `pro-` prefix because
`strip-pro-programs.ts` regex-deletes those blocks from the client file — verified by
running the script: 52 kept, 0 removed.

**Per-set percentages, structurally.** `WorkoutSetTemplate` gains optional `loadPct`
— the exercise-level field cannot express 65/75/85 inside one session. 5/3/1's
training max (90% of 1RM) is **baked into the authored numbers** (85% TM is written
76.5) rather than adding a TM concept anywhere.

**Materialized at `startWorkout`, deliberately.** New pure `materializeProgram.ts`
resolves `loadPct` against `workingMaxFromHistory` — the same free e1RM the coach
uses — at the moment the workout starts, not at save time: a saved cycle keeps its
percentages, so starting it next month resolves against next month's max. Sets that
materialize are stamped `prescribed`, so the `.175` precedence holds and the
suggestion engine stays out of the way. `startWorkout` is the one seam every
caller — Builder, Today, coach cards — already flows through.

**Three refusals, each falsified:** deleting the materializer leaks `0 kg` into
prescribed sets (2 tests fail); fabricating a max on empty history — the `.127`
defect — fails the identity assertion (deepEqual, not absence-of-crash); dropping the
`prescribed` stamp fails 2. Plain templates come out **byte-identical**.

The pairing is the launch demo: **import your Hevy history (`.180`) → load 5/3/1 →
week 1 is prescribed in your own weights.** Tests **761→766**.

## 2026-07-29 — The switching moment (`.180`)

CSV import, web: a Strong or Hevy export becomes native history. Every would-be
switcher is holding one of these files — Hevy caps free history at three months and
the export is how you leave — and until now the web app had no door for it (Android
has had one since F2). One file in, and `personalRecordsFor`, `e1rmSeries` and
`loadBands` light up against years of the athlete's own training.

**A real CSV scanner, because Hevy notes contain newlines.** `text.split('\n')` —
the obvious implementation — imports a 400-session export as garbage the moment one
note wraps. Records are split by a quote-aware scanner; the falsification run replaced
it with the naive version and 7 of 11 tests fail.

**The two import paths cannot disagree.** Hevy's numeric RPE goes through
`rpeNumberToCategory` — the same mapping Android sync uses — and the test asserts it
the `.174` way: an imported session and its natively logged twin produce **identical**
`sessionLoad`. Weights convert to the athlete's display unit (kg-as-lb falsified).
Format is detected from the header, never the filename.

**Matching is never the reason a set is lost.** Catalog match by normalised name with
the "(Barbell)" parenthetical stripped; anything unmatched becomes a slug id exactly
like custom exercises. Skipped rows are counted and reported, not swallowed.

**An import is a migration, not an authority.** `mergeImportedLogs` keys identity on
(completedAt minute, name, set count): re-importing the same file is a no-op, and a
natively logged session at the same identity always wins. Falsified with id-based
identity — the no-op test fails.

Surface: one card on Profile under the backup card, mirroring its restore pattern
(write the persist payload, refresh). The `.128` storage ratchet caught the first
version's bare `localStorage` calls in review — `safeStorage` now, like everything
else. Free forever, never gated: the same contract Android's importer states.

Tests **750→761**.

