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

  it('states payments are not live and names the planned PayPal prices', () => {
    assert.match(copy, /PayPal/);
    assert.match(copy, /\$19\.99/);
    assert.match(copy, /\$119\.99/);
    assert.match(copy, /\$299/);
    assert.match(copy, /not live/);
    assert.match(copy, /The free logger never needs a refund/);
    assert.match(copy, /when paid checkout is live/);
  });

  it('does not name Stripe, Phantom, USDC, or Super Bundle', () => {
    assert.doesNotMatch(copy, /Stripe|Phantom|USDC|Super Bundle/i);
    assert.doesNotMatch(copy, /Manage billing/);
  });
});
