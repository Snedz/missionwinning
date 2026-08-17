import { test } from 'node:test';
import assert from 'node:assert/strict';
import { todayHighlightsSentence } from './highlightsSentence.ts';

test('no logs is an honest empty, not a wallpaper sentence', () => {
  assert.equal(
    todayHighlightsSentence({ trainedToday: false, lastSessionName: null }),
    null
  );
});

test('a finished today session is one sentence', () => {
  const hit = todayHighlightsSentence({
    trainedToday: true,
    lastSessionName: 'Just Go — Chest',
  });
  assert.equal(hit?.key, 'todayHighlightsTrained');
});

test('a last session waiting is one sentence', () => {
  const hit = todayHighlightsSentence({
    trainedToday: false,
    lastSessionName: 'Just Go — Chest',
  });
  assert.equal(hit?.key, 'todayHighlightsLast');
  assert.equal(hit?.sessionName, 'Just Go — Chest');
});
