/**
 * Every place this app gets built must build the *same* app.
 *
 * `.229` found `scripts/gate.mjs` and `.github/workflows/ci.yml` disagreeing:
 * the gate set a VAPID placeholder and CI did not, so every push surface
 * rendered nothing on CI and *"Today shows one red action at 19:00"* failed
 * there while passing locally. The guard written for it named the two files it
 * had just compared.
 *
 * `.235` — there were three. `ci-extended.yml` builds the app in **three**
 * separate jobs, and a guard that enumerates cannot notice a fourth. What the
 * enumeration missed, in the one run that job has ever had:
 *
 *   - `e2e-critical` had no VAPID key, so it reproduced `.229` exactly.
 *   - `visual-regression` set `PRIVATE_MODE` on a *step*, after the build and
 *     after the server started, so the private gate defaulted on and
 *     `home-reduced.png` was a screenshot of `/private`.
 *   - `lighthouse-budget` had no env at all, so two of the four pages in its
 *     budget (`/` and `/log`) were also `/private` — the lightest page in the
 *     product, scored as if it were the product.
 *
 * That is `.220`'s defect inside the guard written for `.220`: a name that
 * claims more than its enumeration. So this discovers instead. It globs
 * `.github/workflows/*.yml`, finds every job that runs `npm run build`, and
 * requires that job to set what `gate.mjs` sets. A new workflow, or a new job
 * in an existing one, is covered the day it is written and not the day someone
 * remembers this file exists.
 *
 * Deliberately **job-level** env only, not workflow-level inheritance. Step
 * env is what caused two of the three failures above, and a guard that accepted
 * env declared anywhere in the file would have passed on all three.
 *
 * Overlap note: `src/lib/gateEnvParity.test.ts` on #178 asserts the `gate.mjs`
 * ⇄ `ci.yml` half of this by name. When that lands, its two env tests are
 * subsumed here and should be deleted; its step-parity and ordering tests are a
 * different question and stay. One concept, one home — `.178`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const WORKFLOW_DIR = '.github/workflows';

/**
 * `BUILD_ENV` in `gate.mjs`, as `name → literal`.
 *
 * Values are written as `process.env.X || 'literal'`, so the literal is the
 * fallback the gate uses on a machine with nothing set — which is exactly the
 * configuration a CI runner has.
 */
function gateEnv(): Map<string, string> {
  const src = read('scripts/gate.mjs');
  const block = src.slice(src.indexOf('const BUILD_ENV'), src.indexOf('let step = 0'));
  assert.ok(block.length > 100, 'BUILD_ENV moved in gate.mjs — re-read this guard');

  /*
   * Split at each declaration first, then read the literal inside that segment.
   *
   * Doing it in one regex lets an optional cross-line branch reach past its own
   * line: `PRIVATE_MODE: 'false',` picks up the `|| 'https://ci-placeholder…'`
   * belonging to the *next* variable and the guard fails on a disagreement that
   * does not exist. Two forms have to be read — `NAME: 'x',` and
   * `NAME:\n  process.env.NAME || 'x',` — and a bounded segment keeps them apart.
   */
  const starts = [...block.matchAll(/^ {2}([A-Z_][A-Z0-9_]*):/gm)].map((m) => ({
    name: m[1],
    at: m.index ?? 0,
  }));

  const out = new Map<string, string>();
  starts.forEach((d, i) => {
    const segment = block.slice(d.at, starts[i + 1]?.at ?? block.length);
    const literal = segment.match(/'([^']+)'/);
    if (literal) out.set(d.name, literal[1]);
  });
  return out;
}

type Job = {
  workflow: string;
  name: string;
  /** Job-level `env:` only. Step env does not reach the build — that is the bug. */
  env: Map<string, string>;
  /** `workflow.yml:job-name` — how an exemption names it. */
  id: string;
};

