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
    baseURL,
    actionTimeout: 8_000,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobile-chromium',
      testIgnore: '**/desktop.spec.ts',
      use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } },
    },
    {
      name: 'desktop-chromium',
      testMatch: ['**/desktop.spec.ts', '**/landing.spec.ts'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    command: `npm run start -w apps/web -- --hostname 127.0.0.1 --port ${port}`,
    url: `${baseURL}/log`,
    env: {
      PRIVATE_MODE: process.env.PRIVATE_MODE ?? 'false',
      MW_TRUST_PROXY_HEADERS: '1',
      GROQ_API_KEY: '', COACH_LLM_API_KEY: '', OPENROUTER_API_KEY: '',
    },
    reuseExistingServer: !process.env.CI,
  },
});
