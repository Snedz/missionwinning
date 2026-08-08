# CONTEXT.md — boot file (read first, every tool)

One screen of truth for any AI tool or human joining cold. Read this, then [AGENTS.md](AGENTS.md), then [INDEX.md](INDEX.md). Keep `## Now` current: update it on every ship, in the same commit as the [LOG.md](LOG.md) entry.

---

## What this is

**Mission Winning** · www.missionwinning.com · "Train Anywhere. Win Daily."

> Adaptive AI coaching for train-anywhere athletes — free offline logging (no account), weekly plans from logs alone (no wearable). Super Bundle adds Coach depth and the other pillars — it never gates the logger.

- Six pillars — Train · Fuel · Move · Mind · Track · Learn — unified by the Mission Score. Constitution: [vision.md](vision.md). Pitch the **Train + Mission Coach wedge**, never "everything app" ([docs/YC_THESIS.md](docs/YC_THESIS.md)). Evidence thesis (structured exercise vs vague advice — not a depression product): [docs/EXERCISE_AS_MEDICINE.md](docs/EXERCISE_AS_MEDICINE.md). Crypto is a **payment rail** (Lifetime USDC), not the product ([docs/CRYPTO_RAILS_THESIS.md](docs/CRYPTO_RAILS_THESIS.md)).
- Surfaces: Next.js 16 PWA (repo root) · native Android Compose ([apps/android](apps/android), v1.24.1) · iOS deferred ([docs/IOS_PLAYBOOK.md](docs/IOS_PLAYBOOK.md)) · "Beyond the Basics" guidebook (`/guide` + magazine PDF).
- Solo founder + AI agents. Founder owns users, money, legal, secrets, `PRIVATE_MODE`. Agents own code, tests, perf, docs — inside horizon gates.

---

## Now (2026-08-08 · web `2026.07-unified.604` · Android `1.24.1`)

