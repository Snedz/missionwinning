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

/**
 * Premium content APIs must match whatever entitlement the app itself reports.
 *
 * `.257` — this used to demand 401/403 unconditionally, and the first time it
 * ever ran it failed on all three routes with **200**. That is not a hole. The
 * free beta deliberately unlocks depth: `isPremiumBypassEnabled()` is
 * `isDemoPremiumEnabled() || isFreeBetaPremiumUnlocked()`, and `isFreeBeta()`
 * returns **true when `NEXT_PUBLIC_FREE_BETA` is unset** — which is every
 * environment that has not opted out. So the assertion had been describing a
 * product the repo stopped shipping, and nothing noticed because `e2e:critical`
 * had never executed (`ci.yml` runs `e2e:gate`, and CI extended was
 * billing-blocked).
 *
 * Skipping under free beta would be the easy answer and the wrong one: the
 * paywall would then be untested in the state it eventually ships in, and the
 * day the beta ends nothing would tell anyone the gate had not come back.
 *
 * So the expectation is derived from `/api/premium/status`, which reports its
 * own reason (`{"premium":true,"source":"free_beta"}`). Unlocked is asserted to
 * be unlocked; locked is asserted to be locked. The test enforces the contract
 * in both states and flips by itself when the flag does.
 */
export async function expectPremiumApiBlocked(
  request: APIRequestContext,
  path: string
): Promise<void> {
  const res = await request.get(path);
  if (res.status() === 503) {
    // Supabase not configured in this environment — skip gate assertion.
    return;
  }

  if (await premiumIsDeliberatelyOpen(request)) {
    if (res.status() !== 200) {
      throw new Error(
        `Premium is unlocked (free beta), so ${path} should serve its payload — got ${res.status()}. ` +
          `A beta tester would be shown a paywall the product says is off.`
      );
    }
    return;
  }

  if (res.status() !== 403 && res.status() !== 401) {
    throw new Error(`Expected 401/403 for ${path}, got ${res.status()}`);
  }
}

/**
 * Whether the running app says depth is unlocked for everyone, and why.
 *
 * Read from the app rather than from `process.env`: `NEXT_PUBLIC_FREE_BETA` is
 * inlined at build time, so a test process reading it is reading its own
 * environment and not the server's. Those are the same on CI and are not the
 * same when a spec is pointed at a deployment via `SMOKE_BASE_URL`.
 */
export async function premiumIsDeliberatelyOpen(request: APIRequestContext): Promise<boolean> {
  const res = await request.get('/api/premium/status');
  if (!res.ok()) return false;
  const data = (await res.json()) as { premium?: boolean; source?: string };
  return data.premium === true && (data.source === 'free_beta' || data.source === 'demo');
}
