/**
 * Move pillar free-beta mute — shell brief used to pitch "premium later"
 * via locale pack overriding freeBeta defaultValue.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

test('MovePage does not leftover open-beta flow-catalog subtitle', () => {
  const src = readFileSync(join(root, 'src/page-components/MovePage.tsx'), 'utf8');
  assert.doesNotMatch(src, /moveSubtitleBriefOpenBeta/);
  assert.doesNotMatch(src, /isFreeBeta|freeBeta/);
  assert.match(src, /<QuietMoveLogCard\b/);
});

test('moveLocales EN open-beta brief omits Super Bundle and premium pay pitch', () => {
  const src = readFileSync(join(root, 'src/i18n/moveLocales.ts'), 'utf8');
  assert.match(src, /moveSubtitleBriefOpenBeta:/);
  const m = src.match(/moveSubtitleBriefOpenBeta:\s*(?:\n\s*)?'((?:\\'|[^'])*)'/m);
  assert.ok(m, 'missing EN moveSubtitleBriefOpenBeta');
  assert.doesNotMatch(m[1]!, /Super Bundle/i);
  assert.doesNotMatch(m[1]!, /\bpremium\b/i);
  assert.doesNotMatch(m[1]!, /\bBundle\b/);
});
