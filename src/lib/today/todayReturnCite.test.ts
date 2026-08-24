import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import { todayReturnCite } from './todayReturnCite.ts';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('todayReturnCite', () => {
  it('last + next when history and a next name exist', () => {
    assert.deepEqual(
      todayReturnCite({ lastSessionName: 'Push', nextSessionName: 'Pull' }),
      { last: 'Push', next: 'Pull' }
    );
  });

  it('last-only when next is empty', () => {
    assert.deepEqual(
      todayReturnCite({ lastSessionName: 'Push', nextSessionName: null }),
      { last: 'Push', next: null }
    );
  });

  it('next-only when last is empty', () => {
    assert.deepEqual(
      todayReturnCite({ lastSessionName: '  ', nextSessionName: 'Coach A' }),
      { last: null, next: 'Coach A' }
    );
  });

  it('empty invents nothing', () => {
    assert.deepEqual(
      todayReturnCite({ lastSessionName: null, nextSessionName: undefined }),
      { last: null, next: null }
    );
    assert.deepEqual(
      todayReturnCite({ lastSessionName: '', nextSessionName: '   ' }),
      { last: null, next: null }
    );
  });

  it('planned-miss suppresses next', () => {
    assert.deepEqual(
      todayReturnCite({
        lastSessionName: 'Push',
        nextSessionName: 'Pull',
        plannedMissShowing: true,
      }),
      { last: 'Push', next: null }
    );
  });

  it('reentry suppresses last', () => {
    assert.deepEqual(
      todayReturnCite({
        lastSessionName: 'Push',
        nextSessionName: 'Pull',
        reentryShowing: true,
      }),
      { last: null, next: 'Pull' }
    );
  });

  it('session-open suppresses both', () => {
    assert.deepEqual(
      todayReturnCite({
        lastSessionName: 'Push',
        nextSessionName: 'Pull',
        sessionOpen: true,
        reentryShowing: true,
        plannedMissShowing: true,
      }),
      { last: null, next: null }
    );
  });
});

describe('todayReturnCite wiring', () => {
  it('StartDockHero cites last/next on the same poster-field as one primary-action', () => {
    const hero = read('src/components/journey/JourneyHero.tsx');
    const startAt = hero.indexOf('function StartDockHero');
    assert.ok(startAt >= 0, 'JourneyHero has no StartDockHero');
    const start = hero.slice(startAt);
    assert.match(start, /data-testid="today-return-last"/);
    assert.match(start, /data-testid="today-return-next"/);
    assert.match(start, /returnCite/);
    const buttons = start.match(/className="primary-action/g) ?? [];
    assert.equal(buttons.length, 2, 'desktop + compact each have one primary-action');
    assert.ok(
      !/className="primary-action[^"]*"[\s\S]*className="primary-action[^"]*"[\s\S]*className="primary-action/.test(
        start
      ),
      'StartDockHero must not grow a third primary-action'
    );
  });

  it('lean wires cite from lastLoggedName + justGoMeta and does not remount Coach', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /todayReturnCite\(/);
    assert.match(lean, /lastSessionName:\s*lastLoggedName/);
    assert.match(lean, /returnCite/);
    assert.doesNotMatch(lean, /CoachTodayCard/);
    assert.doesNotMatch(lean, /<SignInPrompt\b/);
  });

  it('Show all stays a closed details door', () => {
    const show = read('src/components/today/TodayShowAll.tsx');
    assert.match(show, /<details className=/);
    assert.doesNotMatch(show, /<details[^>]*\bopen\b/);
    assert.doesNotMatch(show, /CoachTodayCard/);
  });

  it('lean return path has no Feed / Top 8 / social chrome', () => {
    const files = [
      'src/page-components/HomeTodayLean.tsx',
      'src/page-components/HomePage.tsx',
      'src/components/journey/JourneyHero.tsx',
      'src/lib/today/todayReturnCite.ts',
    ];
    for (const rel of files) {
      const src = read(rel);
      assert.doesNotMatch(src, /Top 8|follower count|likes|comments|DMs/i, rel);
      assert.doesNotMatch(src, /social Feed|everything-app/i, rel);
    }
  });
});
