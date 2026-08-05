/**
 * Archivo loads exactly three weights — 400/600/800 (`app/layout.tsx`).
 * `font-medium` (500) and `font-bold` (700) therefore render a browser-
 * synthesized fake weight: the 400/600 outline artificially thickened, which
 * is why two "bold" labels on one screen could look subtly different.
 *
 * Discovery walk, not a file list (`.220`): every `.tsx` under the two UI
 * trees is read, and the count may only fall.
 *  - `src/page-components`: swept to zero in `.462` — stays zero.
 *  - `src/components`: ratchet. Lower the constant when you win some back;
 *    raising it is a design decision a reviewer must see in this file's diff.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const COMPONENTS_CEILING = 132;

const root = process.cwd();

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.tsx$/.test(entry.name) && !/\.test\.tsx$/.test(entry.name)) files.push(full);
  }
  return files;
}

function countSynthesizedWeights(dir: string): { count: number; hits: string[] } {
  const hits: string[] = [];
  let count = 0;
  for (const file of walk(path.join(root, dir))) {
    const source = readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|\s)\/\/[^\n]*/g, '$1');
    const matches = source.match(/\bfont-(?:medium|bold)\b/g);
    if (matches?.length) {
      count += matches.length;
      hits.push(`${path.relative(root, file)} (${matches.length})`);
    }
  }
  return { count, hits };
}

describe('designWeights', () => {
  it('page-components carry zero synthesized weights', () => {
    const { count, hits } = countSynthesizedWeights('src/page-components');
    assert.equal(
      count,
      0,
      `font-medium/font-bold synthesize (Archivo ships 400/600/800 only) — use font-semibold or font-extrabold:\n  ${hits.join('\n  ')}`
    );
  });

  it(`components stay at or below the ratchet (${COMPONENTS_CEILING})`, () => {
    const { count, hits } = countSynthesizedWeights('src/components');
    assert.ok(
      count <= COMPONENTS_CEILING,
      `synthesized weights rose to ${count} (ceiling ${COMPONENTS_CEILING}) — new UI must use font-semibold/font-extrabold:\n  ${hits.join('\n  ')}`
    );
  });
});
