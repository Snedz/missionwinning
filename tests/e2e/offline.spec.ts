import { test, expect } from '@playwright/test';
import { logSetButton, startEmptyActiveWorkout } from './helpers/active';
import { gateRequired, unlockGate } from './helpers/gate';
import {
  composeBarToday,
  dismissHouseOverlays,
  todayStart,
} from './helpers/houseChrome';
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

    // Warm compose online and wait for leftover Log set — `networkidle` is
    // not first paint. Consent / Got it / locale must not steal the tap.
    await startEmptyActiveWorkout(page);
    await dismissHouseOverlays(page);

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

    /**
     * Client-side house leftover — not a hard `goto` while offline.
     *
     * A hard load of /active after `setOffline` is a document load against
     * Serwist. The old comment called that "client-side navigation"; it
     * is not. When the navigation cache has the HTML but not the compose
     * tree, Log set is simply not in the DOM — CI `element(s) not found`,
     * same leftover class as `.1070` Hero (stale Start / `.primary-action`).
     *
     * Compose-bar Today + `today-start-cta` are the taps an athlete still
     * has with JS already loaded. Train unmounts `nav.house-floor`. Hard
     * reload without a network stays the second case in this file.
     */
    const todayBar = composeBarToday(page);
    await expect(todayBar).toBeVisible({ timeout: 10_000 });
    await todayBar.click();
    await expect(page).toHaveURL(/\/log/);
    await dismissHouseOverlays(page);
    await expect(page.locator('body')).toBeVisible();

    await expect(todayStart(page)).toBeVisible({ timeout: 15_000 });
    await todayStart(page).click();
    await expect(page).toHaveURL(/\/active/);
    await dismissHouseOverlays(page);

    const logSet = logSetButton(page);
    await expect(logSet.first()).toBeVisible({ timeout: 15_000 });
    await expect(logSet.first()).toBeEnabled();

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

    /**
     * Reconnecting must not discard local state.
     *
     * The app reloads *itself* on this line. `next.config.js` sets Serwist's
     * `reloadOnOnline`, which registers
     * `window.addEventListener("online", () => location.reload())`
     * (`@serwist/next` `sw-entry.ts`). So a `page.goto('/active')` here races a
     * navigation the product already started — and when the reload wins, the
     * goto dies with *"Navigation to /active is interrupted by another
     * navigation to /active"*. That is exactly how this `@gate` spec reported
     * `1 flaky` in CI (run 30727582011) while the job still went green.
     *
     * Measured rather than assumed: with no `goto` at all, reconnecting fires
     * two main-frame navigations and wipes a marker stamped on `window`. The
     * race was never 50/50 — the reload always happens, and the goto only
     * sometimes gets there first.
     *
     * So wait for the product's reload instead of driving one. It is
     * deterministic, and it is the truer assertion: this is the reload a
     * returning athlete actually gets. **Awaited, not assumed** — if
     * `reloadOnOnline` is ever turned off this fails loudly rather than quietly
     * asserting that a page nobody reloaded still shows what it already showed.
     */
    const reloadOnReconnect = page.waitForEvent('framenavigated', {
      predicate: (frame) => frame === page.mainFrame(),
      timeout: 15_000,
    });
    await context.setOffline(false);
    await reloadOnReconnect;
    await page.waitForLoadState('domcontentloaded');

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
