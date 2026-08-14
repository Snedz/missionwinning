# CONTEXT.md — boot file (read first, every tool)

One screen of truth for any AI tool or human joining cold. Read this, then [AGENTS.md](AGENTS.md), then [INDEX.md](INDEX.md). Keep `## Now` current: update it on every ship, in the same commit as the [LOG.md](LOG.md) entry.

---

## What this is

**Mission Winning** · www.missionwinning.com · "Train Anywhere. Win Daily."

> Adaptive AI coaching for train-anywhere athletes — free offline logging (no account), weekly plans from logs alone (no wearable). Super Bundle adds Coach depth and the other pillars — it never gates the logger.

- Six pillars — Train · Fuel · Move · Mind · Track · Learn — unified by the Mission Score. Constitution: [vision.md](vision.md). Pitch the **Train + Mission Coach wedge**, never "everything app" ([docs/THESIS.md](docs/THESIS.md)). Evidence thesis (structured exercise vs vague advice — not a depression product): [docs/EXERCISE_AS_MEDICINE.md](docs/EXERCISE_AS_MEDICINE.md). Crypto is a **payment rail** (Lifetime USDC), not the product ([docs/CRYPTO_RAILS_THESIS.md](docs/CRYPTO_RAILS_THESIS.md)).
- Surfaces: Next.js 16 PWA (repo root) · native Android Compose ([apps/android](apps/android), v1.24.1) · iOS deferred ([docs/IOS_PLAYBOOK.md](docs/IOS_PLAYBOOK.md)) · "Beyond the Basics" guidebook (`/guide` + magazine PDF).
- Solo founder + AI agents. Founder owns users, money, legal, secrets, `PRIVATE_MODE`. Agents own code, tests, perf, docs — inside horizon gates.

---

