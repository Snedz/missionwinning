import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseCoachLlmJson, coachFromFallback } from './coachDailyServer';
import type { DailyCoachContext } from './coachDailyServer';

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
