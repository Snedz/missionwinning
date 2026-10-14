import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';
import { startEmptyActiveWorkout, logSetButton } from './helpers/active';

/**
 * The device that is not saving says so, on the screen where you are logging.
 *
 * `safeStorage` has reported failures to the UI for as long as it has existed, and
 * the copy has existed just as long — "This device is out of storage space…", "this
 * browser won't let us save to the device — private browsing does this. Your session
 * works, but it won't be here next time." Both were rendered by `SyncStatusRow`, and
 * `SyncStatusRow` is mounted on exactly one page: `/account`.
 *
 * That is the wrong page. `/account` is not where a session is lost. An athlete fills
 * a disk, or opens the app in Safari private browsing, and logs a whole workout on
 * Train. `safeStorage`'s memory fallback keeps the tab alive, so every tap reads as
 * landed; on reload the session is gone. The one warning that would have prevented it
 * was on a page they had to go looking for, afterwards.
 *
 * ## Why the failure is installed mid-session, not before it
 *
 * The obvious version of this test breaks `localStorage` and then navigates. That
 * cannot work: seeding and onboarding are themselves stored there, so the athlete
 * never reaches Train at all, and the test fails on a missing Log set button —
 * a failure that looks like the feature is broken rather than a setup that was wrong.
 *
 * Breaking the disk *mid-session* is also the real sequence. The athlete is logging;
 * the device fills; the writes start failing. So the session is loaded and Train is
 * on screen before storage starts refusing, which is exactly when the warning is
 * worth having.
 *
 * This test also asserts the notice is **absent** when storage is healthy. That half
 * is not padding: a banner that is always on is a banner that stops being read, and
 * the first draft would have passed if the notice were rendered unconditionally.
 */
test.describe('Storage failure is visible where you log @gate', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
  });

  test('a device that stops saving says so while you are logging', async ({ page }) => {
    await startEmptyActiveWorkout(page);

    // Reads keep working, so the loaded session survives; writes start failing.
    // Quota rather than denial: a full disk mid-workout is the common case, and it
    // exercises the listener path instead of the `isPersistent()` check on mount.
    await page.evaluate(() => {
      const real = window.localStorage;
      const failing = {
        getItem: (k: string) => real.getItem(k),
        removeItem: (k: string) => {
          throw new DOMException('quota', 'QuotaExceededError');
        },
        clear: () => {
          throw new DOMException('quota', 'QuotaExceededError');
        },
        key: (i: number) => real.key(i),
        get length() {
          return real.length;
        },
        setItem: (_k: string, _v: string) => {
          throw new DOMException('quota', 'QuotaExceededError');
        },
      };
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get: () => failing,
      });
    });

    await logSetButton(page).first().click();

    const notice = page.getByTestId('storage-failure-notice');
    await expect(notice).toBeVisible({ timeout: 15_000 });
    await expect(notice).toContainText(/out of storage space/i);
  });

  test('a working device is not nagged', async ({ page }) => {
    await startEmptyActiveWorkout(page);
    await logSetButton(page).first().click();
    await expect(page.getByTestId('storage-failure-notice')).toHaveCount(0);
  });
});