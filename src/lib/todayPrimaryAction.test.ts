import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { isTodayTrainReady } from './todayPrimaryAction.ts';

describe('isTodayTrainReady', () => {
  it('is true for /active href, startWorkout, or commissioned', () => {
    assert.equal(
      isTodayTrainReady({ href: '/active', hasStartWorkout: false, phase: 'basic' }),
      true
    );
    assert.equal(
      isTodayTrainReady({ href: '/log', hasStartWorkout: true, phase: 'basic' }),
      true
    );
    assert.equal(
      isTodayTrainReady({ href: '/log', hasStartWorkout: false, phase: 'commissioned' }),
      true
    );
  });

  it('basic Just Go only when includeBasicJustGo', () => {
    assert.equal(
      isTodayTrainReady({ href: '/log', hasStartWorkout: false, phase: 'basic' }),
      false
    );
    assert.equal(
      isTodayTrainReady({
        href: '/log',
        hasStartWorkout: false,
        phase: 'basic',
        includeBasicJustGo: true,
      }),
      true
    );
    assert.equal(
      isTodayTrainReady({
        href: '/log',
        hasStartWorkout: false,
        phase: 'readiness',
        includeBasicJustGo: true,
      }),
      false
    );
  });

  it('shells and primary action wire the one definition (.426)', () => {
    const dash = readFileSync(
      path.join(import.meta.dirname, '..', 'page-components', 'HomeTodayDashboard.tsx'),
      'utf8'
    );
    const lean = readFileSync(
      path.join(import.meta.dirname, '..', 'page-components', 'HomeTodayLean.tsx'),
      'utf8'
    );
    const primary = readFileSync(
      path.join(import.meta.dirname, 'todayPrimaryAction.ts'),
      'utf8'
    );
    assert.match(dash, /isTodayTrainReady\(/);
    assert.match(lean, /isTodayTrainReady\(/);
    assert.match(primary, /isTodayTrainReady\(/);
    assert.doesNotMatch(
      dash,
      /action\.href\s*===\s*'\/active'\s*\|\|\s*!!action\.startWorkout/
    );
    assert.doesNotMatch(
      lean,
      /action\.href\s*===\s*'\/active'\s*\|\|\s*!!action\.startWorkout/
    );
  });
});
