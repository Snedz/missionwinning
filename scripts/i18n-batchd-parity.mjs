/**
 * Wave 9 — Batch D locale coverage vs EN for landing/growth/bundle.
 * Run: node scripts/i18n-batchd-parity.mjs
 * Exit 1 if a Batch D language is missing from BY_LANG/LOCALES maps.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const BATCH_D = ['hi', 'id', 'th', 'zh', 'vi', 'ar'];

function fileHasLang(file, lang) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  // landing: LANDING_HI or hi: LANDING_HI
  if (file.includes('landingLocales')) {
    return new RegExp(`LANDING_${lang.toUpperCase()}\\b|\\b${lang}:\\s*LANDING_`, 'i').test(src);
  }
  if (file.includes('growthLocales') || file.includes('bundleLocales')) {
    return new RegExp(`\\bconst ${lang}:|\\b${lang},`, 'm').test(src);
  }
  return false;
}

const files = [
  'src/i18n/landingLocales.ts',
  'src/i18n/growthLocales.ts',
  'src/i18n/bundleLocales.ts',
];

let failed = false;
console.log('Batch D parity (presence of language records):\n');
for (const file of files) {
  console.log(file);
  for (const lang of BATCH_D) {
    const ok = fileHasLang(file, lang);
    console.log(`  ${ok ? '✓' : '✗'} ${lang}`);
    if (!ok) failed = true;
  }
}

if (failed) {
  console.error('\nBatch D gaps remain.');
  process.exit(1);
}
console.log('\nBatch D records present for landing/growth/bundle.');
