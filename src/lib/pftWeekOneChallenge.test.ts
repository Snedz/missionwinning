import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatWeekOneChallengeText, PFT_WEEK_ONE_CHALLENGE } from '@/data/pftWeekOneChallenge';
import { tierToScore } from '@/lib/presidentialFitnessTest';

describe('pftWeekOneChallenge', () => {
  it('has seven days', () => {
    assert.equal(PFT_WEEK_ONE_CHALLENGE.length, 7);
  });

  it('formats printable text', () => {
    const text = formatWeekOneChallengeText('5th Grade PE', 'MWTEST');
    assert.match(text, /Week 1/);
    assert.match(text, /MWTEST/);
    assert.match(text, /Day 7/);
  });
});

describe('tierToScore', () => {
  it('maps award tiers to scores', () => {
    assert.equal(tierToScore('presidential'), 100);
    assert.equal(tierToScore('national'), 75);
    assert.equal(tierToScore('participant'), 50);
    assert.equal(tierToScore('below'), 25);
  });
});
