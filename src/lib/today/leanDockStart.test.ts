/**
 * Lean Today dock is Start. I-Day is a Search destination, not the red field.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { isTodayTrainReady, runTodayPrimaryAction } from '../todayPrimaryAction.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

describe('lean dock copy is Start, not I-Day', () => {
  it('lean source does not put Begin I-Day or Your next step on the dock', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.doesNotMatch(lean, /Begin I-Day/);
    assert.doesNotMatch(lean, /yourNextStep/);
    assert.match(lean, /includeColdStart:\s*true/);
    assert.match(lean, /dock="start"/);
  });

  it('start dock never falls back to journey label or next-step kicker', () => {
    const hero = read('src/components/journey/JourneyHero.tsx');
    const startAt = hero.indexOf('function StartDockHero');
    assert.ok(startAt >= 0, 'JourneyHero has no StartDockHero');
    const start = hero.slice(startAt);
    assert.doesNotMatch(start, /yourNextStep/);
    assert.doesNotMatch(start, /action\.label/);
    assert.doesNotMatch(start, /action\.description/);
    assert.doesNotMatch(start, /justGoCta|justGoTitle|justGoDesc|justGoEyebrow/);
    assert.doesNotMatch(start, /resolveJustGoHeroCopy/);
    assert.match(start, /todayStartCta/);
  });
});

describe('cold lean is train-ready', () => {
  it('i-day /welcome is not train-ready unless lean asks', () => {
    assert.equal(
      isTodayTrainReady({
        href: '/welcome',
        hasStartWorkout: false,
        phase: 'i-day',
      }),
      false
    );
    assert.equal(
      isTodayTrainReady({
        href: '/welcome',
        hasStartWorkout: false,
        phase: 'i-day',
        includeColdStart: true,
      }),
      true
    );
  });

  it('lean primary never navigates to /welcome', async () => {
    const navigated: string[] = [];
    await runTodayPrimaryAction({
      hasActiveWorkout: false,
      action: {
        label: 'Begin I-Day',
        description: 'Where the journey begins — in-processing takes about 2 minutes.',
        href: '/welcome',
        phase: 'i-day',
        stepLabel: 'I-Day · Where you start',
        progressPct: 0,
      },
      recommendedFocus: { group: 'Chest', statusKey: 'todayReadinessPrime' },
      readiness: {
        Chest: { days: 5, statusKey: 'todayReadinessPrime' },
        Back: { days: 5, statusKey: 'todayReadinessPrime' },
        Legs: { days: 5, statusKey: 'todayReadinessPrime' },
        Shoulders: { days: 5, statusKey: 'todayReadinessPrime' },
        Arms: { days: 5, statusKey: 'todayReadinessPrime' },
        Core: { days: 5, statusKey: 'todayReadinessPrime' },
      },
      history: [],
      units: 'metric',
      equipment: 'bodyweight',
      includeColdStart: true,
      startWorkout: () => {},
      navigate: (href) => {
        navigated.push(href);
      },
    });
    assert.ok(!navigated.includes('/welcome'), `lean went to ${navigated.join(',')}`);
    assert.ok(navigated.includes('/active'), `lean did not open Train: ${navigated.join(',')}`);
  });
});