> The ONLY "where we are" block in the repo — [ORCHESTRATION.md](ORCHESTRATION.md) points here.
>
> **Budget: ≤25 bullets.** Enforced by `src/lib/contextBudget.test.ts`. When over,
> rotate the oldest *shipped* entries to `docs/archive/` — `.203` moved `.123`–`.189`,
> `.207` moved `.190`–`.193`, `.211` moved `.194`–`.197`, `.215` moved `.198`
> `.216` moved `.200`, `.217` moved `.199`, `.218` moved `.201`, `.219` moved `.202`
> `.220` moved `.203`, `.221` moved `.204`, `.222` moved `.205`, `.223` moved `.206`,
> `.224` moved `.207`, `.240` moved `.208`, `.241` moved `.209`–`.210`, `.242` moved `.211`,
> `.243` moved `.212`, `.251` moved `.213`–`.218` and `.252` moved `.219`
> and `.253` moved `.220`
> and `.254` moved `.221`
> and `.255` moved `.222`
> and `.256` moved `.223`
> and `.257` moved `.224`
> and `.259` moved `.241`–`.240`
> and `.262` moved `.242`
> and `.263` moved `.246`–`.247`
> and `.265` moved `.244`
> and `.278` dropped `.263` detail (full text remains in LOG.md)
> and `.279` dropped `.264` detail (full text remains in LOG.md)
> and `.280` dropped `.265` detail (full text remains in LOG.md)
> and `.281` dropped `.266` detail (full text remains in LOG.md)
> and `.282` dropped `.267` detail (full text remains in LOG.md / archive)
> and `.283` dropped `.268` detail (full text remains in LOG.md / archive)
> and `.284` dropped `.269` detail (full text remains in LOG.md / archive)
> and `.285` dropped `.270` detail (full text remains in LOG.md / archive)
> and `.286` dropped `.271` detail (full text remains in LOG.md / archive)
> and `.287` dropped `.272` detail (full text remains in LOG.md / archive)
> and `.288` dropped `.273` detail (full text remains in LOG.md / archive)
> and `.289` dropped `.274` detail (full text remains in LOG.md / archive)
> and `.290` dropped `.275` detail (full text remains in LOG.md / archive)
> and `.291` dropped `.276` detail (full text remains in LOG.md / archive)
> and `.292` dropped `.277` detail (full text remains in LOG.md / archive)
> and `.293` dropped `.278` detail (full text remains in LOG.md / archive)
> and `.294` dropped `.279` detail (full text remains in LOG.md / archive)
> and `.295` dropped `.280` detail (full text remains in LOG.md / archive)
> and `.296` dropped `.281` detail (full text remains in LOG.md / archive)
> and `.297` dropped `.282` detail (full text remains in LOG.md / archive)
> and `.298` dropped `.283` detail (full text remains in LOG.md / archive)
> and `.299` dropped `.284` detail (full text remains in LOG.md / archive)
> and `.300` dropped `.285` detail (full text remains in LOG.md / archive)
> and `.301` dropped `.286` detail (full text remains in LOG.md / archive)
> and `.302` dropped `.287` detail (full text remains in LOG.md / archive)
> and `.303` dropped `.288` detail (full text remains in LOG.md / archive)
> and `.304` dropped `.289` detail (full text remains in LOG.md / archive)
> and `.305` dropped `.290` detail (full text remains in LOG.md / archive)
> and `.306` dropped `.291` detail (full text remains in LOG.md / archive)
> and `.307` dropped `.292` detail (full text remains in LOG.md / archive)
> and `.308` dropped `.293` detail (full text remains in LOG.md / archive)
> and `.309` dropped `.294` detail (full text remains in LOG.md / archive)
> and `.310` dropped `.295` detail (full text remains in LOG.md / archive)
> and `.311` dropped `.296` detail (full text remains in LOG.md / archive)
> and `.312` dropped `.297` detail (full text remains in LOG.md / archive)
> and `.313` dropped `.298` detail (full text remains in LOG.md / archive)
> and `.314` dropped `.299` detail (full text remains in LOG.md / archive)
> and `.315` dropped `.300` detail (full text remains in LOG.md / archive)
> and `.316` dropped `.301` detail (full text remains in LOG.md / archive)
> and `.317` dropped `.302` detail (full text remains in LOG.md / archive)
> and `.318` dropped `.303` detail (full text remains in LOG.md / archive)
> and `.319` dropped `.304` detail (full text remains in LOG.md / archive)
> and `.320` dropped `.305` detail (full text remains in LOG.md / archive)
> and `.321` dropped `.306` detail (full text remains in LOG.md / archive)
> and `.322` dropped `.307` detail (full text remains in LOG.md / archive)
> and `.323` dropped `.308` detail (full text remains in LOG.md / archive)
> and `.324` dropped `.309` detail (full text remains in LOG.md / archive)
> and `.325` dropped `.310` detail (full text remains in LOG.md / archive)
> and `.326` dropped `.311` detail (full text remains in LOG.md / archive)
> and `.327` dropped `.312` detail (full text remains in LOG.md / archive)
> and `.328` dropped `.313` detail (full text remains in LOG.md / archive)
> and `.329` dropped `.314` detail (full text remains in LOG.md / archive)
> and `.330` dropped `.315` detail (full text remains in LOG.md / archive)
> and `.331` dropped `.316` detail (full text remains in LOG.md / archive)
> and `.332` dropped `.317` detail (full text remains in LOG.md / archive)
> and `.333` dropped `.318` detail (full text remains in LOG.md / archive)
> and `.334` dropped `.319` detail (full text remains in LOG.md / archive)
> and `.335` dropped `.320` detail (full text remains in LOG.md / archive)
> and `.336` dropped `.321` detail (full text remains in LOG.md / archive)
> and `.337` dropped `.322` detail (full text remains in LOG.md / archive)
> and `.338` dropped `.323` detail (full text remains in LOG.md / archive)
> and `.339` dropped `.324` detail (full text remains in LOG.md / archive)
> and `.340` dropped `.325` detail (full text remains in LOG.md / archive)
> and `.341` dropped `.326` detail (full text remains in LOG.md / archive)
> and `.342` dropped `.327` detail (full text remains in LOG.md / archive)
> and `.343` dropped `.328` detail (full text remains in LOG.md / archive)
> and `.344` dropped `.329` detail (full text remains in LOG.md / archive)
> and `.345` dropped `.330` detail (full text remains in LOG.md / archive)
> and `.346` dropped `.331` detail (full text remains in LOG.md / archive)
> and `.347` dropped `.332` detail (full text remains in LOG.md / archive)
> and `.348` dropped `.333` detail (full text remains in LOG.md / archive)
> and `.349` dropped `.334` detail (full text remains in LOG.md / archive)
> and `.350` dropped `.335` detail (full text remains in LOG.md / archive)
> and `.351` dropped `.336` detail (full text remains in LOG.md / archive)
> and `.352` dropped `.337` detail (full text remains in LOG.md / archive)
> and `.353` dropped `.338` detail (full text remains in LOG.md / archive)
> and `.354` dropped `.339` detail (full text remains in LOG.md / archive)
> and `.355` dropped `.340` detail (full text remains in LOG.md / archive)
> and `.356` dropped `.341` detail (full text remains in LOG.md / archive)
> and `.357` dropped `.342` detail (full text remains in LOG.md / archive)
> and `.358` dropped `.343` detail (full text remains in LOG.md / archive)
> and `.359` dropped `.344` detail (full text remains in LOG.md / archive)
> and `.360` dropped `.345` detail (full text remains in LOG.md / archive)
> and `.361` dropped `.346` detail (full text remains in LOG.md / archive)
> and `.362` dropped `.347` detail (full text remains in LOG.md / archive)
> and `.363` dropped `.348` detail (full text remains in LOG.md / archive)
> and `.364` dropped `.349` detail (full text remains in LOG.md / archive)
> and `.365` dropped `.350` detail (full text remains in LOG.md / archive)
> and `.366` dropped `.351` detail (full text remains in LOG.md / archive)
> and `.367` dropped `.352` detail (full text remains in LOG.md / archive)
> and `.368` dropped `.353` detail (full text remains in LOG.md / archive)
> and `.369` dropped `.354` detail (full text remains in LOG.md / archive)
> and `.370` dropped `.355` detail (full text remains in LOG.md / archive)
> and `.371` dropped `.356` detail (full text remains in LOG.md / archive)
> and `.372` dropped `.357` detail (full text remains in LOG.md / archive)
> and `.373` dropped `.358` detail (full text remains in LOG.md / archive)
> and `.374` dropped `.359` detail (full text remains in LOG.md / archive)
> and `.375` dropped `.360` detail (full text remains in LOG.md / archive)
> and `.376` dropped `.361` detail (full text remains in LOG.md / archive)
> and `.377` dropped `.362` detail (full text remains in LOG.md / archive)
> and `.378` dropped `.363` detail (full text remains in LOG.md / archive)
> and `.379` dropped `.364` detail (full text remains in LOG.md / archive)
> and `.380` dropped `.365` detail (full text remains in LOG.md / archive)
> and `.381` dropped `.366` detail (full text remains in LOG.md / archive)
> and `.382` dropped `.367` detail (full text remains in LOG.md / archive)
> and `.383` dropped `.368` detail (full text remains in LOG.md / archive)
> and `.384` dropped `.369` detail (full text remains in LOG.md / archive)
> and `.385` dropped `.370` detail (full text remains in LOG.md / archive)
> and `.386` dropped `.371` detail (full text remains in LOG.md / archive)
> and `.387` dropped `.372` detail (full text remains in LOG.md / archive)
> and `.388` dropped `.373` detail (full text remains in LOG.md / archive)
> and `.389` dropped `.374` detail (full text remains in LOG.md / archive)
> and `.390` dropped `.375` detail (full text remains in LOG.md / archive)
> and `.391` dropped `.376` detail (full text remains in LOG.md / archive)
> and `.392` dropped `.377` detail (full text remains in LOG.md / archive)
> and `.393` dropped `.378` detail (full text remains in LOG.md / archive)
> and `.394` dropped `.379` detail (full text remains in LOG.md / archive)
> and `.395` dropped `.380` detail (full text remains in LOG.md / archive)
> and `.396` dropped `.381` detail (full text remains in LOG.md / archive)
> and `.397` dropped `.382` detail (full text remains in LOG.md / archive)
> and `.398` dropped `.383` detail (full text remains in LOG.md / archive)
> and `.399` dropped `.384` detail (full text remains in LOG.md / archive)
> and `.400` dropped `.385` detail (full text remains in LOG.md / archive)
> and `.401` dropped `.386` detail (full text remains in LOG.md / archive)
> and `.402` dropped `.387` detail (full text remains in LOG.md / archive)
> and `.403` dropped `.388` detail (full text remains in LOG.md / archive)
> and `.404` dropped `.389` detail (full text remains in LOG.md / archive)
> and `.405` dropped `.390` detail (full text remains in LOG.md / archive)
> and `.406` dropped `.391` detail (full text remains in LOG.md / archive)
> and `.407` dropped `.392` detail (full text remains in LOG.md / archive)
> and `.408` dropped `.390` detail (full text remains in LOG.md / archive)
> and `.409` dropped `.394` detail (full text remains in LOG.md / archive)
> and `.410` dropped `.395` detail (full text remains in LOG.md / archive)
> and `.411` dropped `.396` detail (full text remains in LOG.md / archive)
> and `.412` dropped `.397` detail (full text remains in LOG.md / archive)
> and `.413` dropped `.398` detail (full text remains in LOG.md / archive)
> and `.414` dropped `.399` detail (full text remains in LOG.md / archive)
> and `.415` dropped `.400` detail (full text remains in LOG.md / archive)
> and `.416` dropped `.401` detail (full text remains in LOG.md / archive)
> and `.417` dropped `.402` detail (full text remains in LOG.md / archive)
> and `.418` dropped `.403` detail (full text remains in LOG.md / archive)
> and `.419` dropped `.404` detail (full text remains in LOG.md / archive)
> and `.420` dropped `.405` detail (full text remains in LOG.md / archive)
> and `.421` dropped `.406` detail (full text remains in LOG.md / archive)
> and `.422` dropped `.407` detail (full text remains in LOG.md / archive)
> and `.423` dropped `.408` detail (full text remains in LOG.md / archive)
> and `.424` dropped `.409` detail (full text remains in LOG.md / archive)
> and `.425` dropped `.410` detail (full text remains in LOG.md / archive)
> and `.426` dropped `.411` detail (full text remains in LOG.md / archive)
> and `.427` dropped `.412` detail (full text remains in LOG.md / archive)
> and `.428` dropped `.413` detail (full text remains in LOG.md / archive)
> and `.429` dropped `.414` detail (full text remains in LOG.md / archive)
> and `.430` dropped `.415` detail (full text remains in LOG.md / archive)
> and `.431` dropped `.416` detail (full text remains in LOG.md / archive)
> and `.432` dropped `.417` detail (full text remains in LOG.md / archive)
> and `.433` dropped `.418` detail (full text remains in LOG.md / archive)
> and `.434` dropped `.419` detail (full text remains in LOG.md / archive)
> and `.435` dropped `.420` detail (full text remains in LOG.md / archive)
> and `.436` dropped `.421` detail (full text remains in LOG.md / archive)
> and `.437` dropped `.422` detail (full text remains in LOG.md / archive)
> and `.438` dropped `.423` detail (full text remains in LOG.md / archive)
> and `.439` dropped `.424` detail (full text remains in LOG.md / archive)
> and `.440` dropped `.425` detail (full text remains in LOG.md / archive)
> and `.441` dropped `.426` detail (full text remains in LOG.md / archive)
> and `.442` dropped `.427` detail (full text remains in LOG.md / archive)
> and `.443` dropped `.428` detail (full text remains in LOG.md / archive)
> and `.444` dropped `.429` detail (full text remains in LOG.md / archive)
> and `.445` dropped `.430` detail (full text remains in LOG.md / archive)
> and `.446` dropped `.431` detail (full text remains in LOG.md / archive)
> and `.447` dropped `.432` detail (full text remains in LOG.md / archive)
> and `.448` dropped `.433` detail (full text remains in LOG.md / archive)
> and `.449` dropped `.434` detail (full text remains in LOG.md / archive)
> and `.450` dropped `.435` detail (full text remains in LOG.md / archive)
> and `.451` dropped `.436` detail (full text remains in LOG.md / archive)
> and `.452` dropped `.437` detail (full text remains in LOG.md / archive)
> and `.453` dropped `.438` detail (full text remains in LOG.md / archive)
> and `.454` dropped `.439` detail (full text remains in LOG.md / archive)
> and `.455` dropped `.440`–`.442` detail (full text remains in LOG.md / archive)
> and `.456` dropped `.441` detail (full text remains in LOG.md / archive)
> and `.457` dropped `.442` detail (full text remains in LOG.md / archive)
> and `.458` dropped `.443` detail (full text remains in LOG.md / archive)
> and `.459` dropped `.444` detail (full text remains in LOG.md / archive)
> and `.460` dropped `.445` detail (full text remains in LOG.md / archive)
> and `.461` dropped `.446` detail (full text remains in LOG.md / archive)
> and `.462` dropped `.447` detail (full text remains in LOG.md / archive)
> and `.463` dropped `.448` detail (full text remains in LOG.md / archive)
> and `.464` dropped `.449` detail (full text remains in LOG.md / archive)
> and `.465` dropped `.450` detail (full text remains in LOG.md / archive)
> and `.466` dropped `.451` detail (full text remains in LOG.md / archive)
> and `.467` dropped `.452` detail (full text remains in LOG.md / archive)
> and `.468` dropped `.453` detail (full text remains in LOG.md / archive)
> and `.469` dropped `.454` detail (full text remains in LOG.md / archive)
> and `.470` dropped `.455` detail (full text remains in LOG.md / archive)
> and `.471` dropped `.456` detail (full text remains in LOG.md / archive)
> and `.472` dropped `.457` detail (full text remains in LOG.md / archive)
> and `.473` dropped `.458` detail (full text remains in LOG.md / archive)
> and `.474` dropped `.459` detail (full text remains in LOG.md / archive)
> and `.475` dropped `.460` detail (full text remains in LOG.md / archive)
> and `.476` dropped `.461` detail (full text remains in LOG.md / archive)
> and `.477` dropped `.462` detail (full text remains in LOG.md / archive)
> and `.478` dropped `.463` detail (full text remains in LOG.md / archive)
> and `.479` dropped `.464` detail (full text remains in LOG.md / archive)
> and `.480` dropped `.465` detail (full text remains in LOG.md / archive)
> and `.481` dropped `.466` detail (full text remains in LOG.md / archive)
> and `.482` dropped `.467` detail (full text remains in LOG.md / archive)
> and `.483` dropped `.468` detail (full text remains in LOG.md / archive)
> and `.484` dropped `.469` detail (full text remains in LOG.md / archive)
> and `.485` dropped `.470` detail (full text remains in LOG.md / archive)
> and `.486` dropped `.471` detail (full text remains in LOG.md / archive)
> and `.487` dropped `.472` detail (full text remains in LOG.md / archive)
> and `.488` dropped `.473` detail (full text remains in LOG.md / archive)
> and `.489` dropped `.474` detail (full text remains in LOG.md / archive)
> and `.490` dropped `.475` detail (full text remains in LOG.md / archive)
> and `.491` dropped `.476` detail (full text remains in LOG.md / archive)
> and `.492` dropped `.477` detail (full text remains in LOG.md / archive)
> and `.493` dropped `.478` detail (full text remains in LOG.md / archive)
> and `.494` dropped `.479` detail (full text remains in LOG.md / archive)
> and `.495` dropped `.480` detail (full text remains in LOG.md / archive)
> and `.496` dropped `.481` detail (full text remains in LOG.md / archive)
> and `.497` dropped `.482` detail (full text remains in LOG.md / archive)
> and `.498` dropped `.483` detail (full text remains in LOG.md / archive)
> and `.499` dropped `.484` detail (full text remains in LOG.md / archive)
> and `.500` dropped `.485` detail (full text remains in LOG.md / archive)
> and `.501` dropped `.486` detail (full text remains in LOG.md / archive)
> and `.502` dropped `.487` detail (full text remains in LOG.md / archive)
> and `.503` dropped `.488` detail (full text remains in LOG.md / archive)
> and `.505`–`.545` dropped detail (full text remains in LOG.md / archive)
> and `.597` dropped `.543`–`.544` detail (full text remains in LOG.md / archive)
> and `.598` dropped `.583` detail (full text remains in LOG.md / archive)
> and `.599` dropped `.584` detail (full text remains in LOG.md / archive)
> and `.600` dropped `.585` detail (full text remains in LOG.md / archive)
> and `.601` dropped `.586` detail (full text remains in LOG.md / archive)
> and `.602` dropped `.587` detail (full text remains in LOG.md / archive)
> and `.603` dropped `.588` detail (full text remains in LOG.md / archive)
> to [CONTEXT-now-2026-07-30.md](docs/archive/CONTEXT-now-2026-07-30.md) after this
> block reached **79 bullets / 103KB**. A status doc that only grows stops being read.

