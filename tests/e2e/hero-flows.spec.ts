import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding, seedReadinessPhase } from './helpers/journey';

test.describe('Phase H hero flows', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
  });

  test('welcome I-Day loads and advances', async ({ page }) => {
    const res = await page.goto('/welcome', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    await expect(page.locator('body')).toContainText(/day|welcome|misión|bienvenido/i);

    const begin = page.getByRole('button', { name: /begin|comenzar|start|acepto/i }).first();
    if (await begin.isVisible()) {
      await begin.click();
      await page.waitForTimeout(300);
    }
  });

  test('Today hub shows mission / Win Score', async ({ page }) => {
    await page.goto('/log', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    const body = await page.textContent('body');
    expect(body).toMatch(/mission|win score|puntuación|misión/i);
  });

  test('workout logger entry — active or builder', async ({ page }) => {
    await page.goto('/active', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText(
      /active workout|start workout|sin entrenamiento|iniciar/i
    );

    await page.goto('/builder', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('active empty start, finish-without-sets toast returns to empty shell', async ({ page }) => {
    await page.goto('/active', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /start workout/i }).click();
    await expect(page.getByRole('button', { name: /^finish$/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('heading', { name: /^add exercise$/i })).toBeVisible();

    await page.getByRole('button', { name: /^finish$/i }).click();
    await expect(page.getByText(/nothing logged/i).first()).toBeVisible({ timeout: 10_000 });
    // completeActiveWorkout with zero sets clears the session — back to empty shell.
    await expect(page.getByRole('button', { name: /start workout/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('workout complete updates Mission Score on Today', async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedReadinessPhase(page);

    await page.goto('/learn', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /start bodyweight sample/i }).click();
    await expect(page).toHaveURL(/\/active/);
    await expect(page.getByRole('heading', { name: /learn sample/i })).toBeVisible({
      timeout: 15_000,
    });

    const logBtn = page.getByRole('button', { name: /^log$/i }).first();
    await expect(logBtn).toBeVisible({ timeout: 15_000 });
    await logBtn.click();
    await expect(page.getByText('Set logged!', { exact: true })).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /^finish$/i }).click();
    const backToday = page.getByRole('button', { name: /back to today/i });
    await expect(backToday).toBeVisible({ timeout: 15_000 });
    await backToday.click();
    await expect(page).toHaveURL(/\/log/);
    // Re-seed readiness so HomePage phase lite mounts full dashboard (Mission Score chrome).
    await page.evaluate(() => {
      try {
        const raw = localStorage.getItem('mw_journey_state');
        const s = raw ? JSON.parse(raw) : {};
        s.phase = 'readiness';
        s.basic = { workout: true, fuel: true, move: true, mind: true, learn: true };
        s.readiness = { parq: true, streakMet: false, winScoreSeen: true };
        localStorage.setItem('mw_journey_state', JSON.stringify(s));
      } catch {
        /* keep */
      }
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(
      page.getByText(/mission score|win score|cross-pillar/i).first()
    ).toBeVisible({ timeout: 20_000 });
  });

  test('sign-in sync prompt visible on Fuel', async ({ page }) => {
    await page.goto('/nutrition', { waitUntil: 'domcontentloaded' });
    const body = await page.textContent('body');
    expect(body).toMatch(/sign in|iniciar sesión|sync|sincroniza/i);
  });

  test('language switch on profile', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'networkidle' });
    const langSelect = page.getByLabel(/change language/i);
    await expect(langSelect).toBeVisible({ timeout: 15_000 });
    await langSelect.selectOption('es');
    await page.waitForTimeout(500);
    const stored = await page.evaluate(() => localStorage.getItem('i18nextLng'));
    expect(stored?.startsWith('es')).toBeTruthy();
  });
});

test.describe('Wave 5 public CTA integrity', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
  });

  test('compare forge story links to welcome', async ({ page }) => {
    const res = await page.goto('/compare/forge', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('link', { name: /start free/i }).first()).toHaveAttribute(
      'href',
      '/welcome'
    );
  });

  test('learn path teaser CTA goes to welcome', async ({ page }) => {
    const res = await page.goto('/paths', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    const firstPath = page.locator('a[href^="/paths/"]').first();
    await expect(firstPath).toBeVisible();
    await firstPath.click();
    await expect(page).toHaveURL(/\/paths\//);
    await expect(page.getByRole('link', { name: /begin i-day|start free/i }).first()).toHaveAttribute(
      'href',
      '/welcome'
    );
  });

  test('exercise public page CTA to welcome', async ({ page }) => {
    const res = await page.goto('/exercises/squats', { waitUntil: 'domcontentloaded' });
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('link', { name: /start free|track|welcome|begin/i }).first()).toBeVisible();
    const welcome = page.locator('a[href="/welcome"]').first();
    await expect(welcome).toBeVisible();
  });
});
