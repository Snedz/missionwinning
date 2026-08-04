import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildCoachChatRequestContext,
  classifyCoachChatStreamChunk,
  coachChatCopyForStatus,
} from '@/lib/coach/coachChatClient';

describe('coachChatCopyForStatus', () => {
  it('maps known HTTP statuses to copy keys', () => {
    assert.equal(coachChatCopyForStatus(429).key, 'coachChatRateLimited');
    assert.equal(coachChatCopyForStatus(401).key, 'coachChatUnauthorized');
    assert.equal(coachChatCopyForStatus(402).key, 'coachChatPremium');
    assert.equal(coachChatCopyForStatus(503).key, 'coachChatOffline');
    assert.equal(coachChatCopyForStatus(503).markOffline, true);
    assert.equal(coachChatCopyForStatus(500).key, 'coachChatError');
  });
});

describe('classifyCoachChatStreamChunk', () => {
  it('classifies offline, quota, generic, and plain text', () => {
    assert.equal(classifyCoachChatStreamChunk('hello'), null);
    assert.equal(
      classifyCoachChatStreamChunk('x[[error:coach_offline]]y')?.kind,
      'offline'
    );
    assert.equal(
      classifyCoachChatStreamChunk('[[error:coach_quota]]')?.kind,
      'quota'
    );
    assert.equal(classifyCoachChatStreamChunk('[[error:other]]')?.kind, 'generic');
    assert.equal(classifyCoachChatStreamChunk('[[error:coach_quota]]')?.copy.markOffline, true);
  });
});

describe('buildCoachChatRequestContext', () => {
  it('caps exercises at 12 and resolves names', () => {
    const ctx = buildCoachChatRequestContext({
      readiness: 70,
      strain: 40,
      recovery: 60,
      exerciseId: 'bench',
      todaySession: {
        name: 'Push',
        kind: 'strength',
        estMinutes: 45,
        exercises: Array.from({ length: 15 }, (_, i) => ({ exerciseId: `ex-${i}` })),
      },
      resolveExerciseName: (id) => `Name-${id}`,
    });
    assert.equal(ctx.trainDays14, 0);
    assert.equal(ctx.exerciseId, 'bench');
    assert.equal(ctx.todaySession?.exercises.length, 12);
    assert.equal(ctx.todaySession?.exercises[0]?.name, 'Name-ex-0');
  });

  it('omits todaySession when absent', () => {
    const ctx = buildCoachChatRequestContext({
      readiness: 1,
      strain: 2,
      recovery: 3,
      resolveExerciseName: (id) => id,
    });
    assert.equal(ctx.todaySession, undefined);
  });
});

describe('CoachChatPanel wires coachChatClient (.445)', () => {
  it('uses copy/classifier/context helpers rather than inlining maps', () => {
    const panel = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'coach', 'CoachChatPanel.tsx'),
      'utf8'
    );
    assert.match(panel, /coachChatCopyForStatus/);
    assert.match(panel, /classifyCoachChatStreamChunk/);
    assert.match(panel, /buildCoachChatRequestContext/);
    assert.doesNotMatch(
      panel,
      /status === 429/,
      'HTTP status → copy must stay inside coachChatCopyForStatus'
    );
    assert.doesNotMatch(
      panel,
      /\[\[error:coach_quota\]\]/,
      'stream error tags must stay inside classifyCoachChatStreamChunk'
    );
  });
});
