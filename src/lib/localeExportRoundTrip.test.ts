/**
 * The exporter must emit what the checker wants.
 *
 * `.232` — `export-locale-json.ts` and `split-locale-packs.mjs` used to disagree
 * by construction. The exporter wrote every namespace **plus** a merged
 * `common.json`; the splitter trims each namespace to the English schema and
 * deletes `common.json` as `REDUNDANT`. So one command undid the other, and
 * `check-locale-split` was permanently one `npm run export-locales` away from
 * red.
 *
 * That is not hypothetical. `.250` ran the exporter while checking which CI
 * steps passed locally, committed 394 regenerated files with `git add -A`, and
 * CI went red on `.222`'s three footprint guards.
 *
 * The mitigations were ordering — `check-locale-split` before `export-locales`
 * in `ci.yml` — and remembering. Both worked *around* the conflict. This asserts
 * it is gone.
 *
 * ## Why this reads source rather than running the exporter
 *
 * Running it would write 400-odd files into `public/locales` as a side effect of
 * `npm test`, and a test that mutates the working tree is how the accident
 * happened in the first place. `localeFootprint.test.ts` already proves the
 * *committed* tree is split; what is missing, and what this adds, is that the
 * **producer cannot un-split it** — which is a property of the exporter's code,
 * not of any one run.
 *
 * The round-trip itself (`export-locales` then `check-locale-split`, both for
 * real) belongs in the gate and in CI, where a dirty tree is expected and
 * discarded.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/** Comments explain the rule; only code enforces it. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

test('the exporter does not write common.json', () => {
  /*
   * The file `.222` removed and `localeFootprint` guards against. The exporter
   * was recreating it on every run — so the guard was true of the committed tree
   * and false of the tree anyone got by running the documented command.
   */
  const src = stripComments(read('scripts/export-locale-json.ts'));
  assert.ok(
    !src.includes('common.json'),
    'export-locale-json.ts writes common.json again — it is REDUNDANT to the splitter and preferred by the HTTP loader'
  );
  assert.ok(
    !src.includes('buildMergedCommonStrings'),
    'the exporter is building the merged catalogue again; only i18n-fill-missing should need it'
  );
});

test('the exporter trims every namespace to the English schema', () => {
  /*
   * The other half. Without this the exporter writes each language's full
   * namespace object, which for non-English carries most of the whole catalogue
   * — the 30.8 MB `.222` found.
   *
   * Asserted on the shape of the code because the property is "it filters",
   * which no single output sample can establish: a language that happens to
   * carry no foreign keys would pass while the filter was absent.
   */
  const src = stripComments(read('scripts/export-locale-json.ts'));
  assert.match(
    src,
    /stringsFor\(\s*'en'\s*\)/,
    'the exporter no longer derives a schema from English — every language will carry its whole catalogue'
  );
  assert.match(
    src,
    /for \(const key of schema\)/,
    'the exporter no longer iterates the English schema, so foreign keys and key order are unconstrained'
  );
});

test('the splitter still owns the rule the exporter mirrors', () => {
  /*
   * `.178` insurance, pointed at the thing this PR could have made worse.
   *
   * The exporter now derives the namespace schema from `stringsFor('en')` while
   * the splitter derives it from `public/locales/en/*.json` — which is the
   * exporter's own output, so they agree by construction. If the splitter ever
   * stops deriving from English, that agreement silently ends and this file's
   * other two assertions keep passing while the invariant is gone.
   */
  const splitter = stripComments(read('scripts/split-locale-packs.mjs'));
  assert.match(
    splitter,
    /function englishSchema/,
    'the splitter no longer derives its schema from English — re-read the exporter, which assumes it does'
  );
  assert.match(
    splitter,
    /REDUNDANT\s*=\s*'common\.json'/,
    'the splitter no longer treats common.json as redundant — the exporter stopped writing it on that basis'
  );
});
