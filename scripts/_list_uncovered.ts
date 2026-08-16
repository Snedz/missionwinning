import fs from 'node:fs';
import path from 'node:path';
import { BOOTSTRAP_EN } from '../src/i18n/bootstrapResources';
import { coreStringsFor } from '../src/i18n/coreLocales';
import { LOCALE_EXPORTS } from '../src/lib/exportLocales';

const root = path.resolve(__dirname, '..');

function walk(dir: string, out: string[] = []): string[] {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel, out);
    else if (/\.tsx$/.test(entry.name) && !/\.(test|routetest)\.tsx$/.test(entry.name)) out.push(rel);
  }
  return out;
}

const en = new Set<string>([
  ...Object.keys(BOOTSTRAP_EN),
  ...Object.keys(coreStringsFor('en') as Record<string, string>),
]);
for (const entry of LOCALE_EXPORTS) {
  for (const k of Object.keys(entry.stringsFor('en') as Record<string, string>)) en.add(k);
}

const uncovered = new Map<string, string>();
for (const file of [...walk('src/components'), ...walk('src/page-components')]) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  for (const m of src.matchAll(/\bt\(\s*'([A-Za-z][\w.]*)'/g)) {
    if (!en.has(m[1]) && !uncovered.has(m[1])) uncovered.set(m[1], file);
  }
}

for (const [key, file] of uncovered) console.log(`${key}\t${file}`);
