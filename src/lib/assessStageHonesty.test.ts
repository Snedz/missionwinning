/**
 * Assessments stage-of-change labels must never paint raw keys.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');
const src = readFileSync(join(root, 'src/page-components/AssessmentsPage.tsx'), 'utf8');
const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

test('stage chips use assessStage*Name keys with English floors', () => {
  assert.match(code, /nameKey:\s*'assessStagePreName'/);
  assert.match(code, /nameDefault:\s*'Pre-Contemplation/);
  assert.doesNotMatch(code, /shortKey:\s*'stagePre'/);
  assert.doesNotMatch(code, /defaultValue:\s*s\.shortKey/);
});

test('stage focus and questions never default to bare keys or empty', () => {
  assert.match(code, /focusDefault:/);
  assert.doesNotMatch(code, /defaultValue:\s*''/);
  assert.doesNotMatch(code, /defaultValue:\s*qKey/);
  assert.match(code, /defaultValue:\s*q\.defaultValue/);
});
