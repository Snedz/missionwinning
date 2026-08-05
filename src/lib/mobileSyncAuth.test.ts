/**
 * One definition for mobile sync Bearer auth — not four route-local copies.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const syncDir = path.join(root, 'app/api/mobile/sync');

test('every mobile sync route uses requireMobileSyncUser — no local requireUser', () => {
  const routes = readdirSync(syncDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(syncDir, d.name, 'route.ts'))
    .filter((p) => {
      try {
        readFileSync(p);
        return true;
      } catch {
        return false;
      }
    });

  assert.ok(routes.length >= 4, `expected ≥4 sync routes, found ${routes.length}`);

  for (const abs of routes) {
    const src = readFileSync(abs, 'utf8');
    const rel = path.relative(root, abs);
    assert.match(
      src,
      /requireMobileSyncUser/,
      `${rel} must call requireMobileSyncUser`
    );
    assert.doesNotMatch(
      src,
      /async function requireUser\b/,
      `${rel} still declares a local requireUser — one fact, one home`
    );
  }
});
