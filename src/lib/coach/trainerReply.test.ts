/**
 * Free trainer seat (.1115 / .1134). Groq, else COACH_LLM, else OpenRouter :free.
 * Gemini free-tier keys are not a seat.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { DEFAULT_GROQ_MODEL, GROQ_CHAT_COMPLETIONS_URL } from '@/lib/coach/providerClient';
import {
  TRAINER_SYSTEM_PROMPT,
  replyTrainer,
  resolveTrainerSeat,
  trainerUserPrompt,
  type TrainerAskInput,
} from '@/lib/coach/trainerReply';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');
const refused = 'Mu' + 'se';

const ask: TrainerAskInput = {
  exerciseName: 'Bench Press',
  setNumber: 2,
  setCount: 3,
  reps: 5,
  weight: 60,
  unitLabel: 'kg',
  kind: 'normal',
  rowType: 'weight',
  hardCount: 0,
  historyLine: '5 × 55 kg',
  question: 'How should I brace?',
};

const RULES = 'Set 2 of 3. Bench Press. 60 kg for 5.';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('no key stays on the set line and does not call the network', async () => {
  let called = 0;
  const reply = await replyTrainer(ask, {
    env: {},
    fetchImpl: async () => {
      called += 1;
      return jsonResponse({});
    },
  });
  assert.equal(called, 0);
  assert.equal(reply.source, 'rules');
  assert.equal(reply.text, RULES);
  assert.equal(reply.model, undefined);
});

test('GROQ_API_KEY calls Groq chat completions and does not send the key in the URL', async () => {
  const urls: string[] = [];
  const headers: Headers[] = [];
  const reply = await replyTrainer(ask, {
    env: { GROQ_API_KEY: 'gsk_test', GEMINI_API_KEY: 'test-gemini-key' },
    fetchImpl: async (url, init) => {
      urls.push(String(url));
      headers.push(new Headers(init?.headers));
      return jsonResponse({
        choices: [{ message: { content: 'Brace, then press the 60 kg you dialed.' } }],
      });
    },
  });
  assert.equal(reply.source, 'groq');
  assert.equal(reply.model, DEFAULT_GROQ_MODEL);
  assert.equal(reply.text, 'Brace, then press the 60 kg you dialed.');
  assert.equal(urls.length, 1);
  assert.equal(urls[0], GROQ_CHAT_COMPLETIONS_URL);
  assert.equal(headers[0]?.get('Authorization'), 'Bearer gsk_test');
  assert.equal(urls[0]?.includes('gsk_test'), false);
  assert.equal(urls[0]?.includes('generativelanguage'), false);
  const seat = resolveTrainerSeat({
    GROQ_API_KEY: 'gsk_test',
    GEMINI_API_KEY: 'k',
  });
  assert.equal(seat.source, 'groq');
});

test('a Gemini key alone stays on the set line and never calls Google', async () => {
  let calls = 0;
  const reply = await replyTrainer(ask, {
    env: { GEMINI_API_KEY: 'k', GOOGLE_GENERATIVE_AI_API_KEY: 'k2' },
    fetchImpl: async () => {
      calls += 1;
      return jsonResponse({
        candidates: [{ content: { parts: [{ text: 'Press.' }] } }],
      });
    },
  });
  assert.equal(calls, 0);
  assert.equal(reply.source, 'rules');
  assert.equal(reply.text, RULES);
  assert.equal(resolveTrainerSeat({ GEMINI_API_KEY: 'k' }).source, 'rules');
});

test('a model error falls back to the set line', async () => {
  const reply = await replyTrainer(ask, {
    env: { GROQ_API_KEY: 'gsk_test' },
    fetchImpl: async () => jsonResponse({ error: 'nope' }, 500),
  });
  assert.equal(reply.source, 'rules');
  assert.equal(reply.text, RULES);
});

test('a model link or a refused product name falls back to the set line', async () => {
  const linked = await replyTrainer(ask, {
    env: { GROQ_API_KEY: 'gsk_test' },
    fetchImpl: async () =>
      jsonResponse({
        choices: [{ message: { content: 'Pay at https://example.com/checkout' } }],
      }),
  });
  assert.equal(linked.source, 'rules');
  assert.equal(linked.text, RULES);

  const named = await replyTrainer(ask, {
    env: { GROQ_API_KEY: 'gsk_test' },
    fetchImpl: async () =>
      jsonResponse({
        choices: [{ message: { content: `Train like ${refused}.` } }],
      }),
  });
  assert.equal(named.source, 'rules');
  assert.equal(named.text, RULES);
});

test('COACH_LLM is the seat when Gemini is unset', async () => {
  const urls: string[] = [];
  const reply = await replyTrainer(ask, {
    env: {
      COACH_LLM_API_URL: 'https://api.invalid/v1/chat/completions',
      COACH_LLM_API_KEY: 'xai-test',
      COACH_LLM_MODEL: 'grok-4.6',
    },
    fetchImpl: async (url) => {
      urls.push(String(url));
      return jsonResponse({
        choices: [{ message: { content: 'Keep the brace and press 60 kg.' } }],
      });
    },
  });
  assert.equal(reply.source, 'coach_llm');
  assert.equal(reply.model, 'grok-4.6');
  assert.equal(reply.text, 'Keep the brace and press 60 kg.');
  assert.equal(urls[0], 'https://api.invalid/v1/chat/completions');
});

test('the prompt is Mission Winning and carries the history line', () => {
  assert.match(TRAINER_SYSTEM_PROMPT, /Mission Winning AI personal trainer/);
  assert.equal(TRAINER_SYSTEM_PROMPT.toLowerCase().includes(refused.toLowerCase()), false);
  assert.equal(TRAINER_SYSTEM_PROMPT.includes('paymentUrl'), false);
  const user = trainerUserPrompt(ask, RULES);
  assert.match(user, /History: 5 × 55 kg/);
  assert.match(user, /How should I brace/);
});

test('trainer files do not brand the product or invent a checkout', () => {
  const files = [
    'src/lib/coach/trainerReply.ts',
    'app/api/coach/trainer/route.ts',
    'src/components/workout/SessionTrainerAsk.tsx',
    'src/components/workout/ActiveExerciseCard.tsx',
    'src/components/coach/CoachTrainerDoor.tsx',
    'src/components/coach/CoachFreeFormAskPanel.tsx',
    'src/components/coach/CoachLiveVoice.tsx',
  ];
  for (const file of files) {
    const src = read(file);
    assert.equal(src.toLowerCase().includes(refused.toLowerCase()), false, file);
    assert.equal(src.includes('paymentUrl'), false, file);
  }
  const route = read('app/api/coach/trainer/route.ts');
  assert.equal(route.includes('premium_required'), false);
  assert.equal(route.includes('hasAppAccess'), false);
  assert.match(route, /replyTrainer/);
  const card = read('src/components/workout/ActiveExerciseCard.tsx');
  assert.match(card, /SessionTrainerAsk/);
  assert.match(read('src/components/workout/SessionTrainerAsk.tsx'), /data-testid="trainer-ask"/);
  const door = read('src/components/coach/CoachTrainerDoor.tsx');
  assert.match(door, /SessionTrainerAsk/);
  assert.match(door, /href="\/active"/);
  assert.equal(door.includes('/bundle'), false);
  const live = read('src/components/coach/CoachLiveVoice.tsx');
  assert.equal((live.match(/<CoachTrainerDoor/g) ?? []).length, 2);
  const form = read('src/components/coach/CoachFreeFormAskPanel.tsx');
  assert.match(form, /CoachTrainerDoor/);
  assert.equal(form.includes('/bundle'), false);
});
