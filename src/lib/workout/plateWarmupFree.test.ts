/**
 * Plate math + warmup stay free forever — not Super Bundle bait.
 * Discovers the new files rather than enumerating a closed list that can go stale.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry)) {
      out.push(path.relative(root, abs));
    }
  }
  return out;
}

const PREMIUM = /premiumServer|isPremium|Super Bundle|\/bundle|isFreeBeta|UnlockButton|trial/i;

test('plate/warmup logger files do not import premium or trial', () => {
  const files = [
    ...walk(path.join(root, 'src/lib/workout')),
    ...walk(path.join(root, 'src/components/workout')),
    'src/lib/plateCalculator.ts',
  ].filter(
    (p) =>
      /warmupRamp|plateCalculator|SetLogRow|SetLogTable|LogConsole|ActiveExerciseFooter/.test(p)
  );
  assert.ok(files.includes('src/lib/workout/warmupRamp.ts'), 'warmupRamp.ts must exist');
  assert.ok(files.includes('src/lib/plateCalculator.ts'), 'plateCalculator.ts must exist');
  const hits: string[] = [];
  for (const file of files) {
    const src = readFileSync(path.join(root, file), 'utf8');
    if (PREMIUM.test(src)) hits.push(file);
  }
  assert.deepEqual(hits, [], `premium/trial leaked into free plate/warmup path:\n${hits.join('\n')}`);
});

test('SetLogTable Prev cell does not host plate math (E-Adjacency owns Prev)', () => {
  const src = readFileSync(path.join(root, 'src/components/workout/SetLogTable.tsx'), 'utf8');
  const prevTd = /data-testid="set-table-prev"[\s\S]*?<\/td>/;
  const block = prevTd.exec(src)?.[0] ?? '';
  assert.ok(block.length > 0, 'set-table-prev cell missing');
  assert.doesNotMatch(block, /setRowPlateLine|set-table-plates|plateCalculator/);
});
