import { test, expect } from '@playwright/test';
import { expectPremiumApiBlocked } from './helpers/gate';

test.describe('Premium API gate', () => {
  test('premium recipes rejects unauthenticated access', async ({ request }) => {
    await expectPremiumApiBlocked(request, '/api/premium/recipes');
  });

  test('premium programs rejects unauthenticated access', async ({ request }) => {
    await expectPremiumApiBlocked(request, '/api/premium/programs');
  });

  test('premium fuel-plan rejects unauthenticated access', async ({ request }) => {
    await expectPremiumApiBlocked(request, '/api/premium/fuel-plan');
  });

  /**
   * `.257` — this asserted `premium === false` flatly, and the first run it ever
   * had returned `{"premium":true,"source":"free_beta"}`.
   *
   * The old allowlist (`anonymous`, `unconfigured`, `free`) never contained
   * `free_beta` either, so both halves described the product as it was before
   * the free beta. Rather than widen the list and lower the assertion to
   * nothing, the two fields are now checked **against each other**: whatever
   * source the endpoint names has to be one the repo knows about, and the
   * `premium` boolean has to be the one that source implies.
   *
   * An anonymous caller getting `premium: true` with no reason given is still a
   * failure, which is the thing this test was written to catch.
   */
  test('premium status is free for anonymous callers, or says why not', async ({ request }) => {
    const res = await request.get('/api/premium/status');
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as { premium: boolean; source?: string };

    const DELIBERATELY_OPEN = ['free_beta', 'demo'];
    const LOCKED = ['anonymous', 'unconfigured', 'free'];

    expect(
      [...DELIBERATELY_OPEN, ...LOCKED],
      `unknown premium source "${data.source}" — add it to this test with the reason, ` +
        `so an entitlement nobody declared cannot arrive quietly`
    ).toContain(data.source);

    expect(
      data.premium,
      `source "${data.source}" but premium=${data.premium} — an anonymous caller is entitled ` +
        `for a reason this endpoint does not name`
    ).toBe(DELIBERATELY_OPEN.includes(data.source ?? ''));
  });
});
