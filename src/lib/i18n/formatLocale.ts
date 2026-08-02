/**
 * Dates and numbers, in the language the athlete chose.
 *
 * **The defect this exists to end.** `Intl` formatting reads the *browser* locale
 * whenever you leave the first argument off — and `undefined` is a legal value
 * that means exactly that. So `new Date(iso).toLocaleDateString()` and
 * `toLocaleDateString(undefined, {…})` are the same call, and both ignore the
 * app's own language switcher. `.227` swept `src/` and `app/` and found **42
 * sites in 22 files** doing it, plus 17 `localeCompare` calls, in a product
 * shipping **fifteen locales**: an athlete who picks Spanish got Spanish copy,
 * Spanish nav, Spanish pillar names and `8/2/2026` with `1,234` separators.
 *
 * The numbers are not decoration here. `1234567` is `1.234.567` in German and
 * `12,34,567` in Hindi — which groups in lakh, so the *shape* changes and not
 * just a separator — and this app's screens are mostly numbers.
 *
 * **`lang` is a required positional.** That is the whole enforcement strategy and
 * it is deliberate: the defect *is* an optional first argument, so an optional
 * first argument cannot be the fix. Making it required turns the compiler into
 * the guard for every call site written after this file — cheaper and earlier
 * than any scan. [`localeFormat.test.ts`](./localeFormat.test.ts) covers the ones
 * written before it, and the raw `Intl` calls this module cannot see.
 *
 * **Not a second `localDate`.** [`time/localDate.ts`](../time/localDate.ts) owns
 * *calendar keys* — `YYYY-MM-DD` strings you compare, bucket and store, which
 * must never pass through a locale at all. This module owns *display strings*,
 * which must always pass through one. Two jobs, two homes, stated in both
 * headers so `.178` does not happen to the third wave that needs a date.
 */

import { normalizeAppLang } from '@/i18n/appLangs';

/**
 * The tag actually handed to `Intl`.
 *
 * **Regional tags survive on purpose.** `normalizeAppLang` collapses `en-GB` to
 * `en`, which is right for *picking a translation pack* — there is no `en-GB`
 * pack — and wrong for formatting, where it would show a British athlete
 * `8/2/2026` for the 2nd of August. So the canonical tag wins when it is valid,
 * and `normalizeAppLang` is the floor rather than the rule.
 *
 * `Intl.getCanonicalLocales` throws `RangeError` on a structurally invalid tag
 * (`en_US`, `xx-`, `''`), and i18next's detector reads `localStorage` and
 * `navigator`, so a hand-edited value can reach here. Falling back beats throwing
 * inside a render.
 */
const resolved = new Map<string, string>();

export function resolveFormatLocale(lang: string): string {
  const hit = resolved.get(lang);
  if (hit !== undefined) return hit;

  let out: string;
  try {
    out = Intl.getCanonicalLocales(lang)[0] ?? normalizeAppLang(lang);
  } catch {
    out = normalizeAppLang(lang);
  }
  resolved.set(lang, out);
  return out;
}

/** `''` for an unparseable ISO string — the same contract as `localDateKeyFromIso`. */
function parse(iso: string | number | Date): Date | null {
  const d = iso instanceof Date ? iso : new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatLocalDate(
  iso: string | number | Date,
  lang: string,
  opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
): string {
  const d = parse(iso);
  return d ? d.toLocaleDateString(resolveFormatLocale(lang), opts) : '';
}

export function formatLocalTime(
  iso: string | number | Date,
  lang: string,
  opts: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }
): string {
  const d = parse(iso);
  return d ? d.toLocaleTimeString(resolveFormatLocale(lang), opts) : '';
}

export function formatLocalDateTime(
  iso: string | number | Date,
  lang: string,
  opts: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }
): string {
  const d = parse(iso);
  return d ? d.toLocaleString(resolveFormatLocale(lang), opts) : '';
}

/**
 * `NaN`/`Infinity` render as `''`, not as the literal "NaN".
 *
 * `Intl` prints `NaN` verbatim, and these numbers come out of division by set
 * counts and week lengths — `.208`'s territory. A blank is a missing number; the
 * string "NaN" on a training screen is the app telling the athlete it is broken.
 */
export function formatLocalNumber(
  n: number,
  lang: string,
  opts?: Intl.NumberFormatOptions
): string {
  if (!Number.isFinite(n)) return '';
  return n.toLocaleString(resolveFormatLocale(lang), opts);
}

/**
 * For a surface whose prose is English and only English.
 *
 * The weekly nudge email, the session debrief, the share card and the school
 * report compose **hardcoded English sentences** — `'working sets'`, `'Volume'`,
 * `'Most people quit in the first week.'` — and three of the four render outside
 * the app entirely, where no athlete language exists to read.
 *
 * Before `.227` those numbers were ambient, which is the worst of both: a German
 * browser rendered `1.234` *inside an English sentence*, localising the one
 * token that had no business disagreeing with the ninety around it. Naming the
 * language makes it a decision instead of an accident, and makes the day the
 * prose gets translated a compile-time conversation rather than a silent
 * inconsistency — grep this constant to find every surface still owing one.
 */
export const EN_ONLY_SURFACE = 'en';

/**
 * The app's long date — `Sun, Aug 2, 2026` in English, ordered and named by the
 * language elsewhere. Exported as options rather than re-typed at each call site:
 * it was spelled once in `utils.formatDate` and eight components reached it
 * through that name, so it stays one object (`.178`). That function is gone —
 * with every caller on `fmt.longDate()` it had no call sites left, and a second
 * home for one preset is what this module exists to prevent.
 */
export const LONG_DATE: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

/** A chart axis tick — short enough to repeat across an x-axis. */
export const AXIS_DATE: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

/**
 * Order two machine keys — `YYYY-MM-DD`, an ISO timestamp, an id.
 *
 * **Not a locale operation, and that is the point.** Thirteen sorts reached for
 * `localeCompare` to order ISO dates, which is a linguistic comparison of
 * strings that contain no language: it cannot give a different answer from `<`
 * on ASCII digits and hyphens, and it costs a collator to say so — `.210`
 * measured one of these running per tick on `/active`. Naming it separately
 * means the `localeCompare` rule can be absolute, with no allowlist to erode.
 */
export function compareKeys(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/**
 * Order two pieces of *language* — a name, a label, an exercise title.
 *
 * Here collation is the whole job and the locale genuinely changes the answer:
 * Swedish sorts `ä` after `z`, German does not; Spanish once sorted `ch` as its
 * own letter. `localeCompare` with no locale asks the browser, so the same class
 * roster sorted differently for the teacher and the athlete looking at it.
 */
export function compareText(a: string, b: string, lang: string): number {
  return a.localeCompare(b, resolveFormatLocale(lang));
}

/** Weekday/month names for a header row, derived rather than hardcoded English. */
export function formatLocalWeekday(
  iso: string | number | Date,
  lang: string,
  weekday: Intl.DateTimeFormatOptions['weekday'] = 'short'
): string {
  return formatLocalDate(iso, lang, { weekday });
}
