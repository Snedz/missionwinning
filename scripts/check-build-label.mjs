#!/usr/bin/env node
/**
 * Hard rule 5, executable: "every ship updates LOG.md + `## Now` + build label."
 *
 * It was prose, so it drifted. `chore/github-security-hardening` carries a commit
 * whose subject reads "(.164)" and which touches none of `buildInfo.ts`, `CONTEXT.md`
 * or `LOG.md` — the label there is still `.163`. A version claimed in a commit
 * message and never minted is worse than no version at all: two branches can both
 * announce the same number, and whichever merges second silently overwrites the
 * other's label with a stale one.
 *
 * `APP_BUILD_LABEL` is a single mutable constant with no uniqueness check, and it is
 * what `/profile` renders and `gate-smoke.ts` asserts against production — so a stale
 * label means the deploy smoke is confirming the wrong build shipped.
 *
 * Checks, against the merge base rather than a hardcoded number:
 *   1. the label is strictly greater than the base branch's
 *   2. LOG.md and CONTEXT.md actually mention it
 *
 * Skipped when HEAD is the base branch itself (nothing to compare) and when the
 * branch changes no app code.
 *
 * Run: node scripts/check-build-label.mjs   (also step 2 of `npm run gate`)
 */

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/*
 * Both quote styles, deliberately. This matched `'…'` only, and a formatter
 * pass rewrote `buildInfo.ts` to double quotes — after which the check could
 * not read the label at all and died on "Could not read APP_BUILD_LABEL"
 * rather than comparing anything. A gate step that cannot see its input is
 * `.220`'s defect: it stops asking the question without anyone deciding to
 * stop. The label's quoting is a formatter's business, not this guard's.
 */
const LABEL_RE = /APP_BUILD_LABEL\s*=\s*['"]([^'"]+)['"]/;

function git(...args) {
  const r = spawnSync('git', args, { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
}

function parse(label) {
  // `2026.07-unified.167` → { prefix: '2026.07-unified', n: 167 }
  const m = /^(.*)\.(\d+)$/.exec(label ?? '');
  return m ? { prefix: m[1], n: Number(m[2]) } : null;
}

function fail(msg) {
  console.error(`\x1b[31m✗ ${msg}\x1b[0m`);
  process.exit(1);
}

const current = LABEL_RE.exec(readFileSync('src/lib/buildInfo.ts', 'utf8'))?.[1];
if (!current) fail('Could not read APP_BUILD_LABEL from src/lib/buildInfo.ts');

// Prefer the remote base — a local `master` can be stale and would wave through a
// label that is already taken upstream.
const base = ['origin/master', 'master'].find((r) => git('rev-parse', '--verify', '--quiet', r));
if (!base) {
  console.log(`  no base branch to compare against — skipping (label ${current})`);
  process.exit(0);
}

const head = git('rev-parse', 'HEAD');
if (head && head === git('rev-parse', base)) {
  console.log(`  HEAD is ${base} — nothing to compare (label ${current})`);
  process.exit(0);
}

const changed = git('diff', '--name-only', `${base}...HEAD`) ?? '';
const touchesApp = changed
  .split('\n')
  .some((f) => /^(src|app|scripts|supabase)\//.test(f));
if (!touchesApp) {
  console.log(`  branch changes no app code — skipping (label ${current})`);
  process.exit(0);
}

const baseLabelRaw = git('show', `${base}:src/lib/buildInfo.ts`);
const baseLabel = baseLabelRaw ? LABEL_RE.exec(baseLabelRaw)?.[1] : null;

const cur = parse(current);
const bas = parse(baseLabel);
if (!cur) fail(`APP_BUILD_LABEL "${current}" does not end in .<number>`);

if (bas && cur.prefix === bas.prefix && cur.n <= bas.n) {
  fail(
    `APP_BUILD_LABEL is ${current}, but ${base} is already at ${baseLabel}.\n` +
      `  Bump src/lib/buildInfo.ts past ${baseLabel} — a commit message claiming a\n` +
      `  version does not mint one, and merging this would overwrite the deployed\n` +
      `  label with an older value that gate-smoke then asserts against production.`
  );
}

// The two docs cite versions differently, so check each the way it is actually
// written rather than imposing one form on both: CONTEXT.md's `## Now` carries the
// full label, LOG.md headings carry the short suffix in backticks — `(`.167`)`.
if (!readFileSync('CONTEXT.md', 'utf8').includes(current)) {
  fail(
    `CONTEXT.md's \`## Now\` does not carry ${current}.\n` +
      `  Hard rule 5: every ship updates LOG.md + \`## Now\` + the build label.`
  );
}

const shortForm = `\`.${cur.n}\``;
const logHeading = new RegExp(`^## .*\\(\\\`\\.${cur.n}\\\`\\)`, 'm');
if (!logHeading.test(readFileSync('LOG.md', 'utf8'))) {
  fail(
    `LOG.md has no entry heading ending in (${shortForm}).\n` +
      `  Hard rule 5: every ship updates LOG.md + \`## Now\` + the build label.`
  );
}

console.log(
  `  ✓ ${current} (base ${base} at ${baseLabel ?? 'unknown'}), cited in LOG.md + CONTEXT.md`
);
