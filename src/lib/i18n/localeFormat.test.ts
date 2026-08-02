/**
 * Nothing formats or collates against the *browser's* locale.
 *
 * `Intl` has an ambient default, and reaching it is the absence of an argument —
 * `toLocaleDateString()` and `toLocaleDateString(undefined, {…})` are the same
 * call, and both ask the browser rather than the app. In a product shipping
 * fifteen languages that is not a nicety: `1234` is `1.234` in German and
 * `12,34,567` groups as lakh in Hindi, and this app's screens are mostly numbers.
 *
 * `.242` measured it before fixing it — **42 formatting sites in 22 files**, plus
 * **17 `localeCompare` sites in 12** — and the two halves needed different rules,
 * so this file states both.
 *
 * ## Why the pattern list is closed
 *
 * `.212`'s rule: *a guard keyed to one spelling of a defect has only ever tested
 * that spelling*, and it earned that rule by closing its own list on the wrong
 * axis — it enumerated ways to *slice* an ISO string and so never saw the ways to
 * *compare* one, missing fifteen sites. So the axis here is **"how does a value
 * reach the ambient locale"**, and JavaScript offers exactly three doors:
 *
 *   1. `Date.prototype.toLocaleDateString` / `toLocaleTimeString` /
 *      `toLocaleString`, and `Number.prototype.toLocaleString` — the same three
 *      method names cover both prototypes.
 *   2. Any `Intl.*` constructor — `DateTimeFormat`, `NumberFormat`,
 *      `RelativeTimeFormat`, `ListFormat`, `PluralRules`, `Collator`,
 *      `DisplayNames`, `Segmenter`, and whatever TC39 adds next. Matched by
 *      `new Intl.<anything>(` rather than by name, so a future one cannot slip
 *      through the way a name list would.
 *   3. `String.prototype.localeCompare`.
 *
 * There is no fourth. A date or number cannot consult the browser's locale
 * without going through one of these.
 *
 * ## The two rules
 *
 * **Formatting** must go through
 * [`formatLocale.ts`](./formatLocale.ts), whose `lang` is a required positional
 * so the compiler catches the next one before this scan has to.
 *
 * **Collation** must name its locale. That rule does more work than it looks
 * like: eleven of the seventeen `localeCompare` calls sorted `YYYY-MM-DD` or ISO
 * timestamps — machine keys, where collation is meaningless and a linguistic
 * comparison is merely a slower `<` (`.210` clocked one of these per tick on
 * `/active`). Requiring a locale makes that absurdity visible at the call site,
 * so those became plain comparisons and the rule needs **no allowlist for them
 * at all** — which is the strongest form available, since an allowlist that
 * fills up is an allowlist that has replaced its rule.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.tsx?$/.test(abs)) out.push(path.relative(root, abs));
  }
  return out;
}

const isTest = (p: string) => /\.(test|routetest)\.tsx?$/.test(p);
const PRODUCT_SOURCE = [
  ...walk(path.join(root, 'src')),
  ...walk(path.join(root, 'app')),
].filter((p) => !isTest(p));

/**
 * Comments describe intent; only code calls anything.
 *
 * `check-design-system.mjs` solved this once and wrote down why — *a guard that
 * punishes documented reasoning gets switched off* — and `.241`'s off-palette
 * rule proved it by failing on the comment that explained a removal. Every
 * docblock in this wave names the methods it replaced, so without this the guard
 * would fire hardest on the files that fixed the bug.
 */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

