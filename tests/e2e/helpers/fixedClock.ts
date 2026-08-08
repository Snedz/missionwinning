/**
 * A clock pinned to a chosen hour **of the day the fixtures were seeded**.
 *
 * `.211` — three cases in `first-90.spec.ts` hardcoded `2026-07-30` while
 * `seedEveningReview` writes its check-in under the **real** current date. They
 * passed all evening and failed the moment the clock rolled past midnight,
 * because the day-review card looked for a day the fixture had not seeded and
 * `composeDayReview` correctly returned null.
 *
 * A test with a date literal in it is a test with an expiry date. Deriving the
 * day from the same clock the fixtures use is what makes "at 19:00" mean the
 * evening *of the seeded day* rather than of one particular Thursday.
 *
 * `.612` moved this out of `first-90.spec.ts` because a second spec needs it,
 * and two copies of a clock rule is how the two drift apart.
 */
export function fixedTimeAt(hour: number): Date {
  const d = new Date();
  d.setHours(hour, 30, 0, 0);
  return d;
}

/**
 * An hour at which Today's block budget is not contended, so a block that spills
 * on a dense evening stays above the fold.
 *
 * Today admits `day-review` only from `DAY_REVIEW_START_HOUR` (18:00) and
 * `week-recap` whenever the week has activity **or it is the week-end**. Both
 * outrank `dashboard` (priority 32 against 15 and 30) under
 * `TODAY_MAX_TOP_LEVEL_BLOCKS = 6`, which is deliberate — Kaizen K1 (`.294`)
 * demoted the Mission Score so that *what to do* beats *how you did* on the
 * densest evening. A test that wants to read the score band therefore has to say
 * which hour it is asking about, or it is really asking "what time is it now".
 */
export const UNCONTENDED_HOUR = 9;
