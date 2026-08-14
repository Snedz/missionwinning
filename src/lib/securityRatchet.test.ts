/**
 * A check that always fails measures nothing.
 *
 * `.219` — `npm run security-audit` had two defects, and the second is the one
 * this file exists for.
 *
 *   1. **It had never run.** It appeared only in `.github/workflows/ci.yml`,
 *      where every job dies in seconds at `runner_id: 0`, and was absent from
 *      `scripts/gate.mjs`. `.200` fixed exactly this for the a11y suite; `.213`
 *      found it again here and deferred it.
 *   2. **It could not have failed usefully.** `npm audit --audit-level=high`
 *      exits 1 for as long as any unfixable advisory exists — so the signal was
 *      saturated, and a new high advisory landing tomorrow would have been
 *      invisible behind the permanent red.
 *
 * Both halves need guarding, and the first is the one that would make the whole
 * thing ceremonial if it regressed: a perfect ratchet in a script nobody runs is
 * worth exactly nothing.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { MAX_ACCEPTED_HIGH, collectHighAdvisories } from '../../scripts/security-audit.mjs';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

const SCRIPT = 'scripts/security-audit.mjs';

test('the check actually runs — in the gate, not only in a dead workflow', () => {
  /*
   * The `.200`/`.213` lesson, and the one regression that would hollow out this
   * entire PR. `ci.yml` is billing-blocked, so a check that lives only there has
   * never executed and never will until the billing is fixed.
   */
  const gate = stripComments(read('scripts/gate.mjs'));
  assert.match(
    gate,
    /'security-audit'/,
    'the audit must be a gate step — living only in ci.yml is how it went unrun for the ' +
      'entire life of the repository'
  );

  const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> };
  assert.equal(
    pkg.scripts['security-audit'],
    'node scripts/security-audit.mjs',
    'the npm script must point at the reviewing check, not back at a bare `npm audit`'
  );
});

test('the cap matches the allowlist exactly', () => {
  /*
   * An allowlist longer than the cap would let an unreviewed advisory ride in
   * behind reviewed ones; a cap longer than the allowlist is slack that decays
   * into the saturation this replaces. They must move together, downward.
   */
  const src = read(SCRIPT);
  const ids = [...src.matchAll(/'(GHSA-[a-z0-9-]+)'/g)].map((m) => m[1]);
  const unique = new Set(ids);

  assert.equal(unique.size, ids.length, 'a duplicated advisory id inflates the allowlist silently');
  assert.equal(
    unique.size,
    MAX_ACCEPTED_HIGH,
    `the allowlist holds ${unique.size} advisories and the cap is ${MAX_ACCEPTED_HIGH} — ` +
      'lower the cap when one clears, and never raise it to match a new one'
  );
});

test('the ratchet only moves down', () => {
  /*
   * The high-water mark, recorded as a literal so the assertion cannot drift
   * with the value it is checking. 17 distinct high advisories existed when this
   * was written; `npm audit fix` cleared four with no breaking change, and 13 is
   * where it may never rise from.
   *
   * `.596`: 13 → 9. Four allowlisted advisories cleared upstream (two postcss,
   * sharp, brace-expansion). Two more arrived mid-branch — js-yaml and nanoid —
   * and **both were fixed rather than admitted**: `npm audit fix
   * --package-lock-only` moved js-yaml 4.3.0 → 4.3.1 and nanoid 3.3.16 → 3.3.18,
   * clearing them outright. That is the branch this guard's error message asks
   * for ("Fix it, or add it to ACCEPTED"), and it is why the allowlist shrank
   * instead of growing. Lowered in lockstep with `MAX_ACCEPTED_HIGH` rather than
   * left at 13, because a ceiling four above the live value is four advisories of
   * silent headroom — the same defect this ship fixed in `i18nCoverage.test.ts`,
   * which sat at 710 against a cap of 16.
   *
   * `.767`: 9 → 1. Eight axios GHSAs cleared by `overrides` `axios@1.19.0`.
   * bigint-buffer remains. Lowered in lockstep with `MAX_ACCEPTED_HIGH`.
   */
  assert.ok(
    MAX_ACCEPTED_HIGH <= 1,
    `MAX_ACCEPTED_HIGH is ${MAX_ACCEPTED_HIGH}; it may only ever be lowered. Raising it to admit ` +
      'a new advisory is how a gate becomes decoration.'
  );
});

