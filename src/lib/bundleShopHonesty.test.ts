/**
 * `.710` — leftover after specialists: Fuel/Mind/Learn shop strings and
 * BundlePage layout are other PRs. The compare table still advertised 10/18
 * Move flows (floors 32/48) and Train as unlimited plans.
 *
 * Discover TS + pack overlay + exported JSON rather than enumerating langs.
 * Mutant: "18 timed recovery" in EN Move premium.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { APP_LANGS } from '@/i18n/appLangs';
import { bundleStringsFor } from '@/i18n/bundleLocales';
import { withLocalePack } from '@/i18n/localePacks';
import { CONTENT_FLOORS } from '@/lib/contentFloors';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const MOVE_FREE = 'bundlePillarMoveFree';
const MOVE_PREMIUM = 'bundlePillarMovePremium';
const TRAIN_PREMIUM = 'bundlePillarTrainPremium';

function leftoverDigits(value: string, ...keep: number[]): string {
  let rest = value;
  for (const n of keep) {
    rest = rest.split(String(n)).join('');
  }
  return rest;
}

test('Move table merch uses floors, not the stale 10/18 trailer', () => {
  const freeN = CONTENT_FLOORS.moveFree;
  const premN = CONTENT_FLOORS.movePremium;
  assert.ok(
    Number(freeN) !== 10 && Number(premN) !== 18,
    'floors collapsed onto the stale trailer — this test would go green on the lie',
  );
  for (const lang of APP_LANGS) {
    const strings = withLocalePack(
      bundleStringsFor(lang) as unknown as Record<string, string>,
      lang,
    );
    const free = strings[MOVE_FREE];
    const prem = strings[MOVE_PREMIUM];
    assert.ok(free, `${lang}.${MOVE_FREE} missing`);
    assert.ok(prem, `${lang}.${MOVE_PREMIUM} missing`);
    assert.ok(free.includes(String(freeN)), `${lang}.${MOVE_FREE} missing floor ${freeN}: ${free}`);
    assert.ok(prem.includes(String(premN)), `${lang}.${MOVE_PREMIUM} missing floor ${premN}: ${prem}`);
    assert.doesNotMatch(
      leftoverDigits(free, freeN, premN),
      /10|18/,
      `${lang}.${MOVE_FREE} still carries a stale 10/18 (${free})`,
    );
    assert.doesNotMatch(
      leftoverDigits(prem, freeN, premN),
      /10|18/,
      `${lang}.${MOVE_PREMIUM} still carries a stale 10/18 (${prem})`,
    );
  }
});

test('stale 18-flow EN merch goes red', () => {
  const en = bundleStringsFor('en');
  assert.doesNotMatch(en.bundlePillarMovePremium, /18 timed/);
  assert.ok(en.bundlePillarMovePremium.includes(String(CONTENT_FLOORS.movePremium)));
});

test('Train table merch is log-cited why + adapt, not unlimited plans', () => {
  for (const lang of APP_LANGS) {
    const strings = withLocalePack(
      bundleStringsFor(lang) as unknown as Record<string, string>,
      lang,
    );
    const train = strings[TRAIN_PREMIUM];
    assert.ok(train, `${lang}.${TRAIN_PREMIUM} missing`);
    assert.doesNotMatch(train, /unlimited/i, `${lang}.${TRAIN_PREMIUM} still sells unlimited plans (${train})`);
    assert.match(train, /adapt/i, `${lang}.${TRAIN_PREMIUM} dropped adapt (${train})`);
  }
});

test('pack overlays cannot re-lie on leftover Move/Train keys — discover packs', () => {
  const packsDir = path.join(root, 'src/i18n/packs');
  const files = readdirSync(packsDir).filter((f) => f.endsWith('.json'));
  assert.ok(files.length >= 10, `expected locale packs, found ${files.length}`);
  for (const file of files) {
    const pack = JSON.parse(read(`src/i18n/packs/${file}`)) as Record<string, string>;
    for (const [key, floor] of [
      [MOVE_FREE, CONTENT_FLOORS.moveFree],
      [MOVE_PREMIUM, CONTENT_FLOORS.movePremium],
    ] as const) {
      const value = pack[key];
      if (value === undefined) continue;
      assert.ok(value.includes(String(floor)), `pack ${file} ${key} dropped floor ${floor}`);
      assert.doesNotMatch(
        leftoverDigits(value, floor),
        /10|18/,
        `pack ${file} ${key} re-types 10/18 (${value})`,
      );
    }
    const train = pack[TRAIN_PREMIUM];
    if (train !== undefined) {
      assert.doesNotMatch(train, /unlimited/i, `pack ${file} ${TRAIN_PREMIUM} re-sells unlimited`);
    }
  }
});

test('exported bundle.json cannot re-lie on leftover Move/Train keys — discover locales', () => {
  const localesDir = path.join(root, 'public/locales');
  const langs = readdirSync(localesDir).filter((name) => {
    try {
      return readdirSync(path.join(localesDir, name)).includes('bundle.json');
    } catch {
      return false;
    }
  });
  assert.ok(langs.length >= 10, `expected exported bundle.json langs, found ${langs.length}`);
  for (const lang of langs) {
    const json = JSON.parse(read(`public/locales/${lang}/bundle.json`)) as Record<string, string>;
    const free = json[MOVE_FREE];
    const prem = json[MOVE_PREMIUM];
    const train = json[TRAIN_PREMIUM];
    assert.ok(free, `${lang}/bundle.json missing ${MOVE_FREE}`);
    assert.ok(prem, `${lang}/bundle.json missing ${MOVE_PREMIUM}`);
    assert.ok(train, `${lang}/bundle.json missing ${TRAIN_PREMIUM}`);
    assert.ok(free.includes(String(CONTENT_FLOORS.moveFree)), `${lang} Move free missing floor`);
    assert.ok(prem.includes(String(CONTENT_FLOORS.movePremium)), `${lang} Move premium missing floor`);
    assert.doesNotMatch(leftoverDigits(prem, CONTENT_FLOORS.movePremium, CONTENT_FLOORS.moveFree), /18/);
    assert.doesNotMatch(train, /unlimited/i, `${lang}/bundle.json Train still unlimited`);
  }
});

test('help vs-stack page names the four-app stack and refuses a trial', () => {
  const help = read('docs/help/super-bundle-vs-stack.md');
  assert.match(help, /MyFitnessPal/);
  assert.match(help, /Pliability/);
  assert.match(help, /Calm/);
  assert.match(help, /no trial/i);
  assert.match(help, /inputs/);
  assert.match(help, /adapt/i);
  const index = read('docs/help/INDEX.md');
  assert.match(index, /super-bundle-vs-stack\.md/);
});

test('this leftover does not steal specialist surfaces', () => {
  const plan = read('docs/SUPER_BUNDLE_SHOP_HONESTY_PLAN.md');
  assert.match(plan, /#498/);
  assert.match(plan, /#497/);
  assert.match(plan, /#499/);
  assert.match(plan, /#501/);
  assert.match(plan, /#502/);
  assert.match(plan, /do not collide/i);
  assert.match(plan, /BundlePage/);
});
