/**
 * The formatters answer in the athlete's language, and never throw at a render.
 *
 * These assert **differences between locales** wherever a literal would pin an
 * ICU version rather than a rule. `formatLocalNumber(1234, 'de') === '1.234'` is
 * true today and is a hostage to a CLDR release; *"German and English do not
 * agree about 1234"* is the actual requirement and cannot drift.
 *
 * The dates here are constructed from explicit local fields and never compared
 * against the clock, so `.211`'s rule — *a test with a date literal in it is a
 * test with an expiry date* — does not apply: the German spelling of the 2nd of
 * August does not change next Tuesday.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatLocalDate,
  formatLocalDateTime,
  formatLocalNumber,
  formatLocalTime,
  formatLocalWeekday,
  resolveFormatLocale,
} from '@/lib/i18n/formatLocale';

/** 2026-08-02, 14:05 local. Fixed, not derived from now. */
const D = new Date(2026, 7, 2, 14, 5);

test('a number is grouped the way the language groups numbers', () => {
  const en = formatLocalNumber(1234567, 'en');
  const de = formatLocalNumber(1234567, 'de');
  const hi = formatLocalNumber(1234567, 'hi');

  assert.notEqual(en, de, 'English and German disagree about the grouping separator');
  assert.ok(en.includes(','), `English groups with a comma, got ${en}`);
  assert.ok(de.includes('.'), `German groups with a full stop, got ${de}`);
  /*
   * Hindi does not merely swap a separator — it groups in lakh/crore
   * (`12,34,567`), so a dropped locale argument is visible in the *shape* of the
   * number rather than one character of it. The strongest available witness that
   * the argument reached `Intl`.
   *
   * Arabic is deliberately not the witness here, and finding out why was worth
   * the failed first draft: bare `ar` renders **Latin** digits (`1,234,567`) in
   * CLDR, because the region decides — `ar-EG` gives `١٬٢٣٤٬٥٦٧` and `ar-MA`
   * gives `1.234.567`. Asserting Eastern Arabic-Indic digits for `ar` would have
   * pinned an assumption about Arabic that ICU does not share.
   */
  assert.notEqual(hi, en, 'Hindi groups in lakh/crore');
  assert.equal(hi.split(',').length, 3, `expected two group separators in ${hi}`);
  // The bug this file exists for: every one of these was the *browser's* answer.
  assert.notEqual(
    formatLocalNumber(1234567, 'fr'),
    en,
    'French groups with a narrow no-break space — if this equals English, the ' +
      'locale argument is being dropped somewhere'
  );
});

test('a date is ordered the way the language orders dates', () => {
  const us = formatLocalDate(D, 'en-US');
  const gb = formatLocalDate(D, 'en-GB');
  const de = formatLocalDate(D, 'de');

  assert.notEqual(us, gb, 'en-GB puts the day first — the region must not be discarded');
  assert.notEqual(us, de);
  assert.ok(us.includes('2026') && gb.includes('2026') && de.includes('2026'));

  /*
   * Thai is on the Buddhist calendar, so 2026 prints as **2569**. Recorded
   * because it is the one locale where a formatted year is not the Gregorian
   * year: any code that reads a year back out of a formatted string is wrong in
   * Thai and only in Thai. Nothing does today — that is what `localDateKey`
   * exists to prevent — and this line is here so the next reader knows the trap
   * is real rather than theoretical.
   */
  assert.ok(
    formatLocalDate(D, 'th').includes('2569'),
    `Thai renders the Buddhist era, got ${formatLocalDate(D, 'th')}`
  );
});

test('a regional tag survives, an unknown one falls back, neither throws', () => {
  assert.equal(resolveFormatLocale('en-GB'), 'en-GB', 'region preserved for formatting');
  assert.equal(resolveFormatLocale('pt-BR'), 'pt-BR');

  // i18next reads localStorage and navigator, so a hand-edited value reaches here.
  // `Intl.getCanonicalLocales` throws RangeError on each of these.
  for (const junk of ['en_US', '', 'xx-', '@@@', '-']) {
    const out = resolveFormatLocale(junk);
    assert.doesNotThrow(() => formatLocalDate(D, junk), `${JSON.stringify(junk)} threw`);
    assert.ok(out.length > 0, `${JSON.stringify(junk)} resolved to an empty tag`);
  }
  assert.equal(resolveFormatLocale('en_US'), 'en', 'falls back through normalizeAppLang');
});

test('an unusable input renders nothing, never the word NaN', () => {
  assert.equal(formatLocalDate('not-a-date', 'en'), '');
  assert.equal(formatLocalTime('', 'en'), '');
  assert.equal(formatLocalDateTime('nope', 'de'), '');

  // Intl prints "NaN" verbatim. These numbers come out of divisions by set counts
  // and week lengths, and "NaN kg" on a training screen reads as a broken app.
  assert.equal(formatLocalNumber(Number.NaN, 'en'), '');
  assert.equal(formatLocalNumber(Number.POSITIVE_INFINITY, 'en'), '');
  assert.equal(formatLocalNumber(0, 'en'), '0', 'zero is a number, not a missing one');
});

test('time and weekday follow the language too', () => {
  const en = formatLocalTime(D, 'en-US');
  const de = formatLocalTime(D, 'de');
  assert.notEqual(en, de, 'en-US is 12-hour with AM/PM, de is 24-hour');

  const enDay = formatLocalWeekday(D, 'en');
  const frDay = formatLocalWeekday(D, 'fr');
  assert.notEqual(enDay, frDay, '2026-08-02 is Sunday / dimanche');
  assert.ok(!enDay.includes('2026'), 'a weekday label carries no year');
});

/**
 * The resolver caches, and a cache that returns another language's answer is a
 * worse defect than the one this module fixes.
 */
test('the resolver cache is keyed by the tag it was asked about', () => {
  const first = resolveFormatLocale('de');
  const other = resolveFormatLocale('fr');
  assert.notEqual(first, other);
  assert.equal(resolveFormatLocale('de'), first, 'second call returns the same answer');
  assert.equal(formatLocalNumber(1234, 'de'), formatLocalNumber(1234, 'de'));
  assert.notEqual(formatLocalNumber(1234, 'de'), formatLocalNumber(1234, 'en'));
});
