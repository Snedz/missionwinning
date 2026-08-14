import { describe, it, beforeEach, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import {
  getPrivateAccessPasswords,
  matchesPrivateAccessPassword,
  normalizePrivateAccessCode,
  privateAccessCookieOptions,
  timingSafeSecretMatch,
  verifyPrivateAccessToken,
} from './privateSession.ts';
import { restoreEnv, setTestEnv, snapshotEnv } from './testEnv.ts';

describe('timingSafeSecretMatch', () => {
  it('matches equal strings', () => {
    assert.equal(timingSafeSecretMatch('Done', 'Done'), true);
  });

  it('rejects unequal strings', () => {
    assert.equal(timingSafeSecretMatch('Done', 'Nope'), false);
    assert.equal(timingSafeSecretMatch('Done', 'Done!'), false);
  });
});

describe('getPrivateAccessPasswords', () => {
  it('includes primary and comma-separated extras', () => {
    assert.deepEqual(getPrivateAccessPasswords('primary', 'Done, other'), [
      'primary',
      'Done',
      'other',
    ]);
  });

  it('dedupes and drops empties', () => {
    assert.deepEqual(getPrivateAccessPasswords('Done', 'Done, ,Done'), ['Done']);
  });
});

describe('matchesPrivateAccessPassword', () => {
  it('accepts primary or extras', () => {
    assert.equal(matchesPrivateAccessPassword('primary', 'primary', 'Done'), true);
    assert.equal(matchesPrivateAccessPassword('Done', 'primary', 'Done'), true);
    assert.equal(matchesPrivateAccessPassword('wrong', 'primary', 'Done'), false);
  });

  it('accepts quoted Preview env aliases and trimmed input', () => {
    assert.equal(normalizePrivateAccessCode('"Done"'), 'Done');
    assert.equal(normalizePrivateAccessCode("  'Done'  "), 'Done');
    assert.equal(
      matchesPrivateAccessPassword('  Done  ', 'rotated-secret', '"Done"'),
      true,
      'Vercel Preview paste of "Done" must match the typed code'
    );
    assert.equal(matchesPrivateAccessPassword('', 'primary', 'Done'), false);
  });

  it('strips quotes when splitting comma-separated extras', () => {
    assert.deepEqual(getPrivateAccessPasswords('primary', '"Done", other'), [
      'primary',
      'Done',
      'other',
    ]);
  });
});

describe('privateAccessCookieOptions', () => {
  let snapshot: NodeJS.ProcessEnv;

  beforeEach(() => {
    snapshot = snapshotEnv();
  });

  afterEach(() => {
    restoreEnv(snapshot);
  });

  it('is host-only (no Domain) so *.vercel.app can store the cookie', () => {
    const opts = privateAccessCookieOptions();
    assert.equal(opts.path, '/');
    assert.equal(opts.sameSite, 'lax');
    assert.equal(opts.httpOnly, true);
    assert.equal('domain' in opts, false, 'a Domain attribute is rejected on the vercel.app PSL');
  });

  it('sets Secure on Vercel even if NODE_ENV is not production', () => {
    setTestEnv('NODE_ENV', 'development');
    setTestEnv('VERCEL', '1');
    assert.equal(privateAccessCookieOptions().secure, true);
  });
});

describe('verifyPrivateAccessToken', () => {
  const secret = 'test-gate-secret-32chars-min!!';

  it('rejects a stale (expired) cookie', () => {
    const exp = Math.floor(Date.now() / 1000) - 30;
    const payload = Buffer.from(JSON.stringify({ exp, v: 1 }), 'utf8').toString('base64url');
    const sig = createHmac('sha256', secret).update(payload).digest('base64url');
    assert.equal(verifyPrivateAccessToken(`${payload}.${sig}`, secret), false);
  });

  it('rejects a raw secret stored as the cookie value', () => {
    assert.equal(verifyPrivateAccessToken(secret, secret), false);
  });

  it('rejects a missing token or secret', () => {
    assert.equal(verifyPrivateAccessToken(undefined, secret), false);
    assert.equal(verifyPrivateAccessToken('x.y', undefined), false);
  });
});

const root = path.join(import.meta.dirname, '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue;
    const abs = path.join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.(ts|tsx|js|mjs)$/.test(entry)) out.push(abs);
  }
  return out;
}

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

test('gate cookies are minted only through attachPrivateAccessCookie', () => {
  const files = [
    path.join(root, 'proxy.ts'),
    ...walk(path.join(root, 'src')),
    ...walk(path.join(root, 'app')),
  ];
  const offenders: string[] = [];
  let writers = 0;
  for (const abs of files) {
    const rel = path.relative(root, abs);
    if (/\.(test|routetest)\.tsx?$/.test(rel)) continue;
    if (rel === 'src/lib/privateSession.ts') continue;
    const src = stripComments(readFileSync(abs, 'utf8'));
    if (src.includes('attachPrivateAccessCookie(')) writers += 1;
    if (
      /cookies\.set\(\s*PRIVATE_ACCESS_COOKIE/.test(src) ||
      /cookies\.set\(\s*['"]mw_private_access['"]/.test(src)
    ) {
      offenders.push(rel);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    'raw Set-Cookie of the gate cookie — use attachPrivateAccessCookie so Preview cannot grow a Domain'
  );
  assert.ok(
    writers >= 4,
    `expected the four mint sites (proxy, password, session, auth callback); found ${writers}`
  );
});
