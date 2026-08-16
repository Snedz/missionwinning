/**
 * H-09 instrument. A cohort figure without a selection frame must fail.
 * Discover producers rather than list them — a name that claims all readers
 * and then enumerates two is the recurring defect.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  WEEK4_RPC_FRAME,
  formatFramedCohort,
  frameCohort,
} from '@/lib/selectionFrame';

const root = path.join(import.meta.dirname, '..', '..');
const lib = path.join(root, 'src/lib');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (ent.name.endsWith('.ts') && !ent.name.endsWith('.test.ts') && !ent.name.endsWith('.routetest.ts')) {
      out.push(p);
    }
  }
  return out;
}

function producers(): string[] {
  return walk(lib).filter((p) => {
    if (p.endsWith(`${path.sep}selectionFrame.ts`)) return false;
    const src = readFileSync(p, 'utf8');
    return /week4_retained|cohort_eligible/.test(src);
  });
}

describe('frameCohort', () => {
  it('rejects an empty frame', () => {
    assert.throws(() => frameCohort(4, { included: '', excluded: 'guests', unknown: false }));
    assert.throws(() => frameCohort(4, { included: 'signed-in', excluded: '  ', unknown: true }));
    assert.throws(() => frameCohort(Number.NaN, { included: 'a', excluded: 'b', unknown: false }));
  });

  it('keeps unknown visible in the output', () => {
    const n = frameCohort(3, { included: 'signed-in', excluded: 'guests', unknown: true });
    assert.match(formatFramedCohort(n), /unknown=yes/);
    assert.match(formatFramedCohort(n), /included: signed-in/);
    const known = frameCohort(3, WEEK4_RPC_FRAME);
    assert.doesNotMatch(formatFramedCohort(known), /unknown=yes/);
  });
});

describe('H-09 selection-frame guard', () => {
  it('every week4_retained / cohort_eligible producer goes through frameCohort', () => {
    const files = producers();
    assert.ok(files.length >= 1, 'discover found no cohort producers — the walk is blind');
    const bare: string[] = [];
    for (const p of files) {
      const src = readFileSync(p, 'utf8');
      if (!/frameCohort|formatFramedCohort/.test(src)) bare.push(path.relative(root, p));
    }
    assert.deepEqual(bare, [], `cohort figure without a selection frame:\n  ${bare.join('\n  ')}`);
  });

  it('a snippet that returns a bare week4_retained is what the guard is for', () => {
    const fake = 'export const week4_retained = 12;\n';
    assert.doesNotMatch(fake, /frameCohort/);
    assert.match(fake, /week4_retained/);
  });
});
