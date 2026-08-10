/**
 * English floors for info/legal i18n keys.
 *
 * Legal pages used `defaultValue: key` / `bodyKey` / `liKey`. Before async
 * hydrate, athletes saw raw tokens (`infoRegionsSummaryBody`) on Regions and
 * Service-Terms (Welcome footer path). Floor from the EN catalog instead (.653).
 */
import { infoStringsFor } from '@/i18n/infoLocales';

const EN = infoStringsFor('en');

export function infoEnFloor(key: string): string {
  return EN[key] ?? key;
}
