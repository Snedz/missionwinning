import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildJustGoHeroMeta,
  isFreestyleJustGo,
  resolveJustGoHeroCopy,
} from './justGoHeroMeta.ts';

describe('buildJustGoHeroMeta', () => {
  it('returns null when a workout is already active', () => {
    assert.equal(
      buildJustGoHeroMeta({
        hasActiveWorkout: true,
        trainReady: true,
        focusLabel: 'Chest',
        coach: null,
      }),
      null
    );
  });

  it('returns null when train is not the journey next step', () => {
    assert.equal(
      buildJustGoHeroMeta({
        hasActiveWorkout: false,
        trainReady: false,
        focusLabel: 'Chest',
        coach: null,
      }),
      null
    );
  });

  it('marks coach when a live session has exercises', () => {
    const meta = buildJustGoHeroMeta({
      hasActiveWorkout: false,
      trainReady: true,
      focusLabel: 'Legs',
      coach: {
        name: 'Upper A',
        status: 'planned',
        exercises: [{ exerciseId: 'bench-press', sets: 3, reps: 8, weight: 60 }],
      },
    });
    assert.deepEqual(meta, {
      focusLabel: 'Legs',
      source: 'coach',
      sessionName: 'Upper A',
    });
  });

  it('marks repeat_last when a last session exists and Coach is not live', () => {
    const meta = buildJustGoHeroMeta({
      hasActiveWorkout: false,
      trainReady: true,
      focusLabel: 'Chest',
      coach: null,
      repeatLastName: 'Push',
    });
    assert.deepEqual(meta, {
      focusLabel: 'Chest',
      source: 'repeat_last',
      sessionName: 'Push',
    });
  });

  it('live Coach still wins over Repeat last', () => {
    const meta = buildJustGoHeroMeta({
      hasActiveWorkout: false,
      trainReady: true,
      focusLabel: 'Legs',
      coach: {
        name: 'Upper A',
        status: 'planned',
        exercises: [{ exerciseId: 'bench-press', sets: 3, reps: 8, weight: 60 }],
      },
      repeatLastName: 'Push',
    });
    assert.equal(meta?.source, 'coach');
  });

  it('falls back to freestyle focus without a coach day', () => {
    const meta = buildJustGoHeroMeta({
      hasActiveWorkout: false,
      trainReady: true,
      focusLabel: 'Back',
      coach: null,
    });
    assert.deepEqual(meta, { focusLabel: 'Back', source: 'focus' });
  });

  it('ignores coach days with no exercises', () => {
    const meta = buildJustGoHeroMeta({
      hasActiveWorkout: false,
      trainReady: true,
      focusLabel: 'Core',
      coach: { name: 'Empty', status: 'planned', exercises: [] },
    });
    assert.equal(meta?.source, 'focus');
  });
});

describe('resolveJustGoHeroCopy', () => {
  it('names session 2 after exactly one completed workout', () => {
    const freestyle = resolveJustGoHeroCopy(
      { focusLabel: 'Back', source: 'focus' },
      { completedSessions: 1 }
    );
    assert.equal(freestyle.labelKey, 'week1SecondSessionCta');
    assert.match(freestyle.defaultLabel, /session 2/i);

    const coach = resolveJustGoHeroCopy(
      { focusLabel: 'Chest', source: 'coach', sessionName: 'Upper A' },
      { completedSessions: 1 }
    );
    assert.equal(coach.labelKey, 'week1SecondSessionCta');
    assert.equal(coach.titleParams?.name, 'Upper A');
  });

  it('does not say Just Go when source is coach', () => {
    const copy = resolveJustGoHeroCopy({
      focusLabel: 'Chest',
      source: 'coach',
      sessionName: 'Upper A',
    });
    assert.equal(copy.labelKey, 'coachStartSession');
    // Label + title must not claim freestyle; desc may contrast with "not … Just Go".
    assert.doesNotMatch(copy.defaultLabel, /just go/i);
    assert.doesNotMatch(copy.defaultTitle, /just go/i);
    assert.match(copy.defaultDesc, /Mission Coach|planned|prescribed/i);
    assert.match(copy.defaultDesc, /not freestyle/i);
    assert.equal(copy.defaultTitle, 'Upper A');
    assert.equal(copy.titleParams?.name, 'Upper A');
  });

  it('falls back to focus label when coach name is empty', () => {
    const copy = resolveJustGoHeroCopy({
      focusLabel: 'Legs',
      source: 'coach',
      sessionName: '  ',
    });
    assert.equal(copy.defaultTitle, 'Legs');
  });

  it('keeps Just Go wording for focus freestyle', () => {
    const copy = resolveJustGoHeroCopy({
      focusLabel: 'Back',
      source: 'focus',
    });
    assert.equal(copy.labelKey, 'justGoCta');
    assert.match(copy.defaultLabel, /Just Go/i);
    assert.match(copy.defaultTitle, /Just Go/i);
    assert.match(copy.defaultDesc, /fresh|lifted/i);
  });

  it('keeps Just Go wording for starter freestyle', () => {
    const copy = resolveJustGoHeroCopy({
      focusLabel: 'Core',
      source: 'starter',
    });
    assert.equal(copy.labelKey, 'justGoCta');
    assert.match(copy.defaultLabel, /Just Go/i);
  });

  it('names Repeat last session without Just Go or week-1 overlay', () => {
    const copy = resolveJustGoHeroCopy(
      { focusLabel: 'Chest', source: 'repeat_last', sessionName: 'Push' },
      { completedSessions: 1 }
    );
    assert.equal(copy.labelKey, 'todayRepeatLastCta');
    assert.equal(copy.defaultLabel, 'Repeat last session');
    assert.equal(copy.defaultTitle, 'Push');
    assert.doesNotMatch(copy.defaultLabel, /just go/i);
    assert.doesNotMatch(copy.defaultDesc, /just go/i);
    assert.doesNotMatch(copy.defaultLabel, /session 2/i);
  });
});

describe('isFreestyleJustGo', () => {
  it('is true for focus and starter only', () => {
    assert.equal(isFreestyleJustGo('focus'), true);
    assert.equal(isFreestyleJustGo('starter'), true);
    assert.equal(isFreestyleJustGo('coach'), false);
    assert.equal(isFreestyleJustGo('repeat_last'), false);
  });
});
