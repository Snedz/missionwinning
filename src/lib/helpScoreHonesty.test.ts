/**
 * Q1 — customer help names Mission Score, not leftover Win Score.
 * Historical “older name” notes are allowed.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const dir = path.join(import.meta.dirname, '..', '..', 'docs/help');

test('docs/help current product name is Mission Score', () => {
  const hits: string[] = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.md')) continue;
    const src = readFileSync(path.join(dir, name), 'utf8');
    for (const [i, line] of src.split('\n').entries()) {
      if (!/Win Score/.test(line)) continue;
      if (/older|earlier name|formerly|used to/i.test(line)) continue;
      hits.push(`${name}:${i + 1}: ${line.trim().slice(0, 90)}`);
    }
  }
  assert.deepEqual(hits, [], hits.join('\n'));
});
