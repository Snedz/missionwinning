# PLAN — Month they own (`.1018`)

**Status:** Frozen. One daily. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1018`.
**Base:** master `8a606a12` — Last cite is BW, not 0, on empty load (`.1017`).
**Do not smash:** `.1017` empty-load cite, `.1016` session-file, `.1015` assisted cite, `.1014` duration cite, `.1013` import, `.1012` historySessionLabel, `.1011` export, `.1010` Library tomb skip, `.1009` BW cite.

---

## The one thing

A quiet offline month on History that they own.

The existing grid already marks trained days. Missing is Hevy's steal: tap a date, see that day's live sessions, open the row they already have. Lightweight facts already in the logs — session count, not a fire count. Empty month stays calm. Tombs stay out.

## Why this, why now

History first paint is the list. The calendar in Show all cannot open a day. `MonthDay.sessions` is always 0. Start-from already folds week 1 — it must not erase the month they own. Search stays a query. Charts stay unfiltered.

`#844` took `.1017` for empty-load Last cite. This hop restamps to `.1018`.

## In / out

**In**

- History Show-all month grid: dates with live sessions are tappable.
- Quiet month prev / next (already there).
- Per-day facts already on the log: live session count (set count when they open the row).
- Tap a date → that day's live rows → existing History detail.
- Live sessions only. Tombs excluded.
- Start-history fold never hides a month mark or a day row.
- Search remains the query box. Charts stay on the full live diary.
- Empty / missing / junk date invents nothing. Empty month invents nothing.
- History / Show-all door. Guest. First set stays ungated.

**Out**

- Today chrome. A second Start. `/private` leak.
- Fire count, shame, ordinal, badges, goals, pass-fail.
- Feed, share, public URL, day-replay permalink as the tap.
- Fuel / Mind as the month fact (pillar-win "logged" marks may stay; they are not the steal).
- Empty-load cite (already `.1017`). Session-file (already `.1016`). Assisted cite. Duration cite. Import. Export.
- Counsel-hold. Mind. Promote.
- Live www stays `.696`.

## Done when

1. A live session marks its local day and a tap lists that row.
2. A tomb on that day does not mark the day and does not appear.
3. Start-from fold still hides week-strip days; the month still shows the older live day.
4. Search query is unchanged by a date tap. Charts still read the unfiltered live diary.
5. Empty month / empty day invents nothing — no missed, no fire count.
6. History Show-all mounts the door. Today still has one Start. No Feed. No `/private`.
7. First set stays ungated. No login wall.
8. Empty-load cite `.1017` through BW cite `.1009` still mount.

## Verify

- `src/lib/history/monthTheyOwn.test.ts` — live vs tomb, fold ignored, empty invents nothing.
- `src/lib/history/monthTheyOwnSurface.test.ts` — History-only; Today lean; first-set ungated; no fire-count tokens; session-file stays; empty-load cite stays.
- `npx tsx --test src/lib/firstSetUngated.ts` green.
- `npx tsc --noEmit` green.
- `npx tsx scripts/check-build-label.mjs` — `.1018` > master `.1017`.
