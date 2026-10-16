import { describe, it } from 'node:test';
import assert from 'node:assert';
import { logSupersetChain, restSkippedCount, SKIP_REST } from './supersetChainLog';

describe('logSupersetChain', () => {
  it('empty chain → ok false, reason empty chain', () => {
    assert.deepStrictEqual(logSupersetChain([]), { ok: false, line: '', reason: 'empty chain' });
    assert.deepStrictEqual(logSupersetChain(null as never), { ok: false, line: '', reason: 'empty chain' });
    assert.deepStrictEqual(logSupersetChain(undefined as never), { ok: false, line: '', reason: 'empty chain' });
  });

  it('single exercise → ok true, reason single exercise (not a superset), line Squat ×5', () => {
    const result = logSupersetChain([{ name: 'Squat', reps: 5 }]);
    assert.strictEqual(result.ok, true);
    assert.strictEqual(result.reason, 'single exercise (not a superset)');
    assert.strictEqual(result.line, 'Squat ×5');
  });

  it('two links, no rest → Bench ×8 → no rest → Row ×10', () => {
    const result = logSupersetChain([
      { name: 'Bench', reps: 8, restTakenSec: null },
      { name: 'Row', reps: 10, restTakenSec: 0 },
    ]);
    assert.strictEqual(result.ok, true);
    assert.strictEqual(result.line, `Bench ×8 ${SKIP_REST} Row ×10`);
    assert.strictEqual(result.reason, 'superset of 2');
  });

  it('three links, rest taken after the second (60) → contains → rest 60s → and one → no rest →', () => {
    const result = logSupersetChain([
      { name: 'A', reps: 1, restTakenSec: 0 },
      { name: 'B', reps: 2, restTakenSec: 60 },
      { name: 'C', reps: 3, restTakenSec: null },
    ]);
    assert.strictEqual(result.ok, true);
    assert.ok(result.line.includes('→ rest 60s →'));
    const noRestCount = (result.line.match(/→ no rest →/g) || []).length;
    assert.strictEqual(noRestCount, 1);
    assert.strictEqual(result.reason, 'superset of 3');
  });

  it('missing reps renders ×—', () => {
    const result = logSupersetChain([{ name: 'Squat' }, { name: 'Press' }]);
    assert.strictEqual(result.line, `Squat ×— ${SKIP_REST} Press ×—`);
    assert.ok(result.line.includes('×—'));
  });

  it('unnamed exercise → ok false', () => {
    assert.deepStrictEqual(logSupersetChain([{ name: '' }]), { ok: false, line: '', reason: 'unnamed exercise' });
    assert.deepStrictEqual(logSupersetChain([{ name: '  ' }]), { ok: false, line: '', reason: 'unnamed exercise' });
  });

  it('restSkippedCount for the three-link case → 1', () => {
    const count = restSkippedCount([
      { name: 'A', restTakenSec: 0 },
      { name: 'B', restTakenSec: 60 },
      { name: 'C', restTakenSec: null },
    ]);
    assert.strictEqual(count, 1);
  });
});