/**
 * Jobs that do **not** run this web app, each with the reason.
 *
 * In scope by default, out of scope only in writing. The first draft of this
 * file did the opposite — it tested `/\bnpm run build\b/` against a job block
 * and treated everything else as irrelevant — and a mutant killed it: a job
 * running `npx next build` with no env at all passed, silently, because the
 * detector was keyed to one spelling of "builds". That is `.212` reproduced
 * inside a guard written about `.220`, a few tests after the sentence *"a guard
 * that enumerates cannot notice a fourth"*.
 *
 * An exemption list has its failure mode pointing the safe way: a new job is
 * covered on the day it is written, and getting out requires an entry a
 * reviewer can disagree with. A pattern list is silent about what it misses.
 *
 * Entries are `workflow.yml:job`, or `workflow.yml:*` for a whole file.
 */
const NOT_THIS_APP: { id: string; why: string }[] = [
  {
    id: 'aikido.yml:*',
    why: 'Third-party security scanner. It reads the repository and never builds or serves the app, so app env would only be a credential-shaped thing sitting in a scanner job.',
  },
  {
    id: 'codeql.yml:*',
    why: 'GitHub CodeQL static analysis. It builds its own database from source; nothing it produces is served, and its findings do not depend on runtime configuration.',
  },
  {
    id: 'gitleaks.yml:*',
    why: 'Secret scanner over git history. Adding placeholder credentials to the job whose purpose is hunting credentials would be an actively bad idea.',
  },
  {
    id: 'apply-migration.yml:*',
    why: 'Runs SQL against the real Supabase project using founder-held secrets. It must NOT receive the ci-placeholder URL — pointing a migration at a placeholder host is the exact failure this exemption prevents.',
  },
  {
    id: 'sync-vercel-env.yml:*',
    why: 'Pushes environment variables into Vercel through its API. It configures the app rather than running it, and handing it CI placeholders is how placeholders reach production.',
  },
  {
    id: 'cron-day-review.yml:*',
    why: 'Calls a scheduled endpoint on the deployed site over HTTP. Nothing is built here, and the configuration that matters is the deployment\u2019s rather than this runner\u2019s.',
  },
  {
    id: 'cron-wind-down.yml:*',
    why: 'Same shape as cron-day-review — an HTTP poke at the deployed site, with no build and no server on the runner.',
  },
  {
    id: 'deploy-production.yml:*',
    why: 'Runs `vercel deploy --prod`, which builds remotely from the project\u2019s real Vercel environment. This is the one lane that must never see CI placeholders: production reads the founder\u2019s dashboard config, and that is correct.',
  },
  {
    id: 'ci-extended.yml:gate-smoke',
    why: 'Hits a remote SMOKE_BASE_URL with secrets and skips entirely when that is unset. It builds nothing and serves nothing on the runner.',
  },
  {
    id: 'ci-extended.yml:growth-smoke',
    why: 'Same as gate-smoke — a remote smoke against the deployed site, guarded by SMOKE_BASE_URL, with no local build.',
  },
  {
    id: 'ci-extended.yml:rate-limit-smoke',
    why: 'Same as gate-smoke. It probes the deployed rate limiter for a 429; a locally built app would tell it nothing.',
  },
  {
    id: 'ci-extended.yml:android',
    why: 'Builds the native Compose app under apps/android with Gradle. A different application with its own configuration — NEXT_PUBLIC_* means nothing to it.',
  },
];

function isExempt(job: Job): boolean {
  return NOT_THIS_APP.some((e) => e.id === job.id || e.id === `${job.workflow}:*`);
}

/**
 * Every job in every workflow, with its job-level env and whether it builds.
 *
 * Hand-parsed rather than via a YAML library because the repo has no YAML
 * dependency and adding one to satisfy a test is a poor trade. The shape being
 * read is narrow and asserted: jobs at four-space indent under `jobs:`, env at
 * six, values at eight.
 */
