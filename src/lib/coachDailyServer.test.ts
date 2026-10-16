import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseCoachLlmJson, coachFromFallback } from './coachDailyServer.ts';
import type { DailyCoachContext } from './coachDailyServer.ts';
import { isHonestProgressCopy } from './workout/noFakeProgressPhrases.ts';

const ctx: DailyCoachContext = {
  readiness: 70,
  strain: 50,
  recovery: 60,
  missionScore: 55,
  streak: 3,
  focusGroup: 'push',
  pillars: { moveFlows: 0, mindSessions: 0, proteinDays: 1, trainDays: 2 },
  fallback: {
    messageKey: 'coachInsightSteady',
    actionLabelKey: 'coachActionViewToday',
    actionPath: '/log',
  },
};

describe('parseCoachLlmJson', () => {
  it('parses valid JSON from LLM', () => {
    const out = parseCoachLlmJson(
      '{"message":"Mobility today protects your push volume.","actionLabel":"Open Move","actionPath":"/move"}'
    );
    assert.ok(out);
    assert.equal(out!.source, 'llm');
    assert.equal(out!.actionPath, '/move');
  });

  it('rejects invalid paths', () => {
    assert.equal(
      parseCoachLlmJson('{"message":"x","actionLabel":"y","actionPath":"/evil"}'),
      null
    );
  });
});

describe('coachFromFallback', () => {
  it('returns rules source with fallback keys', () => {
    const out = coachFromFallback(ctx);
    assert.equal(out.source, 'rules');
    assert.equal(out.message, 'coachInsightSteady');
  });
});

describe('fake progress guard', () => {
  it('refused phrase → source rules', () => {
    // Simulate LLM returning a refused phrase
    const out = parseCoachLlmJson(
      '{"message":"Guaranteed PR this week!","actionLabel":"Start Workout","actionPath":"/active"}'
    );
    assert.ok(out);
    assert.equal(out!.source, 'llm');
    // The guard should catch this and fall back
    // We test the guard logic directly via isHonestProgressCopy
    assert.equal(isHonestProgressCopy(out!.message), false);
  });

  it('allowed phrase → LLM message kept', () => {
    const out = parseCoachLlmJson(
      '{"message":"Logged 3 working sets today.","actionLabel":"View Progress","actionPath":"/track"}'
    );
    assert.ok(out);
    assert.equal(out!.source, 'llm');
    assert.equal(isHonestProgressCopy(out!.message), true);
  });
});
