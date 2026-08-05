import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isPathEnabled,
  isSurfaceEnabled,
  parkedSurfaces,
  surfaceForPath,
  SURFACE_PATHS,
  type Surface,
} from '@/lib/surface';

function withSurfaces<T>(value: string | undefined, fn: () => T): T {
  const prev = process.env.NEXT_PUBLIC_SURFACES;
  if (value === undefined) delete process.env.NEXT_PUBLIC_SURFACES;
  else process.env.NEXT_PUBLIC_SURFACES = value;
  try {
    return fn();
  } finally {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_SURFACES;
    else process.env.NEXT_PUBLIC_SURFACES = prev;
  }
}

test('surface', async (t) => {
  await t.test('legal / hardware / payment-rail surface is parked by default', () => {
    withSurfaces(undefined, () => {
      for (const s of ['america', 'school', 'wearables', 'cryptoRails', 'paypal'] as Surface[]) {
        assert.equal(isSurfaceEnabled(s), false, `${s} should be parked by default`);
      }
      assert.equal(
        isSurfaceEnabled('leaderboard'),
        true,
        'leaderboard is on by default under full-launch override (honest Pacers)'
      );
    });
  });

  await t.test('secondary pillars stay usable by default (vision keeps six pillars)', () => {
    withSurfaces(undefined, () => {
      for (const s of ['move', 'mind', 'track', 'learn', 'guidebook'] as Surface[]) {
        assert.equal(isSurfaceEnabled(s), true, `${s} should be reachable by default`);
      }
    });
  });

  await t.test('a named surface opts back in', () => {
    withSurfaces('wearables,leaderboard', () => {
      assert.equal(isSurfaceEnabled('wearables'), true);
      assert.equal(isSurfaceEnabled('leaderboard'), true);
      assert.equal(isSurfaceEnabled('school'), false, 'unnamed surfaces stay parked');
    });
  });

  await t.test('wedge parks every optional surface', () => {
    withSurfaces('wedge', () => {
      for (const s of ['move', 'mind', 'track', 'learn', 'guidebook', 'benchmarks', 'calculators', 'programs'] as Surface[]) {
        assert.equal(isSurfaceEnabled(s), false, `${s} should be parked in wedge mode`);
      }
      assert.equal(isSurfaceEnabled('america'), false);
    });
  });

  await t.test('all enables everything for a full-surface QA pass', () => {
    withSurfaces('all', () => {
      assert.equal(isSurfaceEnabled('school'), true);
      assert.equal(isSurfaceEnabled('paypal'), true);
    });
  });

  await t.test('a leading minus overrides a preset', () => {
    withSurfaces('all,-school', () => {
      assert.equal(isSurfaceEnabled('school'), false);
      assert.equal(isSurfaceEnabled('america'), true);
    });
    withSurfaces('wedge,move', () => {
      assert.equal(isSurfaceEnabled('move'), true, 'an explicit name beats the wedge preset');
    });
  });

  await t.test('parsing is forgiving about spacing and case', () => {
    withSurfaces(' Wearables , SCHOOL ', () => {
      assert.equal(isSurfaceEnabled('wearables'), true);
      assert.equal(isSurfaceEnabled('school'), true);
    });
  });

  await t.test('the free logger and its wedge can never be parked', () => {
    // Nothing in SURFACE_PATHS may claim a wedge route — otherwise a flag could
    // switch off the free logger, which CONTEXT.md hard rule 2 forbids outright.
    const wedge = [
      '/log',
      '/active',
      '/coach',
      '/nutrition',
      '/profile',
      '/history',
      '/library',
      '/builder',
      '/welcome',
      '/',
    ];
    withSurfaces('wedge', () => {
      for (const path of wedge) {
        assert.equal(surfaceForPath(path), null, `${path} must not belong to a parkable surface`);
        assert.equal(isPathEnabled(path), true, `${path} must stay reachable`);
      }
    });
  });

  await t.test('paths resolve to their surface, longest match first', () => {
    assert.equal(surfaceForPath('/learn'), 'learn');
    assert.equal(surfaceForPath('/learn/course'), 'learn');
    assert.equal(surfaceForPath('/learn/guide'), 'guidebook');
    assert.equal(surfaceForPath('/learn/guide/chapter-1'), 'guidebook');
    assert.equal(surfaceForPath('/api/school/class/mine'), 'school');
    assert.equal(surfaceForPath('/api/coach/chat'), null);
  });

  await t.test('a path prefix does not match a longer sibling segment', () => {
    // /moveable must not be treated as /move
    assert.equal(surfaceForPath('/moveable'), null);
    assert.equal(surfaceForPath('/tracker'), null);
  });

  await t.test('parked route paths are blocked, wedge paths are not', () => {
    withSurfaces(undefined, () => {
      assert.equal(isPathEnabled('/america'), false);
      assert.equal(isPathEnabled('/api/wearables/status'), false);
      assert.equal(isPathEnabled('/leaderboard'), true);
      assert.equal(isPathEnabled('/move'), true);
      assert.equal(isPathEnabled('/active'), true);
    });
  });

  await t.test('parkedSurfaces reports what is off', () => {
    withSurfaces(undefined, () => {
      const parked = parkedSurfaces();
      assert.ok(parked.includes('america'));
      assert.ok(!parked.includes('move'));
    });
    withSurfaces('all', () => {
      assert.deepEqual(parkedSurfaces(), []);
    });
  });

  await t.test('every surface declares at least one path', () => {
    for (const [surface, paths] of Object.entries(SURFACE_PATHS)) {
      assert.ok(paths.length > 0, `${surface} has no paths — parking it would do nothing`);
    }
  });
});
