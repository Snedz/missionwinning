/** Pure guards for crypto confirm — no server-only imports (unit-testable). */

/** Signature shape before DB/RPC. */
export function isPlausibleTxSignature(signature: string): boolean {
  const s = signature.trim();
  return s.length >= 32;
}