> **Status — the facts that decide what may be built.** Kept here as standing
> lines, not inside a ship bullet: `.203` rotated `.170` to the archive and took
> the beta-gate state with it, so `## Now` stopped stating the one rule that
> governs every other decision in this repo. Enforced by the `MUST_STATE` list in
> `src/lib/contextBudget.test.ts`.
>
> | Fact | State |
> |---|---|
> | **REDTEAM A5 falsifier** ([REDTEAM.md](docs/REDTEAM.md)) — *"14 days… still no 10 beta users"* | **FIRED** as a *public-flip* signal — still no 10 beta. **Founder override 2026-08-03:** not a build freeze while EIN is pending. Craft window open (excellence + anti-slop); free-first mute pay continues; agents still never flip `PRIVATE_MODE` or invent traction. |
> | `PRIVATE_MODE` | **on** in production. The gate is up; `/` serves the `/private` teaser. Also disables the service worker, so **no beta tester can install the PWA or log offline** — deliberate (do not offline-cache a private app), and the offline promise gets zero beta validation until the flip. Post-flip check is in [LAUNCH_RUNBOOK](docs/LAUNCH_RUNBOOK.md) §5. |
> | `MAIL_POSTAL_ADDRESS` | **unset** — `send-beta-invite.ts` hard-exits and `renderEmail.ts` refuses to render, so **no invite email can be sent**. `.204` fixed the link; this is the remaining blocker to the first 10 users. |
> | Repo visibility | **private since 2026-08-02 00:49Z** — it was public until then, and four GitHub security features went with it, all needing Advanced Security on a private repo: **secret scanning + push protection** (had been on), **code scanning** (`/code-scanning/default-setup` → 403), **private vulnerability reporting** (→ 404), and the **Dependency Review API** (→ 403, so `dependency-review-action` cannot run here at all). **Dependabot alerts and security updates are unaffected** and still on — 3 open advisories, all high. That leaves `gitleaks` as the only secret gate. Flipping back to public restores all four at no cost; until then, do not propose them. |
> | GitHub Actions | **running, and metered again.** Measured 2026-08-02 on PR #186: `build-and-test` ran to completion in 7m22s (53 `@gate` e2e), `gitleaks` and `aikido-security` likewise. The `runner_id: 0` billing block is cleared. But that run finished at **00:41, eight minutes before the repo went private** — standard runners are free only on public repos, so every minute since draws on the account quota. The lean-CI split (PR-only, heavy jobs in `ci-extended`) is load-bearing again, not just tidy. `npm run gate` is no longer the only thing guarding `master` — it stays the faster pre-push check, and now the cheaper one. |
> | VAPID keys · `CRON_SECRET` · `SMOKE_BASE_URL` · Sentry DSN · Upstash | **unset.** Push ships dark, the hourly sweeps `exit 0`, there is no server request logging, and rate limiting is per-instance in memory. |
> | Migrations | **9 recorded pending** — [LAUNCH_RUNBOOK](docs/LAUNCH_RUNBOOK.md) §3, enforced by `src/lib/migrationLedger.test.ts`. |
> | gitleaks | **green — and scanning for the first time.** It had never scanned anything: on a `pull_request` event the action lists the PR's commits, the job declared no `permissions:` block, and it 403'd (`pull_requests=read`) before opening a file. Fixed by a `permissions:` block (`.224` carrying `.255`). It scans **only the PR's own commits**, so commit `8ea3527a`'s real Solana treasury address — scrubbed from the working file, still in history — is out of its scope. That finding stands, deliberately not allowlisted; it was never what made this check red. |

