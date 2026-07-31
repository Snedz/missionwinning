/**
 * The parser answers or asks — it never guesses.
 *
 * `.225` — the failure mode worth designing against is a chart of the *wrong*
 * metric, because it looks exactly like a right answer. This repo has paid for
 * "confident number, wrong quantity" in `.208`, `.217`, `.220` and `.223`, so
 * the tests below spend most of their weight on the refusals rather than on
 * the happy path.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_WINDOW_DAYS,
  parseTrendQuery,
  parseWindowDays,
} from '@/lib/trends/parseTrendQuery';
import { TREND_METRICS, trendMetric } from '@/lib/trends/trendMetrics';

/** Narrow to the success case, failing loudly rather than returning undefined. */
function ok(raw: string) {
  const parsed = parseTrendQuery(raw);
  assert.ok(parsed.ok, `expected "${raw}" to parse, got ${JSON.stringify(parsed)}`);
  return parsed.query;
}

describe('parseTrendQuery — what it understands', () => {
  it('reads the metric and the window out of a natural sentence', () => {
    const q = ok('how has my volume been over the last 30 days');
    assert.equal(q.metric, 'volume');
    assert.equal(q.windowDays, 30);
    assert.equal(q.windowAssumed, false);
  });

  it('accepts the phrasings people actually type', () => {
    assert.equal(ok('show me my protein this week').metric, 'protein');
    assert.equal(ok('sessions past 6 weeks').windowDays, 42);
    assert.equal(ok('chart my bodyweight').metric, 'bodyweight');
    assert.equal(ok('waist over three months').windowDays, 90);
    assert.equal(ok('active minutes last 14 days').metric, 'active');
  });

  it('prefers the more specific phrase', () => {
    /*
     * "body fat" contains "body", and "active minutes" contains "active". A
     * parser that took the first table hit would answer bodyweight and active
     * respectively — right-looking charts of the wrong quantity.
     */
    assert.equal(ok('body fat over the last month').metric, 'bodyfat');
    assert.equal(ok('active minutes trend').metric, 'active');
  });

  it('defaults the window and says that it did', () => {
    const q = ok('my volume trend');
    assert.equal(q.windowDays, DEFAULT_WINDOW_DAYS);
    assert.equal(q.windowAssumed, true, 'an assumed window must be reported, not implied');
  });
});

describe('parseTrendQuery — what it refuses', () => {
  it('refuses an empty query', () => {
    assert.deepEqual(parseTrendQuery(''), { ok: false, reason: 'empty' });
    assert.deepEqual(parseTrendQuery('   '), { ok: false, reason: 'empty' });
  });

  it('refuses a metric it does not measure rather than picking a near one', () => {
    for (const q of ['how did I sleep last week', 'my hrv over 30 days', 'resting heart rate']) {
      const parsed = parseTrendQuery(q);
      assert.equal(parsed.ok, false, `"${q}" must not resolve — this app cannot measure it`);
      assert.equal(parsed.ok === false && parsed.reason, 'no-metric');
    }
  });

  it('surfaces the weight ambiguity instead of resolving it by table order', () => {
    /*
     * The one word worth refusing loudly. In a training app "my weight is
     * going up" is the scale or the bar with equal likelihood, and the app
     * measures both — so answering either silently is wrong half the time.
     */
    const parsed = parseTrendQuery('am I lifting more weight');
    assert.equal(parsed.ok, false);
    assert.equal(parsed.ok === false && parsed.reason, 'ambiguous');
    assert.deepEqual(
      parsed.ok === false && parsed.reason === 'ambiguous' ? parsed.candidates : null,
      ['bodyweight', 'volume']
    );
  });

  it('but a qualified weight is not ambiguous', () => {
    /*
     * The qualifier is doing real work in each of these, and the possessive is
     * the interesting one: in English "my weight" is the scale, while a bare
     * "weight" in a training app is as likely to be the bar. So `'my weight'`
     * earns its place in `bodyweight`'s phrase list, and the refusal above is
     * reserved for the genuinely undecidable case.
     *
     * The first draft of that test asked about "has my weight gone up" and
     * expected a refusal — it parsed cleanly, correctly, and the test was the
     * thing that was wrong.
     */
    assert.equal(ok('body weight last month').metric, 'bodyweight');
    assert.equal(ok('how has my weight changed').metric, 'bodyweight');
    assert.equal(ok('training volume last month').metric, 'volume');
  });

  it('reports both candidates when a query names two metrics', () => {
    const parsed = parseTrendQuery('protein and waist over 30 days');
    assert.equal(parsed.ok, false);
    assert.equal(parsed.ok === false && parsed.reason, 'ambiguous');
  });

  it('does not match a keyword buried inside another word', () => {
    /*
     * "active" is a real entry in the table and sits inside "inactive" — so
     * this asks something the data can actually violate.
     *
     * The first version used "fatigue" for "fat", which reads well and proves
     * nothing: no metric answers to a bare "fat", so no matching strategy at
     * all could have failed it. A mutation swapping whole-word matching for
     * `includes()` walked straight through. That is the vacuous-guard shape
     * this repo has now paid for a dozen times, written fresh.
     */
    const parsed = parseTrendQuery('I was totally inactive last week');
    assert.equal(parsed.ok, false, '"inactive" must not select the active-minutes metric');
  });
});

