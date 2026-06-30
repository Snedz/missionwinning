#!/usr/bin/env node
/**
 * Export English welcome strings to public/locales for translator handoff (G2).
 * Run: npm run export-locales
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { welcomeStringsFor } from '../src/i18n/welcomeLocales';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public/locales/en');
mkdirSync(outDir, { recursive: true });

const welcome = welcomeStringsFor('en');
writeFileSync(join(outDir, 'welcome.json'), JSON.stringify(welcome, null, 2) + '\n');
console.log(`Wrote ${outDir}/welcome.json (${Object.keys(welcome).length} keys)`);
