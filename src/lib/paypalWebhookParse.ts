export type PayPalWebhookHeaders = {
  transmissionId: string;
  transmissionTime: string;
  transmissionSig: string;
  certUrl: string;
  authAlgo: string;
};

/** SSRF guard — cert URL must be on PayPal infrastructure. */
export function isPayPalCertUrl(certUrl: string): boolean {
  try {
    const u = new URL(certUrl);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    return host === 'api.paypal.com' || host.endsWith('.paypal.com');
  } catch {
    return false;
  }
}

/** Parse PayPal transmission headers (case-insensitive). */
export function parsePayPalWebhookHeaders(req: Request): PayPalWebhookHeaders | null {
  const transmissionId = req.headers.get('paypal-transmission-id');
  const transmissionTime = req.headers.get('paypal-transmission-time');
  const transmissionSig = req.headers.get('paypal-transmission-sig');
  const certUrl = req.headers.get('paypal-cert-url');
  const authAlgo = req.headers.get('paypal-auth-algo');

  if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
    return null;
  }

  if (!isPayPalCertUrl(certUrl)) return null;

  return { transmissionId, transmissionTime, transmissionSig, certUrl, authAlgo };
}
