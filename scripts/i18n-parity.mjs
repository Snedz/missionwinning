/**
 * Full-site i18n parity gate — key-set + non-EN placeholder check for APP_LANGS.
 * Run: node scripts/i18n-parity.mjs
 * Exit 1 on missing keys or English placeholders (except allowlist).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');

// Load TS via tsx when available
async function loadExportLocales() {
  try {
    const { register: tsxRegister } = await import('tsx/esm/api');
    tsxRegister();
  } catch {
    /* tsx may already be registered when run via npx tsx */
  }
  const mod = await import(pathToFileURL(path.join(root, 'src/lib/exportLocales.ts')).href);
  const langs = await import(pathToFileURL(path.join(root, 'src/i18n/appLangs.ts')).href);
  return { ...mod, APP_LANGS: langs.APP_LANGS };
}

function loadAllowlist() {
  const p = path.join(root, 'scripts/i18n-allowlist.json');
  if (!fs.existsSync(p)) return { keys: [], prefixes: [] };
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function isAllowlisted(key, allow) {
  if (allow.keys?.includes(key)) return true;
  if (allow.prefixes?.some((p) => key.startsWith(p))) return true;
  // Very short tokens / brands often stay identical
  if (/^(MW|OK|PDF|RPE|PAR-Q|1RM|API|URL|ID|CTA)$/i.test(key)) return true;
  return false;
}

function valueAllowlisted(enVal, allow) {
  const brand = allow.identicalValues ?? [];
  if (brand.includes(enVal)) return true;
  if (/^Mission Winning$/i.test(enVal)) return true;
  if (/^Super Bundle$/i.test(enVal)) return true;
  if (enVal.length <= 2) return true;
  return false;
}

const { LOCALE_EXPORTS, APP_LANGS } = await loadExportLocales();
const allow = loadAllowlist();

let failed = false;
const summary = [];

console.log(`i18n parity — ${APP_LANGS.length} langs × ${LOCALE_EXPORTS.length} namespaces\n`);

for (const entry of LOCALE_EXPORTS) {
  const en = entry.stringsFor('en');
  const enKeys = Object.keys(en).sort();

  for (const lang of APP_LANGS) {
    if (lang === 'en') continue;
    const other = entry.stringsFor(lang);
    const otherKeys = new Set(Object.keys(other));

    const missing = enKeys.filter((k) => !otherKeys.has(k));
    if (missing.length > 0) {
      failed = true;
      console.error(`✗ ${entry.namespace}/${lang}: missing ${missing.length} keys (e.g. ${missing.slice(0, 3).join(', ')})`);
    }

    let placeholders = 0;
    const samples = [];
    for (const key of enKeys) {
      if (isAllowlisted(key, allow)) continue;
      const ev = en[key];
      const ov = other[key];
      if (ov === undefined) continue;
      if (ov === ev && !valueAllowlisted(ev, allow)) {
        placeholders++;
        if (samples.length < 3) samples.push(key);
      }
    }

    const ratio = enKeys.length ? placeholders / enKeys.length : 0;
    summary.push({ ns: entry.namespace, lang, placeholders, total: enKeys.length, ratio });

    // Fail if any non-allowlisted EN placeholder remains
    if (placeholders > 0) {
      failed = true;
      console.error(
        `✗ ${entry.namespace}/${lang}: ${placeholders}/${enKeys.length} still English (${samples.join(', ')})`
      );
    } else if (enKeys.length > 0) {
      console.log(`✓ ${entry.namespace}/${lang}: ${enKeys.length} keys`);
    }
  }
}

// Batch D presence retained as soft note
const batchD = ['hi', 'id', 'th', 'zh', 'vi', 'ar'];
for (const lang of batchD) {
  if (!APP_LANGS.includes(lang)) {
    failed = true;
    console.error(`✗ Batch D lang ${lang} missing from APP_LANGS`);
  }
}

if (failed) {
  console.error('\ni18n parity FAILED — fill packs via: npm run i18n:fill');
  process.exit(1);
}
console.log('\ni18n parity OK.');
