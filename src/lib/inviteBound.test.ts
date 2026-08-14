import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { inviteRedeemed, sessionMintEligible } from './inviteBound.ts';

describe('inviteRedeemed', () => {
  it('is false for a bare account', () => {
    assert.equal(inviteRedeemed(null), false);
    assert.equal(inviteRedeemed(undefined), false);
    assert.equal(inviteRedeemed(''), false);
    assert.equal(inviteRedeemed('   '), false);
  });

  it('is true only when invited_via is set', () => {
    assert.equal(inviteRedeemed('MW-B-ABCDE'), true);
  });
});

describe('sessionMintEligible', () => {
  it('mints for any verified user when the gate is off', () => {
    assert.equal(
      sessionMintEligible({ privateModeEnabled: false, inviteRedeemed: false }),
      true
    );
  });

  it('refuses a JWT-only user while the gate is on', () => {
    assert.equal(
      sessionMintEligible({ privateModeEnabled: true, inviteRedeemed: false }),
      false
    );
  });

  it('mints after the invite is bound', () => {
    assert.equal(
      sessionMintEligible({ privateModeEnabled: true, inviteRedeemed: true }),
      true
    );
  });
});
