/**
 * A status doc that only grows stops being read.
 *
 * `CONTEXT.md` opens by calling itself *"One screen of truth for any AI tool or
 * human joining cold"* and is the first thing `CLAUDE.md` tells an agent to
 * read. Every PR had been adding a bullet to its `## Now` block — the same
 * `+1`-per-feature pattern `.197` fixed on the Today screen, and no PR is ever
 * the one that made it long. I added seven of them in a single day.
 *
 * At `.203` it held **79 bullets / 103KB**. That is not one screen; it is a
 * changelog with a misleading title, and the cost is real — an agent booting
 * cold reads 103KB of mostly-superseded context before touching the code.
 *
 * `.123`–`.189` rotated to `docs/archive/CONTEXT-now-2026-07-30.md`. Nothing was
 * deleted; the full record is LOG.md and its archives. *Now* means now.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/**
 * A judgement, not a measurement — which is why it lives in one place where it
 * can be argued with, exactly like `TODAY_MAX_TOP_LEVEL_BLOCKS`.
 */
const MAX_NOW_BULLETS = 25;

function nowBlock(): string {
  const src = read('CONTEXT.md');
  const start = src.indexOf('## Now');
  assert.notEqual(start, -1, 'CONTEXT.md has no `## Now` block');
  const end = src.indexOf('## Read next', start);
  assert.notEqual(end, -1, 'CONTEXT.md `## Now` block has no terminator');
  return src.slice(start, end);
}

test('the Now block stays within one screen', () => {
  const bullets = nowBlock()
    .split('\n')
    .filter((l) => l.startsWith('- **')).length;
  assert.ok(
    bullets <= MAX_NOW_BULLETS,
    `CONTEXT.md \`## Now\` has ${bullets} bullets (budget ${MAX_NOW_BULLETS}). ` +
      `Rotate the oldest shipped entries into docs/archive/ — the full record is LOG.md. ` +
      `It reached 79 before anyone noticed, because no single PR is ever the one that made it long.`
  );
});

/** The budget is only real if the file says so where the next author will look. */
test('the Now block states its own budget', () => {
  const block = nowBlock();
  assert.match(
    block,
    /Budget: ≤\d+ bullets/,
    'the `## Now` block must name its own budget — a cap nobody can see is a cap nobody keeps'
  );
});

/** Rotation must archive, never delete: the history is the point. */
test('the rotation archive exists and is listed', () => {
  const archive = 'docs/archive/CONTEXT-now-2026-07-30.md';
  assert.ok(read(archive).length > 0, `${archive} is missing — rotation must archive, not delete`);
  assert.match(
    nowBlock(),
    /CONTEXT-now-2026-07-30\.md/,
    'the Now block must link where its rotated entries went'
  );
});

/**
 * Counting bullets is not the same as keeping the truth.
 *
 * `.213` — `.203` rotated `.123`–`.189` to the archive and, with them, the
 * `.170` bullet that was the **only** place `## Now` recorded REDTEAM **A5**'s
 * falsifier as fired. That fact is what makes the beta gates red, and
 * `ORCHESTRATION.md` §Do-not-build keys off exactly it: *"Features while beta
 * gates red | Only hero bugs / launch unblock."*
 *
 * So for ten builds an agent booting cold read `CONTEXT.md`, saw no red gate,
 * and would have concluded features were allowed. The budget guard I wrote in
 * the same PR counted bullets, checked the archive existed, and checked the
 * budget was stated — and asserted **nothing about which facts survive**. A
 * budget guard that counts without checking content will happily let you
 * archive the truth.
 *
 * The fix is not "never rotate". It is that these facts do not live in ship
 * bullets at all — they are standing status lines, which is what makes them
 * rotatable-proof, and this list is what keeps them there.
 */
const MUST_STATE: { question: string; pattern: RegExp }[] = [
  { question: 'Are the beta gates red, and what does that permit?', pattern: /A5|falsifier/i },
  { question: 'Is PRIVATE_MODE on?', pattern: /PRIVATE_MODE/ },
  { question: 'Can an invite email be sent?', pattern: /MAIL_POSTAL_ADDRESS/ },
  { question: 'Does CI run?', pattern: /Actions/ },
  { question: 'Does push work?', pattern: /VAPID/ },
  { question: 'How many migrations are pending?', pattern: /[Mm]igrations?/ },
];

test('the Now block still answers the questions that govern what may be built', () => {
  const block = nowBlock();
  const unanswered = MUST_STATE.filter((m) => !m.pattern.test(block)).map((m) => m.question);
  assert.deepEqual(
    unanswered,
    [],
    'CONTEXT.md `## Now` no longer answers:\n  ' +
      unanswered.join('\n  ') +
      '\nThese decide what an agent is allowed to do. If one was rotated out with a ship ' +
      'bullet, it was in the wrong place — put it in the standing Status table, not in prose ' +
      'about a build.'
  );
});

/**
 * And the facts must be *standing*, not incidental. A mention that only exists
 * because some recent PR happened to discuss it disappears the moment that
 * bullet rotates — which is precisely how the gate state was lost.
 */
test('the governing facts live in a table, not in a ship bullet', () => {
  const block = nowBlock();
  assert.match(
    block,
    /> \*\*Status — the facts that decide what may be built\.\*\*/,
    'the standing Status block is gone; the facts above are one rotation from vanishing again'
  );
});
