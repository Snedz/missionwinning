/**
 * Cloud PFT writes go through /api/pft/results. A signed-in PostgREST insert
 * with an attacker-chosen class_code / overall_tier must not be possible
 * from the client path that used to call supabase.from().insert().
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pftResultDeliveryDone } from '@/lib/pftSync';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('pft client insert path is closed', () => {
  it('pushPftResult does not insert fitness_test_results via the browser client', () => {
    const src = read('src/lib/pftSync.ts');
    assert.doesNotMatch(src, /from\(\s*['"]fitness_test_results['"]\s*\)/);
    assert.doesNotMatch(src, /\.insert\s*\(/);
    assert.match(src, /\/api\/pft\/results/);
    assert.doesNotMatch(src, /overall_tier/);
    assert.doesNotMatch(src, /class_code/);
    assert.doesNotMatch(src, /getJoinedClassCode/);
  });

  it('the migration drops the client INSERT policy and revokes INSERT', () => {
    const sql = read('supabase/migrations/20260817_fitness_test_results_api_only.sql');
    assert.match(sql, /drop policy if exists "Users insert own fitness test results"/);
    assert.match(
      sql,
      /revoke insert on table public\.fitness_test_results from anon,\s*authenticated/i
    );
    assert.doesNotMatch(sql, /create policy "Users insert own fitness test results"/);
  });

  it('the API route is session + Zod + service-role and does not take class_code', () => {
    const route = read('app/api/pft/results/route.ts');
    assert.match(route, /getUserFromRequest/);
    assert.match(route, /rateLimitAsync/);
    assert.match(route, /pftResultBodySchema/);
    assert.match(route, /storePftResult/);
    assert.match(route, /status: 401/);
    assert.doesNotMatch(route, /class_code\s*:/);
    assert.doesNotMatch(route, /overall_tier\s*:/);
    assert.doesNotMatch(route, /parsed\.data\.user/);
  });
});

describe('pftResultDeliveryDone', () => {
  it('retries only transient failures', () => {
    assert.equal(pftResultDeliveryDone(200), true);
    assert.equal(pftResultDeliveryDone(401), true);
    assert.equal(pftResultDeliveryDone(400), true);
    assert.equal(pftResultDeliveryDone(404), true);
    assert.equal(pftResultDeliveryDone(429), false);
    assert.equal(pftResultDeliveryDone(408), false);
    assert.equal(pftResultDeliveryDone(500), false);
  });
});
