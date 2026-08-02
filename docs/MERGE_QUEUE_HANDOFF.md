# Merge queue handoff — open PRs, label collisions, merge order

> Written 2026-08-02 against `master` at **`2026.07-unified.243`** (`67ed1d56`).
> Supersedes nothing; delete this file once the queue below is empty.

Ten substantive PRs are open and none of them can merge as they stand. This file says why, in
what order to land them, and which traps have already been paid for once.

---

## 1. The blocker: nine PRs are numbered below `master`

`#188` merged on 2026-08-02 carrying four builds (`.240`–`.243`), which took `master` from `.224`
straight to **`.243`**. It merged **out of the order the queue was numbered for**. Nine open PRs
were numbered `.225`–`.239` before that happened, so every one of them now sits *below* the base.

[`scripts/check-build-label.mjs`](../scripts/check-build-label.mjs) checks, against the merge base:

> 1. the label is strictly greater than the base branch's
> 2. `LOG.md` and `CONTEXT.md` actually mention it

**Nine PRs fail rule 1 today.** This is not a merge conflict and `git` will not tell you about it —
the gate fails at step 2 of `npm run gate`, or on CI, with `✗ 2026.07-unified.2NN is not greater
than base`.

| PR | Branch | Label | Status |
|---|---|---|---|
| **#178** | `feat/wind-down-nudge-5o3fpb` | `.244`–`.251` | **mergeable now** — the only one above `.243` |
| #190 | `chore/repo-security-private-repo` | `.225` | blocked on label |
| #187 | `claude/test-coverage-analysis-wdti6s` | `.226` | blocked on label |
| #179 | `feat/locale-export-split` | `.232` | blocked on label |
| #180 | `feat/a11y-settle` | `.233` | blocked on label |
| #181 | `feat/visual-baselines` | `.234` | blocked on label |
| #182 | `fix/ci-extended-env-parity` | `.235` | blocked on label |
| #183 | `fix/coach-missed-card-contrast` | `.236` | blocked on label + see §5 |
| #184 | `fix/the-suite-that-never-ran` | `.237` | blocked on label |
| #189 | `fix/guidebook-hero-palette` | `.238`–`.239` | blocked on label (2-build stack) |

Also open: **#120** (close it — see §6) and **ten dependabot PRs** (#75, #76, #77, #80, #81, #110,
#111, #112, #116, #117, #176), untriaged.

---

## 2. The fix, in order

**Merge `#178` first.** At `.251` it is the only PR that legally clears `.243`. That takes
`master` to `.251`.

**Then renumber the remaining nine to `.252`–`.260`**, in this order, and merge them one at a time:

| Order | PR | New label |
|---|---|---|
| 1 | #190 | `.252` |
| 2 | #187 | `.253` |
| 3 | #179 | `.254` |
| 4 | #180 | `.255` |
| 5 | #181 | `.256` |
| 6 | #182 | `.257` |
| 7 | #183 | `.258` |
| 8 | #184 | `.259` |
| 9 | #189 | `.260`–`.261` (2 builds) |

They **cannot** reuse `.244`–`.251` — those belong to `#178`'s stack. Nothing in the repo enforces
uniqueness of a historical label, so a reused number produces two `LOG.md` entries under one
heading and the version silently stops being a key into the record. That has already happened once
in this queue and cost a full renumbering pass.

**One at a time is not optional.** `CONTEXT.md` `## Now` sits at exactly **25/25 bullets**
(`src/lib/contextBudget.test.ts`), so every merge forces the *next* PR to rotate a different
bullet out. Batch them and they conflict on the rotation, not on the code.

---

## 3. How to renumber a branch — and the trap

Change **all** of these:

- `src/lib/buildInfo.ts` — `APP_BUILD_LABEL`
- `LOG.md` — the `## YYYY-MM-DD — Title (`.N`)` heading
- `CONTEXT.md` — the `## Now (… web `2026.07-unified.N` …)` header **and** the ship bullet
- `CONTEXT.md` — the rotation ledger line (`` `.N` moved `.M` ``)
- `docs/archive/CONTEXT-now-2026-07-30.md` — the header's rotation list
- **every source-comment citation of that number** — `src/`, `scripts/`, `.github/`, tests

