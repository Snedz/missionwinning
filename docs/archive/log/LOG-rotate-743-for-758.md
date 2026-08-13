## 2026-08-13 — Cursor-local CI: unblock build-and-test without burning Actions minutes (`.743`)

GitHub Actions minutes are exhausted. ~50 draft PRs showed `build-and-test` red.
The shared cause on `master` was not quota: `src/lib/readinessDisplay.test.ts`
used `require()`, which `@typescript-eslint/no-require-imports` fails, so every
PR died at Lint before typecheck/tests. Replaced with ESM imports. Test kept.

While minutes are red, the merge bar is **Cursor-local green** (`npm test`,
lint, typecheck, excellence) + craft LGTM — [docs/CI_LOCAL.md](docs/CI_LOCAL.md).
Actions red is not a product fail. `[skip vercel]` unless the founder asked for
a Preview. Security jobs (gitleaks / CodeQL / aikido) stay on.

**Workflow tighten (no new paid minutes):** `ci.yml` + `ratchets.yml` skip
docs-only paths; `aikido.yml` gained concurrency cancel-in-progress. gitleaks
does not inherit the docs skip.

**i18n (same ship, still `.743`):** after lint cleared, `i18n:parity` /
`i18n:coverage` were the next shared reds on master — Learn beachhead over the
40% placeholder cap, and three UI keys (`todayCoachChipAction`,
`activeReentryStart`, `activeReentryStartDesc`) used with `defaultValue` but
missing from every EN pack. Caps stayed 40% / 0. Keys filled; es/fr/pt
translated. Did not raise the ratchets.

**Bundle budget** (`/log` 286.5 vs 280, `/active` 448.7 vs 435) is already red
on `master` at the same numbers — a CI-matching `PRIVATE_MODE=false` build.
Did not raise the caps. Separate size pass; not this merge bar.

Label `.743` (onto master `.714`). Excellence-Override below.

Excellence-Override: local CI unblock

Rotated LOG oldest → [docs/archive/log/LOG-rotate-669-for-743.md](docs/archive/log/LOG-rotate-669-for-743.md). · [`.714` for `.757`](docs/archive/log/LOG-rotate-714-for-757.md).
