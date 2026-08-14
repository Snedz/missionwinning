/**
 * Whether the private-gate waitlist may take an email address, given `/api/geo`.
 *
 * The gate is the only public capture point while `PRIVATE_MODE` is on, and it
 * was asking every visitor for an address — including the territories
 * {@link ./supportedRegions.ts} hard-blocks at signup and checkout. Taking a
 * launch email we can never act on is not a small dishonesty: it is the one
 * promise ("we'll email you the moment doors open") we would be certain to break.
 *
 * Three stances, because "blocked" is two different facts:
 * - `refuse`  — a named excluded territory. No capture; say which list and why.
 * - `notice`  — Cloudflare could not confirm a country (XX / Tor / some VPNs).
 *               Keep the form: an unconfirmed connection is not an exclusion.
 * - `capture` — supported, or we simply do not know (fail-open).
 *
 * Fail-open is deliberate in both directions of doubt: a supported athlete must
 * never be told they are excluded because a fetch failed or a payload changed.
 */
import {
  TERRITORY_BLOCK_MESSAGES,
  type TerritoryBlockReason,
} from '@/lib/legal/supportedRegions';

export type WaitlistTerritoryStance = 'capture' | 'notice' | 'refuse';

export type WaitlistTerritory = {
  stance: WaitlistTerritoryStance;
  /** Present for `notice` and `refuse` — the policy sentence to show verbatim. */
  message?: string;
  reason?: TerritoryBlockReason;
};

const NAMED_EXCLUSIONS: readonly TerritoryBlockReason[] = [
  'europe',
  'oic',
  'canada',
  'ukraine',
];

function isTerritoryBlockReason(value: unknown): value is TerritoryBlockReason {
  return typeof value === 'string' && value in TERRITORY_BLOCK_MESSAGES;
}

/** Interpret a `/api/geo` body. Anything unrecognised means "capture". */
export function waitlistTerritoryFromGeo(payload: unknown): WaitlistTerritory {
  if (payload == null || typeof payload !== 'object') return { stance: 'capture' };

  const body = payload as Record<string, unknown>;
  if (body.blocked !== true) return { stance: 'capture' };

  const reason = isTerritoryBlockReason(body.blockReason)
    ? body.blockReason
    : 'unknown_edge';

  /*
   * The server's own sentence wins when it sends one, so the policy text has a
   * single home; the local table is the floor for an older or trimmed payload.
   */
  const message =
    typeof body.blockMessage === 'string' && body.blockMessage.trim()
      ? body.blockMessage.trim()
      : TERRITORY_BLOCK_MESSAGES[reason];

  return {
    stance: NAMED_EXCLUSIONS.includes(reason) ? 'refuse' : 'notice',
    message,
    reason,
  };
}
