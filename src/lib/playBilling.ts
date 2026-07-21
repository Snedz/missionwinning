/**
 * Google Play purchase verification + enrollment grant for Super Bundle.
 * Used by /api/mobile/premium/play-purchase.
 *
 * Production: set GOOGLE_PLAY_PACKAGE_NAME + GOOGLE_PLAY_SERVICE_ACCOUNT_JSON
 * (service account with Android Publisher API access, JSON key as string).
 *
 * Dev-only fallback: PLAY_BILLING_DEV_GRANT=true (never in production).
 */
import 'server-only';
import { grantEnrollmentFromWebhook, isDemoPremiumEnabled } from '@/lib/premiumServer';
import { PLAY_PRODUCT_ALLOWLIST } from '@/lib/playBillingProducts';

export { PLAY_PRODUCT_ALLOWLIST } from '@/lib/playBillingProducts';

export type PlayPurchaseInput = {
  userId: string;
  email: string | null;
  packageName: string;
  productId: string;
  purchaseToken: string;
  orderId?: string | null;
};

export type PlayPurchaseResult =
  | { ok: true; premium: true; source: string; duplicate?: boolean }
  | { ok: false; error: string; code: number };

function expectedPackage(): string {
  return (
    process.env.GOOGLE_PLAY_PACKAGE_NAME?.trim() ||
    process.env.ANDROID_APPLICATION_ID?.trim() ||
    'com.missionwinning.app'
  );
}

export function isPlayBillingConfigured(): boolean {
  return Boolean(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON?.trim());
}

function allowDevGrant(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  return process.env.PLAY_BILLING_DEV_GRANT === 'true' || isDemoPremiumEnabled();
}

/**
 * Minimal JWT (RS256) for Google service accounts → access_token.
 */
async function googleAccessTokenFromServiceAccount(saJson: string): Promise<string> {
  const sa = JSON.parse(saJson) as {
    client_email: string;
    private_key: string;
    token_uri?: string;
  };
  if (!sa.client_email || !sa.private_key) {
    throw new Error('Invalid GOOGLE_PLAY_SERVICE_ACCOUNT_JSON');
  }
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: sa.token_uri || 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const enc = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64url')
      .replace(/=+$/, '');
  const unsigned = `${enc(header)}.${enc(claim)}`;
  const crypto = await import('crypto');
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsigned);
  sign.end();
  const sig = sign.sign(sa.private_key).toString('base64url').replace(/=+$/, '');
  const jwt = `${unsigned}.${sig}`;
  const tokenUri = sa.token_uri || 'https://oauth2.googleapis.com/token';
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  });
  const res = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Google token exchange failed: ${res.status} ${t.slice(0, 200)}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error('No access_token from Google');
  return json.access_token;
}

/**
 * Verify subscription or one-time product token with Android Publisher API.
 */
export async function verifyPlayPurchaseWithGoogle(input: {
  packageName: string;
  productId: string;
  purchaseToken: string;
}): Promise<{ valid: boolean; orderId?: string; detail?: string }> {
  const sa = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON?.trim();
  if (!sa) return { valid: false, detail: 'GOOGLE_PLAY_SERVICE_ACCOUNT_JSON not set' };

  const accessToken = await googleAccessTokenFromServiceAccount(sa);
  const pkg = encodeURIComponent(input.packageName);
  const token = encodeURIComponent(input.purchaseToken);
  const product = encodeURIComponent(input.productId);

  // Prefer subscriptionsv2; fall back to products (one-time) then legacy subscriptions
  const urls = [
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${pkg}/purchases/subscriptionsv2/tokens/${token}`,
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${pkg}/purchases/products/${product}/tokens/${token}`,
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${pkg}/purchases/subscriptions/${product}/tokens/${token}`,
  ];

  for (const url of urls) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.status === 404) continue;
    if (!res.ok) {
      const t = await res.text();
      return { valid: false, detail: `Play API ${res.status}: ${t.slice(0, 180)}` };
    }
    const data = (await res.json()) as Record<string, unknown>;
    // subscriptionsv2: subscriptionState; products: purchaseState 0 = purchased
    const subState = data.subscriptionState as string | undefined;
    const purchaseState = data.purchaseState as number | undefined;
    const valid =
      subState === 'SUBSCRIPTION_STATE_ACTIVE' ||
      subState === 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD' ||
      purchaseState === 0 ||
      // legacy: 0 purchased
      data.paymentState === 1 ||
      data.paymentState === 0;
    if (valid || subState || purchaseState !== undefined) {
      return {
        valid: Boolean(valid || subState?.includes('ACTIVE') || purchaseState === 0),
        orderId: (data.latestOrderId || data.orderId || data.obfuscatedExternalAccountId) as
          | string
          | undefined,
        detail: subState || `purchaseState=${purchaseState}`,
      };
    }
  }
  return { valid: false, detail: 'Token not found for subscription or product' };
}

export async function processPlayPurchase(input: PlayPurchaseInput): Promise<PlayPurchaseResult> {
  const productId = input.productId.trim();
  const purchaseToken = input.purchaseToken.trim();
  if (!productId || !purchaseToken) {
    return { ok: false, error: 'productId and purchaseToken required', code: 400 };
  }
  if (!PLAY_PRODUCT_ALLOWLIST.has(productId)) {
    return { ok: false, error: `Unknown productId: ${productId}`, code: 400 };
  }

  const expected = expectedPackage();
  if (input.packageName && input.packageName !== expected && input.packageName !== `${expected}.debug`) {
    // Allow debug suffix package
    if (!input.packageName.startsWith(expected)) {
      return { ok: false, error: `packageName mismatch (expected ${expected})`, code: 400 };
    }
  }

  let verified = false;
  let orderId = input.orderId?.trim() || '';
  let source = 'play_billing';

  if (isPlayBillingConfigured()) {
    try {
      const v = await verifyPlayPurchaseWithGoogle({
        packageName: input.packageName || expected,
        productId,
        purchaseToken,
      });
      if (!v.valid) {
        return { ok: false, error: v.detail || 'Purchase not valid with Google Play', code: 402 };
      }
      verified = true;
      if (v.orderId) orderId = v.orderId;
      source = 'play_billing_verified';
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : 'Play verification failed',
        code: 502,
      };
    }
  } else if (allowDevGrant()) {
    // Dev scaffold only — never production
    verified = true;
    source = 'play_billing_dev';
    if (!orderId) orderId = `dev-${purchaseToken.slice(0, 24)}`;
  } else {
    return {
      ok: false,
      error:
        'Play Billing server verify not configured. Set GOOGLE_PLAY_SERVICE_ACCOUNT_JSON + GOOGLE_PLAY_PACKAGE_NAME.',
      code: 503,
    };
  }

  if (!verified) {
    return { ok: false, error: 'Purchase not verified', code: 402 };
  }

  const externalId = orderId || purchaseToken;
  try {
    const result = await grantEnrollmentFromWebhook({
      user_email: (input.email || `${input.userId}@play.local`).trim().toLowerCase(),
      user_id: input.userId,
      product_id: productId,
      provider: 'play_billing',
      external_id: externalId,
    });
    return {
      ok: true,
      premium: true,
      source,
      duplicate: result.duplicate,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Enrollment grant failed',
      code: 500,
    };
  }
}
