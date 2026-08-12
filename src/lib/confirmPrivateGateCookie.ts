/**
 * Client probe — true when the httpOnly gate cookie is present and accepted by proxy.
 * Uses a gated API: proxy returns 403 without a valid `mw_private_access` cookie;
 * any other status means the request cleared the gate (401/503 are route-level).
 */

const GATE_PROBE_PATH = '/api/referral';
const PROBE_TIMEOUT_MS = 4_000;

export async function confirmPrivateGateCookie(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const res = await fetch(GATE_PROBE_PATH, {
      method: 'GET',
      credentials: 'same-origin',
      cache: 'no-store',
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    return res.status !== 403;
  } catch {
    return false;
  }
}

export { GATE_PROBE_PATH, PROBE_TIMEOUT_MS };
