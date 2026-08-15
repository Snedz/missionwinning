# Agent recipes — Mission Winning

Copy-paste playbooks for common tasks. Read [AGENTS.md](../AGENTS.md) and folder `INDEX.md` first.

---

## 1. Add a new app page route

1. `app/(app)/your-path/page.tsx` — import page component only
2. `src/page-components/YourPage.tsx` — full UI
3. Row in [app/INDEX.md](../app/INDEX.md)
4. `navConfig.ts` if in nav
5. i18n keys in `src/i18n/*Locales.ts`
6. File header comment on page component

---

## 2. Add a new API route

1. `app/api/your-path/route.ts` — thin handler
2. Logic in `src/lib/yourFeatureServer.ts`
3. Zod schema in `src/lib/apiSchemas.ts`
4. `rateLimitAsync` + auth (`getUserFromRequest`, `hasAppAccess`, etc.)
5. Update [app/api/INDEX.md](../app/api/INDEX.md) and [docs/API.md](API.md)
6. File header on route (auth, rate, schema)

---

## 3. Fix premium 403 for enrolled user

1. Check Vercel: `DEMO_PREMIUM=false` in production
2. Verify `isPremiumForUser` uses `getSupabaseAdmin()` in [premiumServer.ts](../src/lib/premiumServer.ts)
3. Confirm `enrollments` row: `user_email` or `user_id`, `status=active` or `premium_granted=true`
4. User signed in with **same email** as Stripe checkout
5. Curl: `GET /api/premium/status` with session cookie

---

## 4. Add rate limit to an endpoint

```ts
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';

const ip = clientIp(request);
const limited = await rateLimitAsync(`your-key:${ip}`, LIMIT, 60_000);
if (!limited.ok) {
  return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
}
```

Document limit in `docs/API.md`. Optional: set `UPSTASH_REDIS_*` in prod.

---

## 5. Add Zod validation to POST body

```ts
import { yourSchema, parseJsonBody } from '@/lib/apiSchemas';

const raw = await request.json().catch(() => null);
const parsed = parseJsonBody(yourSchema, raw);
if (!parsed.ok) {
  return NextResponse.json({ error: parsed.error }, { status: 400 });
}
const body = parsed.data;
```

Define `yourSchema` in `apiSchemas.ts` with max string lengths.

---

## 6. Add a cross-pillar coach chip

1. Rule in [crossPillarCoach.ts](../src/lib/crossPillarCoach.ts)
2. Test in `crossPillarCoach.test.ts`
3. Chip renders via [CrossPillarCoachChips.tsx](../src/components/today/CrossPillarCoachChips.tsx)
4. i18n keys for label and message

---

## 7. Change Mission Coach plan logic

1. Read pipeline: [src/lib/coach/INDEX.md](../src/lib/coach/INDEX.md)
2. Edit `planEngine.ts`, `adapt.ts`, or `selector.ts` — not page components
3. Update golden tests in `planEngine.test.ts` / `adapt.test.ts`
4. `npm test` — coach suite must pass

---

## 8. School class API change

1. Auth via [schoolClassAccess.ts](../src/lib/schoolClassAccess.ts)
2. Teacher PIN in header `x-teacher-pin`, never query string for new code
3. Redact user ids in public JSON — use `athleteId` from [userIdRedact.ts](../src/lib/userIdRedact.ts)
4. Update [docs/help/fitness-test-and-school.md](help/fitness-test-and-school.md) if user-visible

---

## 9. New i18n string

1. Add the key to the appropriate `src/i18n/fooLocales.ts` **English** pack
2. Ensure every `APP_LANGS` entry can resolve it (spread `...en` + overrides, or pack fill)
3. Use `t('key', { defaultValue: 'English fallback' })` in UI
4. Run `npm run i18n:fill` if other langs still show English placeholders
5. Run `npm run i18n:parity` (must pass) and `npm run export-locales`
6. Brand / proper nouns that stay identical: add to `scripts/i18n-allowlist.json`
7. **Do not** use `src/locales/`

Canonical langs: [`src/i18n/appLangs.ts`](../src/i18n/appLangs.ts) (`APP_LANGS`, 15 languages).

---

## 10. Touching auth / PII / webhooks / LLM / health flags

Living census: [security/PROGRAM_STATUS.md](security/PROGRAM_STATUS.md). Catalog: [`docs/compliance/controls.yaml`](compliance/controls.yaml). This is **not** a SOC 2 / ISO / HIPAA / GDPR certification.

**Required reads**

1. [CONTEXT.md](../CONTEXT.md) `## Now`
2. [PROTECTION.md](PROTECTION.md)
3. [LEGAL_SAFETY.md](LEGAL_SAFETY.md) §2 (store-label inventory)
4. [security/PROGRAM_STATUS.md](security/PROGRAM_STATUS.md)

**Required tests** (run the ones your change can break)

```bash
npx tsx --test src/lib/healthDataBucket.test.ts
npx tsx --test src/lib/legal/supportedRegions.test.ts
npx tsx --test src/lib/privacyInstill.test.ts
npx tsx --conditions=react-server --test src/lib/accountDataServer.routetest.ts
npm run compliance:status   # fail count must stay 0
```

