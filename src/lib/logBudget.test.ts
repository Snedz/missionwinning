/**
 * `LOG.md` has had a rotation rule since it was written, and nothing enforced it.
 *
 * Its own header said *"keep ≤15 entries / ≤20KB here"*. `CLAUDE.md` §7 repeats
 * it. At `.242` the file held **27 entries / 127,015 bytes** — 80% over on
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
 * Set from measurement after `.242` rotated `.200`–`.213` out, with roughly one
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

/**
 * Label ranges that never reached `master`, so nothing was ever rotated for them.
 *
 * Module scope on purpose: the boundary check *uses* it and the staleness test
 * below *derives from* it. An earlier draft hardcoded `225..239` in the
 * staleness test while the boundary check read this list, so widening a gap
 * over a label that really shipped went unnoticed — a guard keyed to a literal
 * instead of to the thing it guards, which is `.220` in miniature and was found
 * by mutating the range rather than by reading it.
 */
const NEVER_SHIPPED: { from: number; to: number; why: string }[] = [
  {
    from: 225,
    to: 239,
    why:
      'Minted by concurrent branches (#178 as `.224`–`.231`, plus #187 and #190) that were ' +
      'renumbered above master before landing — #178 shipped as `.244`–`.251`. No commit on ' +
      'master ever carried these, so there is nothing to rotate and nothing to archive.',
  },
  {
    from: 260,
    to: 260,
    why:
      'Coverage branch renumbered mid-flight (`.226` → `.260` → landed as `.262`). No LOG ' +
      'heading on master ever ended in (`.260`), so the live window can sit on `.261` without ' +
      'a prior rotate of a missing section.',
  },
  {
    from: 686,
    to: 688,
    why:
      'Wedge reserved `.686`–`.688` for concurrent PRs (#453 / #462 / #470); master jumped ' +
      '`.685` → `.689`. No LOG heading on master ever ended in those labels, so rotating ' +
      '`.685` leaves `.689` as the live floor without a missing section.',
  },
];
const neverShipped = (x: number) => NEVER_SHIPPED.some((g) => x >= g.from && x <= g.to);

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

  /*
   * `.254` — **headings**, not raw text. This was `archives.map(read).join()` and
   * the boundary check below asked `archived.includes('`.224`')`, which any
   * passing mention of `.224` in another entry's prose satisfied. Deleting the
   * `.224` section outright left the guard green, because this file's own house
   * style is to cite neighbouring labels constantly — so the citation *was* the
   * evidence. Substring where a parsed shape was available: the defect `.212`
   * named and `.199` shipped.
   */
  const archivedEntries = new Set(
    archives
      .flatMap((f) => entryHeadings(readFileSync(path.join(dir, f), 'utf8')))
      .map((h) => /\(`\.(\d+)`\)/.exec(h)?.[1])
      .filter((x): x is string => !!x)
  );
  const index = read('docs/archive/INDEX.md');

  for (const f of archives) {
    assert.ok(
      index.includes(f),
      `${f} is not listed in docs/archive/INDEX.md — an archive nobody can find is a deletion`
    );
  }

  /*
   * Spot-check the boundary: the entry immediately older than LOG.md's oldest
   * must exist in an archive, so a rotation that *deleted* a section instead of
   * filing it goes red.
   *
   * `.254` — the first version asserted `.${n - 1}` and assumed the labels run
   * contiguously. They do not. `.225`–`.239` were minted by branches that were
   * later renumbered, so `master` goes `.224` → `.240` and **those labels never
   * shipped at all**. The check passed for as long as the live window's bottom
   * edge sat away from that hole, and went red the moment a rotation put `.240`
   * at the bottom — reporting a missing rotation when nothing was missing.
   *
   * A guard that fires on a fact about the numbering rather than on the
   * property it protects is the `.200` shape: it stops being read. So the gap
   * is declared, with a reason, and `no declared gap is stale` below fails if
   * one of these labels ever turns up — which is what would happen if somebody
   * resurrected a renumbered branch without renumbering it.
   */
  const live = entryHeadings(read('LOG.md'));
  const oldestLive = live[live.length - 1];
  assert.ok(oldestLive, 'LOG.md has no entries at all');
  const n = /\(`\.(\d+)`\)/.exec(oldestLive)?.[1];
  assert.ok(n, `could not read a build label out of ${JSON.stringify(oldestLive)}`);

  // Walk down past declared gaps to the first label that should really exist.
  let prev = Number(n) - 1;
  while (prev > 0 && neverShipped(prev)) prev--;
  assert.ok(
    archivedEntries.has(String(prev)),
    `LOG.md's oldest entry is \`.${n}\`, but \`.${prev}\` has no \`##\` entry in any archive — ` +
      'the history has a hole where a rotation should be'
  );
});

