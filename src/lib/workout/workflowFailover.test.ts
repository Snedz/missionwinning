import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { WorkflowEntry } from './workflowRegistry.ts';
import { pickProvider } from './workflowFailover.ts';

const mockEntry: WorkflowEntry = {
  id: 'set-logging',
  label: 'Set Logging',
  requiredTools: ['exercise-db', 'rep-counter'],
  maxLatencyMs: 2000,
  contextTokens: 256,
  qualityThreshold: 0.85,
  fallbackProviders: ['on-device', 'free-lane'],
  lastReviewed: '2025-01-15',
};

const mockEntryNoFallback: WorkflowEntry = {
  ...mockEntry,
  fallbackProviders: [],
};

test('primary up returns primary, usedFallback false', () => {
  const down = new Set<string>(['other-provider']);
  const result = pickProvider(mockEntry, 'primary-provider', down);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.provider, 'primary-provider');
    assert.equal(result.usedFallback, false);
  }
});

test('one lane outage (primary in down) returns first healthy fallback', () => {
  const down = new Set<string>(['primary-provider']);
  const result = pickProvider(mockEntry, 'primary-provider', down);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.provider, 'on-device');
    assert.equal(result.usedFallback, true);
  }
});

test('primary plus every fallback down returns all-down', () => {
  const down = new Set<string>(['primary-provider', 'on-device', 'free-lane']);
  const result = pickProvider(mockEntry, 'primary-provider', down);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, 'all-down');
  }
});

test('entry with empty fallbackProviders and primary down returns no-fallback', () => {
  const down = new Set<string>(['primary-provider']);
  const result = pickProvider(mockEntryNoFallback, 'primary-provider', down);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.reason, 'no-fallback');
  }
});