## Now (2026-08-14 · web `2026.07-unified.766` · Android `1.24.1`)

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
> and `.605` dropped `.590` detail (rotated to docs/archive/log/LOG-rotate-605.md)
> and `.597` dropped `.543`–`.544` detail (full text remains in LOG.md / archive)
> and `.598` dropped `.583` detail (full text remains in LOG.md / archive)
> and `.599` dropped `.584` detail (full text remains in LOG.md / archive)
> and `.600` dropped `.585` detail (full text remains in LOG.md / archive)
> and `.601` dropped `.586` detail (full text remains in LOG.md / archive)
> and `.602` dropped `.587` detail (full text remains in LOG.md / archive)
> and `.603` dropped `.588` detail (full text remains in LOG.md / archive)
> and `.614` dropped `.594` detail (full text remains in LOG.md / archive)
> and `.679` dropped `.668` detail (full text remains in LOG.md / archive)
> and `.680` dropped `.626` detail (full text remains in LOG.md / archive)
> and `.684` dropped `.627` detail (full text remains in LOG.md / archive)
> and `.685` dropped `.628` detail (full text remains in LOG.md / archive)
> and `.689` dropped `.629` detail (full text remains in LOG.md / archive)
> and `.690` dropped `.630` detail (full text remains in LOG.md / archive)
> and `.691` dropped `.631` detail (full text remains in LOG.md / archive)
> and `.692` dropped `.632` detail (full text remains in LOG.md / archive)
> and `.693` dropped `.633` detail (full text remains in LOG.md / archive)
> and `.694` dropped `.619` detail (full text remains in LOG.md / archive)
> and `.695` dropped `.606` detail (full text remains in LOG.md / archive)
> and `.696` dropped `.635` detail (full text remains in LOG.md / archive)
> and `.697` dropped `.618` detail (full text remains in LOG.md / archive)
> and `.714` dropped `.636` detail (full text remains in LOG.md / archive)
> and `.743` dropped `.669` detail (full text remains in LOG.md / archive)
> and `.744` dropped `.679` detail (full text remains in LOG.md / archive)
> and `.745` dropped `.680` detail (full text remains in LOG.md / archive)
> and `.746` dropped `.684` detail (full text remains in LOG.md / archive)
> and `.747` dropped `.685` detail (full text remains in LOG.md / archive)
> and `.748` dropped `.689` detail (full text remains in LOG.md / archive)
> and `.749` dropped `.690` detail (full text remains in LOG.md / archive)
> and `.750` dropped `.691` detail (full text remains in LOG.md / archive)
> and `.751` dropped `.692` detail (full text remains in LOG.md / archive)
> and `.752` dropped `.693` detail (full text remains in LOG.md / archive)
> and `.753` dropped `.694` detail (full text remains in LOG.md / archive)
> and `.754` dropped `.695` detail (full text remains in LOG.md / archive)
> and `.755` dropped `.696` detail (full text remains in LOG.md / archive)
> and `.756` dropped `.697` detail (full text remains in LOG.md / archive)
> and `.757` dropped `.714` detail (full text remains in LOG.md / archive)
> and `.758` dropped `.743` detail (full text remains in LOG.md / archive)
> and `.759` dropped `.744` detail (full text remains in LOG.md / archive)
> and `.760` dropped `.745` detail (full text remains in LOG.md / archive)
> and `.761` dropped `.746` detail (full text remains in LOG.md / archive)
> and `.762` dropped `.747` detail (full text remains in LOG.md / archive)
> and `.763` dropped `.748` detail (full text remains in LOG.md / archive)
> and `.764` dropped `.749` detail (full text remains in LOG.md / archive)
> and `.765` dropped `.750` detail (full text remains in LOG.md / archive)
> and `.766` dropped `.751` detail (full text remains in LOG.md / archive)
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
> | GitHub Actions | **minutes exhausted / billing-blocked for paid jobs.** ~50 draft PRs show `build-and-test` red. Merge bar while red: **Cursor-local green** (`npm test`, lint, typecheck, excellence) + craft LGTM — [docs/CI_LOCAL.md](docs/CI_LOCAL.md). Actions red is not a product fail. Security jobs (gitleaks / CodeQL / aikido) stay on. `[skip vercel]` on commits unless the founder asked for a Preview. |
> | VAPID keys · `CRON_SECRET` · `SMOKE_BASE_URL` · Sentry DSN · Upstash | **unset.** Push ships dark, the hourly sweeps `exit 0`, there is no server request logging, and rate limiting is per-instance in memory. |
> | Migrations | **9 recorded pending** — [LAUNCH_RUNBOOK](docs/LAUNCH_RUNBOOK.md) §3, enforced by `src/lib/migrationLedger.test.ts`. |
> | gitleaks | **green — and scanning for the first time.** It had never scanned anything: on a `pull_request` event the action lists the PR's commits, the job declared no `permissions:` block, and it 403'd (`pull_requests=read`) before opening a file. Fixed by a `permissions:` block (`.224` carrying `.255`). It scans **only the PR's own commits**, so commit `8ea3527a`'s real Solana treasury address — scrubbed from the working file, still in history — is out of its scope. That finding stands, deliberately not allowlisted; it was never what made this check red. |

