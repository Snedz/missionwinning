/**
 * What the app makes an athlete download, and how many copies of it exist.
 *
 * `.222` — the same translations existed **three times**: compiled into
 * `src/i18n/*Locales.ts` (504 KB), again in `src/i18n/packs/*.json` (1.1 MB),
 * and again in `public/locales/**` (32 MB, 435 files).
 *
 * The third copy was not a variant. `public/locales/ja/common.json` and
 * `src/i18n/packs/ja.json` shared **947 keys with 100% byte-identical values**.
 * And `LocaleHttpSync` fetched it — the whole 1,687-key catalogue, 40–49 KB
 * gzipped, with `cache: 'no-cache'` so the browser cache never helped — on
 * **every app load**, to overwrite values already in the bundle.
 *
 * `.209` spent a PR removing 306 KB of locale packs from the critical path.
 * This put ~45 KB back where `bundle-budget.mjs` could not see it, because that
 * budget measures gzipped *initial JS* and this was a runtime `fetch`.
 *
 * Three things are held shut here: the fetch stays **opt-in**, the packs stay
 * **split**, and the copies stay **in agreement**.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');
const readJson = (p: string) => JSON.parse(read(p)) as Record<string, string>;

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

const LOCALES = 'public/locales';
const langs = () =>
  readdirSync(path.join(root, LOCALES)).filter((d) =>
    existsSync(path.join(root, LOCALES, d, 'fuel.json'))
  );

/* ── The fetch is opt-in ─────────────────────────────────────────────────── */

test('the override fetch does not fire for an ordinary athlete', () => {
  /*
   * The whole point. This path is a translator tool; it was on for everyone,
   * costing ~45 KB uncached per load to merge in values that were already
   * present and identical.
   */
  const src = stripComments(read('src/lib/localeHttpLoader.ts'));
  const fn = src.slice(src.indexOf('export function shouldLoadLocaleHttp'));
  const body = fn.slice(0, fn.indexOf('\n}'));

  assert.match(body, /locale-http/, 'a translator must be able to turn it on');
  assert.match(body, /LOCALE_HTTP_FLAG|mw_locale_http/, 'and have it stick across a reload');
  assert.doesNotMatch(
    body,
    /return\s+process\.env\.NEXT_PUBLIC_LOCALE_HTTP\s*!==\s*'false';?\s*$/,
    'on-unless-disabled is what made every athlete pay for a tool they never use'
  );
});

test('the kill switch still wins over the opt-in', () => {
  // An env flag that a query param can override is not a kill switch.
  const src = stripComments(read('src/lib/localeHttpLoader.ts'));
  const fn = src.slice(src.indexOf('export function shouldLoadLocaleHttp'));
  const body = fn.slice(0, fn.indexOf('\n}'));
  const envIdx = body.indexOf('NEXT_PUBLIC_LOCALE_HTTP');
  const paramIdx = body.indexOf('locale-http');
  assert.ok(envIdx !== -1 && paramIdx !== -1);
  assert.ok(envIdx < paramIdx, 'the env kill switch must be checked before the opt-in');
});

/* ── The packs stay split ────────────────────────────────────────────────── */

test('no namespace file carries keys from another namespace', () => {
  /*
   * English was split correctly and no other language was: `ja/coach.json` and
   * `ja/fuel.json` shared 947 keys, which is how 2.0 MB of content became
   * 30.8 MB. English is the schema; `scripts/split-locale-packs.mjs` restores
   * this, and re-running it must be a no-op.
   */
  const schema = new Map<string, Set<string>>();
  for (const file of readdirSync(path.join(root, LOCALES, 'en'))) {
    if (!file.endsWith('.json')) continue;
    schema.set(file, new Set(Object.keys(readJson(`${LOCALES}/en/${file}`))));
  }

  const offenders: string[] = [];
  for (const lang of langs()) {
    for (const [file, keys] of schema) {
      const p = `${LOCALES}/${lang}/${file}`;
      if (!existsSync(path.join(root, p))) continue;
      const foreign = Object.keys(readJson(p)).filter((k) => !keys.has(k));
      if (foreign.length) offenders.push(`${lang}/${file} (+${foreign.length})`);
    }
  }
  assert.deepEqual(offenders.slice(0, 8), [], 'run node scripts/split-locale-packs.mjs');
});