test('every accepted advisory says why, and what would change it', () => {
  /*
   * An allowlist of bare identifiers is a mute button. One that has to state its
   * reasoning is a decision someone can disagree with later — including the
   * reader who discovers the reasoning no longer holds.
   */
  const src = read(SCRIPT);
  const entries = [...src.matchAll(/id:\s*'(GHSA-[a-z0-9-]+)'[\s\S]{0,900}?fixWhen:\s*'([^']*)'/g)];
  const inline = [...src.matchAll(/\.map\(\(id\) => \(\{[\s\S]{0,900}?fixWhen:\s*'([^']*)'/g)];

  assert.ok(entries.length + inline.length > 0, 'the allowlist shape changed — re-read this guard');

  for (const [, id, fixWhen] of entries) {
    assert.ok(fixWhen.trim().length > 20, `${id} must say what would let it be removed`);
  }
  for (const [, fixWhen] of inline) {
    assert.ok(fixWhen.trim().length > 20, 'the grouped entries must say what would clear them');
  }

  // Each `why` has to be prose, not a shrug.
  for (const [, why] of src.matchAll(/why:\s*'([^']*)'/g)) {
    assert.ok(
      why.trim().length > 40,
      `an accepted advisory is justified by "${why}" — that is not a reason`
    );
  }
});

/* ── The counting unit, which is the thing that nearly went wrong ────────── */

test('advisories are counted, not flagged packages', () => {
  /*
   * This distinction is not academic — it nearly cost a real improvement.
   * Running `npm audit fix` moved npm's own headline from 17 high **packages**
   * to 23, while distinct high **advisories** fell 17 → 13 with four genuinely
   * fixed. The package tally rose because the fix reshaped eslint's subtree, so
   * more packages inherited the same advisory.
   *
   * Counting the wrong unit made an improvement look like a regression. The
   * fixture below is that exact shape: one advisory, three packages.
   */
  const oneAdvisoryThreePackages = {
    vulnerabilities: {
      eslint: { via: [{ severity: 'high', url: 'https://github.com/advisories/GHSA-aaaa', title: 'x' }] },
      glob: { via: [{ severity: 'high', url: 'https://github.com/advisories/GHSA-aaaa', title: 'x' }] },
      lighthouse: { via: [{ severity: 'high', url: 'https://github.com/advisories/GHSA-aaaa', title: 'x' }] },
    },
  };
  const found = collectHighAdvisories(oneAdvisoryThreePackages);
  assert.equal(found.size, 1, 'three packages carrying one advisory is one advisory');
  assert.deepEqual([...found.get('GHSA-aaaa').pkgs].sort(), ['eslint', 'glob', 'lighthouse']);
});

test('only high severity counts, and string `via` entries are not advisories', () => {
  const mixed = {
    vulnerabilities: {
      a: { via: [{ severity: 'moderate', url: 'https://github.com/advisories/GHSA-mod', title: 'm' }] },
      b: { via: [{ severity: 'high', url: 'https://github.com/advisories/GHSA-hi', title: 'h' }] },
      // A string `via` is a transitive pointer at another package, not an
      // advisory of its own — counting it would double-count the same finding.
      c: { via: ['b'] },
    },
  };
  const found = collectHighAdvisories(mixed);
  assert.deepEqual([...found.keys()], ['GHSA-hi']);
});

test('an unreviewed advisory is what makes the check fail', () => {
  /*
   * The whole point. Under the old script this scenario was indistinguishable
   * from every other run, because the exit code was already 1.
   */
  const withNewOne = {
    vulnerabilities: {
      something: {
        via: [{ severity: 'high', url: 'https://github.com/advisories/GHSA-brand-new', title: 'n' }],
      },
    },
  };
  const found = collectHighAdvisories(withNewOne);
  const src = read(SCRIPT);
  assert.ok(found.has('GHSA-brand-new'));
  assert.ok(
    !src.includes('GHSA-brand-new'),
    'a freshly-landed advisory is by definition not in the allowlist, so the check must fail on it'
  );
});
