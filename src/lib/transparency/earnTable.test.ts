import { test } from 'node:test';
import assert from 'node:assert/strict';

import { DAILY_ACTION_CAPS, DAILY_XP_SOFT_CAP, XP_BY_ACTION } from '@/lib/rewards/catalog';
import type { RewardActionId } from '@/lib/rewards/types';
import {
  capLabelForAction,
  EARN_EVENT_LABELS,
  publishEarnTable,
} from '@/lib/transparency/earnTable';

test('earn table is one row per live catalog action', () => {
  const rows = publishEarnTable();
  const ids = Object.keys(XP_BY_ACTION) as RewardActionId[];
  assert.equal(rows.length, ids.length);
  for (const id of ids) {
    const row = rows.find((r) => r.actionId === id);
    assert.ok(row, `missing ${id}`);
    assert.equal(row.points, XP_BY_ACTION[id]);
    assert.equal(row.event, EARN_EVENT_LABELS[id]);
    assert.ok(row.event.trim());
    assert.equal(row.cap, capLabelForAction(id));
  }
});

test('caps match catalog daily action caps plus the soft total', () => {
  assert.equal(DAILY_XP_SOFT_CAP, 200);
  assert.equal(capLabelForAction('workout_finish'), `${DAILY_ACTION_CAPS.workout_finish}/day`);
  assert.match(capLabelForAction('weekly_train_goal'), /no daily action cap/);
  assert.match(capLabelForAction('weekly_train_goal'), /200/);
});
