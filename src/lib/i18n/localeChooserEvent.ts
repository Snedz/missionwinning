/**
 * The name of the "open the language sheet" broadcast, on its own.
 *
 * Triggers live on first-paint surfaces — the gate poster is one — and importing
 * `LocaleCountryChooser` just to read a string would pull the whole 40-language
 * overlay, its country catalogue and `supportedRegions` into that first bundle.
 * `.768` measured what unnecessary first-paint JS costs on a slow connection.
 */
export const LOCALE_CHOOSER_OPEN_EVENT = 'mw-open-locale-chooser';

/** Ask for the language + country sheet from anywhere on the client. */
export function openLocaleChooser(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(LOCALE_CHOOSER_OPEN_EVENT));
}
