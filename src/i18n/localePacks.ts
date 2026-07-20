/**
 * Locale pack overlays — flat key→string maps merged after *Locales.ts.
 * Fill via: npx tsx scripts/i18n-fill-missing.ts
 */

import type { AppLang } from '@/i18n/appLangs';
import { normalizeAppLang } from '@/i18n/appLangs';

import es from '@/i18n/packs/es.json';
import fr from '@/i18n/packs/fr.json';
import pt from '@/i18n/packs/pt.json';
import ru from '@/i18n/packs/ru.json';
import de from '@/i18n/packs/de.json';
import it from '@/i18n/packs/it.json';
import ko from '@/i18n/packs/ko.json';
import ja from '@/i18n/packs/ja.json';
import th from '@/i18n/packs/th.json';
import vi from '@/i18n/packs/vi.json';
import hi from '@/i18n/packs/hi.json';
import zh from '@/i18n/packs/zh.json';
import id from '@/i18n/packs/id.json';
import ar from '@/i18n/packs/ar.json';

const PACKS: Partial<Record<AppLang, Record<string, string>>> = {
  es: es as Record<string, string>,
  fr: fr as Record<string, string>,
  pt: pt as Record<string, string>,
  ru: ru as Record<string, string>,
  de: de as Record<string, string>,
  it: it as Record<string, string>,
  ko: ko as Record<string, string>,
  ja: ja as Record<string, string>,
  th: th as Record<string, string>,
  vi: vi as Record<string, string>,
  hi: hi as Record<string, string>,
  zh: zh as Record<string, string>,
  id: id as Record<string, string>,
  ar: ar as Record<string, string>,
};

export function getLocalePack(lang: string): Record<string, string> {
  const code = normalizeAppLang(lang);
  if (code === 'en') return {};
  return PACKS[code] ?? {};
}

/** Apply pack overlays onto a string map (mutates and returns target). */
export function applyLocalePack(target: Record<string, string>, lang: string): Record<string, string> {
  const pack = getLocalePack(lang);
  if (Object.keys(pack).length > 0) Object.assign(target, pack);
  return target;
}

/** Non-mutating merge for exporters / parity. */
export function withLocalePack(base: Record<string, string>, lang: string): Record<string, string> {
  const pack = getLocalePack(lang);
  if (Object.keys(pack).length === 0) return { ...base };
  return { ...base, ...pack };
}
