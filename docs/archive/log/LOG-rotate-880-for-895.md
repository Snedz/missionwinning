# Rotated from LOG.md for `.895`

## 2026-08-16 — Coverage could not see the overlay that existed (`.880`)

`npm run i18n:coverage` (cap 0) has been red on every PR because it walked
`LOCALE_EXPORTS` plus bootstrap and core, and stopped there. The first-class
overlay (`firstClassLocales.ts` — locale chooser, and the rest of the
root-layout-safe strings) is **not** in that list, on purpose: locale-split
and the bundle budget forbid a value-import of those bodies on the layout
path. The ratchet therefore reported keys that already existed. Hydrate had
the same hole — `mergeFirstClassStrings` was never called — so the runtime
fell through to the English `defaultValue` in every language even after the
overlay was written.

That is a check keyed to one spelling of "where English lives". The packs
are one spelling. The overlay is the other. A guard that only opens the
export manifest cannot notice the overlay, so it goes red on work that
already shipped, and the hydrate path never delivers that work either.

The overlay is now in `englishKeys()` and merged last at hydrate so it wins
on collision. Keys that really had no catalog (bundle shop, Victory receipt,
re-entry quiet line, field-test receipt strings that lived only in the
unhydrated `fieldTestLocales` overlay, server chrome, and the rest) are in
the packs hydrate already walks. The week-diff headline was a runtime
ternary in one key — the same class as `moveSubtitleDepth` — split to
`coachWeekDiffHeadlineOne` / `Many` with two literal call sites.

Cap stays 0. Do not raise it. #725 catalogues the same keys by stuffing
`fieldTestLocales` into `LOCALE_EXPORTS`; that fights the overlay contract
and still does not hydrate first-class. Close it when this lands.

`.877`–`.879` are reserved by the open Victory stack (#726–#728). This
branch is off `master` (`.876`).

**Ship:** coverage sees first-class · hydrate merges it · leftover keys
catalogued · week-diff headline split.

Label `.880` (onto master `.876`).

Rotated LOG oldest → [docs/archive/log/LOG-rotate-862-for-880.md](docs/archive/log/LOG-rotate-862-for-880.md).
