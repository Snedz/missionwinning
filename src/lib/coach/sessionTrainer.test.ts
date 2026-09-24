import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  acceptTrainerLine,
  formatTrainerLoad,
  libraryFormCue,
  libraryHrefForExercise,
  readTrainerLine,
  sessionTrainerSeedFromPlan,
  TRAINER_SYSTEM_PROMPT,
  type SessionTrainerFacts,
} from './sessionTrainer';
import {
  FREE_SESSION_TRAINER_MODEL,
  geminiGenerateUrl,
  readGeminiModel,
  voiceSessionTrainer,
} from './sessionTrainerServer';

const facts: SessionTrainerFacts = {
  exerciseId: 'squats',
  exerciseName: 'Back Squat',
  weight: 60,
  reps: 8,
  unit: 'kg',
  setsLeft: 3,
  planLabel: 'Legs',
  formCue: 'Brace, then drive the floor away.',
};

describe('session trainer facts', () => {
  it('a missing plan invents no lift', () => {
    const seed = sessionTrainerSeedFromPlan(null, 0, 'kg');
    assert.equal(seed.exerciseId, null);
    assert.equal(seed.planLabel, null);
    assert.equal(seed.weight, null);
  });

  it('today’s open session wins over a later planned day', () => {
    const seed = sessionTrainerSeedFromPlan(
      {
        sessions: [
          {
            dayOffset: 2,
            status: 'planned',
            name: 'Push',
            exercises: [{ exerciseId: 'bench-press', sets: 3, reps: 5, weight: 100 }],
          },
          {
            dayOffset: 0,
            status: 'planned',
            name: 'Legs',
            exercises: [{ exerciseId: 'squats', sets: 4, reps: 8, weight: 60 }],
          },
        ],
      },
      0,
      'kg'
    );
    assert.equal(seed.exerciseId, 'squats');
    assert.equal(seed.planLabel, 'Legs');
    assert.equal(seed.reps, 8);
    assert.equal(seed.weight, 60);
  });

  it('a finished today falls through to the next planned lift', () => {
    const seed = sessionTrainerSeedFromPlan(
      {
        sessions: [
          {
            dayOffset: 0,
            status: 'done',
            name: 'Legs',
            exercises: [{ exerciseId: 'squats', sets: 3, reps: 5, weight: 80 }],
          },
          {
            dayOffset: 1,
            status: 'planned',
            name: 'Push',
            exercises: [{ exerciseId: 'push-ups', sets: 3, reps: 10, weight: 0 }],
          },
        ],
      },
      0,
      'lb'
    );
    assert.equal(seed.exerciseId, 'push-ups');
    assert.equal(seed.planLabel, 'Push');
    assert.equal(seed.weight, 0);
    assert.equal(seed.unit, 'lb');
  });

  it('zero weight is reps, never a zero-kilo prescription', () => {
    assert.equal(formatTrainerLoad({ weight: 0, reps: 10, unit: 'kg' }), '10 reps');
    assert.equal(formatTrainerLoad({ weight: 60, reps: 8, unit: 'kg' }), '60 kg × 8');
    assert.equal(formatTrainerLoad({ weight: 135, reps: 5, unit: 'lb' }), '135 lbs × 5');
    assert.equal(formatTrainerLoad({ weight: null, reps: null, unit: 'kg' }), null);
  });

  it('form cue prefers execute, else setup, else the catalog line', () => {
    assert.equal(
      libraryFormCue({ setup: ['Feet planted'], execute: ['Drive the floor away'], cues: 'unused' }),
      'Drive the floor away'
    );
    assert.equal(libraryFormCue({ setup: ['Feet planted'], execute: [], cues: null }), 'Feet planted');
    assert.equal(libraryFormCue({ setup: [], execute: [], cues: '  Hips high. ' }), 'Hips high.');
    assert.equal(libraryFormCue({ setup: [], execute: [], cues: '   ' }), null);
  });

  it('library links are catalog slugs', () => {
    assert.equal(libraryHrefForExercise('squats'), '/exercises/squats');
    assert.equal(libraryHrefForExercise('fedb-0123'), '/exercises/fedb-0123');
    assert.equal(libraryHrefForExercise('../admin'), null);
    assert.equal(libraryHrefForExercise(''), null);
  });
});