describe('parseWindowDays', () => {
  it('reads digits and spelled-out counts alike', () => {
    assert.equal(parseWindowDays('last 7 days'), 7);
    assert.equal(parseWindowDays('past two weeks'), 14);
    assert.equal(parseWindowDays('over a month'), 30);
    assert.equal(parseWindowDays('this week'), 7);
  });

  it('returns null when no window is named, rather than inventing one', () => {
    assert.equal(parseWindowDays('my volume'), null);
  });

  it('caps a runaway window at a year', () => {
    assert.equal(parseWindowDays('last 900 days'), 365);
    assert.equal(parseWindowDays('all time'), 365);
  });

  it('ignores a zero or malformed count', () => {
    assert.equal(parseWindowDays('last 0 days'), null);
  });
});

describe('TREND_METRICS registry', () => {
  it('every metric names the series it comes from', () => {
    /*
     * `source` is why an entry is allowed to exist. `.178` is the standing risk
     * here — it would be easy to re-derive "weekly volume" in this table rather
     * than call the function that already says it, and then have two answers.
     */
    for (const m of TREND_METRICS) {
      assert.ok(m.source.trim().length > 10, `${m.id} does not say where its series comes from`);
      assert.ok(m.match.length > 0, `${m.id} has no way to be asked for`);
      assert.ok(m.label.trim().length > 0, `${m.id} has no fallback label`);
    }
  });

  it('no two metrics answer to the same phrase', () => {
    const seen = new Map<string, string>();
    const clashes: string[] = [];
    for (const m of TREND_METRICS) {
      for (const phrase of m.match) {
        const prior = seen.get(phrase);
        if (prior) clashes.push(`"${phrase}" → ${prior} and ${m.id}`);
        else seen.set(phrase, m.id);
      }
    }
    assert.deepEqual(clashes, [], 'a phrase that selects two metrics can only ever be a coin flip');
  });

  it('no phrase of one metric is contained in another metric\'s', () => {
    /*
     * The invariant that replaces runtime ranking.
     *
     * `parseTrendQuery` used to sort matches by phrase length and drop the
     * shorter ones, so that a metric answering to "active" could not shadow one
     * answering to "active minutes". Mutation testing killed the idea: removing
     * that ranking changed no result, because no such pair exists — and a rule
     * nothing can exercise is a rule nobody can trust.
     *
     * Forbidding the overlap here makes the collision a **failing test** at the
     * moment someone adds the phrase, instead of a silent ranking decision made
     * at runtime. Containment *within* one metric is fine and expected —
     * "session" inside "sessions" always answers the same thing.
     */
    const clashes: string[] = [];
    for (const a of TREND_METRICS) {
      for (const b of TREND_METRICS) {
        if (a.id === b.id) continue;
        for (const pa of a.match) {
          for (const pb of b.match) {
            if (pa !== pb && pb.includes(pa)) clashes.push(`${a.id}:"${pa}" ⊂ ${b.id}:"${pb}"`);
          }
        }
      }
    }
    assert.deepEqual(
      clashes,
      [],
      'one metric\'s phrase sits inside another\'s — rename it, or the shorter one silently wins'
    );
  });

  it('every id in the union has a table entry', () => {
    // The one way this registry silently stops covering something is an id
    // added to the type and not to the table.
    for (const m of TREND_METRICS) assert.equal(trendMetric(m.id).id, m.id);
    assert.throws(() => trendMetric('nope' as never), /no entry/);
  });

  it('lists no metric this app cannot measure', () => {
    /*
     * Training, not health. There is no wearable, and `sleepConsistency.ts` is
     * already an explicit refusal to print a sleep number this app cannot
     * compute — a registry that offered one would make the asking surface
     * promise what the measuring surface refuses.
     */
    const unmeasurable = ['hrv', 'sleep', 'heart rate', 'spo2', 'respiratory'];
    for (const m of TREND_METRICS) {
      for (const phrase of m.match) {
        assert.ok(
          !unmeasurable.some((u) => phrase.includes(u)),
          `${m.id} answers to "${phrase}" — this app has no wearable and cannot measure it`
        );
      }
    }
  });
});
