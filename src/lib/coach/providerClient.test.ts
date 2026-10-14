import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DEFAULT_GROQ_MODEL,
  DEFAULT_OPENROUTER_FREE_MODEL,
  GROQ_CHAT_COMPLETIONS_URL,
  OPENROUTER_CHAT_COMPLETIONS_URL,
  buildOpenAiChatBody,
  fetchCoachProviderCompletion,
  isGeminiFreeTierUrl,
  isGeminiModel,
  openRouterFreeModel,
  resolveCoachProviders,
} from './providerClient';

const REQ = { system: 'Be brief.', user: 'Set 1. Squat. 60 kg.' };

describe('resolveCoachProviders', () => {
  it('defaults to Groq and falls back to an OpenRouter :free model', () => {
    const seats = resolveCoachProviders({
      GROQ_API_KEY: 'gsk_test',
      OPENROUTER_API_KEY: 'sk-or-test',
    });
    assert.deepEqual(
      seats.map((seat) => seat.id),
      ['groq', 'openrouter']
    );
    assert.equal(seats[0]?.url, GROQ_CHAT_COMPLETIONS_URL);
    assert.equal(seats[0]?.model, DEFAULT_GROQ_MODEL);
    assert.equal(seats[0]?.apiKey, 'gsk_test');
    assert.equal(seats[1]?.url, OPENROUTER_CHAT_COMPLETIONS_URL);
    assert.equal(seats[1]?.model, DEFAULT_OPENROUTER_FREE_MODEL);
    assert.equal(seats[1]?.model.endsWith(':free'), true);
  });

  it('accepts any OpenAI-compatible URL from COACH_LLM_* and keeps Groq first', () => {
    const seats = resolveCoachProviders({
      GROQ_API_KEY: 'gsk_test',
      COACH_LLM_API_URL: 'https://api.example.test/v1/chat/completions',
      COACH_LLM_API_KEY: 'custom-key',
      COACH_LLM_MODEL: 'local-model',
      OPENROUTER_API_KEY: 'sk-or-test',
    });
    assert.deepEqual(
      seats.map((seat) => [seat.id, seat.model]),
      [
        ['groq', DEFAULT_GROQ_MODEL],
        ['openai-compatible', 'local-model'],
        ['openrouter', DEFAULT_OPENROUTER_FREE_MODEL],
      ]
    );
  });

  it('does not put a Gemini host or model on the seat list', () => {
    const seats = resolveCoachProviders({
      GEMINI_API_KEY: 'gemini-secret',
      GOOGLE_GENERATIVE_AI_API_KEY: 'also-gemini',
      GROQ_API_URL: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      GROQ_API_KEY: 'gsk_test',
      GROQ_MODEL: 'gemini-2.5-flash',
      COACH_LLM_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      COACH_LLM_API_KEY: 'should-not-send',
      COACH_LLM_MODEL: 'gemini-2.5-flash',
      OPENROUTER_API_KEY: 'sk-or-test',
      OPENROUTER_MODEL: 'google/gemini-2.0-flash-exp:free',
    });
    assert.equal(seats.length, 1);
    assert.equal(seats[0]?.id, 'openrouter');
    assert.equal(seats[0]?.model, DEFAULT_OPENROUTER_FREE_MODEL);
    assert.equal(JSON.stringify(seats).includes('gemini-secret'), false);
    assert.equal(JSON.stringify(seats).includes('should-not-send'), false);
    assert.equal(isGeminiFreeTierUrl(seats[0]?.url ?? ''), false);
  });

  it('forces the OpenRouter fallback onto a :free model id', () => {
    assert.equal(openRouterFreeModel('meta-llama/llama-3.3-70b-instruct'), 'meta-llama/llama-3.3-70b-instruct:free');
    assert.equal(openRouterFreeModel('already:free'), 'already:free');
    assert.equal(openRouterFreeModel('google/gemini-2.0-flash:free'), DEFAULT_OPENROUTER_FREE_MODEL);
    assert.equal(isGeminiModel('gemini-2.5-flash'), true);
    assert.equal(isGeminiFreeTierUrl('https://gemini.google.com/v1'), true);
    assert.equal(isGeminiFreeTierUrl('https://api.groq.com/openai/v1/chat/completions'), false);
  });

  it('is unconfigured when every key is absent', () => {
    assert.deepEqual(resolveCoachProviders({}), []);
  });
});

