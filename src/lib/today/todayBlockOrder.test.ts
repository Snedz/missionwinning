/**
 * What Today spills, and why it is not a matter of taste.
 *
 * Horizon W excellence criterion 2 is *"one clear next session on Today"*.
 * Before `.240` the declared prices were `dashboard` 10, `day-review` 15,
 * `intent` 20, `coach-invite` 25, `week-recap` 30, `coach-today` 35,
 * `coach-week` 45 — and with the four spillable slots a real athlete has, that
 * ordering produced this, on a readiness athlete's evening screen:
 *
 *     visible: header · dashboard · coach-invite · day-review · week-recap
 *     hidden : coach-week · freshness · guidebook
 *
 * A card **inviting you to go and get a weekly plan** was on the screen while
 * the weekly plan itself was inside a disclosure. At `commissioned` both the
 * session and the week were hidden together.
 *
 * This guard does not enumerate the prices — a test that restates the numbers
 * passes for any numbers. It states the **rule** the numbers have to satisfy and
 * reads the prices out of the shell, so a future edit that reintroduces the
 * defect fails here rather than shipping (`.220`: a check whose name claims a
 * wider scope than its enumeration is the twelfth vacuous guard).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { planTodayBlocks, type TodayBlockCandidate } from '@/lib/today/todayBlockBudget';
import { TODAY_BLOCK_PRIORITY, type TodayBlockKey } from '@/lib/today/todayBlockPriority';

const root = path.join(import.meta.dirname, '..', '..', '..');
const SHELLS = [
  'src/page-components/HomeTodayDashboard.tsx',
  'src/page-components/HomeTodayLean.tsx',
];
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const p = (k: TodayBlockKey) => TODAY_BLOCK_PRIORITY[k];

/**
 * The rules below are about the shipped screens, so the screens have to be the
 * ones using this table. A price list nothing imports is a price list about
 * nothing — `.221`, where `check-token-sync` pinned values that components had
 * already drifted away from, because it never opened a `.tsx`.
 */
test('both Today shells price their blocks from the shared table', () => {
  for (const shell of SHELLS) {
    const src = read(shell);
    assert.match(
      src,
      /from ["']@\/lib\/today\/todayBlockPriority["']/,
      `${shell} does not import TODAY_BLOCK_PRIORITY — two shells with two price lists is ` +
        `an ordering that can invert in one of them silently`
    );
    assert.doesNotMatch(
      src,
      /priority:\s*\d/,
      `${shell} still declares a literal priority. Every price belongs in the shared table, ` +
        `or the table stops being the answer to "what does Today show first"`
    );
  }
});

/**
 * And both shells must actually apply the budget. `HomeTodayLean` had none
 * before `.240`: it stacked whatever mounted, in source order, with no ceiling.
 */
test('both Today shells apply the block budget', () => {
  for (const shell of SHELLS) {
    assert.match(
      read(shell),
      /planTodayBlocks\(/,
      `${shell} never calls planTodayBlocks — a shell with no budget is the feed the budget exists to prevent`
    );
  }
});

/**
 * The next action is docked on both shells, or on neither.
 *
 * `.240` — `JourneyHero` was portalled to `ScreenDock` in the dashboard shell
 * and rendered inline in the lean one. `ScreenDock` exists so the one red
 * action cannot leave the fold; inline, it scrolls away. The cohort that lost
 * it was `i-day`/`basic` — athletes who have not yet completed a workout, whose
 * next action is the entire reason the screen exists.
 */
test('both Today shells dock the next action', () => {
  for (const shell of SHELLS) {
    const src = read(shell);
    assert.match(
      src,
      /<ScreenDock>[\s\S]*?<JourneyHero/,
      `${shell} does not dock <JourneyHero> — an inline hero can scroll off the bottom, ` +
        `which is exactly what ScreenDock was built to prevent`
    );
  }
});

test('what to do outranks how you did', () => {
  assert.ok(
    p('coach-today') < p('dashboard'),
    `today's prescribed session (${p('coach-today')}) must outrank the Mission Score ` +
      `(${p('dashboard')}) — Today answers "what now", not "how am I doing"`
  );
  assert.ok(
    p('coach-week') < p('dashboard'),
    `this week's plan (${p('coach-week')}) must outrank the Mission Score (${p('dashboard')})`
  );
});

test('the invitation never outranks the thing it invites you to', () => {
  assert.ok(
    p('coach-invite') > p('coach-week') && p('coach-invite') > p('coach-today'),
    `'coach-invite' (${p('coach-invite')}) is a link asking the athlete to go and get a ` +
      `weekly plan. It must never win a slot that the plan itself (${p('coach-today')}/` +
      `${p('coach-week')}) then loses — an invitation replaces the thing, it does not sit beside it`
  );
});

test('the session and the week survive the budget together, on a real screen', () => {
  // A commissioned athlete's evening, with the beta banner still up — the
  // densest screen the app produces, and the one the defect was found on.
  const candidates: TodayBlockCandidate<string>[] = [
    { key: 'beta', priority: 0, pinned: true, node: 'beta' },
    { key: 'header', priority: 1, pinned: true, node: 'header' },
    ...(['intent', 'dashboard', 'freshness', 'day-review', 'week-recap', 'coach-week', 'coach-today', 'guidebook'] as const).map(
      (k) => ({ key: k, priority: p(k), node: k })
    ),
    { key: 'more', priority: Number.MAX_SAFE_INTEGER, pinned: true, node: 'more' },
  ];

  const { top } = planTodayBlocks(candidates);
  const visible = new Set(top.map((c) => c.key));

  assert.ok(
    visible.has('coach-today'),
    `today's session spilled into the disclosure on the densest real screen — ` +
      `visible was: ${top.map((c) => c.key).join(', ')}`
  );
  assert.ok(
    visible.has('coach-week'),
    `this week's plan spilled on the densest real screen — visible was: ${top
      .map((c) => c.key)
      .join(', ')}`
  );
});
