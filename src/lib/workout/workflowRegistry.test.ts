import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  WORKFLOW_REGISTRY,
  getWorkflow,
  registryProblems,
  type WorkflowId,
} from './workflowRegistry.ts';

test('registry has exactly 4 ids, unique', () => {
  const ids = WORKFLOW_REGISTRY.map((e) => e.id);
  assert.deepEqual(ids.length, 4);
  assert.deepEqual(new Set(ids).size, 4);
  const expected: WorkflowId[] = ['set-logging', 'rest-timing', 'plan-publish', 'session-review'];
  assert.deepEqual(ids.sort(), expected.sort());
});

test('getWorkflow returns undefined for unknown id', () => {
  assert.equal(getWorkflow('nope'), undefined);
  assert.equal(getWorkflow(''), undefined);
});

test('registryProblems returns empty when entries are clean', () => {
  const today = '2025-04-15'; // within 90 days of all lastReviewed dates
  const problems = registryProblems(WORKFLOW_REGISTRY, today);
  assert.deepEqual(problems, []);
});

test('registryProblems detects missing fallback', () => {
  const entry = {
    id: 'test' as WorkflowId,
    label: 'Test',
    requiredTools: ['tool'] as readonly string[],
    maxLatencyMs: 1000,
    contextTokens: 100,
    qualityThreshold: 0.9,
    fallbackProviders: [] as readonly string[],
    lastReviewed: '2025-04-01',
  };
  const problems = registryProblems([entry], '2025-04-15');
  assert.deepEqual(problems, ['test: missing fallback']);
});

test('registryProblems detects stale entry', () => {
  const entry = {
    id: 'test' as WorkflowId,
    label: 'Test',
    requiredTools: ['tool'] as readonly string[],
    maxLatencyMs: 1000,
    contextTokens: 100,
    qualityThreshold: 0.9,
    fallbackProviders: ['free-lane'] as readonly string[],
    lastReviewed: '2023-04-01', // 2 years earlier
  };
  const problems = registryProblems([entry], '2025-04-15');
  assert.deepEqual(problems, ['test: stale entry']);
});

test('registryProblems detects bad threshold', () => {
  const entry = {
    id: 'test' as WorkflowId,
    label: 'Test',
    requiredTools: ['tool'] as readonly string[],
    maxLatencyMs: 1000,
    contextTokens: 100,
    qualityThreshold: 1.5, // outside 0..1
    fallbackProviders: ['free-lane'] as readonly string[],
    lastReviewed: '2025-04-01',
  };
  const problems = registryProblems([entry], '2025-04-15');
  assert.deepEqual(problems, ['test: bad threshold']);
});
