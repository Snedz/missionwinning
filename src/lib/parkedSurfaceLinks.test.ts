/**
 * Parked America/school must not be hard-coded as the only escape hatch from
 * live join/back CTAs — use americaHomeOrFallback() so athletes hit a real route.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('JoinClassPage uses americaHomeOrFallback, not bare /america', () => {
  const src = readFileSync(join(root, 'src/page-components/JoinClassPage.tsx'), 'utf8');
  assert.match(src, /americaHomeOrFallback/);
  assert.doesNotMatch(src, /replace\([^)]*['"]\/america['"]/);
});

test('classJoinUrl empty code uses americaHomeOrFallback', () => {
  const src = readFileSync(join(root, 'src/lib/schoolClass.ts'), 'utf8');
  assert.match(src, /americaHomeOrFallback/);
});

test('FitnessTestRunner gates National fitness CTA on track enable', () => {
  const src = readFileSync(join(root, 'src/components/fitness-test/FitnessTestRunner.tsx'), 'utf8');
  assert.match(src, /isAmericaTrackEnabled/);
  assert.doesNotMatch(src, /push\(['"]\/america['"]\)/);
});

test('TeacherClassPage back links use americaHomeOrFallback', () => {
  const src = readFileSync(join(root, 'src/page-components/TeacherClassPage.tsx'), 'utf8');
  assert.match(src, /americaHomeOrFallback/);
  assert.doesNotMatch(src, /href=["']\/america["']/);
});
