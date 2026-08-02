import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';

test.describe('Growth surfaces', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
  });

  test('EmailCaptureBand submit reaches done state', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const email = page.locator('input[type="email"]').first();
    if (!(await email.isVisible().catch(() => false))) {
      test.skip(true, 'No email capture band on landing');
    }
    await email.fill(`wave8-e2e-${Date.now()}@example.com`);
    const submit = page
      .getByRole('button', { name: /join|notify|waitlist|list|subscribe|start/i })
      .first();
    if (await submit.isVisible().catch(() => false)) {
      await submit.click();
    } else {
      await email.press('Enter');
    }
    await expect(page.locator('body')).toContainText(
      /thanks|thank you|you.?re on|list|check|done|got it/i,
      { timeout: 15_000 }
    );
  });

  test('?ref= captures into mw_attribution and does not clobber UTMs', async ({ page }) => {
    await page.goto('/?utm_source=twitter&utm_campaign=wave8', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(300);
    await page.goto('/?ref=MW-TEST1', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    const attr = await page.evaluate(() => {
      try {
        return JSON.parse(localStorage.getItem('mw_attribution') || 'null');
      } catch {
        return null;
      }
    });
    expect(attr).toBeTruthy();
    expect(attr.ref).toBe('MW-TEST1');
    expect(attr.utm_source).toBe('twitter');
    expect(attr.utm_campaign).toBe('wave8');
  });

  /*
   * `.257` — this navigated to `/profile` and landed on the I-Day welcome
   * screen, so it was asserting against onboarding rather than the profile.
   * The received body was *"Welcome — I-Day … Set your path, then log your
   * first session"*.
   *
   * Every other spec that needs a signed-in screen calls `seedLegacyOnboarding`
   * first; this describe block never did, and nothing said so because
   * `e2e:critical` had never run. Seeding is what makes the test about the
   * referral card instead of about the redirect.
   */
  test('profile signed-out shows referral invite card', async ({ page }) => {
    await seedLegacyOnboarding(page);
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });
    expect(
      new URL(page.url()).pathname,
      'still being redirected away from /profile — the seed did not take, and the ' +
        'assertion below would be measuring onboarding again'
    ).toBe('/profile');
    await expect(page.locator('body')).toContainText(
      /invite a friend|invita|code|sign in|iniciar/i
    );
  });
});
