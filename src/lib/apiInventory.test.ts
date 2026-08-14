/**
 * A handler nobody listed is a handler nobody reviews.
 *
 * H0-3: 74 route.ts files, INDEX was missing nine, PROGRAM_STATUS said 71.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const apiRoot = path.join(root, 'app/api');

function routeDirs(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      routeDirs(full, acc);
    } else if (name === 'route.ts') {
      acc.push(path.relative(apiRoot, path.dirname(full)).split(path.sep).join('/'));
    }
  }
  return acc;
}

test('every API handler is listed in app/api/INDEX.md', () => {
  const index = readFileSync(path.join(root, 'app/api/INDEX.md'), 'utf8');
  const routes = routeDirs(apiRoot).sort();
  assert.ok(routes.length >= 70, `expected a real API tree, found ${routes.length}`);
  const missing = routes.filter((r) => !index.includes(r));
  assert.deepEqual(
    missing,
    [],
    `these app/api/**/route.ts paths are not in app/api/INDEX.md:\n  ${missing.join('\n  ')}`
  );
});

test('PROGRAM_STATUS census matches the discovered route.ts count', () => {
  const routes = routeDirs(apiRoot);
  const status = readFileSync(path.join(root, 'docs/security/PROGRAM_STATUS.md'), 'utf8');
  assert.match(
    status,
    new RegExp(`\\*\\*${routes.length}\\*\\* \`app/api/\\*\\*/route\\.ts\``),
    `PROGRAM_STATUS must state **${routes.length}** handlers (discovered), not a stale census`
  );
});
