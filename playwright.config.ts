import { defineConfig } from '@playwright/test';

const baseURL = process.env.SMOKE_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  /*
   * Output hygiene — the gap that let 33 dead failures sit in `test-results/` and read
   * as live red.
   *
   * `.last-run.json` was dated 2026-09-26 while source was 2026-09-27, and all 33
   * failures traced to one stale premise: the suite asserts a paywall the product left.
   * A `test-results/` directory full of red is indistinguishable from a genuine
   * regression unless you check its date, and nobody checks a date. Clearing the
   * directory on each run means the only red present is red produced by this run.
   *
   * Safe because Playwright treats these as derived artifacts, not inputs — and it is
   * paired with `preserveOutput` below so a CI failure is still archived.
   */
  preserveOutput: 'failures-only',
  outputDir: 'test-results',
  expect: {
    // Platform-specific baselines — generate on Linux CI, not macOS-local
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
    },
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'mobile-chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
      // Everything except the desktop-only spec, which asserts the opposite
      // surface and would fail at 390 by design.
      testIgnore: /surface-split\.spec\.ts/,
    },
    {
      /*
       * The desktop app is a *different design*, not this one reflowed
       * (src/hooks/useIsCompact.ts). Every other spec here is written for a
       * phone — tab bar, docked console, sheets — so this project runs only
       * the spec that asserts the desktop side of the split.
       *
       * Without it the whole suite ran at 390 and nothing guarded desktop:
       * `.159`–`.161` each shipped desktop changes under a green 34/34 that
       * had never rendered a desktop viewport.
       */
      name: 'desktop-chrome',
      use: {
        browserName: 'chromium',
        viewport: { width: 1440, height: 900 },
      },
      testMatch: /surface-split\.spec\.ts/,
    },
  ],
});
