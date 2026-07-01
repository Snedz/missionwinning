import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { authorizeSchoolClassUpsert } from '@/lib/schoolClassAuth';

describe('schoolClassAuth', () => {
  const row = (overrides: Partial<{ created_by: string | null; teacher_pin: string | null }> = {}) => ({
    code: 'MWA3K9',
    name: 'PE',
    created_by: 'user-a',
    teacher_pin: '123456',
    ...overrides,
  });

  it('allows new class creation', () => {
    assert.deepEqual(authorizeSchoolClassUpsert(null, 'user-a'), { allowed: true });
  });

  it('allows creator to update own class', () => {
    assert.deepEqual(authorizeSchoolClassUpsert(row(), 'user-a'), { allowed: true });
  });

  it('blocks non-creator without verified pin', () => {
    const result = authorizeSchoolClassUpsert(row(), 'user-b');
    assert.equal(result.allowed, false);
    if (!result.allowed) assert.equal(result.reason, 'forbidden');
  });

  it('allows non-creator re-sync when pin verified', () => {
    assert.deepEqual(authorizeSchoolClassUpsert(row(), 'user-b', { pinVerified: true }), {
      allowed: true,
    });
  });

  it('allows claiming unowned class when pin verified', () => {
    assert.deepEqual(
      authorizeSchoolClassUpsert(row({ created_by: null }), 'user-b', { pinVerified: true }),
      { allowed: true, claimCreator: true }
    );
  });

  it('rejects claiming unowned class without pin verification', () => {
    const result = authorizeSchoolClassUpsert(row({ created_by: null }), 'user-b');
    assert.equal(result.allowed, false);
    if (!result.allowed) assert.equal(result.reason, 'pin_mismatch');
  });
});
