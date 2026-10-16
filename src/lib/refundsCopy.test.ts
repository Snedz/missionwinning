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
    assert.match(copy, /[Ee]arn back up to \$90/);
    assert.match(copy, /\$50 after 24 workouts/);
    assert.match(copy, /One earn-back per person per paid year/);
    assert.match(copy, /within 14 days of the first charge/);
    assert.match(copy, /The free logger is free forever/);
  });

  it('does not name Phantom, USDC, or Super Bundle', () => {
    assert.doesNotMatch(copy, /Phantom|USDC|Super Bundle/i);
    assert.doesNotMatch(copy, /Manage billing/);
    assert.doesNotMatch(copy, /\$19\.99|\$119\.99/);
  });
});
