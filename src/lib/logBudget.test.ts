/**
 * `LOG.md` has had a rotation rule since it was written, and nothing enforced it.
 *
 * Its own header said *"keep ≤15 entries / ≤20KB here"*. `CLAUDE.md` §7 repeats
 * it. At `.227` the file held **27 entries / 127,015 bytes** — 80% over on
 * entries and **6.4× over on bytes** — because the only automated thing that ever
 * opened it was [`check-build-label.mjs`](../../scripts/check-build-label.mjs),
 * which asks whether the current version is *mentioned* and nothing else.
 *
 * Its twin one file over has a guard. [`contextBudget.test.ts`](./contextBudget.test.ts)
 * caps `CONTEXT.md`'s `## Now` at 25 bullets, and `## Now` is inside budget. Same
 * repo, same rule, same rotation ritual, same archive directory — one of them
 * checked and one of them not, and the unchecked one drifted 6×. That is `.221`
 * exactly (*the design rules nothing checked*) in the docs lane, and it is worth
 * saying that the *checked* twin is the one that stayed honest.
 *
 * ## Why the byte half of the rule is a ratchet and not a number
 *
 * An entry here averages ~5.6KB, because the house style is to explain the defect
 * class rather than name the change. Fifteen of them is ~84KB. There is no
 * arrangement of "≤15 entries" and "≤20KB" that is satisfiable — 20KB means
 * **three** entries — so the file could never have complied, which is a large
 * part of why nobody tried.
 *
 * A rule that cannot be met is not a strict rule; it is an ignored one, and the
 * repo has paid for that distinction repeatedly (`.200`, `.213`, `.219`). So the
 * count stays a hard cap, the size becomes a **ratchet** in the shape
 * `bundle-budget.mjs` and `security-audit.mjs` already use here: the file may
 * shrink, and going *under* the ceiling asks you to lower it. What the original
 * rule was protecting — *a file that only grows stops being read* — is preserved
 * exactly; only the unmeetable constant is gone.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/** A judgement, argued with in one place — the shape `MAX_NOW_BULLETS` uses. */
const MAX_LOG_ENTRIES = 15;

/**
 * The ratchet ceiling, in bytes. **Lower it; never raise it.**
 *
 * Set from measurement after `.227` rotated `.200`–`.213` out, with roughly one
 * entry of headroom so that shipping a wave does not *force* a rotation in the
 * same commit — rotation is a deliberate act with an archive file and an index
 * row, and a byte should not be what triggers it.
 *
 * It was set at 90,000 first, from the size *before* this wave's own entry
 * existed, and the file landed 102 bytes over. Rotating `.213` was the answer
 * rather than nudging the number: a ratchet raised the first time it binds is a
 * ratchet that never binds again, which is the failure `.219` describes for a
 * check saturated at red. Noted because the temptation was real and took ten
 * seconds to feel.
 */
const MAX_LOG_BYTES = 95_000;

const entryHeadings = (src: string) => src.split('\n').filter((l) => l.startsWith('## '));

test('LOG.md keeps only the live record', () => {
  const src = read('LOG.md');
  const entries = entryHeadings(src);

  assert.ok(
    entries.length <= MAX_LOG_ENTRIES,
    `LOG.md has ${entries.length} entries (budget ${MAX_LOG_ENTRIES}). Rotate the ` +
      'oldest whole `##` sections to docs/archive/log/ and add a row to ' +
      'docs/archive/INDEX.md. Rotation moves; it never deletes.'
  );

  const bytes = Buffer.byteLength(src, 'utf8');
  assert.ok(
    bytes <= MAX_LOG_BYTES,
    `LOG.md is ${bytes} bytes (ceiling ${MAX_LOG_BYTES}). Rotate, do not trim — ` +
      'the prose is the point.'
  );
});

/**
 * Rotation moved the entries somewhere, and this is the half `.213` says a budget
 * guard usually forgets.
 *
 * That wave's defect was `contextBudget.test.ts` counting bullets while asserting
 * nothing about *which* survived, so `.203` archived the beta-gate state and the
 * guard called it compliant. A count-only rule here would pass just as happily if
 * the twelve rotated entries had been deleted rather than filed.
 */
test('every rotated entry is in an archive, not gone', () => {
  const dir = path.join(root, 'docs/archive/log');
  const archives = readdirSync(dir).filter((f) => f.endsWith('.md'));
  assert.ok(archives.length > 0, 'docs/archive/log/ is empty — rotation must archive');

  const archived = archives.map((f) => readFileSync(path.join(dir, f), 'utf8')).join('\n');
  const index = read('docs/archive/INDEX.md');

  for (const f of archives) {
    assert.ok(
      index.includes(f),
      `${f} is not listed in docs/archive/INDEX.md — an archive nobody can find is a deletion`
    );
  }

  // Spot-check the boundary: the entry immediately older than LOG.md's oldest
  // must exist in an archive. Derived from the files rather than hardcoded, so it
  // keeps checking the *current* boundary after the next rotation.
  const live = entryHeadings(read('LOG.md'));
  const oldestLive = live[live.length - 1];
  assert.ok(oldestLive, 'LOG.md has no entries at all');
  const n = /\(`\.(\d+)`\)/.exec(oldestLive)?.[1];
  assert.ok(n, `could not read a build label out of ${JSON.stringify(oldestLive)}`);
  assert.ok(
    archived.includes(`\`.${Number(n) - 1}\``),
    `LOG.md's oldest entry is \`.${n}\`, but \`.${Number(n) - 1}\` is in no archive — ` +
      'the history has a hole where a rotation should be'
  );
});

/**
 * The rule is stated where people read it, and states the same thing.
 *
 * `.223` cost a launch gate because one rule had two definitions; `.213` because
 * a doc stopped saying the fact that governed it. The header is what a human
 * rotating by hand will follow, so if it drifts from this file the guard is
 * enforcing something nobody has been told.
 */
test('LOG.md still tells its reader the rule this file enforces', () => {
  const header = read('LOG.md').split('---')[0] ?? '';
  assert.match(header, /Rotation rule/i, 'LOG.md dropped its rotation rule');
  assert.ok(
    header.includes(String(MAX_LOG_ENTRIES)),
    `LOG.md's header no longer states the ${MAX_LOG_ENTRIES}-entry cap this file enforces`
  );
  assert.match(
    header,
    /logBudget\.test\.ts/,
    'LOG.md must name its guard — an unenforced-looking rule is one people stop obeying, ' +
      'which is how it reached 27 entries'
  );

  /*
   * The retired figure must be gone from the **rule**, and is welcome in the
   * prose that explains why it went.
   *
   * The first draft scanned the whole header and failed on the blockquote saying
   * *"the ≤20KB half of this rule is retired"* — the third time in this run of
   * work that a new guard has fired on the sentence documenting its own subject
   * (`.226` twice, on `text-red-400` and on a UTC spelling). `check-design-system`
   * wrote the rule down after paying for it once: *a guard that punishes
   * documented reasoning gets switched off*. The rule line is the bolded
   * `**Rotation rule:**` paragraph; everything after it is commentary.
   */
  const ruleLine = header.split('\n').find((l) => /\*\*Rotation rule:\*\*/.test(l)) ?? '';
  assert.ok(ruleLine, 'LOG.md has no **Rotation rule:** line to check');
  assert.ok(
    !/≤\s*20\s*KB/i.test(ruleLine),
    'the ≤20KB figure is retired from the rule — at ~5.6KB per entry it permitted ' +
      'three entries, and an unmeetable rule is an ignored one. Explaining that ' +
      'below the rule is fine; restating it as the rule is not.'
  );
});
