import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchCoachLlmCompletion,
  isTruthyEnv,
  parseZeroDataRetentionHeader,
  readCoachLlmEnv,
} from '@/lib/coachLlmClient';

describe('parseZeroDataRetentionHeader', () => {
  it('parses true/false and null', () => {
    assert.equal(parseZeroDataRetentionHeader('true'), true);
    assert.equal(parseZeroDataRetentionHeader('FALSE'), false);
    assert.equal(parseZeroDataRetentionHeader(null), null);
    assert.equal(parseZeroDataRetentionHeader(''), null);
    assert.equal(parseZeroDataRetentionHeader('maybe'), null);
  });
});

describe('isTruthyEnv / readCoachLlmEnv', () => {
  it('reads require ZDR flag', () => {
    assert.equal(isTruthyEnv('true'), true);
    assert.equal(isTruthyEnv('0'), false);
    const env = readCoachLlmEnv({
      COACH_LLM_API_URL: ' https://api.x.ai/v1/chat/completions ',
      COACH_LLM_API_KEY: 'xai-test',
      COACH_LLM_MODEL: 'grok-4.5',
      COACH_LLM_REQUIRE_ZDR: 'true',
    });
    assert.equal(env.apiUrl, 'https://api.x.ai/v1/chat/completions');
    assert.equal(env.requireZdr, true);
  });
});

describe('fetchCoachLlmCompletion', () => {
  const baseEnv = {
    apiUrl: 'https://api.x.ai/v1/chat/completions',
    apiKey: 'xai-test',
    model: 'grok-4.5',
    requireZdr: false,
  };

  it('returns unconfigured without url/key', async () => {
    const out = await fetchCoachLlmCompletion(
      { system: 's', user: 'u' },
      { env: {} }
    );
    assert.equal(out.ok, false);
    if (!out.ok) assert.equal(out.reason, 'unconfigured');
  });

  it('returns content and ZDR true', async () => {
    const fetchImpl = async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: '{"message":"Train smart."}' } }],
        }),
        {
          status: 200,
          headers: { 'x-zero-data-retention': 'true' },
        }
      );
    const out = await fetchCoachLlmCompletion(
      { system: 's', user: 'u' },
      { env: baseEnv, fetchImpl: fetchImpl as typeof fetch }
    );
    assert.equal(out.ok, true);
    if (out.ok) {
      assert.ok(out.content.includes('Train'));
      assert.equal(out.zeroDataRetention, true);
    }
  });

  it('fails closed when REQUIRE_ZDR and header is false', async () => {
    const fetchImpl = async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'secret' } }],
        }),
        {
          status: 200,
          headers: { 'x-zero-data-retention': 'false' },
        }
      );
    const out = await fetchCoachLlmCompletion(
      { system: 's', user: 'u' },
      {
        env: { ...baseEnv, requireZdr: true },
        fetchImpl: fetchImpl as typeof fetch,
      }
    );
    assert.equal(out.ok, false);
    if (!out.ok) {
      assert.equal(out.reason, 'zdr_inactive');
      assert.equal(out.zeroDataRetention, false);
    }
  });

  it('fails closed when REQUIRE_ZDR and header missing', async () => {
    const fetchImpl = async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'ok' } }],
        }),
        { status: 200 }
      );
    const out = await fetchCoachLlmCompletion(
      { system: 's', user: 'u' },
      {
        env: { ...baseEnv, requireZdr: true },
        fetchImpl: fetchImpl as typeof fetch,
      }
    );
    assert.equal(out.ok, false);
    if (!out.ok) assert.equal(out.reason, 'zdr_inactive');
  });

  it('maps http errors', async () => {
    const fetchImpl = async () =>
      new Response('nope', {
        status: 429,
        headers: { 'x-zero-data-retention': 'true' },
      });
    const out = await fetchCoachLlmCompletion(
      { system: 's', user: 'u' },
      { env: baseEnv, fetchImpl: fetchImpl as typeof fetch }
    );
    assert.equal(out.ok, false);
    if (!out.ok) {
      assert.equal(out.reason, 'http_error');
      assert.equal(out.status, 429);
    }
  });

  it('maps network failures', async () => {
    const fetchImpl = async () => {
      throw new Error('offline');
    };
    const out = await fetchCoachLlmCompletion(
      { system: 's', user: 'u' },
      { env: baseEnv, fetchImpl: fetchImpl as typeof fetch }
    );
    assert.equal(out.ok, false);
    if (!out.ok) assert.equal(out.reason, 'network');
  });
});
