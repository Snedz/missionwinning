#!/usr/bin/env node
/**
 * Export i18n namespace JSON for translator handoff (G2).
 * Run: npm run export-locales
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { LOCALE_EXPORTS, localeExportSummary, buildMergedCommonStrings } from '../src/lib/exportLocales';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outRoot = join(root, 'public/locales');

let fileCount = 0;

for (const entry of LOCALE_EXPORTS) {
  for (const lang of entry.langs) {
    const strings = entry.stringsFor(lang);
    const dir = join(outRoot, lang);
    mkdirSync(dir, { recursive: true });
    const path = join(dir, entry.filename);
    writeFileSync(path, JSON.stringify(strings, null, 2) + '\n');
    console.log(`Wrote ${path} (${Object.keys(strings).length} keys)`);
    fileCount++;
  }
}

for (const lang of LOCALE_EXPORTS[0].langs) {
  const common = buildMergedCommonStrings(lang);
  const dir = join(outRoot, lang);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, 'common.json');
  writeFileSync(path, JSON.stringify(common, null, 2) + '\n');
  console.log(`Wrote ${path} (${Object.keys(common).length} keys merged)`);
  fileCount++;
}

const summary = localeExportSummary();
console.log(
  `\nDone: ${fileCount} files, ${summary.namespaces} namespaces + common.json, ${summary.langs} langs.`
);