**The trap is that last one.** `check-build-label.mjs` only verifies the label appears in `LOG.md`
and `CONTEXT.md`. Source comments citing the old number go stale **silently** — the gate passes,
the full test suite passes, and CI goes green over comments naming a build that no longer exists.
This happened during this queue's cleanup: one renumber left **21 stale references across 20
files** and everything reported green.

Before pushing a renumber, check for leftovers:

```bash
git grep -c '`\.<old>`' -- src scripts .github tests docs CONTEXT.md LOG.md
```

Verify every hit is a self-reference before rewriting it — some citations legitimately point at
*other* builds and must not move.

---

## 4. How to bring a branch onto `master`

**Merge, never rebase.** These branches are pushed and have open PRs; rebasing needs a
force-push.

```bash
git fetch origin master
git switch <branch>
git merge origin/master          # plain push afterwards
```

Expect conflicts in exactly four files, and resolve them this way:

| File | Resolution |
|---|---|
| `LOG.md` | keep **both** entries, newest first |
| `CONTEXT.md` `## Now` | keep both bullets; take `master`'s Status table rows (they are the measured ones); rotate the oldest *shipped* bullet to stay at 25 |
| `docs/archive/CONTEXT-now-2026-07-30.md` | keep both rotated bullets, ascending; update the header's rotation list |
| `src/lib/buildInfo.ts` | the branch's label (it must exceed `master`'s) |

**Never blanket-resolve `.github/workflows/ci.yml`.** Taking `master`'s whole file is correct when
the difference is only the VAPID placeholder comment — and wrong when the branch's `ci.yml`
carries feature work. `#178`'s `.250` added four CI steps (`bundle-budget`,
`check-design-system`, `check-locale-split`, `i18n:coverage`); `git checkout --theirs` discarded
all four, and only `src/lib/gateEnvParity.test.ts` caught it. **Diff before choosing a side.**

Verify before pushing:

```bash
git fetch origin master     # mandatory — a stale origin/master false-passes the label check
node scripts/check-build-label.mjs
npm test && npm run typecheck && npm run lint && npm run test:routes
```

---

## 5. `#183` — still worth landing, and why

`#188` and `#183` independently fixed the same defect: `opacity-60` on the missed state of
[`PlanSessionCard.tsx`](../src/components/coach/PlanSessionCard.tsx), which composites the card's
text toward the ground and drops the muscle badges to **2.97:1**.

`#188` won the race and put `border-2 border-dashed border-border bg-transparent` on `master` —
**visual only**. `#183` has `border-2 border-border bg-transparent` **plus a `coachSessionMissed`
badge**.

`master` today contains **zero** references to `coachSessionMissed`. Opacity conveyed the state to
sighted users only; a border alone conveys it to nobody. **Keep `#183`'s badge** — it is the only
version that puts the state in the accessibility tree, and the key already exists in every locale
pack because `WeekStrip.tsx` has used it since it was written. The border style is taste; the
badge is the substance.

---

## 6. Recommended closes

- **#120** (`chore/github-security-hardening`) — **close, do not rebase.** ~100 commits behind,
  and every doc change now asserts a false state: `SECRETS.md` ticks `[x]` for push protection and
  code scanning, `controls.yaml` records CodeQL default setup as compliance evidence, and
  `SECURITY.md` makes a 404ing advisory link the preferred channel. All four became untrue when
  the repo went private. It also adds a `dependency-review.yml` that cannot run on a private repo.
- **The ten dependabot PRs** — untriaged, several superseded by each other. Worth one batch pass
  after the queue above is empty, not before.

---

## 7. Re-deriving this state later

This file goes stale the moment anything merges. To rebuild the picture from scratch:

```bash
git fetch origin --prune
git show origin/master:src/lib/buildInfo.ts | grep -o 'unified\.[0-9]*'

for b in $(git branch -r --format='%(refname:short)' | grep -v HEAD); do
  printf '%-50s %s\n' "$b" "$(git show $b:src/lib/buildInfo.ts 2>/dev/null | grep -o 'unified\.[0-9]*')"
done
```

**Any branch whose number is ≤ `master`'s must be renumbered before it can merge.** To find
label collisions between branches — the failure that produced this queue — compare the `LOG.md`
headings each branch adds beyond `master`; every branch must contribute a disjoint set.
