/** Beta invite codes: MW-B- + 5 chars (same alphabet as referral — no I/O/0/1). */
import { REFERRAL_ALPHABET } from '@/lib/referralCode';

export function generateInviteCode(randomBytes?: () => number): string {
  const rnd = randomBytes ?? (() => {
    const arr = new Uint8Array(1);
    crypto.getRandomValues(arr);
    return arr[0];
  });
  let body = '';
  for (let i = 0; i < 5; i++) {
    body += REFERRAL_ALPHABET[rnd() % REFERRAL_ALPHABET.length];
  }
  return `MW-B-${body}`;
}

export const INVITE_CODE_RE = /^MW-B-[A-HJ-NP-Z2-9]{5}$/;

export function isValidInviteCode(code: string): boolean {
  return INVITE_CODE_RE.test(code.trim());
}
