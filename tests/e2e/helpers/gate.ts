import type { APIRequestContext, BrowserContext, Page } from '@playwright/test';

const accessSecret = process.env.SMOKE_ACCESS_SECRET;

/** Unlock private gate via POST /api/private-access (sets httpOnly cookie on context). */
export async function unlockGate(
  page: Page,
  context: BrowserContext,
  baseURL: string
): Promise<boolean> {
  if (!accessSecret) return false;

  const res = await page.request.post(`${baseURL}/api/private-access`, {
    data: { password: accessSecret },
  });
  if (!res.ok()) return false;

  const setCookie = res.headers()['set-cookie'];
  if (!setCookie) return false;

  const match = setCookie.match(/([^=]+)=([^;]+)/);
  if (!match) return false;

  await context.addCookies([
    {
      name: match[1],
      value: match[2],
      domain: new URL(baseURL).hostname,
      path: '/',
      httpOnly: true,
      secure: baseURL.startsWith('https'),
      sameSite: 'Lax',
    },
  ]);
  return true;
}

export function gateRequired(): boolean {
  return !!accessSecret;
}

/** Premium content APIs should reject anonymous callers when Supabase is configured. */
export async function expectPremiumApiBlocked(
  request: APIRequestContext,
  path: string
): Promise<void> {
  const res = await request.get(path);
  if (res.status() === 503) {
    // Supabase not configured in this environment — skip gate assertion.
    return;
  }
  if (res.status() !== 403 && res.status() !== 401) {
    throw new Error(`Expected 401/403 for ${path}, got ${res.status()}`);
  }
}
