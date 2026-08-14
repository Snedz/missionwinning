import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { estimateLlmUsage, parseLlmUsage, sumLlmUsage } from '@/lib/llm/usage';

describe('parseLlmUsage', () => {
  it('reads an OpenAI-compatible usage block as the provider meter', () => {
    assert.deepEqual(
      parseLlmUsage({ prompt_tokens: 120, completion_tokens: 42, total_tokens: 162 }),
      { promptTokens: 120, completionTokens: 42, totalTokens: 162, estimated: false }
    );
  });

  it('fills a missing total from the parts, and tolerates a partial block', () => {
    assert.deepEqual(parseLlmUsage({ prompt_tokens: 10, completion_tokens: 5 }), {
      promptTokens: 10,
      completionTokens: 5,
      totalTokens: 15,
      estimated: false,
    });
    assert.equal(parseLlmUsage({ completion_tokens: 7 })?.completionTokens, 7);
  });

  it('garbage is null, not zeros — zero tokens reads as "free" downstream', () => {
    assert.equal(parseLlmUsage(undefined), null);
    assert.equal(parseLlmUsage(null), null);
    assert.equal(parseLlmUsage('usage'), null);
    assert.equal(parseLlmUsage({}), null);
    assert.equal(parseLlmUsage({ prompt_tokens: 'many' }), null);
  });

  it('clamps negatives and rounds floats — a ledger never stores -3 tokens', () => {
    const u = parseLlmUsage({ prompt_tokens: -5, completion_tokens: 2.6 });
    assert.deepEqual(u, { promptTokens: 0, completionTokens: 3, totalTokens: 3, estimated: false });
  });

  it('reads reasoning tokens — omitting them treats thinking as free', () => {
    const u = parseLlmUsage({
      prompt_tokens: 40,
      completion_tokens: 12,
      total_tokens: 140,
      completion_tokens_details: { reasoning_tokens: 88 },
      cost_in_usd_ticks: 1500,
    });
    assert.equal(u?.reasoningTokens, 88);
    assert.equal(u?.costUsdTicks, 1500);
    assert.equal(u?.totalTokens, 140);
    assert.equal(parseLlmUsage({ prompt_tokens: 10, completion_tokens: 2 })?.reasoningTokens, undefined);
  });
});

describe('estimateLlmUsage', () => {
  it('four chars per token, ceiled, and always marked estimated', () => {
    assert.deepEqual(estimateLlmUsage(9, 4), {
      promptTokens: 3,
      completionTokens: 1,
      totalTokens: 4,
      estimated: true,
    });
  });

  it('negative char counts clamp to zero', () => {
    assert.deepEqual(estimateLlmUsage(-10, 0), {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      estimated: true,
    });
  });
});

describe('sumLlmUsage', () => {
  it('adds parts and marks estimated if either side was', () => {
    assert.equal(sumLlmUsage(undefined, undefined), undefined);
    const a = { promptTokens: 10, completionTokens: 2, totalTokens: 12, estimated: false };
    const b = { promptTokens: 3, completionTokens: 5, totalTokens: 8, estimated: true };
    assert.deepEqual(sumLlmUsage(undefined, a), a);
    assert.deepEqual(sumLlmUsage(a, b), {
      promptTokens: 13,
      completionTokens: 7,
      totalTokens: 20,
      estimated: true,
    });
  });
});
