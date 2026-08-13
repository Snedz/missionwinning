import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { XP_BY_ACTION } from '@/lib/rewards/catalog';
import { EARN_EVENT_LABELS } from '@/lib/transparency/earnTable';
import {
  CLUB_PLANNED_BOOSTS,
  PENALTY_DISPLAY,
  WEIGHTS_SOURCE_CLUB,
  WEIGHTS_SOURCE_LIVE,
  WEIGHTS_SOURCE_VISIBILITY,
  publishClubPlannedBoosts,
  publishLiveBoosts,
  publishPenalties,
} from '@/lib/transparency/weights';

const root = path.join(import.meta.dirname, '..', '..', '..');

test('live boosts match the catalog, never another product\'s ranking scores', () => {
  const rows = publishLiveBoosts();
  assert.equal(rows.length, Object.keys(XP_BY_ACTION).length);
  for (const row of rows) {
    assert.equal(row.kind, 'boost');
    assert.equal(row.live, true);
    assert.equal(row.source, WEIGHTS_SOURCE_LIVE);
    assert.ok(row.id in XP_BY_ACTION);
    assert.equal(row.points, XP_BY_ACTION[row.id as keyof typeof XP_BY_ACTION]);
    assert.equal(row.display, `+${row.points}`);
    assert.equal(row.label, EARN_EVENT_LABELS[row.id as keyof typeof EARN_EVENT_LABELS]);
    assert.doesNotMatch(row.label, /copy link|quote|repost|share via dm/i);
  }
  assert.ok(rows.some((r) => r.id === 'workout_finish' && r.points === 50));
});

test('Club planned boosts publish session and coach-plan from CLUB_PLAN', () => {
  const club = readFileSync(path.join(root, 'docs/CLUB_PLAN.md'), 'utf8');
  assert.match(club, /Workout session completed.*\|\s*10\s*\|/);
  assert.match(club, /Coach-plan session done.*\|\s*\+?5\s*\|/);

  const rows = publishClubPlannedBoosts();
  assert.equal(rows.length, CLUB_PLANNED_BOOSTS.length);
  const session = rows.find((r) => r.id === 'club_session');
  const coachPlan = rows.find((r) => r.id === 'club_coach_plan');
  assert.ok(session);
  assert.ok(coachPlan);
  assert.equal(session.points, 10);
  assert.equal(session.display, '+10');
  assert.equal(coachPlan.points, 5);
  assert.equal(coachPlan.display, '+5');
  for (const row of rows) {
    assert.equal(row.live, false);
    assert.equal(row.source, WEIGHTS_SOURCE_CLUB);
    assert.equal(row.kind, 'boost');
  }
});

test('penalties are visibility filters and never debit points', () => {
  const rows = publishPenalties();
  assert.deepEqual(
    rows.map((r) => r.id),
    ['report', 'mute', 'block', 'hide']
  );
  for (const row of rows) {
    assert.equal(row.kind, 'penalty');
    assert.equal(row.points, null);
    assert.equal(row.display, PENALTY_DISPLAY);
    assert.equal(row.cap, 'visibility filter');
    assert.equal(row.source, WEIGHTS_SOURCE_VISIBILITY);
    assert.match(row.note ?? '', /does not debit/i);
    assert.doesNotMatch(row.display, /you lost/i);
    assert.doesNotMatch(row.display, /-\d/);
  }
});

test('no ROOM SCORE table exists to invent penalty magnitudes from', () => {
  const hits: string[] = [];
  for (const rel of ['docs/CLUB_PLAN.md', 'docs/contracts/ECONOMY.md', 'docs/TRANSPARENCY_PLAN.md']) {
    const src = readFileSync(path.join(root, rel), 'utf8');
    // A heading or markdown table named ROOM SCORE — not a sentence that says it is absent.
    if (/^#{1,6}\s+ROOM SCORE\b/im.test(src) || /^\|[^|\n]*ROOM SCORE/im.test(src)) {
      hits.push(rel);
    }
  }
  assert.deepEqual(hits, [], 'ROOM SCORE table appeared — wire it, do not keep filter labels');
});
