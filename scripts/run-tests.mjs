#!/usr/bin/env node
/**
 * Split the unit suite into "tests the product" and "tests the repository text".
 *
 * Why this exists: `npm test` reported a wall of green while ~42% of its files never
 * touched a single line of product code. They `readFileSync` a source file and regex the
 * string — checking that a Tailwind class is absent from a ±160-character slice, or that
 * a doc file still contains a particular sentence. That is not worthless (several are
 * deliberate honesty guards, and `privacyInstill.test.ts` is one), but it is not a
 * behavioural test, and it is not what a green tick is supposed to mean.
 *
 * The cost was never the CPU. It was that a suite of ~1,000 files made the queue feel
 * full of verification while the actual gap was that no one could measure retention.
 *
 * Classification is mechanical and auditable:
 *   META        — the file imports no module from the product tree.
 *   BEHAVIORAL  — the file imports at least one product module and therefore can fail
 *                 because product behaviour changed.
 *
 * `node scripts/run-tests.mjs --list` prints the classification and the counts.
 * Nothing is deleted; both halves still run, just under honest names.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const ROOTS = ['src', 'packages'];
const EXTS = ['.test.ts', '.test.tsx'];

/** `@/`, `./`, `../` — anything that resolves inside this repo. */
function isProjectSpecifier(spec) {
  return spec.startsWith('@/') || spec.startsWith('./') || spec.startsWith('../');
}

/**
 * A specifier that resolves to a product module rather than to another test.
 * `./foo.test` and `./__fixtures__/bar` do not count: importing a sibling test or a
 * fixture still leaves the file unable to fail on product behaviour.
 */
function isProductSpecifier(spec) {
  if (!isProjectSpecifier(spec)) return false;
  if (/\.(test|spec|routetest)\.[jt]sx?$/.test(spec)) return false;
  if (/(^|\/)__?(fixtures|mocks)($|\/)/.test(spec)) return false;
  if (/(^|\/)__tests__($|\/)/.test(spec)) return false;
  return true;
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === '.next') continue;
    const p = join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (EXTS.some((e) => ent.name.endsWith(e))) out.push(p);
  }
  return out;
}

function classify(file) {
  const src = readFileSync(file, 'utf8');
  const specs = [...src.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
  const dynamic = [...src.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1]);
  const require_ = [...src.matchAll(/\brequire\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1]);
  const all = [...specs, ...dynamic, ...require_];
  return {
    file,
    kind: all.some(isProductSpecifier) ? 'BEHAVIORAL' : 'META',
    imports: all.length,
  };
}

const all = ROOTS.flatMap((r) => walk(join(root, r)))
  .filter((f) => {
    try {
      return statSync(f).isFile();
    } catch {
      return false;
    }
  })
  .map(classify)
  .sort((a, b) => a.file.localeCompare(b.file));

const meta = all.filter((f) => f.kind === 'META');
const behavioral = all.filter((f) => f.kind === 'BEHAVIORAL');
const pct = ((meta.length / all.length) * 100).toFixed(1);

const rel = (f) => relative(root, f).split(sep).join('/');

if (process.argv.includes('--list')) {
  console.log(`\nUnit suite classification — ${all.length} files\n`);
  console.log(`  BEHAVIORAL (imports product code) : ${behavioral.length}`);
  console.log(`  META       (asserts repo text)    : ${meta.length}  (${pct}%)\n`);
  const buckets = new Map();
  for (const f of meta) {
    const base = rel(f.file).replace(/\.(test|spec)\.tsx?$/, '');
    const key = base.match(/([A-Za-z]+)(Cite|Honesty|Guard|Budget|Doc|Source)\d*$/)?.[0];
    if (key) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  if (buckets.size) {
    console.log('  Largest meta-test naming clusters:');
    [...buckets.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([k, n]) => console.log(`    ${String(n).padStart(4)}  ${k}`));
    console.log('');
  }
  for (const f of meta) console.log(`  META  ${rel(f.file)}`);
  process.exit(0);
}

const wantMeta = process.argv.includes('--meta');
const selected = wantMeta ? meta : behavioral;
const label = wantMeta ? 'meta (repo-text)' : 'behavioral';

if (selected.length === 0) {
  console.error(`No ${label} tests found.`);
  process.exit(1);
}

console.log(
  `\n${label}: ${selected.length} of ${all.length} files ` +
    `(${wantMeta ? meta.length : behavioral.length} selected, ${meta.length} held back)\n`,
);

const args = selected.map((f) => rel(f.file));
const res = spawnSync(
  'npx',
  ['tsx', '--test', ...args],
  { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' }
);
process.exit(res.status ?? 1);