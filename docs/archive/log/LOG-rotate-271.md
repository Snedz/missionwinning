# Rotated for .271

## 2026-08-01 — Three jobs that built a different app (`.255`)

`ci-extended.yml` ran for the first time on 2026-08-01. Actions had been
billing-blocked, so a workflow the repo has carried for weeks had never executed
a single job. All three of its app-building jobs were configured wrong — in
three different ways, none of which any local run could have shown.

### The same defect, three spellings

```yaml
# e2e-critical — no VAPID key at all
env:
  PRIVATE_MODE: 'false'
  NEXT_PUBLIC_SUPABASE_URL: https://ci-placeholder.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ci-placeholder-anon-key

# visual-regression — set on the *assertion step*, after the build and the server
- name: Visual regression (@visual)
  env:
    PRIVATE_MODE: 'false'

# lighthouse-budget — nothing
```

`e2e-critical` reproduced `.249` exactly: without `NEXT_PUBLIC_VAPID_PUBLIC_KEY`,
`isPushSupported()` returns false, every component behind it renders nothing, and
*"Today shows one red action at 19:00"* asserts that one of them is mounted.

The other two are worse, because they passed.

### "No env" is not neutral on a runner

```ts
// src/lib/privateGate.ts:19-24
export function isPrivateModeEnabled(): boolean {
  const flag = process.env.PRIVATE_MODE;
  if (flag === 'false' || flag === '0') return false;
  if (flag === 'true' || flag === '1') return true;
  return process.env.NODE_ENV === 'production';
}
```

`next build` and `next start` both set `NODE_ENV=production`. So a job that sets
nothing does not get a neutral app — it gets the **gated** app, where `/` and
`/log` are absent from `PRIVATE_GATE_PUBLIC_PATHS` and redirect to `/private`.

GitHub step `env:` does not reach earlier steps, so `visual-regression`'s
`PRIVATE_MODE: 'false'` applied to the Playwright invocation and to nothing that
mattered. Both jobs built and served the teaser.

### Two checks that could not fail

`scripts/lighthouse-budget.mjs:9` scores
`['/', '/log', '/guide/human-performance', '/exercises/squats']`. Two of those
four were `/private` — the lightest page in the product, timed as if it were the
product, in a job whose whole purpose is to notice the product getting heavier.

And the `.234` baseline bootstrap wrote `home-reduced.png` as a screenshot of
`/private`, under the name of the most-linked page in the app — in the same run
that `visual.spec.ts`'s own header called *"covering it for the first time"*.

That is verbatim the laundering `.221` deleted the previous baselines to avoid:

> the obvious response to four huge visual diffs is `--update-snapshots` without
> looking, which launders whatever the app happens to render that day into the
> new truth.

It arrived through the front door instead, wearing the right filename. **Neither
of the two baselines already reviewed is affected** — `/guide` and `/exercises`
are public prefixes and rendered themselves. `home-reduced.png` must not be
committed, and the homepage remains visually unguarded until a bootstrap runs
with this fix in place.

### The one case that survived checked where it landed

`/bundle` refused to snapshot a redirect, because it compared `page.url()` to the
route it asked for. Three cases did not, and that is the difference between
catching this and enshrining it.

Every case now goes through one `shoot()` helper that compares the landing path
to the file name and refuses on a mismatch. A redirect may only *skip* if the
case states a reason — `/bundle` does (FREE_BETA), so it resumes by itself the
day Bundle ships. The env fix removes the cause we found; the landing check
catches the next one, because a baseline is precisely the artifact nobody
re-reads.

### The guard written for `.220` had the `.220` defect

`gateEnvParity.test.ts` (on #178) asserts parity between `scripts/gate.mjs` and
`.github/workflows/ci.yml`. It names the two files it was written from. There are
three files and eight jobs, and a guard that enumerates cannot notice the fourth
place this app gets built — which is exactly *a name that claims more than its
enumeration*.

New `src/lib/workflowBuildEnv.test.ts` globs `.github/workflows/*.yml` and
requires every job that runs this app to set what `gate.mjs` sets, to the same
values. Deliberately **job-level env only**: accepting env declared anywhere in
the file would have passed on two of tonight's three failures. It also asserts
its own parser is not returning an empty set, since a guard about vacuous checks
is a poor place to ship one.

Its first draft had the defect it was written about, and a mutant found it. It
decided scope by testing `/\bnpm run build\b/` against the job block, so a job
running `npx next build` with no env at all **passed** — the detector was keyed
to one spelling, which is `.212`, inside a guard written about `.220`, a few
tests after the sentence *"a guard that enumerates cannot notice a fourth"*.

So the rule is inverted: every job is in scope unless `NOT_THIS_APP` names it
with a reason. Twelve entries — the three scanners, the two cron HTTP pokes,
`apply-migration` and `sync-vercel-env` (which must **never** receive the
ci-placeholder values, so their exemption is load-bearing rather than
housekeeping), `deploy-production` (Vercel builds remotely from the real project
environment, which is correct), the three remote smokes, and the Android Gradle
job. Two tests keep the list honest: a reason has to be one, and an entry naming
a job that no longer exists fails.

A pattern list is silent about what it misses. An exemption list is covered by
default and makes leaving a thing a reviewer can disagree with.

Overlap is stated rather than left to be discovered: when #178 lands, its two env
tests are subsumed here and should be deleted; its step-parity and ordering tests
are a different question and stay. One concept, one home — `.178`.

### The secret scanner crashed on the first run of every PR

Found while driving this PR to green, and it is the same defect one layer over.

```
RequestError [HttpError]: Resource not accessible by integration
  at async Object.ScanPullRequest (…/gitleaks-action/v2/dist/index.js)
  url: https://api.github.com/repos/Snedz/missionwinning/pulls/181/commits
  status: 403
  x-accepted-github-permissions: pull_requests=read
```

Identical on #181 (run 30684203909) and #182 (run 30719575181), with the same
first-run failure on `feat/locale-export-split` and `feat/a11y-settle`. On a
`pull_request` event `gitleaks-action` lists the PR's commits so it scans only
what the PR adds; `gitleaks.yml` declared no `permissions:` block, so the job
inherited the repository default, which does not include `pull_requests`.

Every one of those failures went green on a later push and was left there. A
check people re-run until it passes is a check they have stopped reading — and
this one is the secret scanner, so the run being skipped is the one that scans a
new branch's first commits.

Fixed with least privilege stated rather than inherited: `contents: read` and
`pull-requests: read`, nothing written. No guard: unlike the silent defects
above, this one crashes loudly — it needed reading, not catching.

### Process

Third occurrence after `.202` and `.205`: I mutated `workflowBuildEnv.test.ts`
while the rework inside it was uncommitted, and `git checkout HEAD --` threw the
rework away. The rule is *commit before mutating*, and it applies to the guard
being hardened exactly as much as to the code underneath it. Twelve mutants
killed after that, all from committed states.

### Not fixed here

`ci-extended`'s `e2e-critical` failed **8** tests on that first run. This fixes
the one with a proved cause. The other seven — four `premium-gate`, one `growth`,
one `hero-flows`, one `premium-pillars` — are unread data and are being triaged
separately rather than assumed to be env.
