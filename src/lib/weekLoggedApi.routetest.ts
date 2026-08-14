/**
 * Week-logged API is session-only. Guests must not have a write path.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { weekLoggedBodySchema } from '@/lib/apiSchemas';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('week-logged API contract', () => {
  it('requires a session and never trusts a client user id', () => {
    const route = read('app/api/metrics/week-logged/route.ts');
    assert.match(route, /getUserFromRequest/);
    assert.match(route, /status: 401/);
    assert.doesNotMatch(route, /user_id:\s*parsed/);
    assert.match(route, /user\.id/);
  });

  it('accepts ISO week keys only', () => {
    assert.equal(weekLoggedBodySchema.safeParse({ isoWeek: '2026-W33' }).success, true);
    assert.equal(weekLoggedBodySchema.safeParse({ isoWeek: '2026-08-13' }).success, false);
    assert.equal(weekLoggedBodySchema.safeParse({}).success, false);
  });
});
