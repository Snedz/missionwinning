#!/usr/bin/env node
/**
 * Take the weight out of `public/locales`.
 *
 * `.222` — English was split correctly and no other language was.
 *
 *     en   0.24 MB   coach.json ∩ fuel.json = 0 keys
 *     ja   2.93 MB   coach.json ∩ fuel.json = 947 keys
 *     th   3.76 MB
 *
 * Every non-English namespace file carried most of the whole catalogue, so the
 * directory came to **30.8 MB across 435 files** — and `common.json` on top of
 * that is every key a fourth time. Split the way English already is, the same
 * content is **2.0 MB**. 93% of it was duplication.
 *
 * ## Why this is a script and not 406 hand edits
 *
 * The transform has to be re-runnable. Translations get regenerated, and a
 * one-off cleanup that cannot be repeated is a cleanup that quietly undoes
 * itself the next time someone runs the fill tool. `localeFootprint.test.ts`
 * asserts the result, this restores it, and the two together are what keep the
 * weight off rather than merely taking it off once.
 *
 * **English is the schema.** `en/<ns>.json` defines which keys belong to a
 * namespace; every other language keeps exactly that set and drops the rest.
 * Keys a language has that English does not are dropped too — English is the
 * source of truth for what exists, and `i18n-parity` already enforces that.
 *
 * Run: node scripts/split-locale-packs.mjs [--check]
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCALES = path.join(root, 'public', 'locales');

/**
 * Every key again, fetched by nobody once the namespace files are correct.
 * `fetchLocaleHttpOverrides` prefers it, so it is removed rather than trimmed —
 * leaving it would mean the loader keeps choosing the 1,687-key file.
 */
const REDUNDANT = 'common.json';

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

/** English defines which keys belong to which namespace. */
function englishSchema() {
  const dir = path.join(LOCALES, 'en');
  const schema = new Map();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json') || file === REDUNDANT) continue;
    schema.set(file, new Set(Object.keys(readJson(path.join(dir, file)))));
  }
  return schema;
}

function bytes(dir) {
  let total = 0;
  for (const f of readdirSync(dir)) {
    if (f.endsWith('.json')) total += statSync(path.join(dir, f)).size;
  }
  return total;
}

export function splitLocales({ check = false } = {}) {
  const schema = englishSchema();
  const langs = readdirSync(LOCALES).filter((d) =>
    statSync(path.join(LOCALES, d)).isDirectory()
  );

  let before = 0;
  let after = 0;
  const wouldChange = [];

  for (const lang of langs) {
    const dir = path.join(LOCALES, lang);
    before += bytes(dir);

    for (const [file, keys] of schema) {
      const p = path.join(dir, file);
      if (!existsSync(p)) continue;
      const data = readJson(p);
      const trimmed = {};
      // Iterate the schema, not the file: this both drops foreign keys and
      // fixes key order, so the output is stable across runs.
      for (const k of keys) if (k in data) trimmed[k] = data[k];

      const next = `${JSON.stringify(trimmed, null, 2)}\n`;
      if (next !== readFileSync(p, 'utf8')) wouldChange.push(`${lang}/${file}`);
      if (!check) writeFileSync(p, next);
    }

    const redundant = path.join(dir, REDUNDANT);
    if (existsSync(redundant)) {
      wouldChange.push(`${lang}/${REDUNDANT} (removed)`);
      if (!check) rmSync(redundant);
    }

    if (!check) after += bytes(dir);
  }

  return { before, after, wouldChange, langs: langs.length };
}

function main() {
  const check = process.argv.includes('--check');
  const { before, after, wouldChange, langs } = splitLocales({ check });

  if (check) {
    if (wouldChange.length) {
      console.error(
        `\n✗ ${wouldChange.length} locale file(s) carry keys outside their namespace, or ` +
          `${REDUNDANT} is back.\n  Run: node scripts/split-locale-packs.mjs\n`
      );
      for (const f of wouldChange.slice(0, 12)) console.error(`    ${f}`);
      if (wouldChange.length > 12) console.error(`    … and ${wouldChange.length - 12} more`);
      process.exit(1);
    }
    console.log(`locale packs — ${langs} languages, all split to the English schema`);
    return;
  }

  console.log(
    `locale packs — ${langs} languages: ${(before / 1024 / 1024).toFixed(1)} MB → ` +
      `${(after / 1024 / 1024).toFixed(1)} MB (${(100 - (100 * after) / before).toFixed(0)}% removed)`
  );
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) main();
