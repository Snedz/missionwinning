# Rotated from LOG.md when `.866` landed

## 2026-08-15 — Each closed loop writes a lesson the next spawn can see (`.851`)

A verdict the next harvest cannot see is a diary. GNT-1 and GNT-2 closed at
`ready-for-founder` with no `V-NN`, so `idea:next` could re-propose the same
wrong brief. `settles` must be an `H-NN`; pretending a campaign settled one
is how a ledger starts lying.

**Ship:** `src/lib/ideaGraph/learn.ts`. Campaign verdicts (`campaign: GNT-n`)
and hypothesis verdicts. Failed hypotheses join the refuse list by fingerprint.
Settled ones stop being candidates even if their file still says so. `npm run
graph` prints the lessons and, on harvest, the `idea:next` pick. It still does
not write the queue. `V-01` GNT-1 · `V-02` GNT-2.

**6 mutants killed** — fail does not rewrite status · pass rewritten as killed
· no fingerprint extracted · similar candidate still emitted · same id still
emitted · covered campaign reported missing.

Label `.851` (onto master `.850`).

Excellence-Override: dev tooling, no product surface (RESULT unscored)

Rotated LOG oldest → [docs/archive/log/LOG-rotate-836-for-851.md](LOG-rotate-836-for-851.md).
