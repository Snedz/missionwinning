/**
 * The sentence a blocked visitor needs, in a module light enough to import.
 *
 * Split out of [supportedRegions.ts](./supportedRegions.ts) at `.769` for the
 * reason `.766` split `privateGateClientFlag.ts`: that module carries three ISO
 * arrays and ~100 country codes, and pulling it into `SignInPanel` — which sits on
 * the Today path — put all of it in `/log`'s initial JS. Measured at +2.8 KB
 * gzipped on a route already over its cap, for one sentence.
 *
 * `supportedRegions.ts` re-exports this, so the constant still has one home and
 * existing imports keep working.
 */

/**
 * What is still true for a visitor we cannot serve — the sentence that turns a
 * dead end into a limit.
 *
 * Shard 1 (US/LatAm, ops #16): the geo-block "reads as a broken page, not an
 * explained limit". The block itself is founder policy and unchanged; what was
 * missing is that the thing most people came for still works. `/regions` has
 * always said so — in its fifth section, after four lists of ISO codes.
 */
export const TERRITORY_STILL_WORKS =
  'The free workout logger still works here: it runs on this device, needs no account, and your data stays yours to export.';
