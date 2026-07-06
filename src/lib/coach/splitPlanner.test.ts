import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { chooseSplit, mapToCalendar } from '@/lib/coach/splitPlanner';

describe('chooseSplit', () => {
  it('2 days yields full-body x2', () => {
    const split = chooseSplit(2, 'beginner', 'general');
    assert.equal(split.length, 2);
    assert.ok(split.every((d) => d.kind === 'strength'));
  });

  it('3 days beginner yields full-body x3', () => {
    const split = chooseSplit(3, 'beginner', 'strength');
    assert.equal(split.length, 3);
    assert.equal(split[0].nameKey, 'coachSessionFullBody');
  });

  it('4 days yields upper/lower x2', () => {
    const split = chooseSplit(4, 'intermediate', 'strength');
    assert.equal(split.length, 4);
    assert.equal(split[0].nameKey, 'coachSessionUpper');
    assert.equal(split[1].nameKey, 'coachSessionLower');
  });

  it('5 days includes conditioning for endurance goal', () => {
    const split = chooseSplit(5, 'advanced', 'endurance');
    assert.ok(split.some((d) => d.kind === 'conditioning'));
  });

  it('mobility goal injects recovery day', () => {
    const split = chooseSplit(4, 'intermediate', 'mobility');
    assert.ok(split.some((d) => d.kind === 'recovery'));
  });

  it('high strain injects recovery day', () => {
    const split = chooseSplit(4, 'intermediate', 'strength', undefined, {
      readiness: 55,
      strain: 75,
      recovery: 40,
    });
    assert.ok(split.some((d) => d.kind === 'recovery'));
  });

  it('very high strain swaps last strength to recovery', () => {
    const split = chooseSplit(4, 'intermediate', 'strength', undefined, {
      readiness: 40,
      strain: 90,
      recovery: 30,
    });
    const recoveryCount = split.filter((d) => d.kind === 'recovery').length;
    assert.ok(recoveryCount >= 2);
  });
});

describe('mapToCalendar', () => {
  it('honors preferredDays', () => {
    const split = chooseSplit(3, 'beginner', 'general');
    const mapped = mapToCalendar(split, [1, 3, 5], '2026-07-06');
    assert.deepEqual(
      mapped.map((m) => m.dayOffset),
      [1, 3, 5]
    );
  });

  it('avoids back-to-back same focus when possible', () => {
    const split = chooseSplit(4, 'intermediate', 'strength');
    const mapped = mapToCalendar(split, [], '2026-07-06');
    for (let i = 1; i < mapped.length; i++) {
      const prev = mapped[i - 1];
      const cur = mapped[i];
      if (cur.dayOffset - prev.dayOffset === 1 && prev.day.kind === 'strength' && cur.day.kind === 'strength') {
        const shared = prev.day.focusGroups.some((g) => cur.day.focusGroups.includes(g));
        assert.equal(shared, false, 'same focus should not be back-to-back');
      }
    }
  });
});
