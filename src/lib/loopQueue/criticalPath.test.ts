/**
 * The path checklist is only worth anything if it stays pinned to
 * ORCHESTRATION and to instruments that exist.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  PATH_STEPS,
  excellenceStatusAt,
  firstCriticalGap,
  isStepProven,
  orchestrationWIds,
} from './criticalPath.ts';

const root = path.join(path.dirname(new URL(import.meta.url).pathname), '../../..');
const orch = readFileSync(path.join(root, 'ORCHESTRATION.md'), 'utf8');

describe('critical path', () => {
  it('covers every W-stream row in ORCHESTRATION and no extra W-id', () => {
    const fromDoc = orchestrationWIds(orch);
    const fromPath = PATH_STEPS.filter((s) => /^W\d+$/.test(s.id)).map((s) => s.id);
    assert.deepEqual(fromPath, fromDoc, 'PATH_STEPS W-ids drifted from ORCHESTRATION');
  });

  it('every step has a live instrument and an ORCHESTRATION home', () => {
    for (const step of PATH_STEPS) {
      assert.match(orch, new RegExp(step.orchAnchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      const src = readFileSync(path.join(root, step.instrument), 'utf8');
      assert.ok(src.includes(step.anchor), `${step.id} instrument lost its anchor`);
      for (const extra of step.also ?? []) {
        assert.ok(readFileSync(path.join(root, extra), 'utf8').length > 0, `${step.id} missing ${extra}`);
      }
    }
  });

  it('on this repo W1–W4 are proven and C5 is the founder gap while RESULT is unscored', () => {
    assert.equal(excellenceStatusAt(root), 'unscored');
    for (const step of PATH_STEPS) {
      if (step.id === 'C5') {
        assert.equal(isStepProven(step, root), false);
      } else {
        assert.equal(isStepProven(step, root), true, `${step.id} should already be proven`);
      }
    }
    const gap = firstCriticalGap(root);
    assert.ok(gap);
    assert.equal(gap.id, 'C5');
    assert.equal(gap.owner, 'founder');
  });

  it('a missing W1 instrument is the ticket, not C5', () => {
    const tmp = mkdtempSync(path.join(tmpdir(), 'path-'));
    mkdirSync(path.join(tmp, 'docs'), { recursive: true });
    writeFileSync(path.join(tmp, 'docs/EXCELLENCE_RESULT.md'), '- **status:** unscored\n');
    const gap = firstCriticalGap(tmp);
    assert.equal(gap?.id, 'W1');
    assert.equal(gap?.owner, 'agent');
    rmSync(tmp, { recursive: true, force: true });
  });
});
