#!/usr/bin/env npx tsx
/**
 * Full-site i18n parity gate.
 *
 * Default (CI): key-set for all namespaces + guidebook content must be translated
 * for every APP_LANG + beachhead (es/pt) core namespaces under placeholder cap.
 *
 * Strict (I18N_PARITY_STRICT=1): every non-allowlisted key must differ from EN.
 *
 * Run: npm run i18n:parity
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_LANGS } from '../src/i18n/appLangs';
import { LOCALE_EXPORTS } from '../src/lib/exportLocales';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const STRICT = process.env.I18N_PARITY_STRICT === '1';

type Allow = {
  keys?: string[];
  prefixes?: string[];
  identicalValues?: string[];
};

function loadAllowlist(): Allow {
  const p = path.join(root, 'scripts/i18n-allowlist.json');
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, 'utf8')) as Allow;
}

function isAllowlisted(key: string, allow: Allow): boolean {
  if (allow.keys?.includes(key)) return true;
  if (allow.prefixes?.some((p) => key.startsWith(p))) return true;
  return false;
}

function valueAllowlisted(enVal: string, allow: Allow): boolean {
  if (allow.identicalValues?.includes(enVal)) return true;
  if (/^Mission Winning$/i.test(enVal)) return true;
  if (enVal.length <= 2) return true;
  // App routes and pure numeric/timing cells stay identical
  if (enVal.startsWith('/')) return true;
  if (/^\d/.test(enVal) && enVal.length < 24) return true;
  return false;
}

function isGuidebookContentKey(key: string): boolean {
  return (
    key.startsWith('guideSection_') ||
    key.startsWith('guideChapter_') ||
    key.startsWith('magazine')
  );
}

const BEACHHEAD = ['es', 'pt'] as const;
const CORE_NS = new Set([
  'nav',
  'welcome',
  'today',
  'fuel',
  'activeWorkout',
  'landing',
  'learn',
  'guidebook',
]);

const allow = loadAllowlist();
let failed = false;

console.log(
  `i18n parity — ${APP_LANGS.length} langs × ${LOCALE_EXPORTS.length} namespaces (${STRICT ? 'STRICT' : 'standard'})\n`
);

for (const entry of LOCALE_EXPORTS) {
  const en = entry.stringsFor('en') as Record<string, string>;
  const enKeys = Object.keys(en);

  if (enKeys.length === 0) {
    console.log(`· ${entry.namespace}: overlay-only (skip)`);
    continue;
  }

  for (const lang of APP_LANGS) {
    if (lang === 'en') continue;
    const other = entry.stringsFor(lang) as Record<string, string>;
    const otherKeys = new Set(Object.keys(other));

    const missing = enKeys.filter((k) => !otherKeys.has(k));
    if (missing.length > 0) {
      failed = true;
      console.error(
        `✗ ${entry.namespace}/${lang}: missing ${missing.length} keys (e.g. ${missing.slice(0, 3).join(', ')})`
      );
      continue;
    }

    let placeholders = 0;
    let guidePlaceholders = 0;
    const samples: string[] = [];
    const guideSamples: string[] = [];
    for (const key of enKeys) {
      if (isAllowlisted(key, allow)) continue;
      const ev = en[key];
      const ov = other[key];
      if (ov === undefined || typeof ev !== 'string') continue;
      if (ov === ev && !valueAllowlisted(ev, allow)) {
        placeholders++;
        if (samples.length < 3) samples.push(key);
        if (isGuidebookContentKey(key)) {
          guidePlaceholders++;
          if (guideSamples.length < 3) guideSamples.push(key);
        }
      }
    }

    const ratio = enKeys.length ? placeholders / enKeys.length : 0;

    // Always require guidebook content translated
    if (entry.namespace === 'guidebook' && guidePlaceholders > 0) {
      failed = true;
      console.error(
        `✗ guidebook/${lang}: ${guidePlaceholders} content keys still English (${guideSamples.join(', ')})`
      );
      continue;
    }

    if (STRICT) {
      if (placeholders > 0) {
        failed = true;
        console.error(
          `✗ ${entry.namespace}/${lang}: ${placeholders}/${enKeys.length} still English (${samples.join(', ')})`
        );
      } else {
        console.log(`✓ ${entry.namespace}/${lang}: ${enKeys.length} keys`);
      }
      continue;
    }

    // Standard: beachhead core namespaces ≤ 40% placeholders
    if (
      (BEACHHEAD as readonly string[]).includes(lang) &&
      CORE_NS.has(entry.namespace) &&
      ratio > 0.4
    ) {
      failed = true;
      console.error(
        `✗ ${entry.namespace}/${lang}: beachhead placeholders ${(ratio * 100).toFixed(0)}% > 40% (${samples.join(', ')})`
      );
    } else if (placeholders === 0) {
      console.log(`✓ ${entry.namespace}/${lang}: ${enKeys.length} keys`);
    } else {
      console.log(
        `· ${entry.namespace}/${lang}: ${placeholders}/${enKeys.length} EN left (${(ratio * 100).toFixed(0)}%)`
      );
    }
  }
}

const batchD = ['hi', 'id', 'th', 'zh', 'vi', 'ar'];
for (const lang of batchD) {
  if (!(APP_LANGS as readonly string[]).includes(lang)) {
    failed = true;
    console.error(`✗ Batch D lang ${lang} missing from APP_LANGS`);
  }
}

if (failed) {
  console.error('\ni18n parity FAILED — npm run i18n:fill (guidebook first; I18N_PARITY_STRICT=1 for full)');
  process.exit(1);
}
console.log('\ni18n parity OK.');
