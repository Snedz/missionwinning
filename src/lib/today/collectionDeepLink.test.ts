import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMoveCollectionParam } from '@/lib/move/filterFlows';
import { parseMindCollectionParam } from '@/lib/mind/filterSessions';

test('parseMoveCollectionParam accepts known ids', () => {
  assert.equal(parseMoveCollectionParam('recover-after-lower'), 'recover-after-lower');
  assert.equal(parseMoveCollectionParam('shoulders'), 'shoulders');
  assert.equal(parseMoveCollectionParam('nope'), 'all');
  assert.equal(parseMoveCollectionParam(null), 'all');
});

test('parseMindCollectionParam accepts known ids', () => {
  assert.equal(parseMindCollectionParam('post-train'), 'post-train');
  assert.equal(parseMindCollectionParam('pre-lift'), 'pre-lift');
  assert.equal(parseMindCollectionParam('bogus'), 'all');
});
