import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PREMIUM_GATED_GET_ROUTES, PREMIUM_GATE_OK_STATUSES } from './premiumApiRoutes';

describe('premiumApiRoutes', () => {
  it('lists all premium content GET routes under app/api/premium', () => {
    const premiumDir = join(process.cwd(), 'app/api/premium');
    const routeDirs = readdirSync(premiumDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name !== 'status')
      .map((d) => `/api/premium/${d.name}`)
      .sort();

    const listed = [...PREMIUM_GATED_GET_ROUTES].sort();
    assert.deepEqual(listed, routeDirs);
  });

  it('expects auth gate statuses for unauthenticated access', () => {
    assert.ok(PREMIUM_GATE_OK_STATUSES.includes(403));
    assert.ok(PREMIUM_GATED_GET_ROUTES.length >= 6);
  });
});