test('common.json does not come back', () => {
  /*
   * It is every key again — a fourth copy — and `fetchLocaleHttpOverrides`
   * *prefers* it, so its mere presence would put the loader back on the
   * 1,687-key file even with the namespace files correct.
   */
  const back = langs().filter((l) => existsSync(path.join(root, LOCALES, l, 'common.json')));
  assert.deepEqual(back, []);
});

test('the footprint stays down', () => {
  /*
   * A ratchet, the shape `.202`/`.209`/`.219`/`.221` all use: down only. 30.8 MB
   * before; 2.1 MB after. The cap has slack for real translation growth but not
   * for the duplication coming back.
   */
  let bytes = 0;
  for (const lang of langs()) {
    for (const f of readdirSync(path.join(root, LOCALES, lang))) {
      if (f.endsWith('.json')) bytes += Buffer.byteLength(read(`${LOCALES}/${lang}/${f}`));
    }
  }
  const mb = bytes / 1024 / 1024;
  assert.ok(mb < 4, `public/locales is ${mb.toFixed(1)} MB; it was 2.1 MB at \`.222\` and 30.8 MB before`);
});

/* ── The copies agree ────────────────────────────────────────────────────── */

test('the shipped packs and the public files do not disagree', () => {
  /*
   * `.178`, applied to data rather than code. Three copies of a string is three
   * chances to drift, and a drifted copy is invisible until someone switches
   * language. Values must match where both hold a key.
   *
   * Discover every pack file rather than enumerate a sample (`.220`). `.489`
   * fixed ja public/pack drift from `.484` placeholders; `.490` fixed hi/vi/th
   * Unicode keys — both would have been invisible while this test only sampled
   * ja/es/de/ar.
   */
  const packsDir = path.join(root, 'src/i18n/packs');
  const packLangs = readdirSync(packsDir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .filter((lang) => lang !== 'en');
  assert.ok(packLangs.length >= 10, `expected many pack langs, got ${packLangs.length}`);

  const disagreements: string[] = [];
  for (const lang of packLangs) {
    const packPath = `src/i18n/packs/${lang}.json`;
    const pack = readJson(packPath);
    const langDir = path.join(root, LOCALES, lang);
    if (!existsSync(langDir)) {
      disagreements.push(`${lang}:missing-public-dir`);
      continue;
    }

    const merged: Record<string, string> = {};
    for (const f of readdirSync(langDir)) {
      if (f.endsWith('.json')) Object.assign(merged, readJson(`${LOCALES}/${lang}/${f}`));
    }
    for (const [k, v] of Object.entries(pack)) {
      if (k in merged && merged[k] !== v) disagreements.push(`${lang}:${k}`);
    }
  }
  assert.deepEqual(disagreements.slice(0, 8), [], 'a copy drifted — one of them is now lying');
});

/**
 * Four keys are declared in two namespaces with **different English values**, so
 * whichever file merges last wins.
 *
 * `common.json` was silently resolving this; removing it exposes it. Inert for
 * athletes today — nothing fetches these files unless a translator opts in — but
 * real, and it is `.178` in the data: one word, two meanings.
 *
 * Recorded rather than fixed, because the fix is not a data change: `fuelTitle`
 * is the Fuel *page* heading in one and the Today *card* heading in the other.
 * They need two keys and two call-site edits, which is a different PR from one
 * about weight.
 */
test('no new key is claimed by two namespaces with different meanings', () => {
  const KNOWN = new Set(['fuelTitle', 'fuelSubtitle', 'fuelScienceCh5', 'fuelScienceCh12']);

  const owners = new Map<string, Map<string, string>>();
  for (const file of readdirSync(path.join(root, LOCALES, 'en'))) {
    if (!file.endsWith('.json')) continue;
    for (const [k, v] of Object.entries(readJson(`${LOCALES}/en/${file}`))) {
      if (!owners.has(k)) owners.set(k, new Map());
      owners.get(k)!.set(file, v);
    }
  }

  const conflicts = [...owners.entries()]
    .filter(([, o]) => new Set(o.values()).size > 1)
    .map(([k]) => k)
    .filter((k) => !KNOWN.has(k));

  assert.deepEqual(
    conflicts,
    [],
    'a key means two different things in two namespaces; whichever loads last wins'
  );
});
