import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getSpeechRecognitionCtor,
  heardTranscriptFromResult,
  listenSupport,
  normalizeHeardTranscript,
} from '@/lib/speech/listen';

describe('listenSupport', () => {
  it('is unsupported under Node — no constructor, no fake ready', () => {
    assert.equal(listenSupport(), 'unsupported');
    assert.equal(getSpeechRecognitionCtor(), null);
  });
});

describe('normalizeHeardTranscript', () => {
  it('trims and collapses space so Send matches a typed line', () => {
    assert.equal(normalizeHeardTranscript('  how  should I  squat  '), 'how should I squat');
    assert.equal(normalizeHeardTranscript(null), '');
    assert.equal(normalizeHeardTranscript(''), '');
  });
});

describe('heardTranscriptFromResult', () => {
  it('joins recognition alternatives in order', () => {
    assert.equal(
      heardTranscriptFromResult({
        results: [{ 0: { transcript: 'how is' } }, { 0: { transcript: '  bench  ' } }],
      }),
      'how is bench'
    );
  });

  it('empty or missing results are silence', () => {
    assert.equal(heardTranscriptFromResult(null), '');
    assert.equal(heardTranscriptFromResult({ results: [] }), '');
    assert.equal(heardTranscriptFromResult({ results: [{ 0: { transcript: '  ' } }] }), '');
  });
});
