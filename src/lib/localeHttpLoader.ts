/*
 * `.209` — the manifest, not the modules.
 *
 * This line used to import `LOCALE_EXPORTS` from `@/lib/exportLocales` for the
 * two metadata fields read below, and dragged 28 `*Locales.ts` modules plus
 * 1.1 MB of locale packs onto the critical path of every route through the root
 * layout. 306 KB gzipped, on `/`, `/log` and `/active`.
 *
 * `ExportLang` is a `type` import — erased at compile time, so it costs nothing
 * at runtime and `isExportLang` below already hardcodes its own list anyway.
 */
import { LOCALE_FILES } from '@/i18n/localeExportManifest';
import type { ExportLang } from '@/lib/exportLocales';

/** Normalize i18n language code (e.g. en-US → en). */
export function normalizeLocaleCode(lang: string): string {
  return lang.split('-')[0] || 'en';
}

/** Public path for merged locale bundle. */
export function localeCommonJsonPath(lang: string): string {
  return `/locales/${normalizeLocaleCode(lang)}/common.json`;
}

/** Whether client should fetch JSON overrides from /public/locales. */
export function shouldLoadLocaleHttp(): boolean {
  if (typeof window === 'undefined') return false;
  return process.env.NEXT_PUBLIC_LOCALE_HTTP !== 'false';
}

export type LocaleHttpFile = {
  path: string;
  namespace: string;
};

export function localeHttpFallbackFiles(lang: string): LocaleHttpFile[] {
  const code = normalizeLocaleCode(lang);
  return LOCALE_FILES.map((entry) => ({
    path: `/locales/${code}/${entry.filename}`,
    namespace: entry.namespace,
  }));
}

export function mergeLocaleRecords(
  records: Record<string, string>[]
): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const rec of records) {
    Object.assign(merged, rec);
  }
  return merged;
}

/** Fetch translator overrides; prefers single common.json, falls back to per-namespace files. */
export async function fetchLocaleHttpOverrides(lang: string): Promise<Record<string, string>> {
  const code = normalizeLocaleCode(lang);

  try {
    const res = await fetch(localeCommonJsonPath(code), { cache: 'no-cache' });
    if (res.ok) {
      const data = (await res.json()) as Record<string, string>;
      if (data && typeof data === 'object') return data;
    }
  } catch {
    /* try fallback files */
  }

  const parts: Record<string, string>[] = [];
  for (const file of localeHttpFallbackFiles(code)) {
    try {
      const res = await fetch(file.path, { cache: 'no-cache' });
      if (res.ok) {
        parts.push((await res.json()) as Record<string, string>);
      }
    } catch {
      /* skip missing namespace */
    }
  }
  return mergeLocaleRecords(parts);
}

export function isExportLang(code: string): code is ExportLang {
  return ['en', 'es', 'zh', 'id', 'th', 'ar'].includes(code);
}
