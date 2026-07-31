/**
 * "How has my volume been over the last 30 days" → `{ volume, 30 }`.
 *
 * `.225` — rules, offline, deterministic. **The LLM is a garnish, not the
 * mechanism.**
 *
 * That is not a stylistic preference. `COACH_LLM_API_URL`/`_API_KEY`/`_MODEL`
 * are all unset (CONTEXT `## Now`), so the model path is **dark today**: a
 * parser that reached for it would answer nothing at all for every current
 * user, and free-beta already unlocks full depth for everyone, so a 402 was
 * never the obstacle either. Whatever ships has to work with no network, no
 * key and no account — which is also the product's own promise about the
 * logger. If a model is wired up later it resolves the phrasings these rules
 * decline; it does not become the thing that answers.
 *
 * ## It answers or it asks — it never guesses
 *
 * The failure mode worth designing against is a chart of the *wrong* metric.
 * It looks exactly like a right answer, and this repo has now paid for
 * "confident number, wrong quantity" in `.208`, `.217`, `.220` and `.223`. So
 * an unmatched query returns `no-metric` and an ambiguous one returns its
 * **candidates** rather than the first table hit.
 *
 * "Weight" is the ambiguity that matters and it is not a corner case: in a
 * training app it means the number on the scale *or* the weight on the bar,
 * and `TREND_METRICS` has an entry for each. Resolving that by table order
 * would silently answer half of these queries wrong, so it is surfaced.
 */

import { TREND_METRICS, type TrendMetricDef, type TrendMetricId } from './trendMetrics';

export interface TrendQuery {
  metric: TrendMetricId;
  /** Calendar days back from today, inclusive. */
  windowDays: number;
  /** True when the query named no window and the default was applied. */
  windowAssumed: boolean;
}

export type TrendParse =
  | { ok: true; query: TrendQuery }
  | { ok: false; reason: 'empty' }
  | { ok: false; reason: 'no-metric' }
  | { ok: false; reason: 'ambiguous'; candidates: TrendMetricId[] };

/**
 * Asked for "my trend" with no window, 30 days is the answer that shows a trend
 * without pretending to history the athlete may not have. Reported as
 * `windowAssumed` so the UI can say so rather than imply it was requested.
 */
export const DEFAULT_WINDOW_DAYS = 30;

/** Longest window a device-local series is allowed to claim. */
const MAX_WINDOW_DAYS = 365;

function normalise(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^\p{L}\p{N}%\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Whole-phrase containment — "fat" must not match inside "fatigue". */
function mentions(haystack: string, phrase: string): boolean {
  return new RegExp(`(?:^|\\s)${phrase.replace(/\s+/g, '\\s+')}(?:$|\\s)`, 'u').test(haystack);
}

const UNIT_DAYS: Record<string, number> = {
  day: 1,
  days: 1,
  week: 7,
  weeks: 7,
  month: 30,
  months: 30,
  year: 365,
  years: 365,
};

const WORD_NUMBERS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
  seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12,
};

/**
 * The window, or null when the query names none.
 *
 * Handles "last 30 days", "past 6 weeks", "3 months", "this week", "this
 * month" and the spelled-out forms ("a month", "six weeks") — people type
 * those at least as often as digits.
 */
export function parseWindowDays(query: string): number | null {
  const q = normalise(query);

  if (mentions(q, 'this week') || mentions(q, 'the week')) return 7;
  if (mentions(q, 'this month') || mentions(q, 'the month')) return 30;
  if (mentions(q, 'this year')) return 365;
  if (mentions(q, 'all time') || mentions(q, 'ever')) return MAX_WINDOW_DAYS;

  const m = q.match(
    /(?:^|\s)(\d{1,3}|a|an|one|two|three|four|five|six|seven|eight|nine|ten|twelve)\s+(days?|weeks?|months?|years?)(?:$|\s)/u
  );
  if (!m) return null;

  const count = /^\d+$/.test(m[1]) ? Number(m[1]) : WORD_NUMBERS[m[1]];
  if (!count || count < 1) return null;

  return Math.min(MAX_WINDOW_DAYS, count * UNIT_DAYS[m[2]]);
}

/**
 * Every metric the query names.
 *
 * Deliberately flat — no longest-phrase preference, no subsumption pass.
 *
 * The first version had both, to resolve a case like one metric answering to
 * "active" while another answered to "active minutes". Mutation testing showed
 * why that was the wrong shape: removing the ranking changed **no** result,
 * because the situation it resolved cannot arise. Phrases are unique to one
 * metric (`no two metrics answer to the same phrase`) and, within a single
 * metric, *which* of its phrases matched does not change the answer.
 *
 * So the overlap is forbidden in the table instead of arbitrated at runtime —
 * `no phrase of one metric is contained in another metric's` makes a
 * cross-metric collision a failing test rather than a silent ranking decision
 * nobody can see. Unrepresentable beats handled, and it deletes the code that
 * had no test able to exercise it.
 */
function matchMetrics(q: string): TrendMetricDef[] {
  return TREND_METRICS.filter((def) => def.match.some((p) => mentions(q, p)));
}

/** Bare "weight" means the scale or the bar, and the app measures both. */
const AMBIGUOUS_WEIGHT: TrendMetricId[] = ['bodyweight', 'volume'];

export function parseTrendQuery(raw: string): TrendParse {
  const q = normalise(raw ?? '');
  if (!q) return { ok: false, reason: 'empty' };

  const windowDays = parseWindowDays(q);
  const matched = matchMetrics(q);

  if (matched.length === 0) {
    /*
     * "Weight" on its own is the one word worth refusing loudly rather than
     * ignoring. It is the most natural thing to type and the least decidable:
     * the scale, or the bar. Checked after the table so "bodyweight" and
     * "volume" — both of which contain a specific answer — resolve first.
     */
    if (mentions(q, 'weight')) {
      return { ok: false, reason: 'ambiguous', candidates: AMBIGUOUS_WEIGHT };
    }
    return { ok: false, reason: 'no-metric' };
  }

  if (matched.length > 1) {
    return { ok: false, reason: 'ambiguous', candidates: matched.map((m) => m.id) };
  }

  return {
    ok: true,
    query: {
      metric: matched[0].id,
      windowDays: windowDays ?? DEFAULT_WINDOW_DAYS,
      windowAssumed: windowDays === null,
    },
  };
}
