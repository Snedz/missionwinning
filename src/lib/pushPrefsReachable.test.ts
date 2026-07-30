/**
 * A server column the user cannot set is a column that stays NULL forever.
 *
 * `.176` and `.194` are the same defect twice. Both shipped a preference
 * column, a migration, a cron that selects on it, and no path for an athlete to
 * write it — `day_review_hour`'s only writer was an opt-in card that returned
 * early whenever a push subscription already existed, which is every athlete
 * who had turned on the wind-down note. The column was NULL for the entire
 * population, `dayReviewDue` was always false, and every test passed, because
 * every test asked whether the decision was *correct* and none asked whether
 * the input could ever arrive.
 *
 * So this walks the chain a preference has to survive — type → row builder →
 * cadence sync → a named control the athlete can actually operate — and fails
 * on the first missing link. Source-text reading in the
 * `surfaceReality.test.ts` idiom; see `reachability.test.ts` for the general
 * form of the same rule.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { buildSubscriptionRow } from '@/lib/pushSubscriptionRow';
import { pushSubscribeBodySchema } from '@/lib/apiSchemas';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');
const stripComments = (src: string) =>
  src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^[ \t]*\/\/.*$/gm, '');

/**
 * Every athlete-settable field on the push row.
 *
 * `control` names a file the athlete can operate — a settings row, a picker, an
 * opt-in card. "Set automatically by the app" is a legitimate answer and is
 * spelled `control: null` with a reason, because a field the app derives has no
 * dead-end to fall into.
 */
const PUSH_PREFERENCES: {
  field: string;
  column: string;
  control: string | null;
  why?: string;
}[] = [
  {
    field: 'dayReviewHour',
    column: 'day_review_hour',
    control: 'src/components/profile/ProfileDayReviewRow.tsx',
  },
  {
    field: 'daysPerWeek',
    column: 'days_per_week',
    control: null,
    why: 'Derived from the schedule preference the athlete already sets in the coach flow; the push row only mirrors it.',
  },
  {
    field: 'lastSessionAt',
    column: 'last_session_at',
    control: null,
    why: 'A fact about what happened, not a preference — written when a session completes.',
  },
  {
    field: 'lastSessionHigh',
    column: 'last_session_high',
    control: null,
    why: 'One bit computed on the device from the debrief zone; there is nothing for an athlete to set.',
  },
  {
    field: 'timeZone',
    column: 'time_zone',
    control: null,
    why: 'Read from the browser via Intl; asking would be worse than resolving it.',
  },
];

const ROW_MODULE = 'src/lib/pushSubscriptionRow.ts';
const CLIENT_MODULE = 'src/lib/pushClient.ts';
const CADENCE_READER = 'src/page-components/ProfilePage.tsx';

test('every push preference survives the whole chain to the column', () => {
  const rowSrc = stripComments(read(ROW_MODULE));
  const clientSrc = stripComments(read(CLIENT_MODULE));

  for (const { field, column } of PUSH_PREFERENCES) {
    assert.match(
      rowSrc,
      new RegExp(`\\b${field}\\??\\s*:`),
      `${field} is not on SubscriptionRowInput — nothing can pass it`
    );
    assert.ok(
      rowSrc.includes(`${column}:`),
      `buildSubscriptionRow never emits ${column} — the value stops one step short of the table`
    );
    assert.ok(
      clientSrc.includes(field),
      `${CLIENT_MODULE} does not carry ${field} — the browser cannot send what the row accepts`
    );
  }
});

/**
 * The `.176`/`.194` rule itself: a preference needs a control, and the control
 * has to be somewhere an athlete can return to. A one-time offer is not a
 * setting — dismiss it once and the column is unreachable for good — so the
 * named control must be wired into a screen, not only into a card that
 * remembers it already asked.
 */
test('every push preference has a control the athlete can operate', () => {
  for (const { field, control, why } of PUSH_PREFERENCES) {
    if (control === null) {
      assert.ok(
        why && why.trim().length > 0,
        `${field} declares no control and gives no reason — "the app sets it" has to be stated, not assumed`
      );
      continue;
    }
    const src = stripComments(read(control));
    assert.ok(
      src.includes('onChange') || src.includes('onClick'),
      `${control} is named as the control for ${field} but has no handler — it displays the setting without letting anyone change it`
    );
    // A control nothing renders is the `.195` defect wearing a settings hat.
    const componentName = path.basename(control).replace(/\.tsx?$/, '');
    const mountedIn = 'src/components/profile/ProfileRemindersCard.tsx';
    assert.match(
      stripComments(read(mountedIn)),
      new RegExp(`<${componentName}\\b`),
      `${componentName} is the control for ${field} but ${mountedIn} never renders it`
    );
  }
});

/**
 * Profile's cadence sync must carry the hour, or nothing but the card ever does.
 *
 * The slice is bounded to the function body. The first version of this test ran
 * `slice(indexOf(...))` to the end of the file, so it matched `changeDayReviewHour`
 * two hundred lines below and passed with the field deleted — a guard against an
 * omission that could not see the omission.
 */
test('the cadence sync carries the evening hour', () => {
  const src = stripComments(read(CADENCE_READER));
  const start = src.indexOf('function readPushCadence');
  assert.notEqual(start, -1, `${CADENCE_READER} no longer declares readPushCadence`);
  const body = src.slice(start, src.indexOf('\n}', start));
  assert.ok(
    body.includes('dayReviewHour') || body.includes('cadenceHourPatch'),
    `readPushCadence() omits the evening hour — this is exactly how the column stayed NULL: one writer, and it skipped itself`
  );
});

/* ------------------------------------------------------------------ *
 * null vs undefined — the safety property.
 * ------------------------------------------------------------------ */

const BASE = {
  userId: null,
  deviceId: 'd1',
  endpoint: 'https://push.example/e1',
  p256dh: 'k',
  auth: 'a',
};

test('an explicit null clears the hour, and absence leaves it standing', () => {
  const cleared = buildSubscriptionRow({ ...BASE, dayReviewHour: null });
  assert.ok(
    'day_review_hour' in cleared,
    'turning the evening review off must reach the column, or the note keeps arriving after the athlete said stop'
  );
  assert.equal(cleared.day_review_hour, null);

  const untouched = buildSubscriptionRow({ ...BASE });
  assert.ok(
    !('day_review_hour' in untouched),
    'a sync with nothing to say about the hour must omit the column — otherwise a Profile mount silently turns the evening review off'
  );
});

test('the subscribe schema accepts an explicit null and rejects an out-of-band hour', () => {
  const off = pushSubscribeBodySchema.safeParse({ ...BASE, dayReviewHour: null });
  assert.ok(off.success, 'null must survive validation or "Off" can never reach the row');

  const absent = pushSubscribeBodySchema.safeParse({ ...BASE });
  assert.ok(absent.success);
  assert.ok(
    !('dayReviewHour' in absent.data) || absent.data.dayReviewHour === undefined,
    'absent must stay absent through validation, not become null'
  );

  for (const bad of [17, 23, 0, 2.5]) {
    assert.ok(
      !pushSubscribeBodySchema.safeParse({ ...BASE, dayReviewHour: bad }).success,
      `${bad} is outside 18–22 and must be refused — the column's CHECK constraint would reject it anyway, as a 500 instead of a 400`
    );
  }
});