- **`.597`:** **The Coach could not learn from effort.** `logSetAndAdvance` — the only path any UI logs through — stamped every set `rpe: 'med'`. Both render sites gate the Easy/Med/Hard buttons on `!set.rpe`, so the controls were unreachable on every set ever logged, while `ActiveSessionChrome` asked athletes to "Rate Easy / Med / Hard so Coach can learn." Downstream, `progression.ts`'s `allEasy`/`anyHardOnTwoPlus`/`allHard` branches could not fire and `load.ts`'s `sessionRpe` was the constant 7 — criterion 3 resting on a value nobody supplied. **2152 tests green over it**, because `progression.test.ts` passes RPE straight in: the decision was proven, the input was not. New `setRating.test.ts` drives the real store into the real planner (easy→`coachWhyLoadUp`, hard→`coachWhyDeload`) and scans for a literal rating over the whole `Rpe` union, not the one spelling. `progression.ts:249`'s unreachable fallback recorded, not fixed — it is a policy change. 4 mutants; tests 2152→2158.
- **`.596`:** **No workflow ran on a push to `master`** — all trigger on `pull_request`/`workflow_dispatch`/cron and prod ships via a Deploy Hook bypassing Actions, so merges reached production ungated. New `ratchets.yml` runs the no-build gate there. i18n **141→0** (cap 16→0), measured on a clean `origin/master` worktree — nearly 9× the cap, every key rendering English in all 15 languages; six ternary-`defaultValue` keys split into literal per-variant pairs. Coverage **415→390** (floor 407→390), breached since `.544`. `i18nCoverage.test.ts` held `HIGH_WATER=710` against a cap of 16 — a **44× loosening stayed green**; now lockstep, dependency ratchet 13→**9** (js-yaml + nanoid arrived mid-branch and were *fixed* via a lockfile bump, not admitted). `CLAUDE.md` claimed a 16-step gate that runs 18 and omitted **Coverage floors**; `gateDocParity.test.ts` derives it. Tests 2152. **Third rebase, third label collision** (`.545`→`.548`, `.562`→`.595`, `.595`→`.596`) — label and `LOG-rotate-<label>.md` both derive from the contested *incoming* label; naming the archive after the entry it contains is proposed, not taken. **Still open:** Actions assigns no runners (`runner_id: 0`); branch protection; bundle budget — its own PR.
- **`.595`:** (`2026.07-unified.595`) About/Vision on `PublicPageShell` with editorial bodies (existing copy) + JoinClass branded shell and error path.
- **`.594`:** (`2026.07-unified.594`) App voice recut — PillarPageHeader onto `.display-section`/`.eyebrow` (~30 screens), weight sweep + ratchet, Track onto `card-section`+`ScoreNumeral`, Learn/Mind/Move idioms, `/experience` retired, design guard walks `.css`.
- **`.593`:** Legal industry-standard privacy + account export/delete.
- **`.592`:** Lean Today evening continuity + Fuel depth subtitle.
- **`.591`:** Evening sleep-week continuity + Fuel prem 110.
- **`.590`:** Sleep-week series complete nights 1–7; mind prem 60.
- **`.604`:** **The verification run — and `.602` claimed a repair it did not make.** The wave's last four gate steps had never run, for two independent reasons: `npm run gate` aborts on first failure and **step 16 (bundle) has been red since before `.596`**, so steps 17–18 are unreachable on this branch *and on `master`*; and this sandbox has Chromium **1194** against Playwright 1.61.1's **1228** with the CDN proxy-blocked, so every browser test died at launch in 3 ms. Measured on identical builds: hero `@gate` **71/71 on both** branch and `master`; `@a11y` **63/8 on both, the same eight**. **So the hero test `.602` said it fixed was already green** — `.first()` is DOM order and `TodayDashboardHeader` renders "Mission Score" *above* the collapsed `<details>`, so it selected the **visible** band all along. Every fact `.602` cited was true; the inference was inverted. The `data-testid` change stays on merits (names the band, asserts a real digit) — only the claim is withdrawn, in `.602`'s entry, the guard's rationale and the PR body. Its "hero spec reverted → red" mutant fired against the **unit** guard that greps spec text, never against Playwright. **8 serious a11y violations, pre-existing, `.605` fixes them:** 7 × `/active … open` `aria-required-parent` (`SetLogRow:78` `role="listitem"`, no `role="list"` ancestor anywhere in `src/`) + `/leaderboard` `scrollable-region-focusable`. Bundle unchanged by the wave (~0.2 KB against a ~10.7 KB standing overage) and **caps not raised**. Tests 2203.
- **`.603`:** **Offline honesty, the remaining surfaces — and one claim that turned out to be true.** The two iOS branches offering install-to-unlock-notifications are gated (false twice over: nothing installable, and an installed shell still has no worker). Fuel/Track/About **reworded, not gated** — they describe data locality, true with or without a worker, so gating would hide a real selling point after the flip. **The near-miss is the finding:** the plan listed `infoLocales:341` as the `/vision` "installable" claim; 341 is actually the **privacy policy** saying data stays on your device until you sign in — true regardless of the SW. Gating a privacy disclosure to make the app "honest" would have been the exact inversion `.600`'s guard exists to prevent, one commit after building it. Now a reasoned `TRUE_TODAY` row with a mutant. `/vision` left alone: it renders the constitution, not a build claim. `AboutPage:140` was missed by the audit entirely and found by grep — the argument for discovery over enumeration. 2 mutants; tests 2200→2203.
- **`.602`:** **Today stops inventing numbers; the red hero gate is green.** `MetricsRow`'s em-dash guard asked only `sessions > 0`, so the literal `50/50/50` seeded until `belowFoldReady` rendered as *measured* for every returning athlete — captioned "Train smart / Moderate load / Rebuilding", coach line derived from it. Explicit `pending` now forces the unmeasured state. "This week" had **no error branch** and its four dynamic imports had **no `.catch`**, so a failed chunk was a permanent spinner nothing knew about (compounds with `.600` — no SW, no cache to serve the chunk); now `ErrorState` **with** an `onAction`, plus the `aria-busy` it never declared (`.253`). **The hero gate `.596` left red was a test bug, not a product one:** `.first()` matched "Cross-pillar Mission Score" hidden inside a collapsed native `<details>` — which is named by its `<summary>` ("Health scores"), why `.596`'s `role=group` probe found nothing — while the real band was visible all along. Now keyed to a `data-testid` + a real digit. `i18n:fill` churned 42 unrelated lines of `es.json` (`.252` hazard) — reverted, keys placed by hand. 5 mutants; tests 2191→2200.
- **`.601`:** **A missed day was deleted instead of narrated.** `adaptPlan`'s ordinary branch ended `[...doneSessions, ...reassigned]`, dropping every missed session. The comment blamed duplicate "Missed" paint — but that risk belongs to the branch *above*, which re-opens the missed sessions themselves (hence its `placedIds` dedupe); this branch re-spreads `remaining` and never touches `missed`. So the filter removed the only record a day was missed, and with it the whole story: no "Life happened…" beat, `hasCoachAdaptationSignal` false, `CoachAdaptBanner` → `null` (the file calls itself "demo-critical"), no re-entry block — criterion 4 with no re-entry at all. The beat's own copy ("Remaining days are re-spread") describes this exact branch, the one that could never show it. One-line fix. `WeekStrip` also drew missed days in the live red accent beside the strikethrough; now muted per `.127`. 3 mutants — **the dedupe one took three attempts**: two fixtures had no `done` session, so the `doneSessions.length > 0` arm holding the filter was unreachable and the mutant survived twice. Tests 2183→2191.
- **`.600`:** **The app promised offline the build does not ship — the feature stays, the tense was the defect.** Serwist is disabled while the gate is up, so production has **no service worker**; yet Today offered "Install … for offline use anywhere", the invite landing said "log from Today offline", and the logger said "offline ready". `CONTEXT` documented this and **no string knew it**. Offline is constitutional (`vision.md` "offline-first", "free offline logger") and already scheduled on at the flip — nothing removed. `NEXT_PUBLIC_PWA_ENABLED` **already existed**, derived in `next.config.js` from the same `pwaDisabled` that builds Serwist; new `isOfflineInstallable()` wraps it so claims are true now *and* after the flip with no copy edit to remember. Crucially the guard separates **capability claims** (false today) from **network-state messages** — `OnlineStatusBanner`'s "Offline — logging still works" is *true* with no worker (persist + outbox), so over-gating it is its own lie and a mutant proves it. Also closed: `isPushSupported()` was one env var from offering push with no worker to subscribe through. **Recorded for the flip:** `cacheOnNavigation` + the `pages` buckets will store 24h of authenticated HTML/RSC and there is **no `caches.delete()` in the repo** — `.211` closed `/api/` only. 4 mutants; tests 2174→2183.
- **`.599`:** **A Postgres error reaching a client, past a guard that could not see it.** `app/api/mobile/workouts/route.ts:84` returned `syncError: error.message` at HTTP **200** — CLAUDE.md §5 forbids it by name. The guard `.filter()`d a **6-entry `LEAKY` list over 69 routes** (an allowlist wearing the name of a scan) *and* keyed on `error:` + `status: 500`, so it missed the live defect on both axes — wrong path, wrong key, wrong status. Rewritten to **discover** every `app/api/**/route.ts` and match any error object reaching a body under any key at any status. It found **two more** on its first run: `journey/nudge:94` leaked the mail provider message (identifier `sendError` — a *third* spelling axis), fixed; `health:53` kept as the one reasoned `LEAK_OK` (behind `?deep=1` **and** `Bearer CRON_SECRET`). Matcher falsified in-file against the shapes that shipped. 3 mutants; tests 2172→2174. **Taken ahead of the planned order** — live disclosure fix, most contained of the four remaining.
- **`.598`:** **A button that says "start" must start a session.** `CoachAdaptBanner` rendered "Start this session" as a bare `<Link href="/active">` — which starts nothing and lands on `ActiveEmptyState` ("No session running"), on the one surface built to restart a lapsed athlete. And the re-entry dose was applied on **one of four** start paths, so `TodayReentryCard` promised "about 50% of usual sets" while the Coach card beneath it started the full session. One definition now (`.178`): `resolveCoachSessionStart` owns refuse-if-done + re-entry read + scaling; `useStartCoachSession` is wiring. My first draft put the hook after two early returns (Rules-of-Hooks) and the guard's own staleness mirror went red on an exemption the refactor had made theatre — both caught before commit. Coverage floor 390→391 through the documented escape hatch, reasoned in `FLOORS`. 4 mutants; tests 2158→2172.
- **`.582`:** Kaizen FormGuide i18n + library overlay fix + upload remove 44px.
- **Horizon W + full-launch override (2026-08-05).** Wedge excellence still required; agents may ship rewards + full surface honesty. Fuel estimate accuracy remains.
- **Free-first beta (~4 weeks):** LLC + EIN pending — **no Bundle UI** + **full depth unlocked** + **full More nav** (journey train-only deferred) ([docs/FREE_BETA.md](docs/FREE_BETA.md)).
- **`e2e:visual` is the one dark gate.** Its three baselines were generated **2026-07-22, before the rebrand**, and depicted the old navy/emerald dark design — black grounds, emerald CTAs, rounded corners. Verified by opening one, not inferred from dates. **Deleted**, because a known-wrong baseline is worse than none: the first Linux run would have shown four huge diffs, and the reflex there is `--update-snapshots` without looking, which launders whatever renders that day into truth. `home-reduced.png` **never had a baseline at all**, so the homepage has been silently self-approving since the case was written. **First Linux CI run after billing clears must bootstrap all four** (`npx playwright test --grep @visual --update-snapshots`, then commit the artifact) — it cannot be done on macOS, the pixels will not match.



