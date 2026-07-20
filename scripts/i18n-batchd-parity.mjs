/**
 * Wave 9–10 — locale coverage vs EN for growth/landing/bundle + Wave 10 gate clusters.
 * Run: node scripts/i18n-batchd-parity.mjs
 * Exit 1 if a required language is missing from BY_LANG maps.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const BATCH_D = ['hi', 'id', 'th', 'zh', 'vi', 'ar'];
const APP_LANGS = [
  'en',
  'es',
  'fr',
  'pt',
  'ru',
  'de',
  'it',
  'ko',
  'ja',
  'th',
  'vi',
  'hi',
  'zh',
  'id',
  'ar',
];

function fileHasLang(file, lang) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  if (file.includes('landingLocales')) {
    return new RegExp(`LANDING_${lang.toUpperCase()}\\b|\\b${lang}:\\s*LANDING_`, 'i').test(src);
  }
  if (file.includes('growthLocales') || file.includes('bundleLocales')) {
    return new RegExp(`\\bconst ${lang}:|\\b${lang},`, 'm').test(src);
  }
  // gate/programs/feedback/beta: BY_LANG keys
  return new RegExp(`\\b${lang}:\\s*(GATE_|PROGRAMS_|FEEDBACK_|BETA_|fb\\(|programsUi|betaUi|\\{)`, 'm').test(
    src
  ) || new RegExp(`\\b${lang}:\\s*[A-Z_a-z]+`, 'm').test(src);
}

const batchDFiles = [
  'src/i18n/landingLocales.ts',
  'src/i18n/growthLocales.ts',
  'src/i18n/bundleLocales.ts',
];

const wave10Files = [
  'src/i18n/gateLocales.ts',
  'src/i18n/programsLocales.ts',
  'src/i18n/feedbackLocales.ts',
  'src/i18n/betaLocales.ts',
];

let failed = false;
console.log('Batch D parity (presence of language records):\n');
for (const file of batchDFiles) {
  console.log(file);
  for (const lang of BATCH_D) {
    const ok = fileHasLang(file, lang);
    console.log(`  ${ok ? '✓' : '✗'} ${lang}`);
    if (!ok) failed = true;
  }
}

console.log('\nWave 10 gate/programs/feedback/beta (all APP_LANGS):\n');
for (const file of wave10Files) {
  console.log(file);
  for (const lang of APP_LANGS) {
    const ok = fileHasLang(file, lang);
    console.log(`  ${ok ? '✓' : '✗'} ${lang}`);
    if (!ok) failed = true;
  }
}

if (failed) {
  console.error('\nParity gaps remain.');
  process.exit(1);
}
console.log('\nBatch D + Wave 10 cluster records present.');
