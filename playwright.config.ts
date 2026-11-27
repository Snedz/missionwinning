import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  forbidOnly: !!process.env.CI,
  workers: 1,
  reporter: 'list',
  use: {
    ...devices['Pixel 7'],
    defaultBrowserType: 'chromium',
    baseURL: 'http://127.0.0.1:4300',
    actionTimeout: 8_000,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run start -w apps/web -- --hostname 127.0.0.1 --port 4300',
    url: 'http://127.0.0.1:4300/log',
    reuseExistingServer: !process.env.CI,
  },
});
