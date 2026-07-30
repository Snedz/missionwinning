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
