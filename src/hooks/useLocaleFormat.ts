'use client';

/**
 * The formatters from [`formatLocale`](../lib/i18n/formatLocale.ts), bound to the
 * language the athlete actually chose.
 *
 * `formatLocalDate(iso, lang)` takes `lang` as a required positional so the
 * compiler catches a missed one — but a component should not have to pull
 * `useTranslation` and thread `i18n.language` through four call sites just to
 * print a date. Binding it once here is what makes the required parameter cheap
 * to comply with, which is the difference between a rule that holds and a rule
 * people route around.
 *
 * `i18n.language` rather than `resolvedLanguage`: the switcher writes the former,
 * and `resolvedLanguage` collapses to the fallback while a pack is still
 * hydrating — which would show English dates for the first paint after a
 * language change and then silently correct them.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AXIS_DATE,
  formatLocalDate,
  formatLocalDateTime,
  formatLocalNumber,
  formatLocalTime,
  formatLocalWeekday,
  LONG_DATE,
} from '@/lib/i18n/formatLocale';

export function useLocaleFormat() {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';

  return useMemo(
    () => ({
      lang,
      date: (iso: string | number | Date, opts?: Intl.DateTimeFormatOptions) =>
        formatLocalDate(iso, lang, opts),
      /** The app's long date — the preset `utils.formatDate` used to mean. */
      longDate: (iso: string | number | Date) => formatLocalDate(iso, lang, LONG_DATE),
      /** A chart axis tick. */
      axisDate: (iso: string | number | Date) => formatLocalDate(iso, lang, AXIS_DATE),
      time: (iso: string | number | Date, opts?: Intl.DateTimeFormatOptions) =>
        formatLocalTime(iso, lang, opts),
      dateTime: (iso: string | number | Date, opts?: Intl.DateTimeFormatOptions) =>
        formatLocalDateTime(iso, lang, opts),
      num: (n: number, opts?: Intl.NumberFormatOptions) => formatLocalNumber(n, lang, opts),
      weekday: (iso: string | number | Date, w?: Intl.DateTimeFormatOptions['weekday']) =>
        formatLocalWeekday(iso, lang, w),
    }),
    [lang]
  );
}
