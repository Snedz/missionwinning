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

describe('the hero gate keys off the visible band', () => {
  /**
   * `.596` shipped this spec knowingly red. The repair is not a product change:
   * the score band was visible all along, and the spec was picking a hidden
   * duplicate out of a collapsed `<details>`.
   */
  it('asserts a test id rather than a text regex that can match hidden copy', () => {
    const spec = stripComments(read('tests/e2e/hero-flows.spec.ts'));
    assert.match(spec, /getByTestId\('today-score-band'\)/, 'scope the assertion to the visible band');
    assert.doesNotMatch(
      spec,
      /getByText\(\/mission score\|win score\|cross-pillar\/i\)\.first\(\)/,
      'the broad regex + .first() is what selected the hidden copy inside the collapsed section'
    );
  });

  it('the band it points at exists', () => {
    assert.match(
      stripComments(read('src/components/today/TodayDashboardHeader.tsx')),
      /data-testid="today-score-band"/,
      'the spec targets a hook the component must actually render'
    );
  });

  it('the hidden duplicate really is inside a collapsed native details', () => {
    // The premise of the whole repair. If "Health scores" ever defaults open,
    // or stops being a <details>, the old locator would have started passing on
    // its own and this reasoning needs re-reading.
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