/**
 * Rotation moves; it never deletes — **and it never duplicates**.
 *
 * `.256` — `.222` was archived **twice**. Two branches each rotated it as they
 * rebased onto a moving `master`, the merge kept both appends, and it reached
 * `master` unnoticed because every check here asks whether an entry is
 * *present*. Presence is satisfied by the first copy, so the second was free.
 *
 * That is the same hole `.213` describes for `contextBudget`: a guard that
 * counts, or that asks "is it there?", says nothing about the shape of what it
 * found. The record is the product here — a reader who greps this history and
 * gets two hits for one ship cannot tell which is the entry and which is the
 * accident.
 *
 * Scoped across `LOG.md` **and** every archive, because the duplicate arrived
 * from one file being appended to by two branches, and a per-file check would
 * have missed a label live in `LOG.md` and archived at the same time — which is
 * what a botched rotation looks like.
 */
test('no build label has two entries', () => {
  const dir = path.join(root, 'docs/archive/log');
  const sources: { file: string; src: string }[] = [
    { file: 'LOG.md', src: read('LOG.md') },
    ...readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => ({ file: `docs/archive/log/${f}`, src: readFileSync(path.join(dir, f), 'utf8') })),
  ];

  const seen = new Map<string, string[]>();
  for (const { file, src } of sources) {
    for (const h of entryHeadings(src)) {
      const n = /\(`\.(\d+)`\)/.exec(h)?.[1];
      if (!n) continue;
      seen.set(n, [...(seen.get(n) ?? []), file]);
    }
  }

  const dupes = [...seen.entries()]
    .filter(([, files]) => files.length > 1)
    .map(([n, files]) => `\`.${n}\` appears ${files.length}× (${files.join(', ')})`);

  assert.deepEqual(
    dupes,
    [],
    'a build label has more than one `##` entry — rotation duplicated instead of moved:\n  ' +
      dupes.join('\n  ')
  );
});

/**
 * The gap is real, and it has to stay real.
 *
 * An allowlist that outlives its reason is the failure this repo keeps paying
 * for (`.219`, `.220`, and `UTC_IS_CORRECT` emptying itself on the `.251`
 * merge). If one of these labels ever appears in `LOG.md` or an archive, the
 * declared gap is a lie and the boundary check above is skipping a real entry.
 */
test('no declared never-shipped label actually shipped', () => {
  const everything = [read('LOG.md'), ...readdirSync(path.join(root, 'docs/archive/log'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => readFileSync(path.join(root, 'docs/archive/log', f), 'utf8'))].join('\n');
  const headings = everything.split('\n').filter((l) => l.startsWith('## '));

  for (const gap of NEVER_SHIPPED) {
    assert.ok(gap.why.trim().length > 0, `NEVER_SHIPPED ${gap.from}-${gap.to} has no reason`);
    for (let x = gap.from; x <= gap.to; x++) {
      const hit = headings.find((h) => h.includes(`(\`.${x}\`)`));
      assert.ok(
        !hit,
        `\`.${x}\` is declared never-shipped in NEVER_SHIPPED, but an entry exists: ${hit} — ` +
          'either the label really shipped (narrow the gap) or a renumbered branch landed unrenumbered'
      );
    }
  }
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
   * (`.241` twice, on `text-red-400` and on a UTC spelling). `check-design-system`
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
