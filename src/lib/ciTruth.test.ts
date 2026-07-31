/**
 * A guard nobody runs is a guard that does not exist.
 *
 * `.195`–`.199` closed one defect class — *a thing was built and nothing
 * asserted anyone could reach it*. This is that class applied to the checks
 * themselves, and the repo had two live instances:
 *
 *   - **`npm run a11y` executed nowhere.** 33 tests over 30 routes, excluded
 *     from `npm run gate` (which said so in its closing line) and absent from
 *     every workflow — while `ci.yml` carried a comment claiming it "stays in CI
 *     extended". `grep -rn a11y .github/workflows/` returned zero hits. The
 *     first time it was ever run, it found a real serious violation.
 *   - **The visual-regression job passed vacuously.** With no committed
 *     baselines it ran `--update-snapshots || true` and then re-ran against the
 *     files it had just written. Green forever, guarding nothing.
 *
 * Both are the same shape as PR #142's discarded baselines: a check that exists,
 * reports success, and measures nothing.
 *
 * So every npm script this repo treats as a check must run *somewhere* — the
 * gate or a workflow — or sit in `NOT_RUN` with a written reason. Source-text
 * reading in the `surfaceReality.test.ts` idiom.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const GATE = 'scripts/gate.mjs';
const WORKFLOW_DIR = '.github/workflows';

/**
 * Workflow YAML with comment lines removed.
 *
 * Without this, `gitleaks.yml`'s header comment — which merely *mentions*
 * `npm run secrets:scan` as the local fallback — counted as the script running
 * in CI. A guard that reads a comment as execution is the `.195` header-menu
 * defect again, and it fired on the first run of this very suite.
 */
