#!/usr/bin/env node
/**
 * A dependency audit that can actually fail.
 *
 * `.219` — two defects, and the second is the one worth reading.
 *
 * **It had never run.** `npm run security-audit` appeared in exactly one place,
 * `.github/workflows/ci.yml`, and every job in that workflow dies in seconds at
 * `runner_id: 0`. It was absent from `scripts/gate.mjs`. `.200` fixed precisely
 * this for the a11y suite; `.213` found it again here and deferred the fix.
 *
 * **And it could not have failed usefully if it had.** `npm audit
 * --audit-level=high` exits 1 today, and would keep exiting 1 for as long as any
 * unfixable advisory exists. A check that always fails measures exactly as much
 * as one that always passes: **a new high advisory landing tomorrow is
 * invisible**, because the signal is saturated. That is this wave's own defect
 * class one level up.
 *
 * So the rule here is not "no advisories". It is **no advisory we have not
 * looked at**, with the count only ever allowed to fall.
 *
 * ## Advisories, not flagged packages
 *
 * The unit matters, and getting it wrong nearly cost a real improvement. Running
 * `npm audit fix` moved `npm audit`'s own headline from 17 high **packages** to
 * 23 — while the number of distinct high **advisories** fell from 17 to 13, four
 * of them genuinely fixed. The package tally rose because the fix reshaped
 * eslint's subtree, so more packages inherited the same advisory. Counting the
 * wrong unit made a real improvement look like a regression, which is the exact
 * failure this file exists to prevent. This script counts advisory IDs.
 */

import { spawnSync } from 'node:child_process';
import process from 'node:process';

/**
 * Accepted high advisories, each with the reason it is accepted.
 *
 * **A reason is mandatory** and asserted by `securityRatchet.test.ts`. An
 * allowlist of bare identifiers is a mute button; an allowlist that has to say
 * *why* is a decision someone can disagree with later.
 *
 * Nothing here is "safe". Each is either unfixable today or fixable only by a
 * breaking downgrade whose cost exceeds the exposure — recorded so the trade is
 * visible rather than implied by a green tick.
 */
const ACCEPTED = [
  {
    id: 'GHSA-6g55-p6wh-862q',
    pkg: 'postcss',
    why: 'Arbitrary file read via attacker-controlled sourceMappingURL. No fixed version is published. postcss runs at build time over our own stylesheets — there is no path by which a user supplies CSS to it.',
    fixWhen: 'A postcss release above the advisory range exists; it is a devDependency and a nested dep of next.',
  },
  {
    id: 'GHSA-r28c-9q8g-f849',
    pkg: 'postcss',
    why: 'Path traversal in source-map auto-loading. Same reasoning and same build-time-only reach as the advisory above.',
    fixWhen: 'A postcss release above the advisory range exists.',
  },
  {
    id: 'GHSA-f88m-g3jw-g9cj',
    pkg: 'sharp',
    why: 'Inherited libvips CVEs. No fixed version is published. sharp is used by Next image optimisation, and every image this app optimises is a local asset committed to the repo — no remote or user-supplied image reaches it.',
    fixWhen: 'sharp >= 0.35.0 ships. Re-check whenever remote image sources are enabled — that would change the exposure, not just the version.',
  },
  {
    id: 'GHSA-mh99-v99m-4gvg',
    pkg: 'brace-expansion',
    why: 'DoS via unbounded expansion. Reached only through eslint, glob and lighthouse — build and lint tooling run on our own repository, never on user input.',
    fixWhen: 'The transitive dependents pick up a patched range; `npm audit fix` cannot reach it today.',
  },
  {
    id: 'GHSA-3gc7-fjrx-p6mg',
    pkg: 'bigint-buffer',
    why: 'Buffer overflow in toBigIntLE(). Enters via @solana/spl-token. The only fix npm offers is a breaking downgrade of the payment SDK.',
    fixWhen: 'A non-breaking @solana/spl-token release clears it, or the crypto rail is retired.',
  },
  // The axios cluster. One package, one entry point, one reason.
  ...[
    'GHSA-35jp-ww65-95wh',
    'GHSA-3g43-6gmg-66jw',
    'GHSA-777c-7fjr-54vf',
    'GHSA-hfxv-24rg-xrqf',
    'GHSA-j5f8-grm9-p9fc',
    'GHSA-p92q-9vqr-4j8v',
    'GHSA-pjwm-pj3p-43mv',
    'GHSA-q8qp-cvcw-x6jj',
  ].map((id) => ({
    id,
    pkg: 'axios',
    why: 'Enters only through @phantom/react-sdk, which is loaded by a dynamic() import on /bundle and never enters the wedge bundle. npm offers only a breaking SDK downgrade. Downgrading the payment SDK to clear an advisory in a route most users never open is the worse trade.',
    fixWhen: '@phantom/react-sdk ships a release on a patched axios, or Lifetime USDC is retired.',
  })),
];

