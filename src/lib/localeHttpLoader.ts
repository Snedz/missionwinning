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
import { readRaw, remove, writeRaw } from '@/lib/storage/safeStorage';

/** Normalize i18n language code (e.g. en-US → en). */
export function normalizeLocaleCode(lang: string): string {
  return lang.split('-')[0] || 'en';
}


/** Key a translator sets once to keep the override fetch on for their device. */
export const LOCALE_HTTP_FLAG = 'mw_locale_http';

/**
 * Whether this client should fetch JSON overrides from `/public/locales`.
 *
 * `.222` — **opt-in**, where it used to be on for everyone.
 *
 * The purpose of this path is a translator hotfix: correct a string without a
 * deploy. That is a real capability and it is kept. What it was not worth is its
 * price, which every athlete paid on every load:
 *
 *   - `common.json` is the **entire** catalogue — 1,687 keys — whether you open
 *     `/log` or `/guide`;
 *   - **40–49 KB gzipped** depending on language;
 *   - `cache: 'no-cache'` below, so the browser cache never helps and the cost
 *     recurs on every single load;
 *   - and the values it merges in are **already in the bundle**. Verified:
 *     `public/locales/ja/common.json` and `src/i18n/packs/ja.json` share 947
 *     keys, 100% byte-identical. It downloaded a copy to overwrite itself.
 *
 * `.209` spent an entire PR taking 306 KB of locale packs off the critical path.
 * This put ~45 KB back, uncached, and `bundle-budget.mjs` could not see it —
 * that budget measures gzipped **initial JS**, and this is a runtime fetch.
 *
 * So: nothing about the loader, the merge or the fallback changed. Only *when*
 * it runs. A translator opts in with `?locale-http=1` (sticky, so a reload keeps
 * it) or by setting the flag directly; `?locale-http=0` clears it. The
 * `NEXT_PUBLIC_LOCALE_HTTP=false` kill switch still wins over both.
 */
export function shouldLoadLocaleHttp(): boolean {
  if (typeof window === 'undefined') return false;
  if (process.env.NEXT_PUBLIC_LOCALE_HTTP === 'false') return false;

  const param = new URLSearchParams(window.location.search).get('locale-http');
  if (param === '1') {
    writeRaw(LOCALE_HTTP_FLAG, '1');
    return true;
  }
  if (param === '0') {
    remove(LOCALE_HTTP_FLAG);
    return false;
  }
  // safeStorage never throws; memory fallback keeps the opt-in for the tab.
  return readRaw(LOCALE_HTTP_FLAG) === '1';
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

/**
 * Fetch translator overrides from the per-namespace files.
 *
 * `.222` removed the `common.json` attempt that used to come first. That file
 * was every key again — the fourth copy of the catalogue — and it is deleted, so
 * the branch could only ever spend a request on a 404 before falling through to
 * exactly this loop. Verified on the wire: the opt-in path issued two doomed
 * `common.json` requests per page before this went.
 */
export async function fetchLocaleHttpOverrides(lang: string): Promise<Record<string, string>> {
  const code = normalizeLocaleCode(lang);
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
