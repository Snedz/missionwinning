import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { homeSurfaceAfterGate, isUngatedDoor } from './homeSurface';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('Preview / local keep the door; production public flip does not', () => {
  assert.equal(isUngatedDoor({ VERCEL_ENV: 'preview', NODE_ENV: 'production' }), true);
  assert.equal(isUngatedDoor({ VERCEL_ENV: 'production', NODE_ENV: 'production' }), false);
  assert.equal(isUngatedDoor({ NODE_ENV: 'development' }), true);
  assert.equal(isUngatedDoor({ NODE_ENV: 'production' }), false);
});

test('home surface: gated lock, cookie homepage, Preview teaser, public flip', () => {
  assert.equal(
    homeSurfaceAfterGate({ privateMode: true, cookie: false, ungatedDoor: false }),
    'private'
  );
  assert.equal(
    homeSurfaceAfterGate({ privateMode: true, cookie: true, ungatedDoor: false }),
    'homepage'
  );
  assert.equal(
    homeSurfaceAfterGate({ privateMode: false, cookie: false, ungatedDoor: true }),
    'teaser'
  );
  assert.equal(
    homeSurfaceAfterGate({ privateMode: false, cookie: true, ungatedDoor: true }),
    'homepage'
  );
  assert.equal(
    homeSurfaceAfterGate({ privateMode: false, cookie: false, ungatedDoor: false }),
    'homepage'
  );
});

test('`/` unlocks from the cookie, not hasServerPrivateAccess (always true on Preview)', () => {
  const page = read('app/page.tsx');
  assert.match(page, /homeSurfaceAfterGate/);
  assert.match(page, /hasPrivateAccessCookieOnServer/);
  assert.doesNotMatch(page, /hasServerPrivateAccess/);
  const server = read('src/lib/privateGateServer.ts');
  assert.match(server, /export async function hasPrivateAccessCookieOnServer/);
  assert.match(
    server,
    /if \(!isPrivateModeEnabled\(\)\) return true/,
    'hasServerPrivateAccess still means gate-off OR cookie — do not use it for `/`'
  );
});
