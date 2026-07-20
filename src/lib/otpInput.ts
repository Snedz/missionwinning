/** Shared OTP digit helpers — one string value, N visual slots. */

export const RESEND_COOLDOWN_MS = 30_000;

/** Strip non-digits (spaces, dashes, etc.) and truncate to `length`. */
export function sanitizeOtpDigits(raw: string, length: number): string {
  if (length <= 0) return '';
  return raw.replace(/\D/g, '').slice(0, length);
}

/** Split a value into `length` slot characters (empty string for unfilled). */
export function otpSlots(value: string, length: number): string[] {
  const digits = sanitizeOtpDigits(value, length);
  return Array.from({ length }, (_, i) => digits[i] ?? '');
}
