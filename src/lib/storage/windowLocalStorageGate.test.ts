/**
 * The localStorage gate must see every spelling of the defect.
 *
 * Framework review (2026-08-05): `no-restricted-globals` only catches the bare
 * identifier `localStorage`. `persistDedupe.browserStorage` and
 * `localeHttpLoader.shouldLoadLocaleHttp` used `window.localStorage` and never
 * failed lint. Closing the call sites without teaching the gate the bypass is
 * how the next one lands green.
 *
 * Discover rather than enumerate (`.220`): any `window.` / `globalThis.`
 * MemberExpression for `localStorage` outside the allowlist fails. Comments are
 * stripped first so prose in this file and INDEX docs cannot fake a hit.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');

const ALLOWED = new Set([
  // The only module allowed to touch the raw API.
  'src/lib/storage/safeStorage.ts',
  // Enumerates mw_* keys for export/restore — documented exception.
  'src/lib/backup.ts',
]);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.next') continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !name.endsWith('.test.ts') && !name.endsWith('.routetest.ts')) {
      out.push(full);
    }
  }
  return out;
}

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

const BYPASS =
  /\b(?:window|globalThis)\s*\.\s*localStorage\b/;

test('no window.localStorage / globalThis.localStorage outside the storage allowlist', () => {
  const hits: string[] = [];
  for (const abs of [...walk(path.join(root, 'src')), ...walk(path.join(root, 'app'))]) {
    const rel = path.relative(root, abs).replace(/\\/g, '/');
    if (ALLOWED.has(rel)) continue;
    const src = stripComments(readFileSync(abs, 'utf8'));
    if (BYPASS.test(src)) hits.push(rel);
  }
  assert.deepEqual(
    hits,
    [],
    `window.localStorage bypasses the eslint localStorage gate. Route through ` +
      `@/lib/storage/safeStorage. Offenders:\n${hits.map((h) => `  - ${h}`).join('\n')}`
  );
});

test('eslint restricts MemberExpression localStorage spellings', () => {
  const cfg = readFileSync(path.join(root, 'eslint.config.js'), 'utf8');
  assert.match(
    cfg,
    /window.*localStorage|property\.name='localStorage'/,
    'eslint.config.js must forbid window.localStorage, not only the bare global'
  );
  assert.match(
    cfg,
    /globalThis/,
    'eslint.config.js must also forbid globalThis.localStorage'
  );
});
