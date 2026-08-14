import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { restoreEnv, setTestEnv, snapshotEnv } from '@/lib/testEnv';
import { mobileCoachBootstrapRequiresAccess } from '@/lib/mobileAccess';

const root = path.join(import.meta.dirname, '..', '..');

describe('mobileCoachBootstrapRequiresAccess', () => {
  it('matches the web gate: unset PRIVATE_MODE is on in production', () => {
    const envSnapshot = snapshotEnv();
    try {
      setTestEnv('PRIVATE_MODE', undefined);
      setTestEnv('NODE_ENV', 'production');
      assert.equal(mobileCoachBootstrapRequiresAccess(), true);

      setTestEnv('PRIVATE_MODE', 'false');
      assert.equal(mobileCoachBootstrapRequiresAccess(), false);

      setTestEnv('PRIVATE_MODE', 'true');
      setTestEnv('NODE_ENV', 'test');
      assert.equal(mobileCoachBootstrapRequiresAccess(), true);
    } finally {
      restoreEnv(envSnapshot);
    }
  });

  it('mobile Coach routes use the shared gate, not a second PRIVATE_MODE string compare', () => {
    const access = readFileSync(path.join(root, 'src/lib/mobileAccess.ts'), 'utf8');
    assert.match(access, /isPrivateModeEnabled/);
    assert.doesNotMatch(access, /PRIVATE_MODE\s*!==\s*['"]true['"]/);
    assert.doesNotMatch(access, /PRIVATE_MODE\s*===\s*['"]true['"]/);

    for (const rel of [
      'app/api/mobile/coach/plan/route.ts',
      'app/api/mobile/coach/adapt/route.ts',
    ]) {
      const src = readFileSync(path.join(root, rel), 'utf8');
      assert.match(src, /allowMobileCoachBootstrap/, rel);
      assert.doesNotMatch(src, /PRIVATE_MODE\s*===\s*['"]true['"]/, rel);
    }
  });
});
