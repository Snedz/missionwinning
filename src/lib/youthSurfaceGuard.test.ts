import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { youthApiNotFound } from './youthSurfaceGuard.ts';

const prev = process.env.NEXT_PUBLIC_SURFACES;

afterEach(() => {
  if (prev === undefined) delete process.env.NEXT_PUBLIC_SURFACES;
  else process.env.NEXT_PUBLIC_SURFACES = prev;
});

describe('youthApiNotFound', () => {
  it('404s when school/youth is parked (the default)', async () => {
    delete process.env.NEXT_PUBLIC_SURFACES;
    const res = youthApiNotFound();
    assert.ok(res);
    assert.equal(res!.status, 404);
    const body = (await res!.json()) as { error?: string };
    assert.equal(body.error, 'Not found');
  });

  it('is a no-op when school is explicitly enabled', () => {
    process.env.NEXT_PUBLIC_SURFACES = 'school';
    assert.equal(youthApiNotFound(), null);
  });
});

describe('youth API routes fail closed when parked', () => {
  it('every youth route calls youthApiNotFound', () => {
    const dir = join(import.meta.dirname, '../../app/api/youth');
    const routes = readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => join(dir, d.name, 'route.ts'));
    assert.ok(routes.length >= 4, 'expected the four consent routes');
    for (const file of routes) {
      const src = readFileSync(file, 'utf8');
      assert.match(src, /youthApiNotFound\s*\(/, `${file} must 404 when parked`);
    }
  });

  it('consent-notify requires a session and caps per recipient', () => {
    const src = readFileSync(
      join(import.meta.dirname, '../../app/api/youth/consent-notify/route.ts'),
      'utf8'
    );
    assert.match(src, /getUserFromRequest/);
    assert.match(src, /if\s*\(\s*!user\s*\)/);
    assert.match(src, /status:\s*401/);
    assert.match(src, /youth-consent-notify:to:/);
  });
});
