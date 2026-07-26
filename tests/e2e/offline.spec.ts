import { test, expect } from '@playwright/test';
import { gateRequired, unlockGate } from './helpers/gate';
import { seedLegacyOnboarding } from './helpers/journey';

/**
 * "Train anywhere" is the core promise — this spec is the only automated proof
 * that the logger survives losing the network mid-session.
 *
 * Requires a build with the service worker compiled (PRIVATE_MODE=false), which
 * is how CI builds. Against a private-mode build the SW is absent by design
 * (next.config.js `pwaDisabled`), so the offline assertions skip rather than fail.
 */
test.describe('Offline logging @gate', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    if (!baseURL) throw new Error('baseURL required');
    const ok = await unlockGate(page, context, baseURL);
    if (gateRequired() && !ok) {
      test.skip(true, 'SMOKE_ACCESS_SECRET required to unlock private gate');
    }
    await seedLegacyOnboarding(page);
  });

  test('a set logged offline survives, and reconnecting does not lose it', async ({
    page,
    context,
  }) => {
    await page.goto('/log', { waitUntil: 'networkidle' });

    const swReady = await page
      .evaluate(async () => {
        if (!('serviceWorker' in navigator)) return false;
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return false;
        await navigator.serviceWorker.ready;
        return true;
      })
      .catch(() => false);

    if (!swReady) {
      test.skip(true, 'No active service worker — build with PRIVATE_MODE=false to cover offline');
    }

    // Warm the logger route while still online so navigation caching has it.
    await page.goto('/active', { waitUntil: 'networkidle' });

    /**
     * Wait for the warm to actually be *in* a cache before cutting the network.
     *
     * `networkidle` only says the page stopped fetching. Serwist caches the
     * navigation response inside `event.waitUntil`, which outlives the response
     * the page saw — so going offline on the next line raced it, and the
     * follow-up `goto` failed with `net::ERR_ABORTED` roughly one run in three.
     * That is the worst kind of gate failure: real-looking, unreproducible, and
     * it teaches people to re-run instead of read.
     *
     * Tolerant on purpose. If the entry never appears we carry on and let the
     * assertions below speak, rather than trading a flaky failure for a flaky
     * skip.
     */
    await page
      .evaluate(async () => {
        const deadline = Date.now() + 5_000;
        while (Date.now() < deadline) {
          const hit = await caches.match('/active', { ignoreSearch: true, ignoreVary: true });
          if (hit) return true;
          await new Promise((r) => setTimeout(r, 150));
        }
        return false;
      })
      .catch(() => false);

    await context.setOffline(true);

    // Client-side navigation must keep working with no network.
    await page.goto('/log', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/active', { waitUntil: 'domcontentloaded' });
    const start = page.getByRole('button', { name: /start workout/i });
    await expect(start).toBeVisible({ timeout: 15_000 });
    await expect(start).toBeEnabled({ timeout: 15_000 });
    await start.click();

    const skipCheckIn = page.getByRole('button', { name: /not now/i });
    if (await skipCheckIn.isVisible({ timeout: 1_500 }).catch(() => false)) {
      await skipCheckIn.click();
    }

    await expect(page.getByRole('button', { name: /finish/i }).first()).toBeVisible({
      timeout: 15_000,
    });

    // An active session must be persisted locally the moment it exists — not on sync.
    const persistedOffline = await page.evaluate(() => {
      const raw = localStorage.getItem('workout-tracker-storage');
      if (!raw) return false;
      try {
        return !!JSON.parse(raw)?.state?.activeWorkout;
      } catch {
        return false;
      }
    });
    expect(persistedOffline).toBe(true);

    // Reconnecting must not discard local state.
    await context.setOffline(false);
    await page.goto('/active', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /finish/i }).first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test('a hard load with no network never shows a browser error page', async ({
    page,
    context,
  }) => {
    await page.goto('/log', { waitUntil: 'networkidle' });

    const swReady = await page
      .evaluate(async () => {
        if (!('serviceWorker' in navigator)) return false;
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return false;
        await navigator.serviceWorker.ready;
        return true;
      })
      .catch(() => false);

    if (!swReady) {
      test.skip(true, 'No active service worker — build with PRIVATE_MODE=false to cover offline');
    }

    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {
      /* a failed navigation is itself the assertion below */
    });

    // Either the cached app or the /offline fallback — never a dead tab.
    const body = (await page.textContent('body').catch(() => '')) ?? '';
    expect(body.trim().length).toBeGreaterThan(0);

    await context.setOffline(false);
  });
});
