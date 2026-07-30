import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchCoachLlmCompletion,
  isTruthyEnv,
  parseZeroDataRetentionHeader,
  readCoachLlmEnv,
  streamCoachLlmCompletion,
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

/**
 * `.188` — token usage capture. Every paid feature was gated on "metering does
 * not exist"; it could not exist while both paths dropped the provider's usage
 * block on the floor. The `usage-discarded` mutant (reverting the client to
 * ignoring `data.usage`) fails these.
 */
describe('usage capture', () => {
  const baseEnv = {
    apiUrl: 'https://api.x.ai/v1/chat/completions',
    apiKey: 'xai-test',
    model: 'grok-4.5',
    requireZdr: false,
  };

  it('non-stream: the provider usage block is returned, not discarded', async () => {
    const fetchImpl = async () =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: 'Steady week.' } }],
          usage: { prompt_tokens: 30, completion_tokens: 12, total_tokens: 42 },
        }),
        { status: 200 }
      );
    const out = await fetchCoachLlmCompletion(
      { system: 's', user: 'u' },
      { env: baseEnv, fetchImpl: fetchImpl as typeof fetch }
    );
    assert.equal(out.ok, true);
    if (out.ok) {
      assert.deepEqual(out.usage, {
        promptTokens: 30,
        completionTokens: 12,
        totalTokens: 42,
        estimated: false,
      });
    }
  });

  it('non-stream: a provider that omits usage yields a char estimate, marked estimated', async () => {
    const fetchImpl = async () =>
      new Response(
        JSON.stringify({ choices: [{ message: { content: 'abcdefgh' } }] }),
        { status: 200 }
      );
    const out = await fetchCoachLlmCompletion(
      { system: '1234', user: '5678' },
      { env: baseEnv, fetchImpl: fetchImpl as typeof fetch }
    );
    assert.equal(out.ok, true);
    if (out.ok) {
      // ceil(8/4)=2 prompt chars-side, ceil(8/4)=2 completion.
      assert.deepEqual(out.usage, {
        promptTokens: 2,
        completionTokens: 2,
        totalTokens: 4,
        estimated: true,
      });
    }
  });

  function sseResponse(lines: string[]): Response {
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        const encoder = new TextEncoder();
        for (const line of lines) controller.enqueue(encoder.encode(`${line}\n`));
        controller.close();
      },
    });
    return new Response(body, { status: 200 });
  }

  it('stream: requests include_usage and carries the final usage chunk home', async () => {
    let sentBody = '';
    const fetchImpl = async (_url: RequestInfo | URL, init?: RequestInit) => {
      sentBody = String(init?.body ?? '');
      return sseResponse([
        'data: {"choices":[{"delta":{"content":"Hel"}}]}',
        'data: {"choices":[{"delta":{"content":"lo"}}]}',
        // include_usage final chunk: empty choices, usage present.
        'data: {"choices":[],"usage":{"prompt_tokens":50,"completion_tokens":9,"total_tokens":59}}',
        'data: [DONE]',
      ]);
    };
    const gen = streamCoachLlmCompletion(
      { system: 's', user: 'u' },
      { env: baseEnv, fetchImpl: fetchImpl as typeof fetch }
    );
    let text = '';
    let result = await gen.next();
    while (!result.done) {
      text += result.value;
      result = await gen.next();
    }
    assert.equal(text, 'Hello');
    const final = result.value;
    assert.equal(final.ok, true);
    if (final.ok) {
      assert.deepEqual(final.usage, {
        promptTokens: 50,
        completionTokens: 9,
        totalTokens: 59,
        estimated: false,
      });
    }
    assert.ok(sentBody.includes('"include_usage":true'), 'stream must ask for usage');
  });

  it('stream: no usage chunk → char estimate from streamed deltas, marked estimated', async () => {
    const fetchImpl = async () =>
      sseResponse([
        'data: {"choices":[{"delta":{"content":"abcd"}}]}',
        'data: {"choices":[{"delta":{"content":"efgh"}}]}',
        'data: [DONE]',
      ]);
    const gen = streamCoachLlmCompletion(
      { system: '12', user: '34' },
      { env: baseEnv, fetchImpl: fetchImpl as typeof fetch }
    );
    let result = await gen.next();
    while (!result.done) result = await gen.next();
    const final = result.value;
    assert.equal(final.ok, true);
    if (final.ok) {
      assert.equal(final.usage.estimated, true);
      assert.equal(final.usage.completionTokens, 2); // ceil(8/4)
    }
  });

  it('stream: the empty-choices usage chunk does not count as content', async () => {
    const fetchImpl = async () =>
      sseResponse([
        // ONLY a usage chunk — no deltas. Must be reason:"empty", not ok.
        'data: {"choices":[],"usage":{"prompt_tokens":5,"completion_tokens":0,"total_tokens":5}}',
        'data: [DONE]',
      ]);
    const gen = streamCoachLlmCompletion(
      { system: 's', user: 'u' },
      { env: baseEnv, fetchImpl: fetchImpl as typeof fetch }
    );
    let result = await gen.next();
    while (!result.done) result = await gen.next();
    assert.equal(result.value.ok, false);
    if (!result.value.ok) assert.equal(result.value.reason, 'empty');
  });
});