/**
 * The ratchet. **Lower this whenever an advisory clears; never raise it.**
 *
 * A cap that follows reality is not a cap, so `securityRatchet.test.ts` asserts
 * this only ever moves down and that it equals the allowlist length — an
 * allowlist longer than the cap would let an unreviewed advisory in behind a
 * reviewed one.
 */
export const MAX_ACCEPTED_HIGH = 13;

const acceptedIds = new Set(ACCEPTED.map((a) => a.id));

function advisoryId(via) {
  const url = typeof via?.url === 'string' ? via.url : '';
  return url.split('/').pop() || '';
}

/** Distinct high advisories in the current tree, mapped to the packages carrying them. */
export function collectHighAdvisories(report) {
  const found = new Map();
  for (const [pkg, entry] of Object.entries(report?.vulnerabilities ?? {})) {
    for (const via of entry?.via ?? []) {
      if (typeof via !== 'object' || via?.severity !== 'high') continue;
      const id = advisoryId(via);
      if (!id) continue;
      if (!found.has(id)) found.set(id, { title: via.title ?? '', pkgs: new Set() });
      found.get(id).pkgs.add(pkg);
    }
  }
  return found;
}

function main() {
  const res = spawnSync('npm', ['audit', '--json'], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });

  // `npm audit` exits non-zero when it finds anything, so the exit code is not a
  // failure signal here — but unparseable output is. A check that silently
  // reports "0 advisories" because the tool broke is the defect this replaces.
  let report;
  try {
    report = JSON.parse(res.stdout);
  } catch {
    console.error('✗ could not parse `npm audit --json` output — the check did not run.');
    console.error((res.stderr || '').slice(0, 800));
    process.exit(1);
  }

  const found = collectHighAdvisories(report);
  const unreviewed = [...found.keys()].filter((id) => !acceptedIds.has(id)).sort();
  const cleared = [...acceptedIds].filter((id) => !found.has(id)).sort();

  console.log(
    `security audit — ${found.size} distinct high advisories (allowlisted ${acceptedIds.size}, cap ${MAX_ACCEPTED_HIGH})`
  );

  if (cleared.length) {
    console.log(
      `  ↓ ${cleared.length} allowlisted ${cleared.length === 1 ? 'advisory is' : 'advisories are'} gone — ` +
        `remove ${cleared.join(', ')} from ACCEPTED and lower MAX_ACCEPTED_HIGH to lock the gain in.`
    );
  }

  if (unreviewed.length) {
    console.error(
      `\n✗ ${unreviewed.length} high ${unreviewed.length === 1 ? 'advisory has' : 'advisories have'} not been reviewed.\n` +
        '  Fix it, or add it to ACCEPTED in this file **with a reason and what would change it**.\n'
    );
    for (const id of unreviewed) {
      const { title, pkgs } = found.get(id);
      console.error(`    ${id}  ${title}`);
      console.error(`      via: ${[...pkgs].sort().join(', ')}`);
    }
    process.exit(1);
  }

  console.log('  ✓ no unreviewed high advisories');
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) main();
