import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e', fullyParallel: false, workers: 1, reporter: 'list', timeout: 60_000,
  use: { baseURL: process.env.SMOKE_BASE_URL || 'http://localhost:3000', trace: 'off', screenshot: 'off' },
  projects: [{ name: 'mobile-chrome', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
    launchOptions: { executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' } } }],
});
