import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSupabase } from './supabaseLazy.ts';

test('loadSupabase resolves the browser client without a static import', async () => {
  const mod = await loadSupabase();
  assert.equal(typeof mod.getUser, 'function');
  assert.equal(typeof mod.isSupabaseConfigured, 'function');
  assert.equal(typeof mod.supabase, 'object');
});