/** Door 1 and door 2, in both their no-argument and explicit-`undefined` forms. */
const AMBIENT_FORMAT = [
  { re: /\.toLocale(?:Date|Time)?String\(\s*\)/g, what: 'toLocale*String() with no locale' },
  {
    re: /\.toLocale(?:Date|Time)?String\(\s*undefined/g,
    what: 'toLocale*String(undefined, …) — `undefined` *is* "ask the browser"',
  },
  { re: /new Intl\.\w+\(\s*\)/g, what: 'new Intl.*() with no locale' },
  { re: /new Intl\.\w+\(\s*undefined/g, what: 'new Intl.*(undefined, …)' },
];

/** Door 3. A single-argument call is a comparison with no locale. */
const AMBIENT_COLLATE = /\.localeCompare\(\s*[^,()]*\s*\)/g;

/**
 * Where the ambient locale is the only one that exists.
 *
 * An entry carries a reason and is checked **in both directions**: it must still
 * exist and must still match, or it is a rule that has quietly stopped applying
 * (`.219`, `.220`, and `UTC_IS_CORRECT` in `reachability.test.ts`).
 */
const AMBIENT_IS_CORRECT: { file: string; why: string }[] = [
  {
    file: 'src/lib/i18n/formatLocale.ts',
    why: 'The one home. Every ambient-looking call here has already resolved an explicit tag through resolveFormatLocale — this is the file the rule points every other file at.',
  },
];

test('no date or number is formatted against the browser locale', () => {
  const exempt = new Set(AMBIENT_IS_CORRECT.map((e) => e.file));

  for (const { file, why } of AMBIENT_IS_CORRECT) {
    assert.ok(why.trim().length > 40, `${file}: an exemption needs a real reason, not a note`);
    assert.ok(PRODUCT_SOURCE.includes(file), `${file} is exempt but no longer exists — drop the entry`);
  }

  const offenders: string[] = [];
  for (const file of PRODUCT_SOURCE) {
    if (exempt.has(file)) continue;
    const src = stripComments(read(file));
    for (const { re, what } of AMBIENT_FORMAT) {
      const hits = src.match(new RegExp(re.source, 'g'));
      if (hits) offenders.push(`${file} — ${hits.length}× ${what}`);
    }
  }

  assert.deepEqual(
    offenders,
    [],
    'These follow navigator.language, not the athlete\'s choice. Use ' +
      '`formatLocalDate` / `formatLocalNumber` from src/lib/i18n/formatLocale.ts, ' +
      'or `useLocaleFormat()` in a component:\n  ' +
      offenders.join('\n  ')
  );
});

test('a comparison that claims to be linguistic names its language', () => {
  const offenders: string[] = [];
  for (const file of PRODUCT_SOURCE) {
    const hits = stripComments(read(file)).match(AMBIENT_COLLATE);
    if (hits) offenders.push(`${file} — ${hits.length}× ${hits[0]!.trim()}`);
  }

  assert.deepEqual(
    offenders,
    [],
    'localeCompare with no locale sorts by whatever the browser decides. If the ' +
      'values are language (names, labels), pass a locale. If they are machine ' +
      'keys (YYYY-MM-DD, ISO timestamps, ids), do not claim a linguistic ' +
      'comparison at all — use `a < b ? -1 : a > b ? 1 : 0`:\n  ' +
      offenders.join('\n  ')
  );
});

/**
 * The guard can see the product, and would notice if it stopped.
 *
 * `.220`'s defect is a check whose *name* claims a scope wider than its
 * *enumeration*. This one discovers, so the failure mode is different and
 * quieter: a broken `walk` or a bad extension filter yields an empty file list
 * and a green run over nothing.
 */
test('the scan actually reaches the product', () => {
  assert.ok(PRODUCT_SOURCE.length > 400, `only ${PRODUCT_SOURCE.length} source files found`);
  assert.ok(
    PRODUCT_SOURCE.includes('src/page-components/HistoryPage.tsx'),
    'the file that held eight of the original offenders is not in the scan'
  );
  assert.ok(
    PRODUCT_SOURCE.some((f) => f.startsWith('app/')),
    'app/ is not being walked'
  );
  assert.equal(
    PRODUCT_SOURCE.filter(isTest).length,
    0,
    'test files must not be scanned — their fixtures name the defect on purpose'
  );

  // And the patterns still match the thing they describe, so a regex edited into
  // uselessness fails here rather than passing everywhere.
  const sample = 'const x = d.toLocaleDateString(); const y = new Intl.NumberFormat();';
  assert.ok(AMBIENT_FORMAT.some(({ re }) => new RegExp(re.source).test(sample)));
  assert.ok(new RegExp(AMBIENT_COLLATE.source).test('a.localeCompare(b)'));
  assert.ok(
    !new RegExp(AMBIENT_COLLATE.source).test('a.localeCompare(b, lang)'),
    'a call that names its locale must not be reported'
  );
});
