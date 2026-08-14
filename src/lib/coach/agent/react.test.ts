import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  COACH_REACT_MAX_TOOL_ROUNDS,
  buildCoachReactSystemPrompt,
  parseCoachReact,
  runCoachReactLoop,
} from '@/lib/coach/agent/react';
import type { CoachAgentWorld, CoachCompleteFn } from '@/lib/coach/agent/types';

const world: CoachAgentWorld = {
  logFacts: [
    {
      exerciseId: 'squats',
      exerciseName: 'Squats',
      weight: 80,
      reps: 5,
      at: 'not-a-calendar-literal',
    },
  ],
  weekSessions: [],
  loadZone: 'light',
  trainDays14: 3,
  documents: [
    {
      id: 'exercise:squats',
      kind: 'exercise',
      title: 'Squats',
      text: 'Brace. Sit between the knees.',
      exerciseId: 'squats',
    },
  ],
};

describe('parseCoachReact', () => {
  it('reads Thought / Action / Action Input', () => {
    const parsed = parseCoachReact(
      'Thought: need the last squat\nAction: lookup_recent_sets\nAction Input: {"exercise_id":"squats"}'
    );
    assert.equal(parsed.kind, 'action');
    if (parsed.kind === 'action') {
      assert.equal(parsed.name, 'lookup_recent_sets');
      assert.equal(parsed.input.exercise_id, 'squats');
    }
  });

  it('reads Final, JSON final, and the chat {"message"} shape', () => {
    const final = parseCoachReact('Thought: enough\nFinal: Brace and sit.');
    assert.equal(final.kind, 'final');
    if (final.kind === 'final') assert.equal(final.text, 'Brace and sit.');

    const jsonFinal = parseCoachReact('{"thought":"ok","final":"Stand tall."}');
    assert.equal(jsonFinal.kind, 'final');
    if (jsonFinal.kind === 'final') assert.equal(jsonFinal.text, 'Stand tall.');

    const chat = parseCoachReact('{"message":"Brace hard.","actionPath":"/active"}');
    assert.equal(chat.kind, 'final');
    if (chat.kind === 'final') assert.match(chat.text, /Brace hard/);
  });

  it('treats unparsed prose as a final answer', () => {
    const parsed = parseCoachReact('Just go train.');
    assert.equal(parsed.kind, 'final');
    if (parsed.kind === 'final') assert.equal(parsed.text, 'Just go train.');
  });
});

describe('runCoachReactLoop', () => {
  it('stops on Final without calling a tool', async () => {
    const calls: string[] = [];
    const complete: CoachCompleteFn = async ({ user }) => {
      calls.push(user);
      return { ok: true, content: 'Final: Brace, then sit.', usage: { promptTokens: 10, completionTokens: 4, totalTokens: 14, estimated: false } };
    };
    const out = await runCoachReactLoop({
      complete,
      world,
      hits: [],
      transcript: '',
      message: 'How do I squat?',
    });
    assert.equal(out.ok, true);
    if (out.ok) {
      assert.equal(out.message, 'Brace, then sit.');
      assert.equal(out.usedTools, false);
      assert.equal(out.usage?.totalTokens, 14);
    }
    assert.equal(calls.length, 1);
  });

  it('runs a tool then answers from the observation', async () => {
    let n = 0;
    const complete: CoachCompleteFn = async () => {
      n += 1;
      if (n === 1) {
        return {
          ok: true,
          content:
            'Thought: quote the log\nAction: lookup_recent_sets\nAction Input: {"exercise_id":"squats"}',
        };
      }
      return { ok: true, content: 'Final: Last squat was 80 × 5. Keep that load.' };
    };
    const out = await runCoachReactLoop({
      complete,
      world,
      hits: [],
      transcript: '',
      message: 'What did I squat last time?',
    });
    assert.equal(out.ok, true);
    if (out.ok) {
      assert.equal(out.usedTools, true);
      assert.equal(out.steps.length, 1);
      assert.match(out.steps[0]!.observation ?? '', /80/);
      assert.match(out.message, /80/);
    }
    assert.equal(n, 2);
  });

  it('caps tool rounds and fails closed when the model never Finals', async () => {
    let n = 0;
    const complete: CoachCompleteFn = async () => {
      n += 1;
      return {
        ok: true,
        content: 'Action: lookup_load_band\nAction Input: {}',
      };
    };
    const out = await runCoachReactLoop({
      complete,
      world,
      hits: [],
      transcript: '',
      message: 'loop forever',
    });
    assert.ok(n <= COACH_REACT_MAX_TOOL_ROUNDS + 1);
    assert.equal(out.steps.length, COACH_REACT_MAX_TOOL_ROUNDS);
    // Last complete is force-final; still an Action, so the loop reports empty.
    assert.equal(out.ok, false);
    if (!out.ok) assert.equal(out.reason, 'empty');
  });

  it('maps unconfigured from the complete fn', async () => {
    const out = await runCoachReactLoop({
      complete: async () => ({ ok: false, reason: 'unconfigured' }),
      world,
      hits: [],
      transcript: '',
      message: 'hi',
    });
    assert.equal(out.ok, false);
    if (!out.ok) assert.equal(out.reason, 'unconfigured');
  });
});

describe('ReAct stays one-shot ZDR', () => {
  it('never mentions stateful Responses or vendor Collections', () => {
    const src = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'react.ts'), 'utf8');
    assert.doesNotMatch(src, /previous_response_id/);
    assert.doesNotMatch(src, /store_messages/);
    assert.match(src, /ZDR-safe one-shot/);
    const sys = buildCoachReactSystemPrompt('plain', []);
    assert.match(sys, /Never invent a set/);
  });
});
