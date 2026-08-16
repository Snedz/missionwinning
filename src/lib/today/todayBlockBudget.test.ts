import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  TODAY_MAX_TOP_LEVEL_BLOCKS,
  planTodayBlocks,
  type TodayBlockCandidate,
} from '@/lib/today/todayBlockBudget';
import { TODAY_BLOCK_PRIORITY, type TodayBlockKey } from '@/lib/today/todayBlockPriority';

const block = (
  key: TodayBlockKey,
  pinned = false
): TodayBlockCandidate<string> => ({
  key,
  priority: TODAY_BLOCK_PRIORITY[key],
  pinned,
  node: key,
});

const synthetic = (
  key: string,
  priority: number,
  pinned = false
): TodayBlockCandidate<string> => ({ key, priority, pinned, node: key });

/** The real Today set, priced from the shared table (not a stale copy). */
const TODAY_BLOCKS: TodayBlockCandidate<string>[] = [
  block('beta', true),
  block('header', true),
  block('intent'),
  block('reentry', true),
  block('dashboard'),
  block('freshness'),
  block('day-review'),
  block('week-recap'),
  block('coach-week'),
  block('coach-today'),
  block('guidebook'),
];

describe('planTodayBlocks', () => {
  it('keeps everything when the screen is under budget', () => {
    const few = TODAY_BLOCKS.slice(0, 4);
    const { top, inMore } = planTodayBlocks(few);
    assert.equal(top.length, few.length);
    assert.deepEqual(inMore, []);
  });

  it('holds the budget once every card wants a slot', () => {
    const { top } = planTodayBlocks(TODAY_BLOCKS);
    assert.ok(
      top.length <= TODAY_MAX_TOP_LEVEL_BLOCKS,
      `${top.length} top-level blocks exceeds the budget of ${TODAY_MAX_TOP_LEVEL_BLOCKS}`
    );
  });

  it('loses nothing — every block is either on top or in the disclosure', () => {
    const { top, inMore } = planTodayBlocks(TODAY_BLOCKS);
    const seen = [...top, ...inMore].map((b) => b.key).sort();
    assert.deepEqual(seen, TODAY_BLOCKS.map((b) => b.key).sort());
    assert.equal(new Set(seen).size, seen.length, 'a block appeared twice');
  });

  /**
   * A budget that can hide the page header is a bug wearing a constraint's hat.
   * Pinned blocks survive even when they alone would blow the budget, because
   * the alternative is an athlete who cannot see where they are.
   */
  it('never spills a pinned block, even past the budget', () => {
    const allPinned = Array.from({ length: TODAY_MAX_TOP_LEVEL_BLOCKS + 4 }, (_, i) =>
      synthetic(`p${i}`, i, true)
    );
    const { top, inMore } = planTodayBlocks(allPinned);
    assert.equal(top.length, allPinned.length);
    assert.deepEqual(inMore, []);
  });

  it('spills the lowest-priority cards first', () => {
    const { inMore } = planTodayBlocks(TODAY_BLOCKS);
    const spilled = inMore.map((b) => b.priority);
    const kept = planTodayBlocks(TODAY_BLOCKS)
      .top.filter((b) => !b.pinned)
      .map((b) => b.priority);
    for (const s of spilled) {
      for (const k of kept) {
        assert.ok(s > k, `spilled priority ${s} outranks kept priority ${k}`);
      }
    }
  });

  /**
   * Priority decides *what spills*, never *what order things read in*. Sorting
   * the visible screen would make cards jump between renders as their conditions
   * flip, which is worse than a long screen.
   */
  it('never reorders what the caller declared', () => {
    const { top } = planTodayBlocks(TODAY_BLOCKS);
    const declaredOrder = TODAY_BLOCKS.map((b) => b.key).filter((k) =>
      top.some((t) => t.key === k)
    );
    assert.deepEqual(top.map((b) => b.key), declaredOrder);
  });

  it('is stable — the same input plans the same screen twice', () => {
    const a = planTodayBlocks(TODAY_BLOCKS);
    const b = planTodayBlocks(TODAY_BLOCKS);
    assert.deepEqual(a.top.map((x) => x.key), b.top.map((x) => x.key));
    assert.deepEqual(a.inMore.map((x) => x.key), b.inMore.map((x) => x.key));
  });

  /**
   * 32 combinations of the conditional blocks — the shape the real screen takes
   * across phases, weekdays and re-entry. The budget is a claim about every one
   * of them, not about the case someone happened to open in a browser.
   */
  it('holds across every combination of conditional cards', () => {
    const optional = ['intent', 'dashboard', 'day-review', 'week-recap', 'coach-week'];
    for (let mask = 0; mask < 1 << optional.length; mask++) {
      const on = new Set(optional.filter((_, i) => mask & (1 << i)));
      const candidates = TODAY_BLOCKS.filter(
        (b) => !optional.includes(b.key) || on.has(b.key)
      );
      const { top, inMore } = planTodayBlocks(candidates);
      assert.ok(
        top.length <= TODAY_MAX_TOP_LEVEL_BLOCKS,
        `mask ${mask}: ${top.length} blocks`
      );
      assert.equal(top.length + inMore.length, candidates.length, `mask ${mask}: lost a block`);
    }
  });

  it('an empty screen plans to nothing rather than throwing', () => {
    assert.deepEqual(planTodayBlocks([]), { top: [], inMore: [] });
  });

  /**
   * H-02: the Coach week proposal replaces the adapt banner. A seventh
   * top-level block is the kill criterion. TAP_BUDGET is a down-only ratchet.
   */
  it('H-02: the week diff is the banner, not a seventh Today block', () => {
    assert.equal(TODAY_MAX_TOP_LEVEL_BLOCKS, 6);
    assert.ok(!('coach-week-diff' in TODAY_BLOCK_PRIORITY));
    assert.ok(!('coach-adapt' in TODAY_BLOCK_PRIORITY));
    const { top } = planTodayBlocks(TODAY_BLOCKS);
    assert.ok(top.length <= TODAY_MAX_TOP_LEVEL_BLOCKS);

    const root = join(import.meta.dirname, '..', '..', '..');
    const dash = readFileSync(join(root, 'src/page-components/HomeTodayDashboard.tsx'), 'utf8');
    assert.match(dash, /'coach-week'/);
    assert.doesNotMatch(dash, /'coach-week-diff'|'coach-adapt'/);

    const banner = readFileSync(join(root, 'src/components/coach/CoachAdaptBanner.tsx'), 'utf8');
    assert.match(banner, /sessionCountChangeFromPlan/);
    assert.match(banner, /coach-week-diff/);

    const first90 = readFileSync(join(root, 'tests/e2e/first-90.spec.ts'), 'utf8');
    assert.match(first90, /const TAP_BUDGET = 4/);
  });
});
