import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildLlmUsageRow } from '@/lib/llm/meteringRow';

const USAGE = { promptTokens: 100, completionTokens: 40, totalTokens: 140, estimated: false };

describe('buildLlmUsageRow', () => {
  it('a signed-in call rows under the user, not the device', () => {
    const row = buildLlmUsageRow({
      feature: 'coach_chat',
      identity: { userId: 'u-1', deviceId: 'd-1', ip: '1.2.3.4' },
      model: 'grok-4.5',
      usage: USAGE,
      ok: true,
      durationMs: 900,
    });
    assert.ok(row);
    assert.equal(row.user_id, 'u-1');
    assert.equal(row.device_id, null);
    assert.equal(row.feature, 'coach_chat');
    assert.equal(row.total_tokens, 140);
    assert.equal(row.estimated, false);
    assert.equal(row.reason, null);
  });

  it('an anonymous device rows under the device with user null — the owner check shape', () => {
    const row = buildLlmUsageRow({
      feature: 'meal_vision',
      identity: { userId: null, deviceId: 'd-1', ip: '1.2.3.4' },
      usage: { ...USAGE, estimated: true },
      ok: true,
    });
    assert.equal(row?.user_id, null);
    assert.equal(row?.device_id, 'd-1');
    assert.equal(row?.estimated, true);
  });

  it('no owner → no row. An IP is not an identity the ledger will accept', () => {
    const row = buildLlmUsageRow({
      feature: 'daily_insight',
      identity: { userId: null, deviceId: null, ip: '1.2.3.4' },
      usage: USAGE,
      ok: true,
    });
    assert.equal(row, null);
  });

  it('the row is counts and outcome only — no field could carry prompt content', () => {
    const row = buildLlmUsageRow({
      feature: 'coach_chat',
      identity: { userId: 'u-1', deviceId: null, ip: '1.2.3.4' },
      usage: USAGE,
      ok: false,
      reason: 'http_error',
      durationMs: 40,
    });
    assert.ok(row);
    // The complete column set, asserted exactly: adding a content-bearing field
    // means consciously breaking this test and the privacy contract with it.
    assert.deepEqual(Object.keys(row).sort(), [
      'completion_tokens',
      'device_id',
      'duration_ms',
      'estimated',
      'feature',
      'model',
      'ok',
      'prompt_tokens',
      'reason',
      'total_tokens',
      'user_id',
    ]);
    assert.equal(row.ok, false);
    assert.equal(row.reason, 'http_error');
  });

  it('the ip never appears anywhere in the row', () => {
    const row = buildLlmUsageRow({
      feature: 'coach_chat',
      identity: { userId: 'u-1', deviceId: null, ip: '203.0.113.9' },
      usage: USAGE,
      ok: true,
    });
    assert.ok(!JSON.stringify(row).includes('203.0.113.9'));
  });
});
