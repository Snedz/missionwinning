import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding, seedReadinessPhase } from './helpers/journey';
import { startEmptyActiveWorkout } from './helpers/active';

test.describe('Phase H hero flows @gate', () => {
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

  test('I-Day skip lands in active session (W1)', async ({ page }) => {
    await page.goto('/welcome', { waitUntil: 'domcontentloaded' });
    const begin = page.getByRole('button', { name: /^begin$/i }).first();
    await expect(begin).toBeVisible({ timeout: 10_000 });
    await begin.click();
    // Profile → Continue
    const cont = page.getByRole('button', { name: /continue|continuar/i }).first();
    await expect(cont).toBeVisible({ timeout: 10_000 });
    await cont.click();
    // Sign-in skip → /active with session
    const skip = page.getByRole('button', { name: /skip|omitir|first session/i }).first();
    await expect(skip).toBeVisible({ timeout: 10_000 });
    await skip.click();
    await expect(page).toHaveURL(/\/active/, { timeout: 15_000 });
    // Widened with the console recut in `.153` — see the note in first-90.
    await expect(page.getByRole('button', { name: /^log( set)?$/i }).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test('Today hub shows mission / Win Score', async ({ page }) => {
    await page.goto('/log', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    const body = await page.textContent('body');
    expect(body).toMatch(/mission|win score|puntuación|misión/i);
    // D4 composure: at most one emerald primary CTA on Today.
    await expect(page.locator('.primary-action')).toHaveCount(1);
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
    await startEmptyActiveWorkout(page);
    // The picker is a sheet as of `.156`. What still matters is what this case
    // has always been about: a first exercise is one tap away from an empty
    // session — so assert the trigger is there, then that it opens the picker.
    const addExercise = page.getByRole('button', { name: /^add exercise$/i });
    await expect(addExercise).toBeVisible();
    await addExercise.click();
    await expect(page.getByPlaceholder(/search exercises/i)).toBeVisible();
    await page.keyboard.press('Escape');

    /*
     * `.548` changed this contract deliberately — "empty Finish no longer
     * discards active workout; calm 'Log a set first' toast" — and this case was
     * never updated, so it asserted the pre-`.548` product on both counts: the
     * old copy (`/nothing logged/i`) and the old outcome (session cleared, back
     * to the empty shell). Red ever since, unseen because the hero lane runs in
     * no CI workflow that is currently firing.
     *
     * Note the i18n key kept its old name (`activeNothingLogged`) while its
     * value became "Log a set first", so grepping the key would have agreed with
     * the stale assertion.
     *
     * Asserted now: the toast appears **and the session survives** — losing a
     * session to a mis-tapped Finish is the defect `.548` fixed, so that is the
     * half worth guarding.
     */
    await page.getByRole('button', { name: /finish/i }).first().click();
    await expect(page.getByText(/log a set first/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /^add exercise$/i })).toBeVisible({
      timeout: 10_000,
    });
  });

  test('workout complete updates Mission Score on Today', async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      throw new Error('SMOKE_ACCESS_SECRET required to unlock private gate for Mission Score path');
    }
    await seedReadinessPhase(page);

    // Fail-closed: seed via Active builder (do not soft-skip on Learn sample CTA).
    await startEmptyActiveWorkout(page);

    // One extra tap to open the picker sheet — see `.156`.
    await page.getByRole('button', { name: /^add exercise$/i }).click();

    const search = page.getByPlaceholder(/search exercises/i);
    await expect(search).toBeVisible({ timeout: 10_000 });
    await search.fill('push-ups');
    await page.getByRole('option', { name: /push-ups/i }).first().click();
    await expect(page.getByText(/selected:\s*push-ups/i)).toBeVisible({ timeout: 5_000 });
    await page.getByRole('button', { name: /add selected exercise/i }).click();

    const logBtn = page.getByRole('button', { name: /^log( set)?$/i }).first();
    await expect(logBtn).toBeVisible({ timeout: 15_000 });
    await logBtn.click();
    // Routine set feedback = completed row + rest timer (toast removed in D0).
    await expect(page.getByRole('timer', { name: /rest/i })).toBeVisible({ timeout: 10_000 });

    await page.getByRole('button', { name: /finish/i }).first().click();
    const backToday = page.getByRole('button', { name: /back to today/i });
    await expect(backToday).toBeVisible({ timeout: 15_000 });
    await backToday.click();
    await expect(page).toHaveURL(/\/log/);
    // Full dashboard (Mission Score) needs readiness phase + live basic milestone evidence.
    await seedReadinessPhase(page);
    await page.goto('/log', { waitUntil: 'domcontentloaded' });

    /*
     * Keyed to the visible band, not to the words.
     *
     * This asserted `getByText(/mission score|win score|cross-pillar/i).first()`
     * and was red from `.596` onward — recorded there as "cause known, repair not
     * landed". The cause is the `.first()`: `TodayHealthSection` renders the
     * literal "Cross-pillar Mission Score" inside a `TodaySection`, which is a
     * native `<details>` with `defaultOpen={false}`. A collapsed `<details>`
     * keeps its content in the DOM, so that node resolves, sorts first, and
     * reports `hidden` forever — while the real score band a few hundred pixels
     * above it was visible the whole time. The product was never broken.
     *
     * `.596`'s repair attempt probed `getByRole('group', { name: /today
     * details/i })`, which found nothing: a `<details>` *is* exposed as a group,
     * but it is named by its `<summary>` — here "Health scores" — so the name
     * never existed. Hence a `data-testid` on the band itself, per this file's
     * own precedent of keying off test ids wherever the visible word is
     * something a kaizen pass is expected to change.
     */
    const band = page.getByTestId('today-score-band');
    await expect(band).toBeVisible({ timeout: 20_000 });

    // And the thing the test is actually named for: a real number, not an
    // em-dash placeholder, after a session has been logged.
    await expect(band).toHaveText(/\d/, { timeout: 20_000 });
  });

  test('sign-in sync prompt visible on Fuel', async ({ page }) => {
    await page.goto('/nutrition', { waitUntil: 'domcontentloaded' });
    const body = await page.textContent('body');
    expect(body).toMatch(/sign in|iniciar sesión|sync|sincroniza/i);
  });

  test('language switch on account', async ({ page }) => {
    // ProfilePreferencesCard carries the switcher, and it moved to /account in `.606`.
    await page.goto('/account', { waitUntil: 'networkidle' });
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
    /*
     * `.257` — `:visible`, and the missing filter is the entire bug.
     *
     * The page has three `/welcome` links and the first in DOM order is the
     * desktop nav's, `class="hidden … md:inline"`. Every project in
     * `playwright.config.ts` is mobile-chrome at 375px, so that one is
     * `display: none` and `.first()` selected a link no phone user can see —
     * then asserted it was visible. It failed the first time this spec ran.
     *
     * Filtering rather than indexing also makes the assertion say what it means:
     * an athlete on the page this test is about must have a reachable route to
     * /welcome, not merely a `/welcome` string somewhere in the markup.
     */
    const welcome = page.locator('a[href="/welcome"]:visible').first();
    await expect(welcome).toBeVisible();
  });
});
