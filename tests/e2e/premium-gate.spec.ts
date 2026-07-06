import { test, expect } from '@playwright/test';
import { expectPremiumApiBlocked } from './helpers/gate';

test.describe('Premium API gate', () => {
  test('premium recipes rejects unauthenticated access', async ({ request }) => {
    await expectPremiumApiBlocked(request, '/api/premium/recipes');
  });

  test('premium programs rejects unauthenticated access', async ({ request }) => {
    await expectPremiumApiBlocked(request, '/api/premium/programs');
  });

  test('premium status returns free for anonymous session', async ({ request }) => {
    const res = await request.get('/api/premium/status');
    expect(res.ok()).toBeTruthy();
    const data = (await res.json()) as { premium: boolean; source?: string };
    expect(data.premium).toBe(false);
    if (data.source) {
      expect(['anonymous', 'unconfigured', 'free']).toContain(data.source);
    }
  });
});
