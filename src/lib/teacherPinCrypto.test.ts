import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashTeacherPin,
  isHashedTeacherPin,
  verifyTeacherPinValue,
} from '@/lib/teacherPinCrypto';

describe('teacherPinCrypto', () => {
  it('hashes and verifies pins', async () => {
    const stored = await hashTeacherPin('123456');
    assert.equal(isHashedTeacherPin(stored), true);
    assert.equal(await verifyTeacherPinValue(stored, '123456'), true);
    assert.equal(await verifyTeacherPinValue(stored, '999999'), false);
  });

  it('supports legacy plain pins', async () => {
    assert.equal(isHashedTeacherPin('123456'), false);
    assert.equal(await verifyTeacherPinValue('123456', '123456'), true);
    assert.equal(await verifyTeacherPinValue('123456', '000000'), false);
  });
});