function jobs(): Job[] {
  const files = readdirSync(path.join(root, WORKFLOW_DIR)).filter((f) => /\.ya?ml$/.test(f));
  assert.ok(files.length >= 2, `found ${files.length} workflow files — the glob broke`);

  const found: Job[] = [];

  for (const file of files) {
    const src = read(path.join(WORKFLOW_DIR, file));
    const jobsAt = src.search(/^jobs:$/m);
    if (jobsAt === -1) continue;
    const body = src.slice(jobsAt);

    // Job keys: exactly two spaces of indent, directly under `jobs:`.
    const heads = [...body.matchAll(/^ {2}([A-Za-z0-9_-]+):$/gm)].map((m) => ({
      name: m[1],
      at: m.index ?? 0,
    }));

    heads.forEach((h, i) => {
      const block = body.slice(h.at, heads[i + 1]?.at ?? body.length);

      const env = new Map<string, string>();
      const envAt = block.search(/^ {4}env:$/m);
      if (envAt !== -1) {
        // Consecutive six-space keys, stopping at the first line that is not one.
        for (const line of block.slice(envAt).split('\n').slice(1)) {
          const m = line.match(/^ {6}([A-Z_][A-Z0-9_]*):\s*'?([^'#]*?)'?\s*$/);
          if (m) {
            env.set(m[1], m[2].trim());
            continue;
          }
          if (/^ {6}#/.test(line) || line.trim() === '') continue;
          break;
        }
      }

      found.push({ workflow: file, name: h.name, env, id: `${file}:${h.name}` });
    });
  }

  return found;
}

test('the workflow parser reads real jobs and real env', () => {
  /*
   * A parser that silently returns nothing turns every assertion below into a
   * vacuous pass — which is the exact defect this file exists to catch, so it
   * would be a poor joke to ship one here. Floors as of `.235`: 10 workflow
   * files, 16 jobs, 4 of them in scope.
   */
  const all = jobs();
  assert.ok(all.length >= 12, `parsed only ${all.length} jobs — the parser broke`);

  const inScope = all.filter((j) => !isExempt(j));
  assert.ok(inScope.length >= 4, `only ${inScope.length} jobs are in scope — the parser broke`);

  const withEnv = all.filter((j) => j.env.size > 0);
  assert.ok(withEnv.length >= 4, `read env on only ${withEnv.length} jobs — the parser broke`);

  // Named, so a rename that empties the set fails here rather than passing quietly.
  const ids = new Set(inScope.map((j) => j.id));
  for (const id of [
    'ci.yml:build-and-test',
    'ci-extended.yml:e2e-critical',
    'ci-extended.yml:lighthouse-budget',
    'ci-extended.yml:visual-regression',
  ]) {
    assert.ok(ids.has(id), `${id} is no longer an in-scope job — re-read this guard`);
  }
});

test('every exemption states a reason', () => {
  for (const e of NOT_THIS_APP) {
    assert.ok(e.why.trim().length > 60, `${e.id}: "${e.why}" is not a reason`);
  }
});

test('no exemption is stale', () => {
  /*
   * `.220`'s direction: an entry for a job that no longer exists makes the list
   * look more considered than it is, and hides the day a real job inherits the
   * name.
   */
  const all = jobs();
  const files = new Set(all.map((j) => j.workflow));
  const ids = new Set(all.map((j) => j.id));

  const stale = NOT_THIS_APP.filter((e) =>
    e.id.endsWith(':*') ? !files.has(e.id.slice(0, -2)) : !ids.has(e.id)
  ).map((e) => e.id);

  assert.deepEqual(stale, [], 'these exemptions name jobs or workflows that no longer exist');
});

test('every job that runs this app sets everything the local gate sets', () => {
  const gate = gateEnv();
  assert.ok(gate.size >= 4, `parsed only ${gate.size} vars from gate.mjs — the parser broke`);

  const problems: string[] = [];
  for (const job of jobs().filter((j) => !isExempt(j))) {
    const missing = [...gate.keys()].filter((k) => !job.env.has(k));
    if (missing.length) {
      problems.push(`${job.id}: missing ${missing.join(', ')}`);
    }
  }

  assert.deepEqual(
    problems,
    [],
    'these jobs run this app with less configuration than `npm run gate` does, so a green ' +
      'local gate says nothing about them. If a job does not run the app, add it to ' +
      'NOT_THIS_APP with the reason:\n  ' + problems.join('\n  ')
  );
});

test('and sets them to the same values', () => {
  /*
   * Presence alone is not enough. A placeholder that differs between lanes
   * reproduces the defect with extra steps: the surfaces render in one lane and
   * not the other, which is what `.229` actually was.
   */
  const gate = gateEnv();

  const problems: string[] = [];
  for (const job of jobs().filter((j) => !isExempt(j))) {
    for (const [k, v] of gate) {
      const got = job.env.get(k);
      if (got !== undefined && got !== v) {
        problems.push(`${job.id}: ${k} is "${got}", gate uses "${v}"`);
      }
    }
  }

  assert.deepEqual(problems, [], 'lanes disagree on these values:\n  ' + problems.join('\n  '));
});

test('no building job leaves the private gate to its default', () => {
  /*
   * The specific mechanism behind two of the three `.235` failures, asserted on
   * its own so the failure message names the cause rather than a variable.
   *
   * `isPrivateModeEnabled()` returns true whenever `PRIVATE_MODE` is unset and
   * `NODE_ENV === 'production'` (`src/lib/privateGate.ts:23`), and both `next
   * build` and `next start` set that. So "no env" is not neutral on a runner —
   * it silently selects the gated app, where `/` and `/log` redirect to
   * `/private`. Anything measured or photographed there is measuring the teaser.
   */
  const unset = jobs()
    .filter((j) => !isExempt(j) && !j.env.has('PRIVATE_MODE'))
    .map((j) => j.id);

  assert.deepEqual(
    unset,
    [],
    'these build with PRIVATE_MODE unset, which on a runner means the private gate is ON ' +
      'and / and /log serve the teaser page:\n  ' + unset.join('\n  ')
  );
});

test('the VAPID placeholder is present everywhere, and is only the public half', () => {
  /*
   * Named explicitly because it is the one that broke and the one a future
   * reader is most likely to delete on security grounds.
   *
   * It is safe: the public half of a keypair gates only whether the UI *draws*.
   * Nothing can subscribe — the server has no private key and no test grants
   * notification permission. Removing it hardens nothing; it un-renders every
   * push surface and makes the guards over them vacuous again, which is the
   * `.198` defect this placeholder exists to prevent.
   */
  for (const job of jobs().filter((j) => !isExempt(j))) {
    const key = job.env.get('NEXT_PUBLIC_VAPID_PUBLIC_KEY');
    assert.ok(key, `${job.id} lost the VAPID placeholder`);
    // Public VAPID keys are 65-byte P-256 points, base64url — never a private key.
    assert.match(
      key,
      /^B[A-Za-z0-9_-]{80,}$/,
      `${job.id}: not a public VAPID key — do not put a secret here`
    );
  }
});

test('the visual suite refuses to snapshot a page it was redirected to', () => {
  /*
   * The env fix above removes the cause we found. This asserts the check that
   * catches the next one: `home-reduced.png` was written as `/private` because
   * nothing compared where the browser landed with what the file was called,
   * and a baseline is precisely the artifact nobody re-reads.
   *
   * Asserted on the source rather than by running Playwright because this suite
   * needs a Linux container and a server; the shape is what regresses.
   */
  const spec = read('tests/e2e/visual.spec.ts');

  assert.match(spec, /new URL\(page\.url\(\)\)\.pathname/, 'the landing-URL check is gone');
  assert.match(spec, /landed !== c\.path/, 'the landing-URL comparison is gone');

  // Every case must go through the helper — a raw `page.goto` in a test body is
  // a case that opted out, which is how three of the four opted out before.
  const bodies = spec.slice(spec.indexOf("test.describe('visual regression"));
  assert.equal(
    [...bodies.matchAll(/await page\.goto\(/g)].length,
    0,
    'a @visual case navigates directly instead of via shoot(), so it does not check where it landed'
  );

  const cases = [...bodies.matchAll(/await shoot\(page, \{/g)].length;
  assert.ok(cases >= 4, `only ${cases} cases go through shoot() — expected at least 4`);

  // A skip has to carry a reason, or "redirected" quietly becomes "passed".
  assert.match(
    spec,
    /test\.skip\(\s*!!c\.skipWhenRedirected/,
    'a redirect with no stated reason must fail, not skip'
  );
});
