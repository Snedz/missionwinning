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

  /*
   * This asserted `excellenceStatusAt(root) === 'unscored'` against the live
   * repo, and that RESULT status is exactly the value the founder is expected
   * to change. It was a test with an expiry date — the same class the house
   * rule bans in fixtures — and it came due the moment the gate was scored:
   * a green suite would have gone red on the founder doing their job.
   *
   * What is durable is the *rule*: W1–W4 are proven by instruments in this
   * tree, and C5 is proven by RESULT status and nothing else. So the live
   * repo is checked for the half that instruments decide, and C5's dependence
   * on status is proved with fixtures in both directions rather than by
   * whichever value happens to be committed today.
   */
  it('on this repo W1–W4 are proven by their instruments', () => {
    for (const step of PATH_STEPS) {
      if (step.id === 'C5') continue;
      assert.equal(isStepProven(step, root), true, `${step.id} should already be proven`);
    }
  });

  it('C5 is proven by RESULT status alone, both ways', () => {
    const c5 = PATH_STEPS.find((s) => s.id === 'C5');
    assert.ok(c5, 'C5 must exist in PATH_STEPS');

    // Live tree: C5 tracks whatever status is committed — computed, not pinned.
    assert.equal(isStepProven(c5, root), excellenceStatusAt(root) === 'pass');

    // Fixtures: same instruments, status is the only variable.
    for (const [status, proven] of [
      ['pass', true],
      ['fail', false],
      ['unscored', false],
    ] as const) {
      const tmp = mkdtempSync(path.join(tmpdir(), 'c5-'));
      try {
        mkdirSync(path.join(tmp, path.dirname(c5.instrument)), { recursive: true });
        writeFileSync(path.join(tmp, c5.instrument), readFileSync(path.join(root, c5.instrument)));
        for (const extra of c5.also ?? []) {
          mkdirSync(path.join(tmp, path.dirname(extra)), { recursive: true });
          writeFileSync(path.join(tmp, extra), readFileSync(path.join(root, extra)));
        }
        mkdirSync(path.join(tmp, 'docs'), { recursive: true });
        writeFileSync(path.join(tmp, 'docs/EXCELLENCE_RESULT.md'), `- **status:** ${status}\n`);
        assert.equal(isStepProven(c5, tmp), proven, `C5 with status ${status}`);
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    }
  });

  it('an unscored RESULT makes C5 the founder gap, a pass clears the path', () => {
    // Every instrument present, so only C5 can be the gap.
    const build = (status: string) => {
      const tmp = mkdtempSync(path.join(tmpdir(), 'gap-'));
      for (const step of PATH_STEPS) {
        mkdirSync(path.join(tmp, path.dirname(step.instrument)), { recursive: true });
        writeFileSync(path.join(tmp, step.instrument), readFileSync(path.join(root, step.instrument)));
        for (const extra of step.also ?? []) {
          mkdirSync(path.join(tmp, path.dirname(extra)), { recursive: true });
          writeFileSync(path.join(tmp, extra), readFileSync(path.join(root, extra)));
        }
      }
      mkdirSync(path.join(tmp, 'docs'), { recursive: true });
      writeFileSync(path.join(tmp, 'docs/EXCELLENCE_RESULT.md'), `- **status:** ${status}\n`);
      return tmp;
    };

    const unscored = build('unscored');
    try {
      const gap = firstCriticalGap(unscored);
      assert.ok(gap, 'unscored must leave a gap');
      assert.equal(gap.id, 'C5');
      assert.equal(gap.owner, 'founder');
    } finally {
      rmSync(unscored, { recursive: true, force: true });
    }

    const passed = build('pass');
    try {
      assert.equal(
        firstCriticalGap(passed),
        null,
        'a pass leaves no critical-path gap — route.ts turns that into stop, not a new letter'
      );
    } finally {
      rmSync(passed, { recursive: true, force: true });
    }
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