**Never**

- Claim SOC 2, ISO 27001, HIPAA, or GDPR in product or docs
- Tick founder-only boxes (`MAIL_POSTAL_ADDRESS`, DMCA agent, Play form, ZDR contract)
- Flip `PRIVATE_MODE`
- Treat [REDTEAM_2026-08-13.md](security/REDTEAM_2026-08-13.md) as live — use PROGRAM_STATUS

**Review checklist**

- [ ] No secrets in `NEXT_PUBLIC_*`
- [ ] Premium check server-side (`premiumServer.ts`, never localStorage)
- [ ] Auth is `getUser()` / `hasAppAccess` + Zod — no second copy of a predicate
- [ ] IDOR: filter by session `user_id`, not a client `userId` / unproven `deviceId`
- [ ] Account delete/export never forwards `parsed.data.deviceId` into the executor
- [ ] Access country is not `x-country-code`; Vercel allow is `x-vercel-ip-country` only
- [ ] Assessment / pregnancy / PAR-Q never call `saveNutritionEntry` or PostHog properties
- [ ] New `create table` has a fate in `accountDataRegistry.ts`
- [ ] New third party is a LEGAL_SAFETY §2 row **and** a Privacy sentence
- [ ] Rate limit on brute-force / mail / webhook endpoints
- [ ] `npm run security-smoke` if deploy smoke env is available

This repo has no `.greptile/` tree. Instill is this recipe + `privacyInstill.test.ts` + the colocated hunt tests. Do not invent a Greptile config.

---

## 11. Continue the agent graph loop

1. Read [GRAPH_LOOP.md](GRAPH_LOOP.md) — the queue is the source, not chat history. Shapes live there (chain / diamond / router / controlled cycle).
2. Take **only** the top `open` loop. Investigate on current master before coding.
3. If the loop’s defect is already gone, mark it `done (already true)` with proof paths and stop.
4. One PR. `[skip vercel]` unless the founder asked for Preview.
5. Touching `src|app|scripts|supabase` → bump `APP_BUILD_LABEL` past master, LOG + CONTEXT `## Now` in the same commit. Surface paths while excellence is unscored need `Excellence-Override: <reason>`.
6. Ordinary loop: close it in `GRAPH_LOOP.md` (Outcome = PR + label). Campaign row: leave `open`; update the workbench only. Do not start the next loop in that PR.
7. Spawn the next agent with the copy-paste prompt in GRAPH_LOOP.md.

The live queue is the top `open` row in GRAPH_LOOP.md. If that row is a gauntlet campaign (`GNT-*`), **stop** and use recipe 12. Do not implement the campaign as one PR. Do not mark the campaign row `done` after one builder.

Do not write excellence `status: pass`. Do not restore cinematic `/`.

Hard bans stay: free logger never gated · no `PRIVATE_MODE` flip · no invented traction.

---

## 12. Run a gauntlet campaign round

**Required reads:** [GAUNTLET_LOOP.md](GAUNTLET_LOOP.md) · the campaign workbench · [GRAPH_LOOP.md](GRAPH_LOOP.md) · [EXCELLENCE_RESULT.md](EXCELLENCE_RESULT.md) if the campaign maps to RESULT.

This recipe wins when the top GRAPH_LOOP `open` row is a campaign (`GNT-*`). The first action is the workbench **Next spawn** line (role · unit · round).

1. LEAD boots the spine + workbench. Bars and budget already written, or this spawn *is* the instrument-commission round. Critic the oldest shipped unit (empty critic cell) before commissioning the next builder.
2. One BUILDER, one unit, one PR — only if Next spawn is BUILDER. Instruments = the workbench’s exact commands, green locally before the PR. Surface paths: `Excellence-Override: gauntlet GNT-<n>.U<u> round <r>`.
3. Fresh CRITIC. Does not read the builder’s PR body or chat. Boot: [GAUNTLET_LOOP.md](GAUNTLET_LOOP.md) §4 critic boot (`npm run dev`, never gated `next start`). Evidence trio: 390×844 walk · own-app stills under `docs/gauntlet/<ID>/evidence/` · pasted instrument output.
4. Verdict: every **written instrument** PASS/FAIL + exactly one “Biggest remaining gap.” A feel sentence is `founder-only, not a builder brief`. Hero-surface passes append a DESIGN_REVIEW §Passes row, Reviewer `Gauntlet <ID>.<U> R<r>`.
5. LEAD pastes a **valid** verdict verbatim (trio present). Missing stills or “tests passed” is invalid — do not paste; re-spawn the critic. Instrument FAIL → that gap is the next builder brief. Feel-only FAIL is not.
6. All units green → one SMOOTHER pass → report. Terminal state `ready-for-founder`. Never write `status: pass`.
7. GRAPH_LOOP campaign row goes `done` only when the report is written.

**Required tests:** the unit’s named instruments (see the workbench table). Plus the GRAPH_LOOP loop tests if the builder touched `src|app|scripts|supabase`.

**Never**

