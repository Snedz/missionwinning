#!/usr/bin/env node
/**
 * Export i18n namespace JSON for translator handoff (G2).
 * Run: npm run export-locales
 *
 * ## It emits the split shape, because the alternative fights the splitter
 *
 * `.232` — this script used to write, per language, every namespace **plus a
 * merged `common.json`**. `split-locale-packs.mjs` enforces the exact opposite:
 * each non-English namespace carries only the keys English puts in it, and
 * `common.json` must not exist (it is that file's `REDUNDANT`).
 *
 * So the two disagreed by construction, and running this turned *"15 languages,
 * all split"* into *"392 files carry keys outside their namespace"*. `.222` cut
 * this directory 30.8 MB → 2.1 MB and wrote the splitter to be **re-runnable**
 * precisely because *"a cleanup that cannot be repeated undoes itself the next
 * time the fill tool runs."* It did: `.230` ran this script while checking which
 * CI steps passed locally, committed the 394 regenerated files with `git add -A`,
 * and CI caught it on `.222`'s own guards.
 *
 * The mitigations at the time were ordering (`check-locale-split` had to run
 * before this step in CI) and remembering not to run it before committing. Both
 * work *around* the conflict. This removes it: the producer now emits what the
 * checker wants, so `npm run export-locales` is safe to run at any point and
 * `npm run check-locale-split` passes immediately afterwards.
 *
 * ## English defines the namespaces
 *
 * The splitter derives that schema by reading `public/locales/en/*.json` — this
 * script's own output. Here it comes from `entry.stringsFor('en')`, the upstream
 * source of those same files, so the two agree by construction rather than by a
 * copied rule. Reading the schema off disk here would be circular.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { LOCALE_EXPORTS, localeExportSummary } from '../src/lib/exportLocales';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outRoot = join(root, 'public/locales');

let fileCount = 0;
let droppedKeys = 0;

for (const entry of LOCALE_EXPORTS) {
  /*
   * The namespace's key set and order, taken from English once per namespace.
   * Iterating this rather than the language's own object is what both drops
   * foreign keys and fixes key order — the same two effects the splitter
   * describes, for the same reason: stable output across runs.
   */
  const schema = Object.keys(entry.stringsFor('en') as Record<string, string>);

  for (const lang of entry.langs) {
    const strings = entry.stringsFor(lang) as Record<string, string>;
    const trimmed: Record<string, string> = {};
    for (const key of schema) if (key in strings) trimmed[key] = strings[key];

    droppedKeys += Object.keys(strings).length - Object.keys(trimmed).length;

    const dir = join(outRoot, lang);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, entry.filename), JSON.stringify(trimmed, null, 2) + '\n');
    fileCount++;
  }
}

/*
 * No `common.json`.
 *
 * It was the entire 1,687-key catalogue repeated in every language, and
 * `fetchLocaleHttpOverrides` preferred it — so leaving it meant the loader kept
 * choosing the big file. `.222` removed it and `localeFootprint.test.ts`'s
 * "common.json does not come back" has guarded it ever since; this script was
 * quietly putting it back on every run.
 *
 * `buildMergedCommonStrings` stays exported — `i18n-fill-missing` uses it to find
 * gaps across the merged catalogue, which is a different job from shipping a file
 * to the browser.
 */

const summary = localeExportSummary();
console.log(
  `Done: ${fileCount} files, ${summary.namespaces} namespaces, ${summary.langs} langs — ` +
    `split to the English schema${droppedKeys > 0 ? `, ${droppedKeys} out-of-namespace keys dropped` : ''}.`
);
