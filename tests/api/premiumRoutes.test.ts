import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { GET as premiumStatus } from '../../app/api/premium/status/route';
import { GET as premiumRecipes } from '../../app/api/premium/recipes/route';
import { GET as premiumPrograms } from '../../app/api/premium/programs/route';

function getRequest(path: string, cookie?: string): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    headers: cookie ? { cookie } : {},
  });
}

function resetEnv() {
  // Explicit false so a NODE_ENV=development test runner can't flip demo mode on.
  process.env.DEMO_PREMIUM = 'false';
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

describe('GET /api/premium/status', () => {
  beforeEach(resetEnv);

  it('reports premium via demo source when DEMO_PREMIUM=true', async () => {
    process.env.DEMO_PREMIUM = 'true';
    const res = await premiumStatus(getRequest('/api/premium/status'));
    const body = await res.json();
    assert.equal(body.premium, true);
    assert.equal(body.source, 'demo');
  });

  it('reports not premium when Supabase is unconfigured', async () => {
    const res = await premiumStatus(getRequest('/api/premium/status'));
    const body = await res.json();
    assert.equal(body.premium, false);
    assert.equal(body.source, 'unconfigured');
  });

  it('reports anonymous when no auth cookie is present', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    const res = await premiumStatus(getRequest('/api/premium/status'));
    const body = await res.json();
    assert.equal(body.premium, false);
    assert.equal(body.source, 'anonymous');
  });
});

describe('GET /api/premium/recipes', () => {
  beforeEach(resetEnv);

  it('serves recipes in demo mode', async () => {
    process.env.DEMO_PREMIUM = 'true';
    const res = await premiumRecipes(getRequest('/api/premium/recipes'));
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.recipes) && body.recipes.length > 0);
  });

  it('returns 503 when Supabase is unconfigured (never leaks content)', async () => {
    const res = await premiumRecipes(getRequest('/api/premium/recipes'));
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.equal(body.recipes, undefined);
  });

  it('returns 403 for anonymous users (no enrollment, no content)', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    const res = await premiumRecipes(getRequest('/api/premium/recipes'));
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.recipes, undefined);
  });
});

describe('GET /api/premium/programs', () => {
  beforeEach(resetEnv);

  it('serves programs in demo mode', async () => {
    process.env.DEMO_PREMIUM = 'true';
    const res = await premiumPrograms(getRequest('/api/premium/programs'));
    assert.equal(res.status, 200);
  });

  it('does not serve programs to anonymous users', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    const res = await premiumPrograms(getRequest('/api/premium/programs'));
    assert.ok(res.status === 401 || res.status === 403);
  });
});