- Builder grades itself
- Treat the workbench as a second queue or `## Now` block
- Invent a bar mid-round
- Commit competitor pixels
- Write excellence `status: pass`
- Flip `PRIVATE_MODE` / raise TAP_BUDGET / firstPaintFloor / bundle caps

---

## 13. Run an idea-loop harvest

**Required reads:** [IDEA_LOOP.md](IDEA_LOOP.md) · [docs/mechanics/INDEX.md](mechanics/INDEX.md) · [GRAPH_LOOP.md](GRAPH_LOOP.md).

Wins when the queue's residual is thin and the honest next step is *a new idea*
rather than another letter. It is the alternative to inventing `AK2`.

1. **SCOUT** (cheap, batched) writes observations into `docs/mechanics/inbox/` — facts, a link, a date. Never a recommendation. Look outside this category on purpose.
2. **ANATOMIST** promotes one observation to a `mechanic` node or discards it. All nine primitives answered, `precondition` and `also_seen_in_failures` included — those two are the fields cargo-culting always drops.
3. `npm run idea:next` names the behaviour axis with an empty cell. **You do not choose it.**
4. **TRANSLATOR** reads only `npm run idea:pack <class>` and proposes hypotheses against that axis. Every one needs `removes`, `guardrail` and `kill_criterion`.
5. **RED TEAM** — fresh context, a *different model family* — tries to refute each: constraint violation, precondition arithmetic, anti-library hit, backfire edge, fake instrument, prospective hindsight. Default to refuted when uncertain.
6. `npm run idea:validate`, then `npm run idea:next`. Paste the single row into GRAPH_LOOP as the top `open` row, prefixed `IL-`.
7. Record the run in `docs/mechanics/LEDGER.md` — spawns, tier, cap, spend, yield.
8. After the gauntlet closes it, **HISTORIAN** writes the `verdict` node and the `ANTILIBRARY.md` row — **whether it won or lost.**

**Required tests:** `npm run idea:validate` plus the colocated guards (`npx tsx --test "src/lib/ideaGraph/*.test.ts"`).

**Never**

- Emit more than one row per run
- Let the model that wrote a candidate judge it
- Target the loop's own process, tooling or queue hygiene as a behaviour
- Upgrade an evidence class, or score a candidate on how good its argument sounds
- Record a mechanic at surface level ("add badges" must stay unwritable)
- Commit competitor pixels · invent an `AnalyticsEvent` name · raise a ratchet

**Stop** when two consecutive harvests yield nothing that survives the constitution filter, novelty and an unfilled cell. That is the measured replacement for "Do not invent X2" — do not refill.

---

## 14. Boot the graph from outside the repo

**Required reads:** whatever `npm run queue:next` names. That is the point of it.

Recipes 11 · 12 · 13 each state when they win, in three different files. This one
decides between them, and works when the shell is not already in the repo — the
`/graph` skill (machine-local, `~/.claude/skills/graph/`, never `.claude/skills/`:
hard rule 6) is a thin loader over exactly these steps.

1. **Find the repo and verify it.** cwd, walking up · `$MW_REPO` · `~/missionwinning`
   and the usual siblings. A candidate counts only when **all three** hold:
   `docs/GRAPH_LOOP.md` exists, `vision.md` exists, `package.json` `name` is
   `mission-winning`. A directory with the right basename is not the repo.
2. **Boot the spine** — `CONTEXT.md` → `AGENTS.md` → `INDEX.md` → `ORCHESTRATION.md`
   → [GRAPH_LOOP.md](GRAPH_LOOP.md), whose § *Copy-paste prompt* BANS block you read
   **verbatim** rather than from memory. Then the folder `INDEX.md` you will edit.
3. **`npm run queue:next`.** It names the live ticket, the route, the recipe, the
   workbench and its `Next spawn` line, any `founder`/`blocked` row it skipped, and
   the monoculture ratchet. It prints; it never edits the queue.
4. **Take the route it named**, and only that one — `build` → recipe 11 · `gauntlet`
   → recipe 12 · `harvest` → recipe 13. Not a more interesting row, not two rows.
5. **One loop, then stop** ([GRAPH_LOOP.md](GRAPH_LOOP.md) loop rule 2). Print
   `loop id · role (if gauntlet) · PR + label (or already-true proof) · next spawn`.

**Required tests:** `npx tsx --test "src/lib/loopQueue/*.test.ts"` if you touched the
router; otherwise the loop's own tests, per the recipe you were routed to.

**Never**

- Choose the route yourself when `queue:next` disagrees — fix the queue or the
  router, in its own PR
- Write another plan instead of executing the row ([GRAPH_LOOP.md](GRAPH_LOOP.md) § *Stop the graph if*)
- Mint the next letter section to refill a thin queue — that is what routing to a
  harvest is for, and `MAX_SINGLE_ROW_RUN` now goes red instead of asking nicely
- Put this skill in `.claude/skills/` (hard rule 6) · merge your own PR · push `master`

---

## Quick commands

```bash
npm run queue:next       # which loop runs next, and under which recipe
npm test
npm run build
npm run lint
SMOKE_BASE_URL=https://your-preview.vercel.app npm run security-smoke
node scripts/verify-supabase-security.mjs
```