- **Excellence:** unscored · — · [docs/EXCELLENCE_RESULT.md](docs/EXCELLENCE_RESULT.md) — Horizon W phone sign-off home; surface PRs need `status: pass` or `Excellence-Override` (`.669`).
- **`.766`:** (`2026.07-unified.766`) **Merge all open PRs on a Cursor landing branch** — 47 PR heads oldest-first; 0 Dependabot PRs (alerts ≠ PRs). Train logger restored from master; PR wiring composed onto it (Victory receipt, garage swap, hard-session, About/Account). No `PRIVATE_MODE` flip. No Vercel preview. Cursor-local merge bar ([docs/CI_LOCAL.md](docs/CI_LOCAL.md)).
- **`.765`:** (`2026.07-unified.765`) **Preview walk P0s** — consent banner docks above the tab bar so Today Start stays tappable; landing Get-notified form (no Stripe). Brief reserved `.750`; first land was `.755` (occupied).
- **`.764`:** (`2026.07-unified.764`) **Free plate math + warmup on the Train set row** — Live barbell plates-per-side + Add warmups 40/60/80. Free. Originally #503 / `.708`.
- **`.763`:** (`2026.07-unified.763`) **Home gym kit on the free logger** — Account Home gym kit (barbell/rack/plates/dumbbells/pull-up/floor). Just Go + Coach filter, never rank. Train empty Start stays repeat-last. Originally #525 / `.733`.
- **`.762`:** (`2026.07-unified.762`) **F-017 first-set verify iterate** — Nullish/hash-safe Sign-in chip; Welcome Begin fallback; extended first-set source-scan. Originally #538 / `.750`.
- **`.761`:** (`2026.07-unified.761`) **e1RM from logged sets (educational)** — Epley est. 1RM on the exercise row after a working set; hideable; not a tested max. Originally #528 / `.739`.
- **`.760`:** (`2026.07-unified.760`) **Vs last session on the set row** — After a working set saves, a tiny +kg / +rep / same vs last session. First-ever and warmups blank. Originally #530 / `.741`.
- **`.759`:** (`2026.07-unified.759`) **Last-set ghost on the Train set row** — One-tap last working set (not warmup) into the dial; first-ever stays empty. Originally #529 / `.738`.
- **`.758`:** (`2026.07-unified.758`) **Bodyweight + load on the Train set row** — On pull-ups/push-ups/dips the load field is extra weight (belt/vest); 0 logs BW only. Originally #527 / `.735`.
- **`.757`:** (`2026.07-unified.757`) **Optional tempo on the set row** — Optional ecc/pause/con (`3-1-1`) on completed rows beside RPE/RIR; last tempo prefills; never blocks Log set. Originally #526 / `.734`.
- **`.756`:** (`2026.07-unified.756`) **Optional RIR on the set row** — Optional 0–5 RIR on completed rows beside RPE; empty valid; Log set ungated. Originally #517 / `.725`.
- **`.755`:** (`2026.07-unified.755`) **Unilateral L/R on the set log** — Optional L/R/Alt on unilateral lifts; after L suggest R; bilateral strips stray side. Originally #516 / `.724`.
- **`.754`:** (`2026.07-unified.754`) **Drop sets on the set log** — Footer Drop after a working set starts a −20% follow-up and skips rest. Originally #515 / `.723`.
- **`.753`:** (`2026.07-unified.753`) **Habit week count + HABIT contract** — Today header always shows this week: N days logged (0 is fine). HABIT contract: daily Train is the loop. Originally #511 / `.722`.
- **`.752`:** (`2026.07-unified.752`) **Garage swap on the exercise row** — Swap on the Train row / Coach line offers 1–2 garage stand-ins; equipment change clears last load; hide when already garage. Originally #514 / `.721`.
- **`.669`:** (`2026.07-unified.669`) **Excellence RESULT + agent stop-rule** — `excellenceGate` path policy + `check-excellence-gate` on gate/PR CI; wedge still ships while unscored.
- **Horizon W + full-launch override (2026-08-05).** Wedge excellence still required; agents may ship rewards + full surface honesty. Fuel estimate accuracy remains.
- **Free-first beta (~4 weeks):** LLC + EIN pending — **no Bundle UI** + **full depth unlocked**; More/rail **Pillars demoted until first workout** (F-004 / `.695`) — still no Bundle ([docs/FREE_BETA.md](docs/FREE_BETA.md)).
- **`e2e:visual` is the one dark gate.** Its three baselines were generated **2026-07-22, before the rebrand**, and depicted the old navy/emerald dark design — black grounds, emerald CTAs, rounded corners. Verified by opening one, not inferred from dates. **Deleted**, because a known-wrong baseline is worse than none: the first Linux run would have shown four huge diffs, and the reflex there is `--update-snapshots` without looking, which launders whatever renders that day into truth. `home-reduced.png` **never had a baseline at all**, so the homepage has been silently self-approving since the case was written. **First Linux CI run after billing clears must bootstrap all four** (`npx playwright test --grep @visual --update-snapshots`, then commit the artifact) — it cannot be done on macOS, the pixels will not match.



