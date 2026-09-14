/**
 * Staged rollout decisions. Kill beats allowlist. Percent is monotonic.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAllFlags, evaluateFlag, isFlagOn, parseAllowlist } from './evaluate';
import type { FlagOverride, FlagSubject } from './evaluate';

const subject: FlagSubject = { userId: '3f9a1c2e-5b7d-4e8f-9a0b-1c2d3e4f5a6b' };

function override(partial: Partial<FlagOverride>): FlagOverride {
  return {
    percent: 0,
    killed: false,
    allowlist: [],
    ...partial,
  };
}

describe('evaluateFlag', () => {
  it('unknown keys are off', () => {
    const d = evaluateFlag('logger', subject, override({ percent: 100 }));
    assert.equal(d.on, false);
    assert.equal(d.reason, 'unknown');
  });

  it('no subject is off even at 100 percent', () => {
    const d = evaluateFlag('example_staged', {}, override({ percent: 100 }));
    assert.equal(d.on, false);
    assert.equal(d.reason, 'no_subject');
    assert.equal(isFlagOn('example_staged', {}, override({ percent: 100 })), false);
  });

  it('kill beats allowlist', () => {
    const d = evaluateFlag(
      'example_staged',
      { ...subject, email: 'founder@example.com' },
      override({
        killed: true,
        percent: 100,
        allowlist: ['founder@example.com', subject.userId!],
      })
    );
    assert.equal(d.on, false);
    assert.equal(d.reason, 'killed');
  });

  it('allowlist email is case-insensitive', () => {
    const d = evaluateFlag(
      'example_staged',
      { email: 'Founder@Example.COM' },
      override({ allowlist: ['FOUNDER@example.com'] })
    );
    assert.equal(d.on, true);
    assert.equal(d.reason, 'allowlist');
  });

  it('allowlist user id wins without a percent', () => {
    const d = evaluateFlag(
      'example_staged',
      subject,
      override({ percent: 0, allowlist: [subject.userId!] })
    );
    assert.equal(d.on, true);
    assert.equal(d.reason, 'allowlist');
  });

  it('percent 0 is off without an allowlist hit', () => {
    const d = evaluateFlag('example_staged', subject, override({ percent: 0 }));
    assert.equal(d.on, false);
    assert.equal(d.reason, 'off');
    assert.equal(typeof d.bucket, 'number');
  });

  it('percent 100 is on when a subject exists', () => {
    const d = evaluateFlag('example_staged', subject, override({ percent: 100 }));
    assert.equal(d.on, true);
    assert.equal(d.reason, 'percent');
  });

  it('a guest with only a device id can still bucket', () => {
    const d = evaluateFlag(
      'example_staged',
      { deviceId: 'mw-device-1' },
      override({ percent: 100 })
    );
    assert.equal(d.on, true);
  });

  it('guests do not match email allowlists', () => {
    const d = evaluateFlag(
      'example_staged',
      { deviceId: 'mw-device-1' },
      override({ percent: 0, allowlist: ['founder@example.com'] })
    );
    assert.equal(d.on, false);
    assert.equal(d.reason, 'off');
  });
});

describe('monotonic percent', () => {
  it('everyone on at 10 percent stays on at 20 percent', () => {
    const ids = Array.from({ length: 80 }, (_, i) => `user-${i}`);
    const at10 = ids.filter((id) =>
      evaluateFlag('example_staged', { userId: id }, override({ percent: 10 })).on
    );
    const at20 = new Set(
      ids.filter((id) =>
        evaluateFlag('example_staged', { userId: id }, override({ percent: 20 })).on
      )
    );
    assert.ok(at10.length > 0, 'a 10% sample of 80 ids should not be empty');
    assert.ok(at20.size > at10.length, '20% must add people, not reshuffle');
    for (const id of at10) {
      assert.equal(at20.has(id), true, `${id} was in 10% but dropped from 20% — buckets reshuffled`);
    }
  });
});

describe('parseAllowlist', () => {
  it('rejects junk and caps at 50', () => {
    assert.equal(parseAllowlist(['not-an-id']), null);
    assert.equal(parseAllowlist(['ok@example.com', 1]), null);
    assert.equal(parseAllowlist(Array.from({ length: 51 }, (_, i) => `a${i}@x.co`)), null);
    assert.deepEqual(parseAllowlist(['A@x.co', 'a@x.co']), ['a@x.co']);
  });
});

describe('evaluateAllFlags', () => {
  it('returns a boolean map keyed by the catalog, never an allowlist', () => {
    const map = evaluateAllFlags(subject, new Map());
    assert.deepEqual(Object.keys(map), ['example_staged']);
    assert.equal(map.example_staged, false);
    assert.equal('allowlist' in map, false);
  });
});
