import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { isBlockedAnalyticsKey, sanitizeAnalyticsProperties } from './analyticsSanitize.ts';

describe('sanitizeAnalyticsProperties', () => {
  it('drops pregnancy and PT flag keys and keeps funnel fields', () => {
    const cleaned = sanitizeAnalyticsProperties({
      adjusted: true,
      source: 'victory',
      pregnancy: true,
      pregnant: false,
      ptFlag: true,
      physicalTherapy: true,
    });
    assert.deepEqual(cleaned, { adjusted: true, source: 'victory' });
  });

  it('recognises the closed flag-name list', () => {
    for (const key of ['pregnancy', 'pregnant', 'pt_flag', 'ptStatus', 'physicalTherapy', 'injuryFlag']) {
      assert.equal(isBlockedAnalyticsKey(key), true, key);
    }
    for (const key of ['adjusted', 'source', 'weekStart', 'pillar']) {
      assert.equal(isBlockedAnalyticsKey(key), false, key);
    }
  });

  it('the client tracker runs properties through the sanitizer', () => {
    const src = readFileSync(path.join(import.meta.dirname, 'analytics.ts'), 'utf8');
    assert.match(src, /sanitizeAnalyticsProperties/);
  });
});
