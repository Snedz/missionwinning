# Rotated from LOG.md for `.894`

## 2026-08-16 — Horizon W is scored (`.876`)

**Founder scored the phone path `pass`.** `docs/EXCELLENCE_RESULT.md` status
`unscored` → `pass`, `scored_by` Snedz, on the Vercel Preview of `18737b0`
(deployed 19:27Z). Production could not have been the surface: `PRIVATE_MODE`
is on there and `/` serves the `/private` teaser. Preview is ungated by
construction — `VERCEL_ENV === 'preview'` short-circuits ahead of the flag in
both `privateModeFlag.ts` and its `next.config.js` mirror — so `pwaDisabled`
is false and Serwist builds, which is the only configuration where the
installable PWA and the offline promise are on a phone at all. The agent
transcribed the value and shipped the rest; the per-criterion lines stay empty
because they are the founder's observations and inventing them would be the
whole point of the rule.

**What this unlocks:** surface paths stop needing `Excellence-Override`, and
that now means something — `.874` stopped a branch borrowing a trailer from
`master`, so the next one written will be a decision rather than an inheritance.
`firstCriticalGap` returns `null` for the first time and `route.ts` already had
the answer: *"Horizon W instruments are green and RESULT is pass — stop, do not
invent a letter."* Confirmed by running `npm run harness`, not by reading it.

**The green test that would have gone red on the founder doing their job.**
`criticalPath.test.ts` asserted `excellenceStatusAt(root) === 'unscored'`
against the live repo — pinning, as a fact, the one value the whole gate exists
for the founder to change. It is `.220`'s shape wearing different clothes: not
a check that stopped asking, but a check whose passing depended on the work
never being finished. The house rule bans date literals in fixtures because a
test with an expiry date is a liability; this had an expiry *event*, which is
worse, because nothing on the calendar warns you it is coming.

Rewritten to the durable rule instead of the current reading. W1–W4 are checked
on the live tree, where instruments decide them. C5's dependence on status is
proved with fixtures in all three states (`pass` / `fail` / `unscored`), and the
live assertion is now *computed* — `isStepProven(C5) === (status === 'pass')` —
so it holds whichever value is committed. A third case pins both ends of the
gap: `unscored` yields a founder-owned C5, `pass` yields `null`. **4 mutants
killed** (C5 always proven, C5 never proven, status reader hardcoded to pass,
gap loses founder ownership). File 4 → 6 tests.

**Ship:** RESULT `pass` + provenance · `criticalPath.test.ts` de-pinned.

Label `.876` (onto `.875`).

Rotated LOG oldest → [docs/archive/log/LOG-rotate-861-for-876.md](docs/archive/log/LOG-rotate-861-for-876.md).
