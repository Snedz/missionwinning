/**
 * Coach, the logger, and Today stay blind to the minis capability bus.
 *
 * Discover those trees rather than listing two files: a new coach helper that
 * imported `@/lib/minis` would otherwise be invisible. Importers of the adapter
 * must live under `src/lib/minis/` — an unreviewed importer is a fail.
 *
 * Package specifiers (`@missionwinning/mw-core`) do not resolve through
 * `resolveSpecifier`; those spellings are listed and the list is closed against
 * `packages/mw-core/package.json` exports.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import {
  doorSymbolsUsed,
  importsOf,
  reaches,
  resolveSpecifier,
  stripComments,
} from '@/lib/domainBoundary';

const root = path.join(import.meta.dirname, '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(path.join(root, dir));
  } catch {
    return out;
  }
  for (const name of entries) {
    const rel = `${dir}/${name}`;
    const st = statSync(path.join(root, rel));
    if (st.isDirectory()) walk(rel, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.(test|routetest)\.(ts|tsx)$/.test(name)) {
      out.push(rel);
    }
  }
  return out;
}

const read = (file: string): string | null => {
  try {
    return readFileSync(path.join(root, file), 'utf8');
  } catch {
    return null;
  }
};

const exists = (p: string) => read(p) !== null;

const MINIS_ADAPTER = ['src/lib/minis/'] as const;
const ALLOW_PREFIX = 'src/lib/minis/';

/**
 * Value names that *are* the bus. Types (`ModuleManifest`) and reserved
 * constants (`UTILITY_CLEARSHOT_MANIFEST`) may be named from docs/tests;
 * these doors may not be imported outside `src/lib/minis/`.
 */
const BUS_SYMBOLS = new Set([
  'assertCapability',
  'resolveRegisteredMini',
  'readIdentity',
  'readBilling',
  'readPhotos',
  'writePhotos',
  'readStorage',
  'writeStorage',
  'createMiniBus',
  'lookupMini',
  'MINI_REGISTRY',
]);

/**
 * Closed: the only mw-core export paths that re-export the bus.
 * If package.json grows another, this list must grow in the same PR.
 */
const CORE_BUS_SPECS = ['@missionwinning/mw-core', '@missionwinning/mw-core/module'] as const;

function resolveEdge(spec: string, fromFile: string): string | null {
  const hit = resolveSpecifier(spec, fromFile, exists);
  if (hit) return hit;
  if ((CORE_BUS_SPECS as readonly string[]).includes(spec)) return spec;
  return null;
}

function isModuleBarrel(spec: string, resolved: string | null): boolean {
  if ((CORE_BUS_SPECS as readonly string[]).includes(spec)) return true;
  return resolved === 'packages/mw-core/src/module/index.ts';
}

function importsMinisBus(file: string, source: string): boolean {
  const stripped = stripComments(source);
  for (const edge of importsOf(stripped, file)) {
    if (/@\/lib\/minis/.test(edge.spec)) return true;
    if (/\/minis\/(?:bus|registry)/.test(edge.spec)) return true;
    if (/module\/capabilities/.test(edge.spec)) return true;
    const next = resolveEdge(edge.spec, file);
    if (next?.startsWith('src/lib/minis/')) return true;
    if (next === 'packages/mw-core/src/module/capabilities.ts') return true;
    if (isModuleBarrel(edge.spec, next)) {
      const star = new RegExp(
        `import\\s+\\*\\s+as\\s+\\w+\\s+from\\s+['"]${edge.spec.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`
      );
      if (star.test(stripped)) return true;
      const used = doorSymbolsUsed(stripped, file, next ?? edge.spec, resolveEdge);
      if (used.some((name) => BUS_SYMBOLS.has(name))) return true;
    }
  }
  return false;
}

const BLIND_ROOTS = ['src/lib/coach/', 'src/store/', 'packages/mw-core/src/coach/'] as const;
const BLIND_FILES = [
  'src/page-components/HomePage.tsx',
  'src/page-components/ActiveWorkoutPage.tsx',
] as const;

function blindEntries(): string[] {
  return [...BLIND_ROOTS.flatMap((d) => walk(d)), ...BLIND_FILES];
}

test('coach, store, HomePage, and ActiveWorkoutPage do not import the minis bus', () => {
  const entries = blindEntries();
  assert.ok(
    entries.some((f) => f.startsWith('src/lib/coach/')),
    'src/lib/coach/ must be discovered, not listed'
  );
  assert.ok(
    entries.some((f) => f.startsWith('src/store/')),
    'src/store/ must be discovered, not listed'
  );
  assert.ok(
    entries.some((f) => f.startsWith('packages/mw-core/src/coach/')),
    'packages/mw-core/src/coach/ must be discovered, not listed'
  );
  assert.ok(entries.includes('src/page-components/HomePage.tsx'));
  assert.ok(entries.includes('src/page-components/ActiveWorkoutPage.tsx'));
  assert.ok(entries.length >= 8, `isolation scan only reached ${entries.length} files — discovery drifted`);

  const offenders: string[] = [];
  for (const file of entries) {
    const src = read(file);
    assert.ok(src !== null, `${file} is in the isolation scan but missing`);
    if (importsMinisBus(file, src)) offenders.push(file);
    const chain = reaches(file, MINIS_ADAPTER, read);
    if (chain) offenders.push(chain.join(' → '));
  }
  assert.deepEqual(
    offenders,
    [],
    `Planner / logger / Today reached the minis bus:\n${offenders.join('\n')}`
  );
});

test('unreviewed importers of the minis adapter fail the scan', () => {
  const product = [
    ...walk('src'),
    ...walk('packages/mw-core/src'),
  ];
  const offenders: string[] = [];
  for (const file of product) {
    if (file.startsWith(ALLOW_PREFIX)) continue;
    const src = read(file);
    if (src === null) continue;
    if (importsMinisBus(file, src)) offenders.push(file);
  }
  assert.deepEqual(
    offenders,
    [],
    `minis adapter importers must live under ${ALLOW_PREFIX}:\n${offenders.join('\n')}`
  );
});

test('a fake coach import of @/lib/minis is a hit — the walk is not vacuous', () => {
  const fake = (files: Record<string, string>) => (p: string) => files[p] ?? null;
  const chain = reaches(
    'src/lib/coach/planEngine.ts',
    MINIS_ADAPTER,
    fake({
      'src/lib/coach/planEngine.ts': "import { createMiniBus } from '@/lib/minis/bus';",
      'src/lib/minis/bus.ts': '',
    })
  );
  assert.deepEqual(chain, ['src/lib/coach/planEngine.ts', 'src/lib/minis/bus.ts']);

  const home = reaches(
    'src/page-components/HomePage.tsx',
    MINIS_ADAPTER,
    fake({
      'src/page-components/HomePage.tsx': "import { createMiniBus } from '@/lib/minis/bus';",
      'src/lib/minis/bus.ts': '',
    })
  );
  assert.deepEqual(home, ['src/page-components/HomePage.tsx', 'src/lib/minis/bus.ts']);

  assert.equal(
    importsMinisBus(
      'src/lib/coach/planEngine.ts',
      "import { createMiniBus } from '@/lib/minis/bus';"
    ),
    true
  );
});
