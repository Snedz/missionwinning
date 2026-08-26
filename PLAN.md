# PLAN — Our export comes back (`.1013`)

**Status:** Frozen. One daily. **Horizon 0.** Wedge: Train + Coach.
**Frozen:** 2026-08-26. **Ship-as:** `.1013`.
**Base:** master `aa23a539` — This-movement title is the date or the name (`.1012`).
**Do not smash:** `.1012` this-movement title (`historySessionLabel`), `.1011` export door, `.1010` Library tomb skip, `.1009` BW cite.

---

## The one thing

The file they just saved is a diary they can open again.

Export this diary (`.1011`) writes a CSV of their local history. Without a matching door back in, that file is a souvenir. This daily is the confirm-gated re-import of **our** export — not Hevy import, not a second diary, not a sync product.

## Why this, why now

`.1011` closed the write. The complementary read is the next honest step on the same diary. Merge #839 already took `.1012` for the this-movement title. This is the next stamp.

## In / out

**In**

- Confirm-gated import of the Mission Winning export file (`.1011` CSV; JSON if the same rows).
- Merge / upsert by session identity. Default. No silent wipe.
- Replace, if present, is a second named confirm. Never the default.
- Empty or garbage invents nothing.
- Honest columns only. No invented 1RM, duration, PRs, or sessions.
- History door only. Guest. First set stays ungated.

**Out**

- Hevy / Strong / any other product's file.
- Today chrome, Feed, `/private`.
- Counsel-hold, Mind, cloud sync, account.
- Promote. Live www stays `.696`.

## Done when

1. A `.1011` export file re-imports into local history after confirm.
2. Cancel leaves history unchanged.
3. Empty / garbage / wrong-header files invent nothing.
4. Merge does not duplicate an already-present session.
5. Replace never writes on the first click.
6. Tombs stay tombs unless the file has a restored live row.
7. History mounts the door. Today still has one Start. No Feed. No `/private`.
8. First set stays ungated. No login wall.

## Verify

- `src/lib/history/importDiary.test.ts` — empty, garbage, Hevy, Strong, round-trip, cancel, merge, tomb, replace-is-second-confirm.
- `src/lib/history/importDiarySurface.test.ts` — History mounts; Today lean; first-set ungated; export `.1011` still mounts.
- `npx tsx --test src/lib/firstSetUngated.ts` green.
- `npx tsx scripts/check-build-label.mjs` — `.1013` > master `.1012`.
