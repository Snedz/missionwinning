/**
 * A migration nobody wrote down is a migration nobody applies.
 *
 * `docs/LAUNCH_RUNBOOK.md` carries the numbered apply-in-order list the founder
 * works from. It is the only place that says *what to run and why it matters*,
 * and it is maintained by hand — so it drifts silently, in the one direction
 * that hurts: a migration lands on disk, the feature it gates ships, and the
 * column it needs is never created.
 *
 * Found by audit on 2026-07-30: **two of twenty-eight migration files appeared
 * in no checklist anywhere.** `20260731_llm_usage.sql` (the `.188` LLM spend
 * ledger) had one parenthetical mention in `docs/ENV.md`; `20260801_day_review_push.sql`
 * (the `.194`/`.196` evening push) had **none at all**. Both gate features that
 * are merged and shipping. `.203` added them, and this makes the next omission
 * a failing test rather than a discovery.
 *
 * This is the same class as `.195`–`.202`: a thing exists, and nothing asserts
 * anyone can act on it.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const RUNBOOK = 'docs/LAUNCH_RUNBOOK.md';
const MIGRATIONS_DIR = 'supabase/migrations';

function migrationFiles(): string[] {
  return readdirSync(path.join(root, MIGRATIONS_DIR))
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

test('every migration on disk appears in the launch runbook', () => {
  const runbook = readFileSync(path.join(root, RUNBOOK), 'utf8');
  const files = migrationFiles();
  assert.ok(files.length > 0, 'expected migrations on disk');

  /*
   * The base schema is covered as a glob — the runbook says "everything under
   * `supabase/migrations/20250629_*.sql`", which is the right instruction for
   * eight files that are applied together and never individually.
   */
  const coveredByGlob = (f: string) =>
    f.startsWith('20250629_') && runbook.includes('20250629_*.sql');

  const missing = files.filter((f) => !runbook.includes(f) && !coveredByGlob(f));
  assert.deepEqual(
    missing,
    [],
    `these migrations exist but are in no founder checklist — the feature ships and the column never gets created:\n  ${missing.join('\n  ')}\n` +
      `Add them to ${RUNBOOK} §3 with what breaks without them.`
  );
});

/** The mirror: a runbook entry for a file that no longer exists is a dead instruction. */
test('the runbook names no migration that is not on disk', () => {
  const runbook = readFileSync(path.join(root, RUNBOOK), 'utf8');
  const onDisk = new Set(migrationFiles());
  const named = [...runbook.matchAll(/`?(\d{8}_[a-z0-9_]+\.sql)`?/g)].map((m) => m[1]);
  const phantom = [...new Set(named)].filter((f) => !onDisk.has(f));
  assert.deepEqual(
    phantom,
    [],
    `the runbook tells the founder to apply files that do not exist: ${phantom.join(', ')}`
  );
});

/**
 * The runbook's value is not the filename — `ls` gives you that. It is the
 * sentence saying what stays broken until you run it. A bare filename in a list
 * is how `20260731_llm_usage` sat in `ENV.md` as a parenthetical and still went
 * unapplied.
 */
test('every migration entry says what it gates', () => {
  const runbook = readFileSync(path.join(root, RUNBOOK), 'utf8');
  const thin: string[] = [];
  for (const file of migrationFiles()) {
    // Skip the pre-`.170` base migrations, which the runbook covers as a group.
    if (file.startsWith('20250629') || file < '20260719') continue;
    const idx = runbook.indexOf(file);
    if (idx === -1) continue; // covered by the first test
    // The bullet the filename sits on, up to the next list item.
    const line = runbook.slice(idx, runbook.indexOf('\n', idx));
    // A real entry explains; a bare reference is under ~40 characters of prose.
    const prose = line.replace(/`[^`]*`/g, '').replace(/[^A-Za-z ]/g, '').trim();
    if (prose.length < 40) thin.push(file);
  }
  assert.deepEqual(
    thin,
    [],
    `these runbook entries name a migration without saying what breaks without it:\n  ${thin.join('\n  ')}`
  );
});
