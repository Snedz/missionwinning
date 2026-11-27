import { defineConfig, devices } from '@playwright/test';

const port = process.env.V2_LOCAL_SUPABASE_TEST ? 3000 : 4300;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  forbidOnly: !!process.env.CI,
  workers: 1,
  reporter: 'list',
  use: {
    ...devices['Pixel 7'],
    viewport: { width: 390, height: 844 },
    defaultBrowserType: 'chromium',
    baseURL,
    actionTimeout: 8_000,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run start -w apps/web -- --hostname 127.0.0.1 --port ${port}`,
    url: `${baseURL}/log`,
    env: { PRIVATE_MODE: process.env.PRIVATE_MODE ?? 'false' },
    reuseExistingServer: !process.env.CI,
  },
});
