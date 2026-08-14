/** Referral code alphabet: no I/O/0/1 ambiguity. */
export const REFERRAL_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateReferralCode(randomBytes?: () => number): string {
  const rnd =
    randomBytes ??
    (() => {
      const arr = new Uint8Array(1);
      crypto.getRandomValues(arr);
      return arr[0];
    });
  let body = '';
  for (let i = 0; i < 5; i++) {
    body += REFERRAL_ALPHABET[rnd() % REFERRAL_ALPHABET.length];
  }
  return `MW-${body}`;
}

export const REFERRAL_CODE_RE = /^MW-[A-HJ-NP-Z2-9]{5}$/;
