/**
 * The Athlete Page catalogue matches what the components actually ask for.
 *
 * `src/i18n/INDEX.md` requires a call-site `defaultValue` to equal the `en` pack
 * value exactly, because the two are the same string reached by different
 * routes: the pack when it loaded, the default when it did not. When they drift,
 * what an athlete reads depends on load order — the least debuggable class of
 * copy bug, and the one `.606` had just finished digging 26 rewards keys out of.
 *
 * So this derives both sides. Keys and defaults are **read out of the component
 * sources**, not listed here; a new `t('…', { defaultValue })` on either surface
 * is in scope the moment it is written, which is the property an enumerated list
 * cannot have.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { athleteStringsFor } from './athleteLocales';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/** The surfaces this catalogue exists for. */
const SOURCES = [
  'src/page-components/ProfilePage.tsx',
  'src/page-components/AccountPage.tsx',
  'src/components/profile/AthleteIdentityCard.tsx',
  'src/components/profile/CareerLineCard.tsx',
  'src/components/profile/MissionIdView.tsx',
];

/** `t('key', { defaultValue: '…' })` — single-quoted literals, the house style. */
const CALL = /t\(\s*'([A-Za-z][\w.]*)'\s*,\s*\{[^}]*?defaultValue:\s*'((?:[^'\\]|\\.)*)'/g;

function callSites(): { key: string; value: string; file: string }[] {
  const out: { key: string; value: string; file: string }[] = [];
  for (const file of SOURCES) {
    const src = read(file);
    for (const m of src.matchAll(new RegExp(CALL.source, 'g'))) {
      out.push({ key: m[1], value: m[2].replace(/\\'/g, "'"), file });
    }
  }
  return out;
}

test('the scan reaches the surfaces it claims to cover', () => {
  const sites = callSites();
  assert.ok(sites.length >= 12, `only ${sites.length} call sites parsed — the regex has drifted`);
  for (const file of SOURCES) {
    assert.ok(read(file).length > 200, `${file} is missing or empty`);
  }
  // A key this catalogue owns must actually be found, or the parse is passing on nothing.
  assert.ok(
    sites.some((s) => s.key === 'careerLineSessions'),
    'careerLineSessions was not discovered — the scan is not reading CareerLineCard'
  );
});

test('every athlete-catalogue key a component asks for is defined in English', () => {
  const en = athleteStringsFor('en');
  const missing = callSites()
    .filter((s) => s.key in en === false && s.key.startsWith('athlete') === true)
    .map((s) => `${s.key} (${s.file})`);
  assert.deepEqual(missing, [], 'an athlete* key is rendered but defined in no catalogue');
});

test('where the catalogue owns a key, the call-site default matches it exactly', () => {
  const en = athleteStringsFor('en') as Record<string, string>;
  const drift: string[] = [];
  for (const site of callSites()) {
    const packed = en[site.key];
    if (typeof packed !== 'string') continue; // owned by another namespace
    // Interpolated strings differ by construction: the call site inlines the
    // resolved value, the pack carries `{{name}}`. Compare only the plain ones.
    if (packed.includes('{{')) continue;
    if (packed !== site.value) drift.push(`${site.key}: pack "${packed}" ≠ default "${site.value}"`);
  }
  assert.deepEqual(drift, [], 'the pack and the call-site default disagree');
});

test('every language carries the full English key set', () => {
  // `al()` spreads EN, so a language can only ever be complete — this pins that
  // property rather than trusting it, since a hand-written entry could replace
  // the spread and silently drop keys for one language.
  const en = Object.keys(athleteStringsFor('en')).sort();
  for (const lang of ['en', 'es', 'pt', 'de', 'ja']) {
    const got = Object.keys(athleteStringsFor(lang)).sort();
    assert.deepEqual(got, en, `${lang} does not carry the full English key set`);
  }
});

test('no catalogue value is empty', () => {
  const empty: string[] = [];
  for (const lang of ['en', 'es', 'pt']) {
    for (const [k, v] of Object.entries(athleteStringsFor(lang))) {
      if (!v || !v.trim()) empty.push(`${lang}.${k}`);
    }
  }
  assert.deepEqual(empty, []);
});
