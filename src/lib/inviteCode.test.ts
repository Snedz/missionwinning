/**
 * Beta invite codes must not be confusable with referral codes.
 *
 * Both are `MW-` + five characters from the same alphabet, and they redeem
 * down different paths — an invite grants private access, a referral credits
 * an athlete. The only thing keeping them apart is the `B-` segment, so this
 * suite pins the separation in both directions: a referral code must never
 * satisfy `isValidInviteCode`, and an invite code must carry the marker.
 *
 * The alphabet itself is proven in `referralCode.test.ts`; this file imports
 * the same constant rather than restating it, so the two can never drift.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { INVITE_CODE_RE, generateInviteCode, isValidInviteCode } from '@/lib/inviteCode';
import { REFERRAL_ALPHABET, generateReferralCode } from '@/lib/referralCode';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('generateInviteCode', () => {
  it('emits the documented shape for every position in the alphabet', () => {
    for (let i = 0; i < REFERRAL_ALPHABET.length; i++) {
      const code = generateInviteCode(() => i);
      assert.match(code, INVITE_CODE_RE, `index ${i} produced "${code}"`);
      assert.equal(code, `MW-B-${REFERRAL_ALPHABET[i].repeat(5)}`);
    }
  });

  it('consumes one draw per body character, in order', () => {
    const draws = [4, 3, 2, 1, 0];
    let call = 0;
    const code = generateInviteCode(() => draws[call++]);
    assert.equal(call, 5);
    assert.equal(code, `MW-B-${draws.map((d) => REFERRAL_ALPHABET[d]).join('')}`);
  });

  it('wraps an out-of-range draw rather than emitting undefined', () => {
    const code = generateInviteCode(() => REFERRAL_ALPHABET.length + 1);
    assert.match(code, INVITE_CODE_RE);
    assert.ok(!code.includes('undefined'));
  });

  it('produces valid codes with the real random source', () => {
    for (let i = 0; i < 200; i++) {
      assert.ok(isValidInviteCode(generateInviteCode()));
    }
  });
});

describe('isValidInviteCode', () => {
  it('accepts a generated invite code, trimming surrounding whitespace', () => {
    const code = generateInviteCode(() => 0);
    assert.ok(isValidInviteCode(code));
    // Codes arrive pasted from email and chat, so the trim is load-bearing.
    assert.ok(isValidInviteCode(`  ${code}\n`));
  });

  it('never accepts a referral code — the two redeem down different paths', () => {
    for (let i = 0; i < REFERRAL_ALPHABET.length; i++) {
      const referral = generateReferralCode(() => i);
      assert.ok(
        !isValidInviteCode(referral),
        `referral "${referral}" must not redeem as a beta invite`
      );
    }
  });

  it('rejects the usual near-misses', () => {
    const code = generateInviteCode(() => 0);
    assert.ok(!isValidInviteCode(code.toLowerCase()), 'lowercase must not pass');
    assert.ok(!isValidInviteCode(code.slice(0, -1)), 'four body chars must not pass');
    assert.ok(!isValidInviteCode(`${code}A`), 'six body chars must not pass');
    assert.ok(!isValidInviteCode(''), 'empty must not pass');
    assert.ok(!isValidInviteCode('MW-B-IOOO1'), 'ambiguous characters must not pass');
    // An inner space survives `.trim()` and must still be rejected.
    assert.ok(!isValidInviteCode('MW-B- ABCD'), 'an inner space must not pass');
  });
});

describe('default RNG is CSPRNG', () => {
  it('invite, referral, and class codes do not call Math.random', () => {
    for (const file of ['src/lib/inviteCode.ts', 'src/lib/referralCode.ts', 'src/lib/schoolClass.ts']) {
      const src = read(file);
      assert.doesNotMatch(src, /Math\.random/, `${file} still draws from Math.random`);
      assert.match(src, /getRandomValues/, `${file} must use crypto.getRandomValues`);
    }
  });
});
