#!/usr/bin/env npx tsx
/**
 * Does the app's UI actually have translations?
 *
 * `i18n-parity.ts` compares locale packs **to each other** and never opens a
 * `.tsx`. That is a real check — it catches a key present in EN and missing in
 * Japanese — but it is structurally blind to the larger problem: a key a
 * component *uses* that exists in **no** pack at all. All fifteen languages
 * agree they don't have it, so parity is trivially satisfied.
 *
 * Measured on the day this was written: **665 of 1538 literal keys (43%) exist
 * in no EN pack.** Because every call site is
 * `t('key', { defaultValue: 'English' })`, users are not shown raw key names —
 * they are shown **English**, silently, in fourteen non-English languages. The
 * app looks translated and is not.
 *
 * This script does not fix that. Closing 665 keys is a project, not a PR, and
 * the founder's call was measure-and-ratchet. So:
 *
 *   1. it counts the gap and **fails on any NEW uncovered key**, and
 *   2. the cap can only ever be lowered, never raised.
 *
 * The debt stops growing today and can only shrink. That is worth more than a
 * partial translation pass, because the untranslated-by-default behaviour is
 * what produced 665 in the first place.
 *
 * Run: npm run i18n:coverage
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BOOTSTRAP_EN } from '../src/i18n/bootstrapResources';
import { coreStringsFor } from '../src/i18n/coreLocales';
import { LOCALE_EXPORTS } from '../src/lib/exportLocales';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The ratchet. **Lower this whenever you translate something; never raise it.**
 *
 * A cap that follows reality is not a cap, so `i18nCoverage.test.ts` asserts
 * this number only ever moves down.
 *
 * ## Why it shipped at 710 and not 665
 *
 * The first measurement was 665. Then `.202` gave five components
 * (`TodayDayReviewCard`, `DayReviewOptIn`, `BehaviorStrip`, `DailyCheckIn`,
 * `BreathingTimer`) their first `useTranslation`, which added 42 keys — and the
 * count went **up**.
 *
 * That is measurement widening, not debt growing. Before, those strings were
 * hardcoded English with **no key at all**: invisible to this counter and
 * impossible for anyone to translate. Now they have keys, so translating them
 * is a data change rather than a code change. The number rose because the
 * counter can finally see them.
 *
 * This is the *only* legitimate reason for the cap to increase, and it happened
 * inside the same PR that introduced the ratchet. Every future move is down.
 */
const MAX_UNCOVERED_KEYS = 121;

/** Components whose user-visible text is not translated, each with a reason. */
const SKIP_UNTRANSLATED: { file: string; why: string }[] = [
  {
    file: 'src/page-components/HomePage.tsx',
    why: 'Routing shell — picks a Today variant by phase and renders no text of its own.',
  },
  {
    file: 'src/page-components/JoinClassPage.tsx',
    why: 'Routing shell for the parked school surface; renders no text of its own.',
  },
];

const UI_DIRS = ['src/components/today', 'src/components/pillars', 'src/components/profile'];

function walk(dir: string, out: string[] = []): string[] {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return out;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(rel, out);
    else if (/\.tsx$/.test(entry.name) && !/\.(test|routetest)\.tsx$/.test(entry.name)) {
      out.push(rel);
    }
  }
  return out;
}

/** Every EN string the app can resolve: bootstrap + core + all namespace packs. */
function englishKeys(): Set<string> {
  const keys = new Set<string>([
    ...Object.keys(BOOTSTRAP_EN),
    ...Object.keys(coreStringsFor('en') as Record<string, string>),
  ]);
  for (const entry of LOCALE_EXPORTS) {
    for (const k of Object.keys(entry.stringsFor('en') as Record<string, string>)) keys.add(k);
  }
  return keys;
}

/** `t('literalKey'` only — a computed key cannot be checked statically. */
function literalKeysIn(source: string): string[] {
  return [...source.matchAll(/\bt\(\s*'([A-Za-z][\w.]*)'/g)].map((m) => m[1]);
}

const ALL_UI = [
  ...walk('src/components'),
  ...walk('src/page-components'),
];

const en = englishKeys();
let failed = false;

/* ── 1. Keys used but present in no EN pack ─────────────────────────────── */

const uncovered = new Map<string, string>(); // key → first file that uses it
for (const file of ALL_UI) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  for (const key of literalKeysIn(src)) {
    if (!en.has(key) && !uncovered.has(key)) uncovered.set(key, file);
  }
}

const count = uncovered.size;
console.log(`i18n coverage — ${count} uncovered keys (cap ${MAX_UNCOVERED_KEYS})`);

if (count > MAX_UNCOVERED_KEYS) {
  failed = true;
  const fresh = [...uncovered.entries()].slice(0, 20);
  console.error(
    `\n✗ ${count} keys are used in the UI but exist in no EN pack — ${count - MAX_UNCOVERED_KEYS} more than the cap.\n` +
      `  A key with no pack entry renders its English \`defaultValue\` in all 15 languages.\n` +
      `  Add the key to the right \`src/i18n/*Locales.ts\`, then run \`npm run i18n:fill\`.\n`
  );
  for (const [key, file] of fresh) console.error(`    ${key}  (${file})`);
  if (uncovered.size > fresh.length) console.error(`    … and ${uncovered.size - fresh.length} more`);
} else if (count < MAX_UNCOVERED_KEYS) {
  console.log(
    `  ↓ ${MAX_UNCOVERED_KEYS - count} below the cap — lower MAX_UNCOVERED_KEYS to ${count} to lock the gain in.`
  );
}

/* ── 2. A component with user-visible text imports useTranslation ───────── */

/** Rough but honest: JSX text that is words, not punctuation or an expression. */
function hasVisibleProse(src: string): boolean {
  return /<(?:p|h[1-6]|span|button|label|li|td|th|CardTitle)[^>]*>\s*[A-Z][a-z]+(?:\s+[\w'’,.-]+){2,}/.test(
    src
  );
}

const untranslated: string[] = [];
for (const file of UI_DIRS.flatMap((d) => walk(d))) {
  if (SKIP_UNTRANSLATED.some((s) => s.file === file)) continue;
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  if (!hasVisibleProse(src)) continue;
  if (!src.includes('useTranslation')) untranslated.push(file);
}

if (untranslated.length > 0) {
  failed = true;
  console.error(
    `\n✗ ${untranslated.length} component(s) render prose without \`useTranslation\`:\n` +
      untranslated.map((f) => `    ${f}`).join('\n') +
      `\n  Wrap the strings in \`t('key', { defaultValue: '…' })\`, or add a reasoned SKIP_UNTRANSLATED row.\n`
  );
}

for (const skip of SKIP_UNTRANSLATED) {
  if (!skip.why.trim()) {
    console.error(`✗ SKIP_UNTRANSLATED entry for ${skip.file} has no reason.`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('i18n coverage OK — no new uncovered keys, every UI component translated.');
