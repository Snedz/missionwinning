/**
 * The bottom bar cannot be allowed to take the app down with it.
 *
 * `MobileNav` resolved each `MOBILE_TAB_HREFS` entry against `PRIMARY_NAV` and
 * **threw** on a miss — inside `useMemo`, on the render path of a nav that is
 * present on every mobile screen. The app is fully client-rendered and has no
 * nested `error.tsx` segment boundaries (`app/error.tsx:8-10` records this), so
 * that throw did not degrade one tab: it blanked the entire route to the generic
 * error screen. A typo in a list of five strings would have taken out the whole
 * product on phones.
 *
 * `.201` made the component drop an unresolvable href instead. That is the right
 * production behaviour — four tabs beat zero screens — but it would also let a
 * genuine mistake ship silently, so the mismatch is caught here instead, where
 * failing is free.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  MOBILE_TAB_HREFS,
  PRIMARY_NAV,
  TAB_LABEL_OVERRIDES,
  resolveMobileTabHrefs,
} from '@/lib/primaryNav';

test('every mobile tab resolves to a primary nav item', () => {
  const known = new Set(PRIMARY_NAV.map((n) => n.href));
  const missing = MOBILE_TAB_HREFS.filter((href) => !known.has(href));
  assert.deepEqual(
    missing,
    [],
    `these tabs have no PRIMARY_NAV entry, so the bar would render fewer tabs than declared: ${missing.join(', ')}`
  );
});

/**
 * Cold chrome is Summary + Search. Train joins only while a session is live.
 * Coach and Fuel are Search rows, not rooms on the first session.
 */
test('cold dock is Summary only; live dock adds Train', () => {
  assert.deepEqual([...resolveMobileTabHrefs({ hasActiveWorkout: false })], ['/log']);
  assert.deepEqual([...resolveMobileTabHrefs({ hasActiveWorkout: true })], [
    '/log',
    '/active',
  ]);
  for (const live of [false, true]) {
    const hrefs = resolveMobileTabHrefs({ hasActiveWorkout: live });
    assert.ok(!hrefs.includes('/coach'), 'Coach is Search, not a cold tab');
    assert.ok(!hrefs.includes('/nutrition'), 'Fuel is Search, not a cold tab');
  }
});

/**
 * The bar is at most two routed tabs plus Search. Five rooms was the
 * six-room house. Two at `flex-1` is a thumb each.
 */
test('the tab count stays within what a 390px bar can hold', () => {
  assert.ok(
    MOBILE_TAB_HREFS.length <= 2,
    `${MOBILE_TAB_HREFS.length} candidate tabs plus Search will not fit a 390px bar at 44px minimum`
  );
  assert.ok(resolveMobileTabHrefs({ hasActiveWorkout: true }).length <= 2);
});

/** A label override for a tab that is not in the bar is dead configuration. */
test('every tab label override applies to a tab that exists', () => {
  const tabs = new Set<string>(MOBILE_TAB_HREFS);
  const stale = Object.keys(TAB_LABEL_OVERRIDES).filter((href) => !tabs.has(href));
  assert.deepEqual(
    stale,
    [],
    `TAB_LABEL_OVERRIDES entries for hrefs that are not tabs: ${stale.join(', ')}`
  );
});

test('MobileNav resolves live tabs and labels the sheet Search', () => {
  const src = readFileSync(
    path.join(import.meta.dirname, '..', 'components', 'layout', 'MobileNav.tsx'),
    'utf8'
  );
  assert.match(src, /resolveMobileTabHrefs\(/);
  assert.match(src, /navSearch/);
  assert.doesNotMatch(src, /t\('navMore'/);
});
