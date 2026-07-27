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
