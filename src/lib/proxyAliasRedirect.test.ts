/**
 * F-039 — retired Today/Train spellings must 308 before the gate.
 *
 * `next.config.js` already lists DEAD_ALIAS_PATHS, but `proxy.ts` runs first.
 * A gated `/today` that is not public used to 307 to `/private?next=/today`
 * (stale Previews 404'd). Canonical `/log` and `/active` are already public.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { NextRequest } from 'next/server';
import { proxy } from '../../proxy.ts';
import { DEAD_ALIAS_PATHS } from './safeRedirect.ts';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');
}

describe('proxy dead-alias 308 (F-039)', () => {
  it('308s every DEAD_ALIAS_PATHS spelling to its canonical route', () => {
    for (const [alias, canonical] of Object.entries(DEAD_ALIAS_PATHS)) {
      const res = proxy(new NextRequest(`https://www.missionwinning.com${alias}`));
      assert.equal(res.status, 308, `${alias} must 308, got ${res.status}`);
      const location = res.headers.get('location');
      assert.ok(location, `${alias} 308 has no Location`);
      assert.equal(new URL(location).pathname, canonical, `${alias} → ${canonical}`);
    }
  });

  it('308s trailing-slash aliases the same way', () => {
    const res = proxy(new NextRequest('https://www.missionwinning.com/today/'));
    assert.equal(res.status, 308);
    assert.equal(new URL(res.headers.get('location')!).pathname, '/log');
  });

  it('keeps the query on the canonical hop', () => {
    const res = proxy(new NextRequest('https://www.missionwinning.com/train?from=share'));
    assert.equal(res.status, 308);
    const loc = new URL(res.headers.get('location')!);
    assert.equal(loc.pathname, '/active');
    assert.equal(loc.searchParams.get('from'), 'share');
  });

  it('source-orders DEAD_ALIAS_PATHS before isPathEnabled', () => {
    const src = stripComments(read('proxy.ts'));
    const aliasAt = src.indexOf('DEAD_ALIAS_PATHS');
    const parkAt = src.indexOf('isPathEnabled');
    assert.ok(aliasAt !== -1, 'proxy.ts must read DEAD_ALIAS_PATHS');
    assert.ok(parkAt !== -1, 'proxy.ts must still call isPathEnabled');
    assert.ok(
      aliasAt < parkAt,
      'alias 308 must run before parking — otherwise a stale Preview 404s /today'
    );
    assert.match(src, /redirect\([^)]*,\s*308\s*\)/, 'alias hop is 308, not a gate 307');
  });
});
