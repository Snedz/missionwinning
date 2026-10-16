import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { infoStringsFor } from '@/i18n/infoLocales';

describe('refunds copy', () => {
  const en = infoStringsFor('en');
  const copy = [
    en.infoRefundsIntro,
    en.infoRefundsIntroOpenBeta,
    en.infoRefundsSubsBody,
    en.infoRefundsLifetimeBody,
    en.infoRefundsHowBody,
  ].join('\n');

  it('names the live $99 yearly plan and the workout refund', () => {
    assert.match(copy, /Mission Winning Yearly is \$99 per year/);
    assert.match(copy, /Stripe/);
    assert.match(copy, /Complete the program\u2019s workouts and we refund your \$99/);
    assert.match(copy, /The free logger never needs a refund/);
  });

  it('does not name Phantom, USDC, or Super Bundle', () => {
    assert.doesNotMatch(copy, /Phantom|USDC|Super Bundle/i);
    assert.doesNotMatch(copy, /Manage billing/);
    assert.doesNotMatch(copy, /\$19\.99|\$119\.99/);
  });
});
