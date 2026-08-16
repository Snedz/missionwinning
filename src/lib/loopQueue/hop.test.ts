/**
 * The hop closer is only worth anything if empty / stale / missing fail.
 * Discover the hop file rather than listing it — a second HOP.md is the defect.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PINNED_MAX_LINES,
  discoverHopFiles,
  hopMatchesTicket,
  isHopParseFail,
  parseHop,
  pinnedLineCount,
  readHop,
} from './hop.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const FILLED = `ticket: W1
done_means: I-Day lands on Today.
accept: npx tsx --test src/lib/orchestrationW1Landing.test.ts
`;

describe('hop contract', () => {
  it('refuses an empty ticket, done_means, or accept', () => {
    assert.ok(isHopParseFail(parseHop('ticket:\ndone_means: x\naccept: npm test\n')));
    assert.ok(isHopParseFail(parseHop('ticket: W1\ndone_means:\naccept: npm test\n')));
    assert.ok(isHopParseFail(parseHop('ticket: W1\ndone_means: x\naccept:\n')));
    const empty = parseHop('ticket:\ndone_means:\naccept:\n');
    assert.ok(isHopParseFail(empty));
    assert.match(empty.error, /empty ticket/);
  });

  it('parses a filled hop', () => {
    const hop = parseHop(FILLED);
    assert.ok(!isHopParseFail(hop));
    assert.equal(hop.ticket, 'W1');
    assert.equal(hop.doneMeans, 'I-Day lands on Today.');
    assert.equal(hop.accept, 'npx tsx --test src/lib/orchestrationW1Landing.test.ts');
  });

  it('rejects a stale ticket and a harvest with no live row', () => {
    const hop = parseHop(FILLED);
    assert.ok(!isHopParseFail(hop));
    assert.match(hopMatchesTicket(hop, 'W2') ?? '', /stale/);
    assert.match(hopMatchesTicket(hop, null) ?? '', /harvest|stall/);
    assert.equal(hopMatchesTicket(hop, 'W1'), null);
  });

  it('discovers exactly one HOP.md under docs/', () => {
    const found = discoverHopFiles(root);
    assert.equal(found.length, 1, `expected one hop file, found ${found.join(', ')}`);
    assert.equal(path.relative(root, found[0]), 'docs/graph/HOP.md');
  });

  it('the committed hop file is the empty template', () => {
    const live = readHop(root);
    assert.ok(isHopParseFail(live), 'committed HOP.md must stay the empty template');
    assert.match(live.error, /empty ticket/);
  });

  it('PINNED.md stays short enough to re-read after compaction', () => {
    const src = readFileSync(path.join(root, 'docs/graph/PINNED.md'), 'utf8');
    const n = pinnedLineCount(src);
    assert.ok(n > 4, 'PINNED.md is missing');
    assert.ok(n <= PINNED_MAX_LINES, `PINNED.md is ${n} lines; cap is ${PINNED_MAX_LINES}`);
    assert.match(src, /graph:done/);
    assert.match(src, /PRIVATE_MODE/);
  });
});
