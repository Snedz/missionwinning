import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isFreestyleJustGo,
  resolveJustGoHeroCopy,
} from './justGoHeroMeta.ts';

describe('resolveJustGoHeroCopy', () => {
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
});

describe('isFreestyleJustGo', () => {
  it('is true for focus and starter only', () => {
    assert.equal(isFreestyleJustGo('focus'), true);
    assert.equal(isFreestyleJustGo('starter'), true);
    assert.equal(isFreestyleJustGo('coach'), false);
  });
});