- **Three jobs that built a different app (`.255`):** `ci-extended.yml` ran for the first time on 2026-08-01 — Actions had been billing-blocked — and **every one of its three app-building jobs was configured wrong**, in three different ways, all invisible until it ran. `e2e-critical` had no `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, so it reproduced `.249` exactly: `isPushSupported()` returns false without it, every component behind it renders nothing, and *"Today shows one red action at 19:00"* asserts one of them is mounted. `visual-regression` set `PRIVATE_MODE: 'false'` on the **assertion step** — after the build, after the server started — and GitHub step env does not reach earlier steps, so it reached neither. `lighthouse-budget` set **nothing at all**. On a runner that is not neutral: `isPrivateModeEnabled()` returns true whenever `PRIVATE_MODE` is unset and `NODE_ENV === 'production'` ([`privateGate.ts:23`](src/lib/privateGate.ts)), and `next build`/`next start` both set that. So both jobs served the **gated** app, where `/` and `/log` are not in `PRIVATE_GATE_PUBLIC_PATHS` and redirect to `/private`. **Two consequences, both of them a check that could not fail.** [`lighthouse-budget.mjs:9`](scripts/lighthouse-budget.mjs) scores four pages and two of them were the teaser — the lightest page in the product, timed as if it were the product. And the `.234` baseline bootstrap wrote `home-reduced.png` as a screenshot of `/private`, under the name of the most-linked page in the app, in the same run that `visual.spec.ts`'s own header called *"covering it for the first time"*. That is verbatim the laundering `.221` deleted the previous baselines to avoid, arriving through the front door. **`/bundle` was the one case that survived, because it checked where it landed** — every case now goes through a `shoot()` helper that compares the landing path to the file name and refuses on a mismatch, and a redirect may only skip if it states a reason. The env fix removes the cause; the landing check catches the next one, because a baseline is exactly the artifact nobody re-reads. **The guard for `.249` had this same defect**: it named `gate.mjs` and `ci.yml`, and there were three files and eight jobs — `.220`'s *name that claims more than its enumeration*, inside the guard written for `.220`. New [`workflowBuildEnv.test.ts`](src/lib/workflowBuildEnv.test.ts) globs `.github/workflows/*.yml` and requires job-level env matching `gate.mjs` — job-level only, since step env is what caused two of the three failures. **Its own first draft had the same defect and a mutant killed it**: it decided scope with `/\bnpm run build\b/`, so a job running `npx next build` with no env passed silently — `.212` inside a guard written about `.220`, a few tests after I wrote *"a guard that enumerates cannot notice a fourth"*. Inverted to **in scope unless exempted**: 12 `NOT_THIS_APP` entries (scanners, cron pokes, the two that must *never* see CI placeholders — `apply-migration` and `sync-vercel-env` — plus `deploy-production`, which Vercel builds remotely from the real project env, the three remote smokes, and Android/Gradle), each with a reason, and a staleness test. A pattern list is silent about what it misses; an exemption list makes leaving a thing a reviewer can disagree with. 12 mutants killed. Tests 1186→1194.

- **The bootstrap the visual gate could not run (`.254`):** the suite has four cases and **zero committed baselines**. `home-reduced.png` never had one at all, so **`/` — the most-linked page in the product — has been silently self-approving** on every run since the case was written; the other three went in `.221` for depicting the pre-Modernist design. `.200` had already fixed the worse half (the job ran `--update-snapshots || true` and re-read the files it had just written, green every time over nothing) by making the absence **a loud failure with instructions** — and those instructions named a command **nobody could execute**. `ci-extended.yml`'s runner is the only Linux/Chromium environment this project has, and baselines made anywhere else differ by font hinting and antialiasing alone, which is precisely how a pixel comparison stops meaning anything. So the gate was correct *and* terminal. New `bootstrap_baselines` `workflow_dispatch` input, **default false**: an input rather than a shell flag or auto-fallback, so the normal path stays loud and the weekly schedule — which supplies no inputs — can never reach the generate. The generate **asserts nothing**, deliberately: it writes the PNGs, the existing `always()` upload carries them off the runner, and the gate is a human opening every file, because `.221` deleted the old set rather than refresh it on the grounds that *"the obvious response to four huge visual diffs is `--update-snapshots` without looking, which launders whatever the app happens to render that day into the new truth."* **`ciTruth`'s guard was narrowed, not weakened** — it forbade the flag anywhere in the step, but what made the old behaviour a defect was never the flag, it was that the *default path* wrote and re-read its own baselines; the rule is now about **reachability**. Six mutants killed. **Near-miss recorded:** the block-extraction regex ended on `\n\s*fi`, which matched the `fi` inside `find` on the next line, so the guard judged one line of the block and failed on a fragment — third lazy-quantifier stop in this programme after `.221`'s `border-radius: 0` and `.223`'s `prLine: null`. **Three baselines, not four** — `/bundle` self-skips while FREE_BETA redirects it to `/log`. **The eyes-on review found one**, which is what it is for: `exercise-squats` and `home-reduced` are clean (paper, poster red, radius 0, Archivo; the homepage's grey blocks are `GrayscalePhoto`'s deliberate no-`base` state), but **all six guidebook chapter heroes in `public/learn/*.webp` are 89–99% dark with teal accents and ~0% red** — the navy/emerald palette `.131` retired, on paper pages. `.137` re-inked the guidebook *cover* and rebuilt the PDF; the chapter heroes were not in that pass, and **nothing could have caught it** — `check-design-system` reads source, and a palette baked into a `.webp` is invisible to it (`.221` one layer out). So `guide-human-performance.png` is **not** a baseline to commit: the image is right about what renders and wrong to enshrine, which is exactly the laundering `.221` deleted the old set to avoid. **Blocked and named:** committing CI-generated PNGs needs the `visual-diffs` artifact, and this session's token gets `403 Resource not accessible by integration` on Actions — the images above were rendered locally (same viewport, `reducedMotion: reduce`), which answers every design question but cannot produce pixel-valid baselines. Mechanism shipped, run dispatched, download + commit is founder-owned.
- **The settle rule that could not see loading (`.253`):** `a11y.spec.ts` waited for `getAnimations()` to go quiet and called the page settled; [`Skeleton.tsx`](src/components/ui/Skeleton.tsx) **deliberately does not animate** — its header explains why, the old pulse *was* the information so `prefers-reduced-motion` deleted the only cue. Two correct decisions composing into a wait that is blind to loading **by construction**. Measured, not argued: `/profile` under a 40× CPU throttle reaches the axe scan with **two `aria-busy` regions on screen and zero running animations**. `settle()` now requires both, on `[aria-busy="true"]` rather than `[aria-busy]` (`HoldToConfirmButton` and `CoachChatPanel` bind the attribute to state, so a resting page carries `false` nodes the looser selector would wait on forever). That let the **route special-case** go: `if (path === '/active')` waited on the Start button's *copy* (`/start workout|loading session/i`) — `.220`'s shape, one string edit from vanishing, and no other route had one at all; `ActiveEmptyState` declares `aria-busy` while persist rehydrates, so the general rule covers it. **Eight placeholders never said they were loading**, all found by the new guard rather than looked for: `HomeTodayDashboard` mounted **five** widgets on `/` with `loading: () => <Skeleton/>` — bare `Skeleton` is `aria-hidden`, so they were invisible to a screen reader *and* to any settle rule; `BenchmarksPage` and `HistoryPage` (×2) drew chart slots as `<div className="h-48 animate-pulse bg-card"/>`, anonymous grey boxes carrying **the exact pulse `Skeleton` retired**; `FuelLogSheet` and `BuilderPage` rendered a bare `<p>Loading…</p>`, visible text announced to nobody. New `SkeletonBlock` and [`loadingStatesAnnounce.test.ts`](src/lib/loadingStatesAnnounce.test.ts), which **resolves the fallback component's own source anywhere in the repo** rather than listing which placeholders exist. **My first guard was `.220` inside the fix for `.220`** — it asserted the `aria-busy` selector *appeared*, so a mutant deleting `&& loading() === 0` from the quiet condition survived: the query ran, its answer was discarded, green. Nine mutants now die. **What this does not claim:** it is **not** a proven fix for the `/profile` skeleton-contrast violation seen once in `.250` — that did not reproduce in ~30 throttled runs at rates 1–80, every one reporting zero serious/critical. `.224` records me calling three failures "container flakiness" when one was real; shipping a fix and declaring the matter closed is the same error mirrored. **a11y stays out of `ci.yml`** until there is stability evidence — its `CI_ONLY_EXEMPT` reasoning (a gate that reddens on a render race teaches people to re-run until green) is honoured, not overridden because a fix feels right. **Third `git checkout --` self-revert**, after `.202` and `.205` — the rule *commit before mutating* was already written in the archive and I ran the mutants against uncommitted work anyway; nothing was lost, but the habit is the finding.

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
| Mission Score | The 0–100 **weekly** grade. **"Win Score" is the retired name** — same number. `.605` renamed the public compare pages and the FAQ; the guidebook prose, `learnPaths`, two component `defaultValue`s and `notificationLocales:149` still say Win Score, because those are i18n strings whose values propagate to 15 packs and that is a translation pass, not a rename. Do not add new "Win Score" strings. |
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