describe('fetchCoachProviderCompletion', () => {
  it('calls Groq with a plain chat body and does not leak the key', async () => {
    const seen: { url: string; body: string; auth: string | null }[] = [];
    const out = await fetchCoachProviderCompletion(REQ, {
      env: { GROQ_API_KEY: 'gsk_test', OPENROUTER_API_KEY: 'sk-or-test' },
      fetchImpl: async (url, init) => {
        const headers = new Headers(init?.headers);
        seen.push({
          url: String(url),
          body: String(init?.body ?? ''),
          auth: headers.get('Authorization'),
        });
        return new Response(
          JSON.stringify({
            choices: [{ message: { content: 'Brace, then stand.' } }],
            usage: { prompt_tokens: 4, completion_tokens: 5, total_tokens: 9 },
          }),
          { status: 200 }
        );
      },
    });
    assert.equal(out.ok, true);
    if (out.ok) assert.equal(out.content, 'Brace, then stand.');
    assert.equal(out.provider, 'groq');
    assert.equal(out.model, DEFAULT_GROQ_MODEL);
    assert.equal(seen.length, 1);
    assert.equal(seen[0]?.url, GROQ_CHAT_COMPLETIONS_URL);
    assert.equal(seen[0]?.auth, 'Bearer gsk_test');
    assert.equal(seen[0]?.body.includes('gsk_test'), false);
    assert.equal(seen[0]?.body.includes('reasoning_effort'), false);
    assert.equal(seen[0]?.body.includes('search_parameters'), false);
    const parsed = JSON.parse(seen[0]?.body ?? '{}') as { model: string };
    assert.equal(parsed.model, DEFAULT_GROQ_MODEL);
  });

  it('falls back to OpenRouter :free when Groq errors', async () => {
    const urls: string[] = [];
    const out = await fetchCoachProviderCompletion(REQ, {
      env: {
        GROQ_API_KEY: 'gsk_test',
        OPENROUTER_API_KEY: 'sk-or-test',
        OPENROUTER_MODEL: 'meta-llama/llama-3.3-70b-instruct',
      },
      fetchImpl: async (url) => {
        urls.push(String(url));
        if (String(url).includes('groq.com')) {
          return new Response('nope', { status: 429 });
        }
        return new Response(
          JSON.stringify({ choices: [{ message: { content: 'From the free seat.' } }] }),
          { status: 200 }
        );
      },
    });
    assert.equal(out.ok, true);
    assert.equal(out.provider, 'openrouter');
    assert.equal(out.model, 'meta-llama/llama-3.3-70b-instruct:free');
    assert.deepEqual(urls, [GROQ_CHAT_COMPLETIONS_URL, OPENROUTER_CHAT_COMPLETIONS_URL]);
  });

  it('does not call Gemini even when that key is the only one set', async () => {
    let calls = 0;
    const out = await fetchCoachProviderCompletion(REQ, {
      env: {
        GEMINI_API_KEY: 'gemini-secret',
        GOOGLE_GENERATIVE_AI_API_KEY: 'also',
        COACH_LLM_API_URL: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        COACH_LLM_API_KEY: 'gemini-secret',
      },
      fetchImpl: async () => {
        calls += 1;
        throw new Error('health data must not leave');
      },
    });
    assert.equal(calls, 0);
    assert.equal(out.ok, false);
    if (!out.ok) assert.equal(out.reason, 'unconfigured');
  });

  it('uses an explicit compatible endpoint when Groq is unset', async () => {
    const out = await fetchCoachProviderCompletion(REQ, {
      env: {
        COACH_LLM_API_URL: 'https://api.example.test/v1/chat/completions',
        COACH_LLM_API_KEY: 'local-key',
        COACH_LLM_MODEL: 'desk-model',
      },
      fetchImpl: async () =>
        new Response(JSON.stringify({ choices: [{ message: { content: 'Local seat.' } }] }), {
          status: 200,
        }),
    });
    assert.equal(out.ok, true);
    assert.equal(out.provider, 'openai-compatible');
    assert.equal(out.model, 'desk-model');
  });
});

describe('buildOpenAiChatBody', () => {
  it('is the OpenAI chat shape', () => {
    const body = buildOpenAiChatBody(REQ, 'openai/gpt-oss-20b');
    assert.equal(body.model, 'openai/gpt-oss-20b');
    assert.ok(Array.isArray(body.messages));
    assert.equal('reasoning_effort' in body, false);
  });
});
