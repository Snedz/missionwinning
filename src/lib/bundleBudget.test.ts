/**
 * The ratchet on the byte budget, and the imports that must never come back.
 *
 * `.209` — `localeHttpLoader.ts` imported `LOCALE_EXPORTS` from
 * `@/lib/exportLocales` to read two metadata fields, and that import dragged 28
 * `*Locales.ts` modules plus `@/i18n/localePacks`'s 14 JSON packs onto the
 * critical path of **every route**, through the root layout:
 *
 *     app/layout.tsx → I18nPwaProvider → LocaleHttpSync → localeHttpLoader
 *                    → exportLocales → localePacks → 14 × packs/*.json
 *
 * Measured result: one `chunks/7660-…js` at **1,053,845 B raw / 313,839 B
 * gzipped**, a plain `<script async>` on `/`, `/log` and `/active` — 44 % of the
 * initial JS on the logger. An English user in Nairobi on 3G downloaded Thai,
 * Vietnamese and Hindi before first paint, and both `i18n/hydrateResources.ts`
 * and `src/i18n.ts` carried header comments claiming the opposite. Both were
 * true of the source and false of the build.
 *
 * Two rules, because the byte budget and the import rule fail at different
 * times: the budget needs `.next/`, this file does not. A source-text rule that
 * runs in the unit lane catches the mistake in seconds, before anyone builds.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

const SCRIPT = 'scripts/bundle-budget.mjs';

/**
 * The worst it has been since the budget existed, recorded 2026-07-30 with the
 * caps as first set. Lowering a cap is a one-line change; **raising one means
 * editing this file too**, with the reason visible in the diff — the `.202`
 * shape, for the same reason: a cap that follows reality is not a cap, it is a
 * changelog of the debt.
 */
const HIGH_WATER_KB: Record<string, number> = {
  // `/` is the PRIVATE_MODE=false landing page, which is what the gate builds —
  // see the note at BUDGETS_KB. A gated production build serves the six-chunk
  // teaser at 164 KB instead.
  '/': 262,
  '/log': 280,
  '/active': 435,
};

function declaredBudgets(): Record<string, number> {
  const src = read(SCRIPT);
  const block = src.slice(src.indexOf('const BUDGETS_KB'), src.indexOf('const ROUTE_HTML'));
  const out: Record<string, number> = {};
  for (const m of block.matchAll(/'([^']+)':\s*(\d+)/g)) out[m[1]] = Number(m[2]);
  return out;
}

test('every budgeted route still has a budget', () => {
  const declared = declaredBudgets();
  assert.deepEqual(
    Object.keys(declared).sort(),
    Object.keys(HIGH_WATER_KB).sort(),
    'a route dropped out of BUDGETS_KB — deleting the cap is the quietest way to pass it'
  );
});

test('the byte caps only ever move down', () => {
  for (const [route, cap] of Object.entries(declaredBudgets())) {
    const high = HIGH_WATER_KB[route];
    assert.ok(
      cap <= high,
      `${route}: budget raised to ${cap} KB (high-water ${high} KB). ` +
        `Raising the cap is how a size gate becomes a record of how big things got. ` +
        `If the growth is genuinely justified, say so at the constant and raise HIGH_WATER_KB here in the same commit.`
    );
  }
});

test('the bundle budget runs in the gate', () => {
  assert.match(
    read('scripts/gate.mjs'),
    /\[\s*'run',\s*'bundle-budget'\s*\]/,
    'the byte budget must run in the gate — it is the only check that can see a 306 KB regression, ' +
      'and 306 KB shipped through a green gate because it did not exist'
  );
});

/**
 * The import rule. `localeHttpLoader` is reached from the root layout, so
 * anything it pulls in is on every route — which makes it the one file where a
 * convenience import is a global cost.
 */
const ROOT_LAYOUT_REACH = [
  'src/lib/localeHttpLoader.ts',
  'src/components/i18n/LocaleHttpSync.tsx',
  'app/i18n-pwa-provider.tsx',
];

/** Modules that pull whole locale bodies. A `type` import is fine — it is erased. */
const NEVER_STATIC = ['@/lib/exportLocales', '@/i18n/localePacks'];

test('nothing on the root-layout path statically imports the locale bodies', () => {
  const offenders: string[] = [];
  for (const file of ROOT_LAYOUT_REACH) {
    const src = stripComments(read(file));
    for (const mod of NEVER_STATIC) {
      // `import type { … } from '…'` is erased at compile time and costs nothing.
      const valueImport = new RegExp(`import\\s+(?!type\\b)[^;]*from\\s+'${mod.replace(/[/@]/g, '\\$&')}'`);
      if (valueImport.test(src)) offenders.push(`${file} → ${mod}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    'these sit on the root-layout path and drag every locale body onto every route:\n  ' +
      offenders.join('\n  ') +
      '\n  Import `@/i18n/localeExportManifest` for metadata; it has no imports of its own.'
  );
});

/** And the manifest has to stay metadata-only, or the split it exists for is undone. */
test('the locale manifest imports nothing', () => {
  const src = stripComments(read('src/i18n/localeExportManifest.ts'));
  const imports = [...src.matchAll(/^import\s.*$/gm)].map((m) => m[0]);
  assert.deepEqual(
    imports,
    [],
    'localeExportManifest.ts exists precisely because it has no imports — one here reopens ' +
      `the path that put 306 KB on every route:\n  ${imports.join('\n  ')}`
  );
});
