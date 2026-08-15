/**
 * N1 — customer help markdown names Alpha, not leftover free-first / open beta.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const dir = path.join(import.meta.dirname, '..', '..', 'docs/help');

test('docs/help does not name the product Open beta or free-first beta', () => {
  const hits: string[] = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.md')) continue;
    const src = readFileSync(path.join(dir, name), 'utf8');
    for (const [i, line] of src.split('\n').entries()) {
      if (/open\s+beta|free-first beta|Private beta/i.test(line)) {
        hits.push(`${name}:${i + 1}: ${line.trim().slice(0, 80)}`);
      }
    }
  }
  assert.deepEqual(hits, [], hits.join('\n'));
});
