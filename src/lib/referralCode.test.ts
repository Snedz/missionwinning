/**
 * The alphabet is the whole point of this module.
 *
 * A referral code is read off a phone screen and typed into another one, often
 * by someone who did not choose the font. `I`/`l`/`1` and `O`/`0` are the pairs
 * that fail that trip, so the alphabet excludes them — and that exclusion is a
 * *claim in a comment* with nothing enforcing it. Someone "tidying" the constant
 * back to `A-Z0-9` would break every hand-typed redemption and no test would
 * notice, because generation and validation would still agree with each other.
 *
 * So the ambiguity rule is asserted directly, and the generator is checked
 * against the regex the redeem path actually uses rather than against itself.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  REFERRAL_ALPHABET,
  REFERRAL_CODE_RE,
  generateReferralCode,
} from '@/lib/referralCode';

/** The characters this alphabet exists to avoid. */
const AMBIGUOUS = ['I', 'O', '0', '1'];

describe('REFERRAL_ALPHABET', () => {
  it('excludes every look-alike character', () => {
    for (const ch of AMBIGUOUS) {
      assert.ok(
        !REFERRAL_ALPHABET.includes(ch),
        `"${ch}" is ambiguous when typed from a screen and must not be in the alphabet`
      );
    }
  });

  it('has no duplicates, so every symbol is equally likely', () => {
    assert.equal(new Set(REFERRAL_ALPHABET).size, REFERRAL_ALPHABET.length);
  });

  it('is large enough for the code space to be worth having', () => {
    assert.ok(REFERRAL_ALPHABET.length > 20, `alphabet is only ${REFERRAL_ALPHABET.length} long`);
  });
});

describe('generateReferralCode', () => {
  it('emits the documented shape for every position in the alphabet', () => {
    // Sweep the whole alphabet rather than sampling: a symbol the regex rejects
    // would otherwise only surface for the unlucky user who was dealt it.
    for (let i = 0; i < REFERRAL_ALPHABET.length; i++) {
      const code = generateReferralCode(() => i);
      assert.match(code, REFERRAL_CODE_RE, `index ${i} produced "${code}"`);
      assert.equal(code, `MW-${REFERRAL_ALPHABET[i].repeat(5)}`);
    }
  });

  it('consumes one random draw per body character, in order', () => {
    const draws = [0, 1, 2, 3, 4];
    let call = 0;
    const code = generateReferralCode(() => draws[call++]);
    assert.equal(call, 5, 'the body is five characters, so five draws');
    assert.equal(
      code,
      `MW-${draws.map((d) => REFERRAL_ALPHABET[d]).join('')}`,
      'draws must map to positions in order, not be reordered or reused'
    );
  });

  it('wraps a draw beyond the alphabet instead of emitting undefined', () => {
    // `rnd() % length` is the guard; without it an out-of-range source yields
    // `undefined` and the code becomes the string "MW-undefined…".
    const code = generateReferralCode(() => REFERRAL_ALPHABET.length);
    assert.match(code, REFERRAL_CODE_RE);
    assert.equal(code, `MW-${REFERRAL_ALPHABET[0].repeat(5)}`);
  });

  it('produces regex-valid codes with the real random source', () => {
    for (let i = 0; i < 200; i++) {
      assert.match(generateReferralCode(), REFERRAL_CODE_RE);
    }
  });
});

describe('REFERRAL_CODE_RE', () => {
  it('rejects the near-misses a hand-typed code actually produces', () => {
    const good = generateReferralCode(() => 0);
    assert.match(good, REFERRAL_CODE_RE);

    assert.ok(!REFERRAL_CODE_RE.test(good.toLowerCase()), 'lowercase must not pass');
    assert.ok(!REFERRAL_CODE_RE.test(good.slice(0, -1)), 'four body chars must not pass');
    assert.ok(!REFERRAL_CODE_RE.test(`${good}A`), 'six body chars must not pass');
    assert.ok(!REFERRAL_CODE_RE.test(good.replace('MW-', '')), 'the prefix is required');
    assert.ok(!REFERRAL_CODE_RE.test(` ${good} `), 'the regex itself does not trim');
    for (const ch of AMBIGUOUS) {
      assert.ok(
        !REFERRAL_CODE_RE.test(`MW-${ch.repeat(5)}`),
        `"${ch}" must not be accepted by the pattern either`
      );
    }
  });
});
