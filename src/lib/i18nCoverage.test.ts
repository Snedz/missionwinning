/**
 * The ratchet only turns one way.
 *
 * `scripts/i18n-coverage.ts` caps the number of `t('key')` calls whose key
 * exists in no EN pack. A cap is only useful if it cannot be raised to whatever
 * the current number happens to be — the obvious response to a red coverage
 * check is "bump the constant", and that converts the guard into a record of
 * how bad things got.
 *
 * So the cap is asserted here against a **high-water mark that is checked in**.
 * Lowering `MAX_UNCOVERED_KEYS` is a one-line change; raising it means editing
 * this file too, with the reason visible in the diff.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const SCRIPT = 'scripts/i18n-coverage.ts';

/**
 * The cap this guard permits — held in **lockstep** with the live
 * `MAX_UNCOVERED_KEYS`, the way `coverageBudget.test.ts` holds its floors.
 *
 * It used to record the worst the count had ever been (665 at first
 * measurement; 710 after `.202` made 42 hardcoded strings visible to the counter
 * for the first time). As a *permission* that reading was wrong. The assertion
 * is `cap <= HIGH_WATER`, so while the live cap sat at 16 this guard would have
 * stayed green through a raise to 710 — a **44× loosening**, on the one ratchet
 * that had already been breached three times in a month (16 → 48 during the
 * Aug-5 wave, 58 by `.561`). A guard whose limit is 44× the thing it guards is
 * not measuring that thing; it is the `.219` saturated-`npm audit` shape, where
 * a check spends its whole life unable to fail.
 *
 * Lockstep restores the property that makes the sibling ratchets work: raising
 * the cap now requires editing this file *and* the script in the same commit,
 * where a reviewer can see both halves of the decision.
 */
const HIGH_WATER = 0;

function declaredCap(): number {
  const m = /const MAX_UNCOVERED_KEYS = (\d+);/.exec(read(SCRIPT));
  assert.ok(m, `${SCRIPT} no longer declares MAX_UNCOVERED_KEYS — this guard is pointing at the wrong thing`);
  return Number(m![1]);
}

test('the uncovered-key cap never rises', () => {
  const cap = declaredCap();
  assert.ok(
    cap <= HIGH_WATER,
    `MAX_UNCOVERED_KEYS was raised to ${cap} (high-water ${HIGH_WATER}). ` +
      `Raising the cap is how a coverage gate becomes a changelog of the debt. ` +
      `If a key genuinely became visible for the first time — the .202 case — say so at the constant and raise HIGH_WATER here in the same commit.`
  );
});

test('the coverage script is in the gate', () => {
  const gate = read('scripts/gate.mjs');
  assert.match(
    gate,
    /\[\s*'run',\s*'i18n:coverage'\s*\]/,
    'i18n:coverage must run in the gate — `i18n:parity` cannot see these keys by construction, so nothing else would'
  );
});

/**
 * The escape hatch, kept uncomfortable. A `SKIP_UNTRANSLATED` row without a
 * reason is how a component stops being translated and nobody notices.
 */
test('every SKIP_UNTRANSLATED row carries a reason', () => {
  const src = read(SCRIPT);
  const block = src.slice(src.indexOf('SKIP_UNTRANSLATED'), src.indexOf('const UI_DIRS'));
  const files = [...block.matchAll(/file:\s*'([^']+)'/g)].map((m) => m[1]);
  const reasons = [...block.matchAll(/why:\s*\n?\s*'([^']*)'/g)].map((m) => m[1]);
  assert.equal(
    files.length,
    reasons.length,
    `${files.length} SKIP_UNTRANSLATED files but ${reasons.length} reasons — every row needs one`
  );
  for (const [i, why] of reasons.entries()) {
    assert.ok(why.trim().length > 0, `SKIP_UNTRANSLATED row ${files[i]} has an empty reason`);
  }
});

/**
 * `behaviors.ts` shipped `labelKey`/`receiptKey` in `.190` and nothing read them
 * for eleven builds — every consumer took the `*Default` English instead, so the
 * library was i18n-ready and its only renderer ignored that. `.202` wired them
 * up; this keeps them wired.
 */
test('BehaviorStrip renders the registry key pairs, not the English defaults', () => {
  const src = read('src/components/pillars/BehaviorStrip.tsx');
  assert.match(src, /t\(\s*meta\.labelKey/, 'labels must resolve through labelKey');
  assert.match(src, /t\(\s*meta\.receiptKey/, 'receipts must resolve through receiptKey');
});
