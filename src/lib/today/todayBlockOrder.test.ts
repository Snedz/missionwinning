/**
 * What Today spills, and why it is not a matter of taste.
 *
 * Horizon W excellence criterion 2 is *"one clear next session on Today"*.
 * Before `.224` the declared prices were `dashboard` 10, `day-review` 15,
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

const root = path.join(import.meta.dirname, '..', '..', '..');
const SHELL = 'src/page-components/HomeTodayDashboard.tsx';

/**
 * Read the declared prices out of the shell rather than restating them, so the
 * assertions below are about the shipped screen and not about this file.
 */
function declaredPriorities(): Map<string, number> {
  const src = readFileSync(path.join(root, SHELL), 'utf8');
  const found = new Map<string, number>();
  // `key: 'x', priority: N` and `key: 'x',\n priority: N` both occur.
  const re = /key:\s*'([a-z-]+)'\s*,\s*(?:\/\/[^\n]*\n\s*)*priority:\s*(\d+)/g;
  for (const m of src.matchAll(re)) found.set(m[1]!, Number(m[2]));
  return found;
}

test('every Today block the shell declares has a price this guard can see', () => {
  const prices = declaredPriorities();
  // If the declaration syntax changes, the regex above silently matches nothing
  // and every rule below passes vacuously. Anchor on the blocks this wave is about.
  for (const key of ['coach-today', 'coach-week', 'dashboard', 'coach-invite', 'day-review']) {
    assert.ok(
      prices.has(key),
      `could not read a priority for '${key}' out of ${SHELL} — the parser has drifted ` +
        `from the declaration syntax, which would make every rule in this file vacuous`
    );
  }
});

test('what to do outranks how you did', () => {
  const p = declaredPriorities();
  assert.ok(
    p.get('coach-today')! < p.get('dashboard')!,
    `today's prescribed session (${p.get('coach-today')}) must outrank the Mission Score ` +
      `(${p.get('dashboard')}) — Today answers "what now", not "how am I doing"`
  );
  assert.ok(
    p.get('coach-week')! < p.get('dashboard')!,
    `this week's plan (${p.get('coach-week')}) must outrank the Mission Score (${p.get('dashboard')})`
  );
});

test('the invitation never outranks the thing it invites you to', () => {
  const p = declaredPriorities();
  assert.ok(
    p.get('coach-invite')! > p.get('coach-week')! && p.get('coach-invite')! > p.get('coach-today')!,
    `'coach-invite' (${p.get('coach-invite')}) is a link asking the athlete to go and get a ` +
      `weekly plan. It must never win a slot that the plan itself (${p.get('coach-today')}/` +
      `${p.get('coach-week')}) then loses — an invitation replaces the thing, it does not sit beside it`
  );
});

test('the session and the week survive the budget together, on a real screen', () => {
  const p = declaredPriorities();
  // A commissioned athlete's evening, with the beta banner still up — the
  // densest screen the app produces, and the one the defect was found on.
  const candidates: TodayBlockCandidate<string>[] = [
    { key: 'beta', priority: 0, pinned: true, node: 'beta' },
    { key: 'header', priority: 1, pinned: true, node: 'header' },
    ...(['intent', 'dashboard', 'freshness', 'day-review', 'week-recap', 'coach-week', 'coach-today', 'guidebook'] as const).map(
      (k) => ({ key: k, priority: p.get(k)!, node: k })
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