- **Three jobs that built a different app (`.255`):** `ci-extended.yml` ran for the first time on 2026-08-01 — Actions had been billing-blocked — and **every one of its three app-building jobs was configured wrong**, in three different ways, all invisible until it ran. `e2e-critical` had no `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, so it reproduced `.249` exactly: `isPushSupported()` returns false without it, every component behind it renders nothing, and *"Today shows one red action at 19:00"* asserts one of them is mounted. `visual-regression` set `PRIVATE_MODE: 'false'` on the **assertion step** — after the build, after the server started — and GitHub step env does not reach earlier steps, so it reached neither. `lighthouse-budget` set **nothing at all**. On a runner that is not neutral: `isPrivateModeEnabled()` returns true whenever `PRIVATE_MODE` is unset and `NODE_ENV === 'production'` ([`privateGate.ts:23`](src/lib/privateGate.ts)), and `next build`/`next start` both set that. So both jobs served the **gated** app, where `/` and `/log` are not in `PRIVATE_GATE_PUBLIC_PATHS` and redirect to `/private`. **Two consequences, both of them a check that could not fail.** [`lighthouse-budget.mjs:9`](scripts/lighthouse-budget.mjs) scores four pages and two of them were the teaser — the lightest page in the product, timed as if it were the product. And the `.234` baseline bootstrap wrote `home-reduced.png` as a screenshot of `/private`, under the name of the most-linked page in the app, in the same run that `visual.spec.ts`'s own header called *"covering it for the first time"*. That is verbatim the laundering `.221` deleted the previous baselines to avoid, arriving through the front door. **`/bundle` was the one case that survived, because it checked where it landed** — every case now goes through a `shoot()` helper that compares the landing path to the file name and refuses on a mismatch, and a redirect may only skip if it states a reason. The env fix removes the cause; the landing check catches the next one, because a baseline is exactly the artifact nobody re-reads. **The guard for `.249` had this same defect**: it named `gate.mjs` and `ci.yml`, and there were three files and eight jobs — `.220`'s *name that claims more than its enumeration*, inside the guard written for `.220`. New [`workflowBuildEnv.test.ts`](src/lib/workflowBuildEnv.test.ts) globs `.github/workflows/*.yml` and requires job-level env matching `gate.mjs` — job-level only, since step env is what caused two of the three failures. **Its own first draft had the same defect and a mutant killed it**: it decided scope with `/\bnpm run build\b/`, so a job running `npx next build` with no env passed silently — `.212` inside a guard written about `.220`, a few tests after I wrote *"a guard that enumerates cannot notice a fourth"*. Inverted to **in scope unless exempted**: 12 `NOT_THIS_APP` entries (scanners, cron pokes, the two that must *never* see CI placeholders — `apply-migration` and `sync-vercel-env` — plus `deploy-production`, which Vercel builds remotely from the real project env, the three remote smokes, and Android/Gradle), each with a reason, and a staleness test. A pattern list is silent about what it misses; an exemption list makes leaving a thing a reviewer can disagree with. 12 mutants killed. Tests 1186→1194.

- **The bootstrap the visual gate could not run (`.254`):** the suite has four cases and **zero committed baselines**. `home-reduced.png` never had one at all, so **`/` — the most-linked page in the product — has been silently self-approving** on every run since the case was written; the other three went in `.221` for depicting the pre-Modernist design. `.200` had already fixed the worse half (the job ran `--update-snapshots || true` and re-read the files it had just written, green every time over nothing) by making the absence **a loud failure with instructions** — and those instructions named a command **nobody could execute**. `ci-extended.yml`'s runner is the only Linux/Chromium environment this project has, and baselines made anywhere else differ by font hinting and antialiasing alone, which is precisely how a pixel comparison stops meaning anything. So the gate was correct *and* terminal. New `bootstrap_baselines` `workflow_dispatch` input, **default false**: an input rather than a shell flag or auto-fallback, so the normal path stays loud and the weekly schedule — which supplies no inputs — can never reach the generate. The generate **asserts nothing**, deliberately: it writes the PNGs, the existing `always()` upload carries them off the runner, and the gate is a human opening every file, because `.221` deleted the old set rather than refresh it on the grounds that *"the obvious response to four huge visual diffs is `--update-snapshots` without looking, which launders whatever the app happens to render that day into the new truth."* **`ciTruth`'s guard was narrowed, not weakened** — it forbade the flag anywhere in the step, but what made the old behaviour a defect was never the flag, it was that the *default path* wrote and re-read its own baselines; the rule is now about **reachability**. Six mutants killed. **Near-miss recorded:** the block-extraction regex ended on `\n\s*fi`, which matched the `fi` inside `find` on the next line, so the guard judged one line of the block and failed on a fragment — third lazy-quantifier stop in this programme after `.221`'s `border-radius: 0` and `.223`'s `prLine: null`. **Three baselines, not four** — `/bundle` self-skips while FREE_BETA redirects it to `/log`. **The eyes-on review found one**, which is what it is for: `exercise-squats` and `home-reduced` are clean (paper, poster red, radius 0, Archivo; the homepage's grey blocks are `GrayscalePhoto`'s deliberate no-`base` state), but **all six guidebook chapter heroes in `public/learn/*.webp` are 89–99% dark with teal accents and ~0% red** — the navy/emerald palette `.131` retired, on paper pages. `.137` re-inked the guidebook *cover* and rebuilt the PDF; the chapter heroes were not in that pass, and **nothing could have caught it** — `check-design-system` reads source, and a palette baked into a `.webp` is invisible to it (`.221` one layer out). So `guide-human-performance.png` is **not** a baseline to commit: the image is right about what renders and wrong to enshrine, which is exactly the laundering `.221` deleted the old set to avoid. **Blocked and named:** committing CI-generated PNGs needs the `visual-diffs` artifact, and this session's token gets `403 Resource not accessible by integration` on Actions — the images above were rendered locally (same viewport, `reducedMotion: reduce`), which answers every design question but cannot produce pixel-valid baselines. Mechanism shipped, run dispatched, download + commit is founder-owned.
- **The settle rule that could not see loading (`.253`):** `a11y.spec.ts` waited for `getAnimations()` to go quiet and called the page settled; [`Skeleton.tsx`](src/components/ui/Skeleton.tsx) **deliberately does not animate** — its header explains why, the old pulse *was* the information so `prefers-reduced-motion` deleted the only cue. Two correct decisions composing into a wait that is blind to loading **by construction**. Measured, not argued: `/profile` under a 40× CPU throttle reaches the axe scan with **two `aria-busy` regions on screen and zero running animations**. `settle()` now requires both, on `[aria-busy="true"]` rather than `[aria-busy]` (`HoldToConfirmButton` and `CoachChatPanel` bind the attribute to state, so a resting page carries `false` nodes the looser selector would wait on forever). That let the **route special-case** go: `if (path === '/active')` waited on the Start button's *copy* (`/start workout|loading session/i`) — `.220`'s shape, one string edit from vanishing, and no other route had one at all; `ActiveEmptyState` declares `aria-busy` while persist rehydrates, so the general rule covers it. **Eight placeholders never said they were loading**, all found by the new guard rather than looked for: `HomeTodayDashboard` mounted **five** widgets on `/` with `loading: () => <Skeleton/>` — bare `Skeleton` is `aria-hidden`, so they were invisible to a screen reader *and* to any settle rule; `BenchmarksPage` and `HistoryPage` (×2) drew chart slots as `<div className="h-48 animate-pulse bg-card"/>`, anonymous grey boxes carrying **the exact pulse `Skeleton` retired**; `FuelLogSheet` and `BuilderPage` rendered a bare `<p>Loading…</p>`, visible text announced to nobody. New `SkeletonBlock` and [`loadingStatesAnnounce.test.ts`](src/lib/loadingStatesAnnounce.test.ts), which **resolves the fallback component's own source anywhere in the repo** rather than listing which placeholders exist. **My first guard was `.220` inside the fix for `.220`** — it asserted the `aria-busy` selector *appeared*, so a mutant deleting `&& loading() === 0` from the quiet condition survived: the query ran, its answer was discarded, green. Nine mutants now die. **What this does not claim:** it is **not** a proven fix for the `/profile` skeleton-contrast violation seen once in `.250` — that did not reproduce in ~30 throttled runs at rates 1–80, every one reporting zero serious/critical. `.224` records me calling three failures "container flakiness" when one was real; shipping a fix and declaring the matter closed is the same error mirrored. **a11y stays out of `ci.yml`** until there is stability evidence — its `CI_ONLY_EXEMPT` reasoning (a gate that reddens on a render race teaches people to re-run until green) is honoured, not overridden because a fix feels right. **Third `git checkout --` self-revert**, after `.202` and `.205` — the rule *commit before mutating* was already written in the archive and I ran the mutants against uncommitted work anyway; nothing was lost, but the habit is the finding.
- **The exporter that undid the splitter (`.252`):** `npm run export-locales` and `npm run check-locale-split` disagreed **by construction** — the exporter wrote every namespace **plus** a merged `common.json`, while the splitter trims each namespace to English's keys and deletes `common.json` as `REDUNDANT` (the entire 1,687-key catalogue, repeated fifteen times, and `fetchLocaleHttpOverrides` *preferred* it). `.222` built the splitter **re-runnable** for exactly one stated reason — *"a cleanup that cannot be repeated undoes itself the next time the fill tool runs"* — and it did: `.250` ran the exporter while checking CI steps, committed 394 regenerated files with `git add -A`, and CI caught it on `.222`'s own guards. The mitigations (CI ordering, and remembering) worked *around* the conflict, which also meant the shipped translator files had drifted behind source because nobody could safely re-export. **The fix is that the producer emits what the checker wants:** each namespace trimmed to `Object.keys(entry.stringsFor('en'))` and iterated in that order — dropping foreign keys and stabilising order in one pass, the same two effects from the same rule as the splitter — and no `common.json`. **252,286 out-of-namespace keys** were being written. A guard pins the shared assumption: the splitter reads its schema from `en/*.json`, which *is* the exporter's output, so if it stops deriving from English the exporter's basis is silently void. **Re-exporting exposed two things.** Fifteen `feedbackCard*`/`feedbackSheet*` keys from `.215` had never reached `public/locales` — the drift the conflict caused, now shipped. And `coachWhySteadyWeek`/`coachWhyPlateauDeload` sat in the committed `en/coach.json` but **in no source module at all**, while `loadGuard.ts:42` and `progression.ts:173` still emit them: [`PlanExerciseLine`](src/components/coach/PlanExerciseLine.tsx) renders `i18n.exists(whyKey) ? t(whyKey) : ''`, so the coach decided a week was a plateau deload, wrote down why, and showed the athlete a **blank line** — in all fifteen languages. `progression.test.ts:117` and `loadGuard.test.ts:51` were green throughout, proving the *choice* while nothing proved the *string* (`.184`, one layer down into i18n). Restored, with a guard that **discovers** every `coachWhy*` literal in `src/lib/coach/` rather than enumerating them (`.220`). Tests 1186→1191.

- **Ops:** prod ships via **Vercel Deploy Hook + GitHub webhook** (unmetered, no Actions) — [docs/VERCEL_DEPLOY_CHECKLIST.md](docs/VERCEL_DEPLOY_CHECKLIST.md) §1.1; `deploy-production` is now **manual-only** fallback. **Actions state lives in the Status table above, and only there** — this line has now been wrong in both directions within one night (it claimed "cleared" while jobs were dying at `runner_id: 0`, and the correction claimed "blocked" an hour before billing came back at 00:12 UTC on 2026-08-01). Two places describing one fact is `.178`; the fix is not a better sentence here but **no sentence here**. `npm run gate` stays the faster pre-push check. **Secrets program** + pre-public scrub shipped — [docs/SECRETS.md](docs/SECRETS.md); OSS public-ready (AGPL + CoC) — founder flips GitHub Public — [docs/OPEN_SOURCE.md](docs/OPEN_SOURCE.md). Promote **`.157`** — now on `master`; keep Supabase Site URL on www.
- Agents **must** ship wedge habit-loop + free acquisition. Full-launch override (2026-08-05) allows rewards + surface honesty; still refuse America marketing / locale farms / F5 / free-logger gates without enable.
- **Founder:** Accept B on Android + phone excellence → invites → YC F26. **Wire the Deploy Hook webhook** ([checklist §1.1](docs/VERCEL_DEPLOY_CHECKLIST.md)) then promote `.157`; clear Actions billing to restore the PR gate. **Before any list email: set `MAIL_POSTAL_ADDRESS`** (CAN-SPAM footer — confirm the Bizee TX registered-agent address is publishable as a business address, else PO box/CMRA; same address closes the DMCA agent row) — [LEGAL_SAFETY.md](docs/LEGAL_SAFETY.md) §3. Before Public: `npm run secrets:scan`, enable GitHub secret scanning + push protection.

---

## Read next

[AGENTS.md](AGENTS.md) (conventions · glossary · commands) → [INDEX.md](INDEX.md) (task → doc routing · stale paths §4) → [ORCHESTRATION.md](ORCHESTRATION.md) (horizons · gates · departments) → the folder `INDEX.md` where you'll work.

---

## Trap terms (full glossary: AGENTS.md)

| Term | Means |
|------|-------|
| Mission Coach | AI plan engine — `src/lib/coach/`, `/coach` (≠ `/coaching` human-lead form) |
| Today | Route `/log` (`HomePage.tsx`), nav label "Today" |
| Train | Route `/active` — the logger |
| Fuel | Route `/nutrition` |
| Journey phase 0–3 | UX arc ([docs/JOURNEY.md](docs/JOURNEY.md)) ≠ build phases A–I ([docs/PLAN.md](docs/PLAN.md)) ≠ PFT G1–G8 |
| Horizon 0–3 | What may be built now — [ORCHESTRATION.md](ORCHESTRATION.md) |
| Wedge | Train + Mission Coach — the go-to-market story |
| Super Bundle | The one premium sub: $11.99/mo · $59/yr founders · $149 lifetime |
| PRIVATE_MODE | Site gate — only the founder flips it |
| mw-core | [packages/mw-core](packages/mw-core) — pure TS shared coach/workout logic |

---

## Commands

`npm run typecheck` · `npm test` · `npm run build` · `npm run lint` — full list in AGENTS.md §Commands.
Android: `cd apps/android && ./gradlew :app:assembleDebug`.

---

## Hard rules

1. **Horizon rule** — Horizon W: build wedge excellence (Train/Today/Victory/Coach). No new pillars/locales/America/F5 without explicit founder override. ≥10 beta only after excellence sign-off.
2. **The free logger is never gated. Ever.**
3. Agents never flip `PRIVATE_MODE`, never invent traction numbers, never mark founder tasks done.
4. Do not open stale/deleted paths — [INDEX.md](INDEX.md) §4.
5. Docs match reality: every ship updates [LOG.md](LOG.md) + this file's `## Now` (+ build label).
