import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { otpSlots, sanitizeOtpDigits } from './otpInput';

describe('sanitizeOtpDigits', () => {
  it('strips spaces and keeps digits', () => {
    assert.equal(sanitizeOtpDigits('12 34 56', 6), '123456');
  });

  it('strips dashes and letters', () => {
    assert.equal(sanitizeOtpDigits('12-34-ab56', 6), '123456');
  });

  it('truncates overflow', () => {
    assert.equal(sanitizeOtpDigits('1234567890', 6), '123456');
  });

  it('returns empty for empty / non-digit input', () => {
    assert.equal(sanitizeOtpDigits('', 6), '');
    assert.equal(sanitizeOtpDigits('abc ---', 6), '');
  });

  it('respects length 0', () => {
    assert.equal(sanitizeOtpDigits('123', 0), '');
  });
});

describe('otpSlots', () => {
  it('pads to length with empty strings', () => {
    assert.deepEqual(otpSlots('12', 6), ['1', '2', '', '', '', '']);
  });

  it('fills all slots when complete', () => {
    assert.deepEqual(otpSlots('123456', 6), ['1', '2', '3', '4', '5', '6']);
  });

  it('sanitizes before splitting', () => {
    assert.deepEqual(otpSlots('1 2 3', 4), ['1', '2', '3', '']);
  });
});
