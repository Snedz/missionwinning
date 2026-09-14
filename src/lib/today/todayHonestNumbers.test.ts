import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Today must not publish a number nobody measured.
 *
 * `MetricsRow` has a careful em-dash guard and a comment explaining it — *"a
 * number nobody measured is a worse lie than a zero, because it looks true"* —
 * but the guard asked only one question: `sessions > 0`, i.e. *has this athlete
 * ever trained*. `HomeTodayDashboard` seeds a literal `{ readiness: 50, strain:
 * 50, recovery: 50 }` until its below-fold imports resolve, so any returning
 * athlete cleared that test and read three fabricated scores — captioned "Train
 * smart / Moderate load / Rebuilding", with a coach line derived from them — as
 * measurements of their own body. The exact lie the comment describes, arriving
 * down the one road the guard did not watch.
 *
 * Two more holes on the same screen, same class:
 *   - "This week" had `todaysWorkout ? … : "Loading week…"` and **no third
 *     branch**, while the four dynamic `import()`s feeding it had **no
 *     `.catch`**. A failed chunk left a permanent spinner-in-prose that nothing
 *     knew about — and with the service worker gated there is no cache to serve
 *     the chunk from, so `.600`'s finding and this one compound.
 *   - That placeholder also never declared `aria-busy`, so it was invisible to a
 *     screen reader *and* to the a11y suite's `settle()` (`.253`).
 */

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

describe('placeholder body scores never render as measurements', () => {
  it('MetricsRow treats `pending` as unmeasured regardless of session count', () => {
    const src = stripComments(read('src/components/metrics/MetricsRow.tsx'));
    assert.match(
      src,
      /const measured = !pending && \(sessions === undefined \|\| sessions > 0\)/,
      'the em-dash guard must consider `pending`; keying on `sessions` alone lets a seeded 50 ' +
        'through for every athlete who has ever trained'
    );
    assert.match(
      src,
      /const recoveryMeasured = !pending && /,
      'recovery needs the same treatment — it is the figure with the *least* data behind it'
    );
  });

  it('the dashboard passes the real condition, not a constant', () => {
    const src = stripComments(read('src/page-components/HomeTodayDashboard.tsx'));
    assert.match(
      src,
      /pending=\{!belowFoldReady\}/,
      'the header must be told when the scores are still placeholders — and told by the same flag ' +
        'that decides whether they are'
    );
    // The seeded triple may stay (it keeps the type simple); what must not
    // happen is publishing it. Pin that it is still gated on `belowFoldReady`,
    // so a refactor cannot make it the steady-state value.
    assert.match(
      src,
      /if \(!belowFoldReady\) \{[\s\S]{0,200}readiness: 50/,
      'the 50/50/50 seed must remain reachable only while below-fold work is pending'
    );
  });

  it('the header forwards it rather than swallowing it', () => {
    const src = stripComments(read('src/components/today/TodayDashboardHeader.tsx'));
    assert.match(src, /pending=\{pending\}/, 'TodayDashboardHeader must pass `pending` to MetricsRow');
  });
});

describe('"This week" can fail visibly', () => {
  it('the loader catches a rejected import chain', () => {
    const src = stripComments(read('src/page-components/HomeTodayDashboard.tsx'));
    assert.match(
      src,
      /setWeekLoadFailed\(true\)/,
      'four dynamic imports with no catch: a chunk failure left "Loading week…" forever and nothing ' +
        'recorded that it had failed'
    );
  });

  it('the accordion has a third branch, with a way out', () => {
    const src = stripComments(read('src/components/today/TodayDashboardAccordion.tsx'));
    assert.match(src, /props\.weekLoadFailed \?/, 'there must be an error branch, not just loaded/loading');
    assert.match(
      src,
      /<ErrorState[\s\S]{0,700}onAction=/,
      'ErrorState renders no retry unless it is passed an `onAction` — "recoverable" means passing one'
    );
  });

  it('the loading placeholder announces itself', () => {
    const src = stripComments(read('src/components/today/TodayDashboardAccordion.tsx'));
    assert.match(
      src,
      /aria-busy="true"/,
      'a placeholder that does not declare itself is invisible to a screen reader and to the a11y ' +
        "suite's settle(), which waits on [aria-busy=\"true\"]"
    );
  });
});

describe('the hero gate keys off the house desk after a finish', () => {
  /**
   * `/log` is TodayDesk in every journey phase. `HomeTodayDashboard` (and
   * `today-score-band`) stays on disk as a leftover shell — it is not this
   * route. Asserting the band as visible on `/log` is the stale dashboard tour.
   *
   * The MetricsRow `pending` guards above still apply to that leftover shell.
   * The hero walk now keys off History + first-rooms progress the desk actually
   * writes after Finish.
   */
  it('does not wait for the unmounted dashboard score band on /log', () => {
    const spec = stripComments(read('tests/e2e/hero-flows.spec.ts'));
    assert.doesNotMatch(
      spec,
      /getByTestId\('today-score-band'\)/,
      'today-score-band lives on HomeTodayDashboard, which HomePage no longer mounts'
    );
    assert.doesNotMatch(
      spec,
      /getByText\(\/mission score\|win score\|cross-pillar\/i\)\.first\(\)/,
      'the broad regex matches leftover dashboard prose, not the desk'
    );
    assert.match(
      spec,
      /today-first-steps/,
      'a finish must tick first rooms on the desk'
    );
    assert.match(
      spec,
      /a\[href="\/history"\]/,
      'a finish must write History on the desk'
    );
  });

  it('the leftover band hook still exists on the unused dashboard shell', () => {
    assert.match(
      stripComments(read('src/components/today/TodayDashboardHeader.tsx')),
      /data-testid="today-score-band"/,
      'do not delete the hook while the leftover shell remains on disk'
    );
  });

  it('the hidden duplicate really is inside a collapsed native details', () => {
    // Why the prose locator is fragile rather than why it failed — see `.604`.
    // A second, permanently-hidden "Cross-pillar Mission Score" exists in the
    // DOM, and only DOM order keeps the regex off it. If "Health scores" ever
    // defaults open, or stops being a <details>, or simply moves above the
    // band, that margin is gone — so pin the shape the reasoning rests on.
    const section = stripComments(read('src/components/journey/TodaySection.tsx'));
    assert.match(section, /<details/, 'TodaySection is a native <details> — that is why it is named by its summary');
    const accordion = stripComments(read('src/components/today/TodayDashboardAccordion.tsx'));
    assert.match(
      accordion,
      /todaySectionHealth[\s\S]{0,400}defaultOpen=\{false\}/,
      'the Health scores section holds the duplicate "Cross-pillar Mission Score" and stays collapsed'
    );
  });
});
