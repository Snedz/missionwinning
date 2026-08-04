import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildCoachChatRequestContext,
  classifyCoachChatStreamChunk,
  coachChatCopyForStatus,
  isCoachChatAbortError,
  readCoachChatStream,
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
    assert.match(panel, /buildCoachChatRequestContext/);
    assert.match(panel, /readCoachChatStream/);
    assert.match(panel, /isCoachChatAbortError/);
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
    assert.doesNotMatch(
      panel,
      /getReader\(\)/,
      'stream read loop lives in readCoachChatStream'
    );
    assert.doesNotMatch(
      panel,
      /err\.name === 'AbortError'/,
      'abort detection lives in isCoachChatAbortError'
    );
  });
});

describe('readCoachChatStream', () => {
  it('accumulates text and reports stream errors / empty', async () => {
    const chunks = ['Hello ', 'coach'];
    let i = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (i < chunks.length) {
          controller.enqueue(new TextEncoder().encode(chunks[i++]));
          return;
        }
        controller.close();
      },
    });
    const partials: string[] = [];
    const result = await readCoachChatStream(stream, (t) => partials.push(t));
    assert.equal(result.kind, 'ok');
    if (result.kind === 'ok') assert.equal(result.text, 'Hello coach');
    assert.deepEqual(partials, ['Hello ', 'Hello coach']);

    const errStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('[[error:coach_quota]]'));
        controller.close();
      },
    });
    const err = await readCoachChatStream(errStream, () => {});
    assert.equal(err.kind, 'stream_error');
    if (err.kind === 'stream_error') assert.equal(err.error.kind, 'quota');

    const emptyStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('   '));
        controller.close();
      },
    });
    const empty = await readCoachChatStream(emptyStream, () => {});
    assert.equal(empty.kind, 'empty');
  });
});

describe('isCoachChatAbortError', () => {
  it('detects AbortError only', () => {
    const abort = new Error('aborted');
    abort.name = 'AbortError';
    assert.equal(isCoachChatAbortError(abort), true);
    assert.equal(isCoachChatAbortError(new Error('nope')), false);
    assert.equal(isCoachChatAbortError('x'), false);
  });
});