function workflowSources(): string {
  return readdirSync(path.join(root, WORKFLOW_DIR))
    .filter((f) => /\.ya?ml$/.test(f))
    .map((f) =>
      read(path.join(WORKFLOW_DIR, f))
        .split('\n')
        .filter((line) => !/^\s*#/.test(line))
        .join('\n')
    )
    .join('\n');
}

/**
 * Scripts that are checks — they can fail and mean something. Deliberately not
 * every npm script: `dev`, `build` and the founder-ops tools against production
 * are not guards, and a rule that fires on them is a rule someone disables.
 */
const CHECKS = [
  'lint',
  'typecheck',
  'test',
  'test:routes',
  'i18n:parity',
  'check-build-label',
  'check-display-type',
  'check-token-sync',
  'a11y',
  'e2e:visual',
  'security-audit',
  'secrets:scan',
];

/**
 * Checks that deliberately run nowhere automatic, each with a reason.
 *
 * A row here is a decision on the record. The reason is read by whoever adds
 * the next one — which is the only thing that keeps a table like this from
 * becoming the place checks go to die.
 */
const NOT_RUN: { script: string; reason: string }[] = [
  {
    script: 'secrets:scan',
    reason:
      'The secret scan itself runs as a GitHub Action (gitleaks.yml uses gitleaks/gitleaks-action, not this script). The npm script is the local fallback for when Actions is billing-blocked — as it is now — and putting it in the gate would make every contributor install the gitleaks binary.',
  },
];

test('every check runs somewhere, or says why it does not', () => {
  const gate = read(GATE);
  const workflows = workflowSources();
  const stranded: string[] = [];

  for (const script of CHECKS) {
    const exempt = NOT_RUN.find((n) => n.script === script);
    if (exempt) {
      assert.ok(
        exempt.reason.trim().length > 0,
        `NOT_RUN entry for ${script} has no reason — an exemption without one is how a11y went unrun for months`
      );
      continue;
    }
    // `run('Label', 'npm', ['run', 'x'])` in the gate, or `npm run x` in a workflow.
    const inGate =
      gate.includes(`'${script}'`) || gate.includes(`npm run ${script}`);
    const inWorkflow = workflows.includes(`npm run ${script}`);
    if (!inGate && !inWorkflow) stranded.push(script);
  }

  assert.deepEqual(
    stranded,
    [],
    `these checks execute nowhere — add them to ${GATE} or a workflow, or give them a reasoned NOT_RUN row:\n  ${stranded.join('\n  ')}`
  );
});

/** The mirror: an exemption for a check that does run is noise in the table. */
test('every NOT_RUN row describes a check that really is unrun', () => {
  const gate = read(GATE);
  const workflows = workflowSources();
  for (const { script } of NOT_RUN) {
    const runs =
      gate.includes(`'${script}'`) ||
      gate.includes(`npm run ${script}`) ||
      workflows.includes(`npm run ${script}`);
    assert.ok(
      !runs,
      `${script} is in NOT_RUN but it does run — delete the row so the table stays a list of real gaps`
    );
  }
});

/**
 * The a11y suite specifically, because it is the one that went unrun.
 *
 * Naming it rather than trusting the generic rule: the generic rule would also
 * be satisfied by someone adding a11y to a weekly cron, which is not what the
 * `.200` decision was.
 */
test('a11y runs in the gate, not only in a schedule', () => {
  const gate = read(GATE);
  assert.match(
    gate,
    /\[\s*'run',\s*'a11y'\s*\]/,
    `${GATE} must invoke npm run a11y — it is 33 tests over 30 routes and it executed in no workflow and no gate until .200`
  );
});

/**
 * A check that cannot fail is not a check.
 *
 * `|| true` and `continue-on-error` both convert a red result to green. They
 * have legitimate uses (uploading artifacts after a failure), so this is scoped
 * to the step that runs the visual suite — the one that actually did this.
 */
test('the visual job fails when it has no baselines', () => {
  const wf = read(path.join(WORKFLOW_DIR, 'ci-extended.yml'));
  const start = wf.indexOf('name: Visual regression');
  assert.notEqual(start, -1, 'expected a visual-regression step in ci-extended.yml');
  const step = wf.slice(start, wf.indexOf('- name:', start + 10));

  /*
   * `echo` lines are excluded, and that is not a loophole — the step now *tells*
   * the reader how to bootstrap baselines, so its help text legitimately
   * contains the flag. The rule is about what the step runs, not what it says.
   * (Caught on this guard's own first run, by its own instructions.)
   */
  const commands = step
    .split('\n')
    .filter((line) => !/^\s*(#|echo\b)/.test(line))
    .join('\n');

  assert.ok(
    !/--update-snapshots/.test(commands),
    'the visual step must not write its own baselines — it then re-runs against the files it just wrote and passes with nothing committed'
  );
  assert.ok(
    !/\|\|\s*true/.test(commands),
    'the visual step must not swallow its exit code'
  );
  assert.ok(
    /exit 1/.test(step),
    'missing baselines must fail loudly — a green job over zero baselines is PR #142 wearing a different hat'
  );
});

/**
 * "In a workflow" is not "runs" while no workflow can run.
 *
 * `.213` — the rule above accepts a check that appears in any
 * `.github/workflows` YAML. Every workflow in this repo is currently
 * **billing-blocked**: each job dies in seconds with `runner_id: 0` and no
 * runner assigned. So the rule I wrote in `.200` to catch *checks that do not
 * run* is presently satisfied by workflows that **cannot run** — the same
 * defect, one level up, inside the guard against it.
 *
 * The proof is `npm run security-audit`. It **exits 1 today** — 48 advisories,
 * 17 of them high — and appears only in `ci.yml`, so `ciTruth` passes it while
 * nothing has ever executed it. It has been red-by-omission for this suite's
 * entire life.
 *
 * Honest scope: the worst advisories (axios CVSS 8.7, `bigint-buffer` 7.5)
 * enter solely through `@phantom`/`@solana`, and that path is unreachable today
 * — `/bundle` 307s during free beta, `PhantomLifetimePayButton` returns null,
 * and the SDK is already `dynamic()`. **This is CI truth and maintenance debt,
 * not live exposure.** `next` and `sharp` are the reachable ones.
 *
 * This does not try to fix billing. It makes the dependency explicit, so a check
 * whose only home is a dead workflow is *named* as unrun rather than counted as
 * covered.
 */

/** GitHub Actions billing state — the single fact this rule turns on. */
const CI_CAN_RUN = false; // See CONTEXT.md `## Now` → Status.

test('a check whose only home is a workflow is named, not counted as covered', () => {
  if (CI_CAN_RUN) return; // Nothing to say once the runners are back.

  const gate = read(GATE);
  const workflows = workflowSources();
  const workflowOnly = CHECKS.filter((script) => {
    if (NOT_RUN.some((n) => n.script === script)) return false;
    const inGate = gate.includes(`'${script}'`) || gate.includes(`npm run ${script}`);
    return !inGate && workflows.includes(`npm run ${script}`);
  });

  assert.deepEqual(
    workflowOnly,
    ['security-audit'],
    'While Actions is billing-blocked, this list is the honest answer to "what is not being ' +
      'checked at all". It changed — update it deliberately, or move the check into ' +
      '`npm run gate`, which is the only thing that actually runs.\n' +
      `  currently workflow-only: ${workflowOnly.join(', ') || '(none)'}`
  );
});

/**
 * And the audit's state is recorded rather than assumed. `npm run security-audit`
 * uses `--audit-level=high` and exits 1 today, so the moment billing clears CI
 * goes red on it — joining gitleaks. Better known now than discovered as a
 * surprise on the first green-runner day.
 */
test('the failing-and-unrun audit is stated where the next reader will look', () => {
  assert.match(
    read('CONTEXT.md'),
    /billing-blocked/,
    'CONTEXT.md `## Now` must record the Actions state — it is the fact CI_CAN_RUN above encodes'
  );
});

/**
 * A skipped check must never be counted as a passed one.
 *
 * `.213` — `gate-smoke.ts` had **two** checks that pushed `ok: true` with a
 * detail reading "skipped", so the summary reported them as passing while they
 * had measured nothing: the PWA assets probe (behind `SMOKE_EXPECT_PWA`) and the
 * unlocked-`/welcome` probe (behind `SMOKE_ACCESS_SECRET`). That is the same
 * defect `ci-extended.yml` documents at length for the visual job, and the one
 * `.200` was written about — a check that reports success while measuring
 * nothing.
 *
 * They now go to a separate `skipped` list, printed and counted apart. This
 * changes no policy: the service worker stays deliberately off while
 * `PRIVATE_MODE=true`. It only stops the check lying about itself.
 */
test('gate-smoke never reports a skipped probe as a pass', () => {
  const src = read('scripts/gate-smoke.ts');
  // `ok: true` on the same push as the word "skipped" is the exact shape.
  const fakeGreens = [...src.matchAll(/ok:\s*true,\s*\n\s*detail:\s*'skipped/g)];
  assert.equal(
    fakeGreens.length,
    0,
    `${fakeGreens.length} gate-smoke check(s) report a pass for something they did not run. ` +
      'Push to `skipped` instead — "All gate checks passed" has to mean measured.'
  );
  assert.match(
    src,
    /const skipped: string\[\] = \[\]/,
    'gate-smoke must track skipped probes separately from passing ones'
  );
});
