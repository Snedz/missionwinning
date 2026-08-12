/**
 * PWA cold-start under PRIVATE_MODE must not open on a gated route.
 *
 * `app/manifest.ts` `start_url` is what the OS loads on icon tap. While the
 * private gate is up, `/log` and `/active` redirect to `/private` — a bounce
 * that previously dropped `next=` and invite context on cold install.
 *
 * To point start_url back at a gated route intentionally, update the allowlist
 * below with rationale — do not silently revert manifest.ts alone.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isPrivateGatePublicPath } from '@/lib/publicRoutes';

const root = join(import.meta.dirname, '..', '..');
const manifestSrc = readFileSync(join(root, 'app/manifest.ts'), 'utf8');

/** Routes that redirect to /private when PRIVATE_MODE is on — never start_url. */
const GATED_START_PATHS = ['/', '/log', '/active'] as const;

/**
 * Explicit product choice for private-beta cold install. Change only with
 * founder sign-off and an update to this constant + test rationale.
 */
const EXPECTED_START_URL = '/private';

function parseManifestField(field: 'start_url' | 'id'): string {
  const re = new RegExp(`${field}:\\s*['"]([^'"]+)['"]`);
  const m = manifestSrc.match(re);
  assert.ok(m, `app/manifest.ts must declare ${field}`);
  return m[1]!;
}

test('PWA start_url is gate-public (private-beta cold install)', () => {
  const startUrl = parseManifestField('start_url');
  assert.equal(
    startUrl,
    EXPECTED_START_URL,
    'start_url must stay /private for private-beta cold install unless this test is updated with rationale'
  );
  for (const gated of GATED_START_PATHS) {
    assert.notEqual(
      startUrl,
      gated,
      `start_url must not be ${gated} while the private gate is up`
    );
  }
  assert.ok(
    isPrivateGatePublicPath(startUrl),
    `start_url ${startUrl} must be in PRIVATE_GATE_PUBLIC_PATHS`
  );
});

test('PWA id stays stable (changing it resets install identity)', () => {
  assert.equal(parseManifestField('id'), '/log');
});
