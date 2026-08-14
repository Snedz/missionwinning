/**
 * PWA cold-start must switch with the private gate — same predicate as SW.
 *
 * `app/manifest.ts` `start_url` is what the OS loads on icon tap. A literal
 * `/private` here survives `PRIVATE_MODE=false` rebuilds; the SW already
 * flag-switches in `next.config.js`. This file guards the wiring, not a
 * second copy of the gate.
 *
 * Behaviour matrix lives in `pwaStartUrl.test.ts`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');
const manifestSrc = readFileSync(join(root, 'app/manifest.ts'), 'utf8');
const helperSrc = readFileSync(join(root, 'src/lib/pwaStartUrl.ts'), 'utf8');

test('manifest start_url is pwaStartUrl() — not a gated literal', () => {
  assert.match(
    manifestSrc,
    /from ['"]@\/lib\/pwaStartUrl['"]/,
    'app/manifest.ts must import pwaStartUrl'
  );
  assert.match(
    manifestSrc,
    /start_url:\s*pwaStartUrl\s*\(/,
    'start_url must call pwaStartUrl so the flip-day rebuild is not a silent teaser'
  );
  assert.doesNotMatch(
    manifestSrc,
    /start_url:\s*['"]\/private['"]/,
    'a hardcoded /private start_url is the landmine this loop exists to close'
  );
  assert.doesNotMatch(
    manifestSrc,
    /start_url:\s*['"]\/(log|active|)['"]/,
    'do not hardcode a gated or logger path; the helper owns the branch'
  );
});

test('pwaStartUrl uses the shared gate predicate (no third private copy)', () => {
  assert.match(
    helperSrc,
    /isPrivateModeEnabledFromEnv/,
    'pwaStartUrl must call isPrivateModeEnabledFromEnv — Preview short-circuit lives there'
  );
  assert.doesNotMatch(
    helperSrc,
    /function isPrivateModeEnabled/,
    'do not copy privateModeFlag into pwaStartUrl (.178)'
  );
});

test('PWA id stays stable (changing it resets install identity)', () => {
  assert.match(manifestSrc, /id:\s*['"]\/log['"]/);
});
