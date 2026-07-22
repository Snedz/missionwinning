/**
 * Visual regression — baselines must be generated on Linux CI (or docker-local),
 * not macOS, or pixels will not match. Tag: @visual
 *
 * Bootstrap (CI container):
 *   npx playwright test --grep @visual --update-snapshots
 * Then commit snapshots from the artifact.
 */
import { test, expect } from '@playwright/test';

test.describe('visual regression @visual', () => {
  test.beforeEach(async ({ page }) => {
    // Freeze ticker / Reveal animations (honored by index.css prefers-reduced-motion)
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('guide human-performance @visual', async ({ page }) => {
    await page.goto('/guide/human-performance', { waitUntil: 'networkidle' });
    await expect(page).toHaveScreenshot('guide-human-performance.png', {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });

  test('exercise squats @visual', async ({ page }) => {
    await page.goto('/exercises/squats', { waitUntil: 'networkidle' });
    await expect(page).toHaveScreenshot('exercise-squats.png', {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });

  test('home reduced-motion @visual', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // LandingPage defers below-fold sections (JourneyScroll, CoachAdaptDemo, GuideTeaser)
    // behind requestIdleCallback(timeout: 1800ms). Wait for the belowFoldReady state to
    // resolve: JourneyScroll replaces the aria-hidden placeholder with <section id="path">.
    await page.waitForFunction(() => {
      const el = document.getElementById('path');
      return el !== null && !el.hasAttribute('aria-hidden');
    });
    await expect(page).toHaveScreenshot('home-reduced.png', {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });

  test('bundle reduced-motion @visual', async ({ page }) => {
    await page.goto('/bundle', { waitUntil: 'networkidle' });
    await expect(page).toHaveScreenshot('bundle-reduced.png', {
      maxDiffPixelRatio: 0.02,
      fullPage: true,
    });
  });
});
