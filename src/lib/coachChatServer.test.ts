import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildChatUserPrompt,
  buildCoachAgentWorld,
  detectExerciseFromMessage,
  parseCoachChatJson,
  buildChatSystemPrompt,
} from '@/lib/coachChatServer';
import { EXERCISES } from '@/data/exercises';

describe('detectExerciseFromMessage', () => {
  it('prefers explicit exerciseId', () => {
    const id = EXERCISES[0]?.id;
    assert.ok(id);
    assert.equal(detectExerciseFromMessage('hello', id), id);
  });

  it('matches longest name in message', () => {
    const withName = EXERCISES.find((e) => e.name.length >= 6);
    assert.ok(withName);
    assert.equal(
      detectExerciseFromMessage(`How do I do ${withName!.name} better?`),
      withName!.id
    );
  });
});

describe('parseCoachChatJson', () => {
  it('parses message and keeps valid path', () => {
    const out = parseCoachChatJson(
      '{"message":"Brace hard.","actionLabel":"Train","actionPath":"/active"}'
    );
    assert.ok(out);
    assert.equal(out!.actionPath, '/active');
  });

  it('strips invalid action path', () => {
    const out = parseCoachChatJson(
      '{"message":"Ok","actionLabel":"X","actionPath":"/evil"}'
    );
    assert.ok(out);
    assert.equal(out!.actionPath, undefined);
    assert.equal(out!.actionLabel, undefined);
  });

  it('truncates long message', () => {
    const long = 'x'.repeat(800);
    const out = parseCoachChatJson(JSON.stringify({ message: long }));
    assert.ok(out);
    assert.equal(out!.message.length, 600);
  });
});

describe('buildChatUserPrompt', () => {
  it('clips transcript to last turns and char budget', () => {
    const turns = Array.from({ length: 20 }, (_, i) => ({
      role: (i % 2 === 0 ? 'user' : 'coach') as 'user' | 'coach',
      content: 'y'.repeat(600),
    }));
    const prompt = buildChatUserPrompt(turns, 'final question');
    assert.ok(prompt.includes('final question'));
    // 12 turns max — should not include earliest
    assert.ok(prompt.length < 20 * 600);
  });
});

describe('buildChatSystemPrompt grounding', () => {
  it('includes grounding for known exercise (default depth ok)', () => {
    const id = EXERCISES[0]!.id;
    const sys = buildChatSystemPrompt(
      {
        readiness: 70,
        strain: 40,
        recovery: 60,
        trainDays14: 3,
      },
      id
    );
    assert.ok(sys.includes('Grounding exercise'));
    assert.ok(sys.includes(EXERCISES[0]!.name));
  });
});

describe('buildCoachAgentWorld', () => {
  it('defaults missing citations and attaches the local corpus', () => {
    const world = buildCoachAgentWorld({
      readiness: 50,
      strain: 40,
      recovery: 60,
      trainDays14: 2,
    });
    assert.deepEqual(world.logFacts, []);
    assert.equal(world.loadZone, 'unknown');
    assert.ok((world.documents?.length ?? 0) > 0);
    assert.ok(world.documents?.some((d) => d.id === 'exercise:squats'));
  });
});

describe('coach chat runs the ReAct loop, not a second prompt copy', () => {
  it('routes through runCoachReactLoop and does not call vendor Collections', () => {
    const src = readFileSync(path.join(import.meta.dirname, 'coachChatServer.ts'), 'utf8');
    assert.match(src, /runCoachReactLoop/);
    assert.match(src, /retrieveCoachKnowledge/);
    assert.doesNotMatch(src, /previous_response_id/);
    assert.doesNotMatch(src, /collections/i);
  });
});
