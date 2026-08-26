# PLAN — This session as a file they own (`.1016`)

**Status:** Frozen. One daily. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1016`.
**Base:** master `4046afd9` — Next cite is BW, not 0 kg, on assisted 0 (`.1015`).
**Do not smash:** `.1015` assisted cite, `.1014` duration cite, `.1013` import, `.1012` historySessionLabel, `.1011` export, `.1010` Library tomb skip, `.1009` BW cite.

---

## The one thing

Tuesday's receipt is a local file they own.

Full-diary dump is `.1011`. The complementary door is one finished session as CSV (JSON if the same rows). Strong share is a public link. Hevy share lets the other person save it. We give them the finished session as a file. No public URL.

## Why this, why now

`.1011` writes the whole live diary. `.1013` reads that file back. Missing is the receipt of *this* session — one file, one log, History detail.

## In / out

**In**

- History detail (finished-session sheet) saves THAT session as CSV.
- JSON if the same rows as export (`.1011` columns).
- Reuse `decideExportDiary` filtered to one session, or a thin helper that shares its columns.
- The file re-imports via `.1013` if they want it back.
- Empty / missing / tomb invents nothing — Save disabled.
- Honest logged columns only. No invented 1RM or duration.
- History / session detail door. Guest. First set stays ungated.

**Out**

- Share link, email, Feed, Discord, clipboard permalink, public URL.
- Full-diary dump (already `.1011`). Re-import (already `.1013`).
- Assisted cite (already `.1015`). Duration cite (already `.1014`).
- Today chrome. `/private`. Counsel-hold. Mind. Promote.
- Live www stays `.696`.

## Done when

1. One live session writes a file of only that session's live rows.
2. A second live session is not in the file.
3. Tomb / empty / missing Save is disabled and invents nothing.
4. The file parses through `decideImportDiary` (`.1013`).
5. History detail mounts the door. Today still has one Start. No Feed. No `/private`.
6. First set stays ungated. No login wall.
7. Export `.1011` and import `.1013` still mount. Assisted cite `.1015` and duration cite `.1014` stay.

## Verify

- `src/lib/history/exportSession.test.ts` — one session only, tomb/empty disabled, columns shared, re-import via `.1013`.
- `src/lib/history/exportSessionSurface.test.ts` — History detail mounts; Today lean; first-set ungated; export / import stay.
- `npx tsx --test src/lib/firstSetUngated.ts` green.
- `npx tsx scripts/check-build-label.mjs` — `.1016` > master `.1015`.
