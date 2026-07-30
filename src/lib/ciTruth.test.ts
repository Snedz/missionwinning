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
