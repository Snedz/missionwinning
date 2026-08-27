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
    const desk = readFileSync(
      path.join(import.meta.dirname, '..', 'page-components', 'TodayDesk.tsx'),
      'utf8'
    );
    const primary = readFileSync(
      path.join(import.meta.dirname, 'todayPrimaryAction.ts'),
      'utf8'
    );
    assert.match(dash, /isTodayTrainReady\(/);
    assert.match(lean, /isTodayTrainReady\(/);
    assert.match(desk, /isTodayTrainReady\(/);
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

describe('Today shells pass re-entry doseScale into primary action', () => {
  it('lean + dashboard agree with shouldRepeatLastOnToday for the hero', () => {
    const root = path.join(import.meta.dirname, '..', '..');
    for (const rel of [
      'src/page-components/HomeTodayLean.tsx',
      'src/page-components/HomeTodayDashboard.tsx',
      'src/page-components/TodayDesk.tsx',
    ]) {
      const src = readFileSync(path.join(root, rel), 'utf8');
      assert.match(src, /shouldRepeatLastOnToday\(/, rel);
      assert.match(src, /repeatLastName:/, rel);
      assert.match(src, /savedWorkouts/, rel);
      assert.match(src, /savedRoutineName:/, rel);
    }
  });

  it('lean + dashboard call runTodayPrimaryAction with doseScale from reentry', () => {
    const root = path.join(import.meta.dirname, '..', '..');
    for (const rel of [
      'src/page-components/HomeTodayLean.tsx',
      'src/page-components/HomeTodayDashboard.tsx',
      'src/page-components/TodayDesk.tsx',
    ]) {
      const src = readFileSync(path.join(root, rel), 'utf8');
      assert.match(src, /runTodayPrimaryAction\(/, rel);
      assert.match(
        src,
        /doseScale:\s*(?:liveReentry|reentry\?)\.show\s*\?\s*(?:liveReentry|reentry)\.doseScale\s*:\s*1/,
        `${rel} must ease Just Go when re-entry shows (criterion 4)`
      );
    }
  });
});

