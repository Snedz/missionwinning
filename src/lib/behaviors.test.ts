import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BEHAVIORS,
  MAX_SERVINGS,
  behaviorById,
  formatBehaviorFooter,
  mergeBehaviors,
  normalizeBehaviors,
  roundToQuarterHour,
} from '@/lib/behaviors';

describe('the registry', () => {
  it('every behavior carries a receipt, a tier, and exactly one pre-registered outcome', () => {
    // The receipt is the product promise: twelve questions, each with its
    // evidence shown. The single outcome is the multiple-comparisons kill switch
    // — a behavior that could be scored against several metrics can be fished.
    for (const b of BEHAVIORS) {
      assert.ok(b.receiptDefault.trim().length > 40, `${b.id} has no real receipt`);
      assert.ok(['A', 'B', 'C'].includes(b.tier), `${b.id} has no evidence tier`);
      assert.equal(typeof b.outcome, 'string');
      assert.ok(['same-day', 'next-day'].includes(b.lag), `${b.id} declares no lag`);
    }
  });

  it('ids are unique and the count stays small — twelve questions, not three hundred', () => {
    const ids = BEHAVIORS.map((b) => b.id);
    assert.equal(new Set(ids).size, ids.length);
    // Three more (sleep/soreness/stress) already live on MindCheckIn as ratings.
    assert.ok(BEHAVIORS.length <= 12, 'catalog paralysis is the defect we are avoiding');
  });

  it('the weakly-evidenced one is labelled weak, and says so in its own words', () => {
    const lateMeal = behaviorById('lateMeal');
    assert.equal(lateMeal?.tier, 'C');
    assert.match(lateMeal!.receiptDefault, /mixed|unsettled|emerging/i);
  });

  it('alcohol and late meals are claims about tomorrow, not tonight', () => {
    assert.equal(behaviorById('alcohol')?.lag, 'next-day');
    assert.equal(behaviorById('lateMeal')?.lag, 'next-day');
    assert.equal(behaviorById('caffeine')?.lag, 'same-day');
  });
});

describe('roundToQuarterHour', () => {
  it('rounds to the quarter hour — the resolution self-report can actually support', () => {
    assert.equal(roundToQuarterHour('23:07'), '23:00');
    assert.equal(roundToQuarterHour('23:08'), '23:15');
    assert.equal(roundToQuarterHour('06:30'), '06:30');
    assert.equal(roundToQuarterHour('7:45'), '07:45');
  });

  it('wraps past midnight instead of inventing 24:00', () => {
    assert.equal(roundToQuarterHour('23:53'), '00:00');
  });

  it('garbage is null, never a throw — this reads whatever storage holds', () => {
    for (const bad of ['25:99', '', 'bedtime', '12:60', '-1:00', null, undefined, 42, {}]) {
      assert.doesNotThrow(() => roundToQuarterHour(bad));
      assert.equal(roundToQuarterHour(bad), null, `${String(bad)} should be null`);
    }
  });
});

describe('normalizeBehaviors', () => {
  it('keeps counts as counts — zero is an answer, not an absence', () => {
    const e = normalizeBehaviors({ caffeineServings: 0, alcoholServings: 0 });
    assert.equal(e?.caffeineServings, 0);
    assert.equal(e?.alcoholServings, 0);
  });

  it('a count above the rating scale survives — 8 servings is 8, not clamped to 5', () => {
    // The 1–5 clamp the rating fields use would silently rewrite this.
    assert.equal(normalizeBehaviors({ caffeineServings: 8 })?.caffeineServings, 8);
    assert.equal(normalizeBehaviors({ caffeineServings: 99 })?.caffeineServings, MAX_SERVINGS);
    assert.equal(normalizeBehaviors({ caffeineServings: -3 })?.caffeineServings, 0);
  });

  it('nothing logged is undefined, not an empty object', () => {
    assert.equal(normalizeBehaviors({}), undefined);
    assert.equal(normalizeBehaviors(null), undefined);
    assert.equal(normalizeBehaviors('caffeine'), undefined);
    assert.equal(normalizeBehaviors({ bedTime: 'nope', creatine: 'yes' }), undefined);
  });

  it('false is preserved — "no alcohol today" is data', () => {
    assert.equal(normalizeBehaviors({ creatine: false })?.creatine, false);
  });
});

describe('mergeBehaviors', () => {
  it('a partial write never erases what the day already holds', () => {
    // This is the WorkoutVictorySheet reply-chip path: one energy rating written
    // in the evening must not wipe the morning's behavior log.
    const existing = { bedTime: '23:00', caffeineServings: 2, creatine: true };
    const merged = mergeBehaviors({ hydration: true }, existing);
    assert.equal(merged?.bedTime, '23:00');
    assert.equal(merged?.caffeineServings, 2);
    assert.equal(merged?.creatine, true);
    assert.equal(merged?.hydration, true);
  });

  it('an incoming value wins over the stored one', () => {
    const merged = mergeBehaviors({ caffeineServings: 4 }, { caffeineServings: 1 });
    assert.equal(merged?.caffeineServings, 4);
  });

  it('merging nothing into nothing stays undefined', () => {
    assert.equal(mergeBehaviors(undefined, undefined), undefined);
  });
});

describe('formatBehaviorFooter', () => {
  it('a count never renders as a rating out of five', () => {
    const lines = formatBehaviorFooter({ caffeineServings: 2, alcoholServings: 1 });
    assert.ok(lines.includes('Caffeine 2'));
    for (const line of lines) {
      assert.ok(!line.includes('/5'), `count rendered as a rating: ${line}`);
    }
  });

  it('caffeine timing rides along when it was logged — the timing is the insight', () => {
    const lines = formatBehaviorFooter({ caffeineServings: 3, caffeineLastAt: '16:30' });
    assert.ok(lines.some((l) => l.includes('16:30')));
  });

  it('booleans read as yes/no, including the no', () => {
    const lines = formatBehaviorFooter({ creatine: true, lateMeal: false });
    assert.ok(lines.includes('Creatine yes'));
    assert.ok(lines.includes('Late meal no'));
  });

  it('nothing logged is no lines at all', () => {
    assert.deepEqual(formatBehaviorFooter(undefined), []);
    assert.deepEqual(formatBehaviorFooter({}), []);
  });
});
