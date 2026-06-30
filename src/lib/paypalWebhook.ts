import 'server-only';
import {
  parsePayPalWebhookHeaders,
  type PayPalWebhookHeaders,
  isPayPalCertUrl,
} from '@/lib/paypalWebhookParse';

export type { PayPalWebhookHeaders };
export { parsePayPalWebhookHeaders, isPayPalCertUrl };

const PAYPAL_SANDBOX = 'https://api-m.sandbox.paypal.com';
const PAYPAL_LIVE = 'https://api-m.paypal.com';

function getPayPalApiBase(): string {
  const custom = process.env.PAYPAL_API_BASE?.replace(/\/$/, '');
  if (custom) return custom;
  return process.env.PAYPAL_ENV === 'live' ? PAYPAL_LIVE : PAYPAL_SANDBOX;
}

async function getPayPalAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    console.error('PayPal OAuth token error:', res.status, await res.text().catch(() => ''));
    return null;
  }

  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

/**
 * Verify webhook via PayPal REST API (POST /v1/notifications/verify-webhook-signature).
 * @see https://developer.paypal.com/api/rest/webhooks/rest/
 */
export async function verifyPayPalWebhookSignature(
  headers: PayPalWebhookHeaders,
  webhookEvent: Record<string, unknown>,
  webhookId: string
): Promise<boolean> {
  const token = await getPayPalAccessToken();
  if (!token) return false;

  const res = await fetch(`${getPayPalApiBase()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transmission_id: headers.transmissionId,
      transmission_time: headers.transmissionTime,
      cert_url: headers.certUrl,
      auth_algo: headers.authAlgo,
      transmission_sig: headers.transmissionSig,
      webhook_id: webhookId,
      webhook_event: webhookEvent,
    }),
  });

  if (!res.ok) {
    console.error('PayPal verify-webhook-signature error:', res.status, await res.text().catch(() => ''));
    return false;
  }

  const data = (await res.json()) as { verification_status?: string };
  return data.verification_status === 'SUCCESS';
}

export function isPayPalWebhookConfigured(): boolean {
  return Boolean(
    process.env.PAYPAL_WEBHOOK_ID &&
      process.env.PAYPAL_CLIENT_ID &&
      process.env.PAYPAL_CLIENT_SECRET
  );
}
