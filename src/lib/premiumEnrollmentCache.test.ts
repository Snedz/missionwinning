import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  __setEnrollmentCacheStoreForTests,
  enrollmentCacheKeyForEmail,
  enrollmentCacheKeyForUser,
  getCachedPremiumFlag,
  invalidatePremiumEnrollmentCache,
  setCachedPremiumFlag,
  type EnrollmentCacheStore,
} from './premiumEnrollmentCache.ts';

function memoryStore(): EnrollmentCacheStore & { map: Map<string, string>; ops: string[] } {
  const map = new Map<string, string>();
  const ops: string[] = [];
  return {
    map,
    ops,
    async get(key) {
      ops.push(`get:${key}`);
      return map.has(key) ? map.get(key)! : null;
    },
    async set(key, value) {
      ops.push(`set:${key}=${value}`);
      map.set(key, value);
    },
    async del(key) {
      ops.push(`del:${key}`);
      map.delete(key);
    },
  };
}

describe('premiumEnrollmentCache', () => {
  afterEach(() => {
    __setEnrollmentCacheStoreForTests(null);
  });

  it('returns null when store is empty miss', async () => {
    const store = memoryStore();
    __setEnrollmentCacheStoreForTests(store);
    const hit = await getCachedPremiumFlag('user-1', 'a@b.com');
    assert.equal(hit, null);
  });

  it('keys are stable for user and normalized email', () => {
    assert.equal(enrollmentCacheKeyForUser('abc'), 'premium:user:abc');
    assert.equal(enrollmentCacheKeyForEmail('Foo@Bar.COM'), 'premium:email:foo@bar.com');
  });

  it('get/set round-trip for user id', async () => {
    const store = memoryStore();
    __setEnrollmentCacheStoreForTests(store);

    assert.equal(await getCachedPremiumFlag('u1', null), null);
    await setCachedPremiumFlag('u1', null, true);
    assert.equal(await getCachedPremiumFlag('u1', null), true);
    await setCachedPremiumFlag('u1', null, false);
    assert.equal(await getCachedPremiumFlag('u1', null), false);
  });

  it('get/set round-trip for email', async () => {
    const store = memoryStore();
    __setEnrollmentCacheStoreForTests(store);

    await setCachedPremiumFlag(null, 'Buyer@Example.com', true);
    assert.equal(await getCachedPremiumFlag(null, 'buyer@example.com'), true);
    assert.ok(store.map.has('premium:email:buyer@example.com'));
  });

  it('invalidate clears user and email keys', async () => {
    const store = memoryStore();
    __setEnrollmentCacheStoreForTests(store);

    await setCachedPremiumFlag('u9', 'x@y.z', false);
    assert.equal(await getCachedPremiumFlag('u9', null), false);

    await invalidatePremiumEnrollmentCache('u9', 'x@y.z');
    assert.equal(await getCachedPremiumFlag('u9', null), null);
    assert.equal(await getCachedPremiumFlag(null, 'x@y.z'), null);
  });
});

describe('premiumEnrollmentCache — miss then hit pattern', () => {
  beforeEach(() => {
    __setEnrollmentCacheStoreForTests(null);
  });

  afterEach(() => {
    __setEnrollmentCacheStoreForTests(null);
  });

  it('second get after set does not need re-query (store hit)', async () => {
    const store = memoryStore();
    __setEnrollmentCacheStoreForTests(store);

    let dbHits = 0;
    async function resolvePremium(userId: string): Promise<boolean> {
      const cached = await getCachedPremiumFlag(userId, null);
      if (cached !== null) return cached;
      dbHits += 1;
      const premium = true;
      await setCachedPremiumFlag(userId, null, premium);
      return premium;
    }

    assert.equal(await resolvePremium('repeat-user'), true);
    assert.equal(await resolvePremium('repeat-user'), true);
    assert.equal(dbHits, 1);
  });
});
