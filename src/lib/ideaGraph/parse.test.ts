/**
 * The parser has to be hostile, because it is the only thing standing between
 * "a node exists" and "a node can be checked".
 *
 * A permissive reader would accept a mis-indented `primitives` block, hand the
 * validator a string where it expected a map, and produce a green parse over a
 * node nobody can check — which is `.220` arriving one layer below the guard.
 * So every test here asserts a **rejection**, and the two that assert acceptance
 * exist to prove the rejections are not vacuous.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FrontMatterError, parseFrontMatter, splitFrontMatter } from './parse.ts';

const F = 'fixture.md';
const wrap = (header: string, body = 'Prose.') => `---\n${header}\n---\n\n${body}\n`;

test('it parses the four shapes the grammar allows', () => {
  const fm = parseFrontMatter(
    wrap(
      [
        'id: M-99',
        'primitives:',
        '  trigger: completion',
        '  visibility: private',
        'produces:',
        '  - B-01',
        '  - B-02',
        'seen_in:',
        '  - product: Something',
        '    url: https://example.com/a',
        '    class: E1',
      ].join('\n')
    ),
    F
  );

  assert.equal(fm.id, 'M-99');
  assert.deepEqual(fm.primitives, { trigger: 'completion', visibility: 'private' });
  assert.deepEqual(fm.produces, ['B-01', 'B-02']);
  assert.deepEqual(fm.seen_in, [{ product: 'Something', url: 'https://example.com/a', class: 'E1' }]);
});

test('a URL in a list entry stays a scalar rather than becoming a map', () => {
  // `https://x` contains a colon. Without the scheme exception this would parse
  // as `{ https: '//x' }` — a silent shape change, which is the worst kind.
  const fm = parseFrontMatter(wrap(['refs:', '  - https://example.com/a'].join('\n')), F);
  assert.deepEqual(fm.refs, ['https://example.com/a']);
});

test('a duplicate top-level key is rejected', () => {
  assert.throws(() => parseFrontMatter(wrap('id: M-01\nid: M-02'), F), FrontMatterError);
});

test('a duplicate key inside a map is rejected', () => {
  assert.throws(
    () => parseFrontMatter(wrap(['primitives:', '  trigger: completion', '  trigger: absence'].join('\n')), F),
    FrontMatterError
  );
});

test('a tab is a parse error, not an indentation width question', () => {
  assert.throws(() => parseFrontMatter(wrap(['produces:', '\t- B-01'].join('\n')), F), /tabs are not indentation/);
});

test('a block that mixes list rows and map rows is rejected', () => {
  assert.throws(
    () => parseFrontMatter(wrap(['produces:', '  - B-01', '  extra: value'].join('\n')), F),
    /mixes list rows and map rows/
  );
});

test('a continuation row that continues nothing is rejected', () => {
  // The `- ` went missing. Real YAML would fold this into the previous entry.
  assert.throws(
    () =>
      parseFrontMatter(
        wrap(['seen_in:', '  product: A', '  - product: B'].join('\n')),
        F
      ),
    /mixes list rows and map rows|continues nothing/
  );
});

test('a key with no value and no block is rejected', () => {
  assert.throws(() => parseFrontMatter(wrap('primitives:'), F), /no value and no indented block/);
});

test('nesting deeper than a map stops, loudly', () => {
  assert.throws(
    () => parseFrontMatter(wrap(['primitives:', '  trigger:', '    kind: completion'].join('\n')), F),
    /nesting stops here/
  );
});

test('an indented top-level key is rejected', () => {
  assert.throws(() => parseFrontMatter(wrap('  id: M-01'), F), /may not be indented/);
});

test('a node with no prose body is rejected', () => {
  // A node that is only front matter is a spreadsheet row. The whole reason the
  // graph is markdown is that a human reads why the node exists.
  assert.throws(() => parseFrontMatter('---\nid: M-01\n---\n', F), /no prose body/);
});

test('unterminated front matter is rejected', () => {
  assert.throws(() => splitFrontMatter('---\nid: M-01\n', F), /never closed/);
});

test('a file that does not open with a fence is rejected', () => {
  assert.throws(() => splitFrontMatter('# Heading\n\nProse\n', F), /must open with/);
});

test('comments and blank lines are skipped, and a hash inside a value is data', () => {
  const fm = parseFrontMatter(
    wrap(['# a comment', '', 'id: M-01', 'note: see docs#section'].join('\n')),
    F
  );
  assert.equal(fm.id, 'M-01');
  assert.equal(fm.note, 'see docs#section');
});
