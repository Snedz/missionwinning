/**
 * `.768` — first set while PRIVATE_MODE is on. `/active` is public; the rest
 * of the habit shell stays cookie-gated. Discover app/(app) routes rather than
 * listing the six we happened to think of.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { isJourneyBypassPath, isPrivateGatePublicPath } from './publicRoutes.ts';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

/** Habit / account surfaces that must stay 307 while gated. */
const MUST_STAY_GATED = [
  '/log',
  '/coach',
  '/nutrition',
  '/history',
  '/profile',
  '/account',
  '/builder',
  '/library',
  '/mind',
  '/move',
  '/track',
  '/benchmarks',
  '/leaderboard',
  '/assessments',
  '/explore',
  '/server',
  '/programs',
  '/coaching',
  '/fitness-test',
  '/help',
  '/join/class',
  '/school/class',
] as const;

function walkPageRoutes(dir: string, hrefBase: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    if (name === 'layout.tsx' || name === 'loading.tsx') continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      const nextHref =
        name.startsWith('[') && name.endsWith(']')
          ? hrefBase
          : hrefBase === '/'
            ? `/${name}`
            : `${hrefBase}/${name}`;
      walkPageRoutes(full, nextHref, out);
      continue;
    }
    if (name === 'page.tsx') out.push(hrefBase === '' ? '/' : hrefBase);
  }
}

describe('first set while gated (.768)', () => {
  it('/active is public; listed habit routes stay gated', () => {
    assert.equal(isPrivateGatePublicPath('/active'), true);
    assert.equal(isPrivateGatePublicPath('/active/'), true);
    assert.equal(isPrivateGatePublicPath('/welcome'), true);
    assert.equal(isPrivateGatePublicPath('/changelog'), true);
    assert.equal(isJourneyBypassPath('/changelog'), true);
    for (const href of MUST_STAY_GATED) {
      assert.equal(
        isPrivateGatePublicPath(href),
        false,
        `${href} must stay cookie-gated`
      );
    }
  });

  it('every app/(app) page is reviewed: public or MUST_STAY_GATED', () => {
    const found: string[] = [];
    walkPageRoutes(path.join(root, 'app', '(app)'), '', found);
    const unique = [...new Set(found)].filter(Boolean).sort();
    const gatedSet = new Set<string>(MUST_STAY_GATED);
    const unreviewed: string[] = [];
    for (const href of unique) {
      if (isPrivateGatePublicPath(href)) continue;
      const covered = [...gatedSet].some(
        (g) => href === g || href.startsWith(`${g}/`)
      );
      if (!covered) unreviewed.push(href);
    }
    assert.deepEqual(
      unreviewed,
      [],
      `unreviewed gated (app) routes — add to MUST_STAY_GATED or PUBLIC_PATHS:\n${unreviewed.join('\n')}`
    );
    const stale = MUST_STAY_GATED.filter((g) => {
      return !unique.some((href) => href === g || href.startsWith(`${g}/`));
    });
    assert.deepEqual(stale, [], `MUST_STAY_GATED stale entries:\n${stale.join('\n')}`);
  });

  it('cold /private primary is Notify me; Log a set does not skip the door', () => {
    const teaser = read('app/private/PrivateTeaserClient.tsx');
    const notify = read('src/components/public/LaunchNotifyForm.tsx');
    assert.doesNotMatch(
      teaser,
      /href=["']\/welcome["']/,
      'cold poster must not send /welcome — that bypasses the gate'
    );
    assert.doesNotMatch(teaser, /gateLogASet/);
    const gateVariant = notify.slice(notify.indexOf("variant === 'gate'"));
    assert.match(gateVariant, /gate-btn-primary/);
    assert.doesNotMatch(
      gateVariant,
      /gate-btn-secondary/,
      'waitlist Notify me is the one red on /private'
    );
  });

  it('resolveActiveEmptyStart still never seeds Just Go', () => {
    const helper = read('src/lib/workout/resolveActiveEmptyStart.ts');
    const emptyStart = read('src/page-components/ActiveWorkoutPage.tsx');
    const emptyUi = read('src/components/workout/ActiveEmptyState.tsx');
    const startAt = emptyStart.indexOf('const handleEmptyStart');
    assert.ok(startAt >= 0, 'handleEmptyStart missing');
    const handle = emptyStart.slice(startAt, startAt + 700);
    assert.doesNotMatch(helper, /justGoSession|buildJustGoSession|previewJustGo/);
    assert.match(handle, /Do not seed Just Go/);
    assert.doesNotMatch(handle, /previewJustGoForEquipment|startWorkout\(preview/);
    assert.doesNotMatch(emptyStart, /previewJustGoForEquipment|handlePreviewStart/);
    assert.match(emptyUi, /onClick=\{onStart\}/);
    assert.doesNotMatch(emptyUi, /onPreviewStart|activeStartPreviewSession/);
  });

  it('Active still opens the check-in sheet only via shouldOfferSessionCheckIn', () => {
    const active = read('src/page-components/ActiveWorkoutPage.tsx');
    assert.match(active, /if \(shouldOfferSessionCheckIn\(\)\)/);
  });
});