describe('session trainer line', () => {
  it('keeps a line that stays on the lift and the load', () => {
    const line = acceptTrainerLine(
      'Next: Back Squat, 60 kg for 8. Brace, then drive the floor away.',
      facts
    );
    assert.ok(line);
  });

  it('refuses a different load and another product name', () => {
    assert.equal(
      acceptTrainerLine('Next: Back Squat, 100 kg for 8. Brace and go.', facts),
      null
    );
    assert.equal(
      acceptTrainerLine('Muse says Back Squat, 60 kg for 8. Brace.', facts),
      null
    );
    assert.equal(acceptTrainerLine('Add weight and go now.', facts), null);
  });

  it('allows a number that already lives in the cue', () => {
    const withTempo = { ...facts, formCue: 'Lower for 3 seconds, then stand.' };
    const line = acceptTrainerLine(
      'Back Squat, 60 kg for 8. Lower for 3 seconds, then stand.',
      withTempo
    );
    assert.ok(line);
  });

  it('reads a JSON line and ignores a fence', () => {
    const raw = '```json\n{"line":"Back Squat, 60 kg × 8. Brace, then drive the floor away."}\n```';
    const line = readTrainerLine(raw, facts);
    assert.match(line ?? '', /Back Squat/);
    assert.match(TRAINER_SYSTEM_PROMPT, /Mission Winning/);
    assert.doesNotMatch(TRAINER_SYSTEM_PROMPT, /\bMuse\b/);
  });
});

describe('session trainer voice', () => {
  it('does not call a model when the live branch is off', async () => {
    let called = 0;
    const voice = await voiceSessionTrainer(facts, {
      useLlm: false,
      fetchImpl: async () => {
        called += 1;
        throw new Error('no network');
      },
    });
    assert.equal(called, 0);
    assert.equal(voice.source, 'library');
    assert.equal(voice.model, null);
    assert.equal(voice.line, null);
  });

  it('calls gemini-2.5-flash and keeps the line', async () => {
    const urls: string[] = [];
    const voice = await voiceSessionTrainer(facts, {
      useLlm: true,
      env: { GEMINI_API_KEY: 'test-gemini-key' },
      fetchImpl: async (input, init) => {
        urls.push(String(input));
        const headers = new Headers(init?.headers);
        assert.equal(headers.get('x-goog-api-key'), 'test-gemini-key');
        assert.equal(String(init?.body).includes('test-gemini-key'), false);
        return new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: '{"line":"Back Squat, 60 kg for 8. Brace, then drive the floor away."}',
                    },
                  ],
                },
              },
            ],
            usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 16, totalTokenCount: 36 },
          }),
          { status: 200 }
        );
      },
    });
    assert.equal(voice.source, 'llm');
    assert.equal(voice.model, FREE_SESSION_TRAINER_MODEL);
    assert.match(voice.line ?? '', /Back Squat/);
    assert.equal(urls.length, 1);
    assert.equal(urls[0], geminiGenerateUrl(FREE_SESSION_TRAINER_MODEL));
    assert.match(urls[0], /generativelanguage\.googleapis\.com/);
    assert.equal(voice.usage?.estimated, false);
    assert.equal(voice.usage?.totalTokens, 36);
  });

  it('a rejected model line does not become the coach', async () => {
    const voice = await voiceSessionTrainer(facts, {
      useLlm: true,
      env: { GEMINI_API_KEY: 'test-gemini-key' },
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            candidates: [{ content: { parts: [{ text: '{"line":"Back Squat at 200 kg now."}' }] } }],
          }),
          { status: 200 }
        ),
    });
    assert.equal(voice.source, 'library');
    assert.equal(voice.line, null);
  });

  it('without a Gemini key, the configured coach model is the fallback', async () => {
    const voice = await voiceSessionTrainer(facts, {
      useLlm: true,
      env: {
        COACH_LLM_API_URL: 'https://api.x.ai/v1/chat/completions',
        COACH_LLM_API_KEY: 'xai-test',
        COACH_LLM_MODEL: 'grok-4.6',
      },
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: '{"line":"Back Squat, 60 kg for 8. Brace, then drive the floor away."}',
                },
              },
            ],
            usage: { prompt_tokens: 10, completion_tokens: 12, total_tokens: 22 },
          }),
          { status: 200, headers: { 'x-zero-data-retention': 'true' } }
        ),
    });
    assert.equal(voice.source, 'llm');
    assert.equal(voice.model, 'grok-4.6');
  });

  it('pins the free model slug', () => {
    assert.equal(FREE_SESSION_TRAINER_MODEL, 'gemini-2.5-flash');
    assert.equal(readGeminiModel({}), 'gemini-2.5-flash');
    assert.equal(readGeminiModel({ GEMINI_MODEL: 'gemini-2.0-flash' }), 'gemini-2.0-flash');
    assert.equal(readGeminiModel({ GEMINI_MODEL: 'https://evil.example' }), 'gemini-2.5-flash');
  });
});
