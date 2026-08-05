/**
 * Product nav word is **Today** (tab label) — not legacy “Today Hub”.
 * Flow-8 fixed Library; K1 sweeps remaining user-facing sources.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|ts)$/.test(name) && !name.endsWith('.test.ts')) out.push(p);
  }
  return out;
}

const FORBIDDEN = /Today Hub/i;

test('no user-facing Today Hub in page-components, data, or i18n locale modules', () => {
  const dirs = [
    path.join(root, 'src/page-components'),
    path.join(root, 'src/data'),
    path.join(root, 'src/i18n'),
  ];
  const hits: string[] = [];
  for (const dir of dirs) {
    for (const file of walk(dir)) {
      const src = readFileSync(file, 'utf8');
      const lines = src.split('\n');
      lines.forEach((line, i) => {
        const t = line.trimStart();
        // Comments and keys like libraryTodayHub are fine if value is not "Today Hub"
        if (
          t.startsWith('//') ||
          t.startsWith('*') ||
          t.startsWith('/*') ||
          t.startsWith('/**')
        ) {
          return;
        }
        if (line.includes('libraryTodayHub')) return; // key name only
        if (FORBIDDEN.test(line)) {
          hits.push(`${path.relative(root, file)}:${i + 1}: ${line.trim()}`);
        }
      });
    }
  }
  assert.deepEqual(hits, [], `rename product language to Today:\n  ${hits.join('\n  ')}`);
});

test('Active empty secondary is hierarchy not twin outlines (K4)', () => {
  const src = readFileSync(
    path.join(root, 'src/components/workout/ActiveEmptyState.tsx'),
    'utf8'
  );
  assert.match(src, /activeGoToday/);
  assert.match(src, /activeGoBuilder/);
  // Builder must not be a second outline Button twin.
  const builderBlock = src.slice(src.indexOf('activeGoBuilder') - 200, src.indexOf('activeGoBuilder') + 80);
  assert.doesNotMatch(
    builderBlock,
    /variant="outline"[\s\S]{0,120}activeGoBuilder/,
    'Builder should be a quiet link, not outline twin of Today'
  );
});
