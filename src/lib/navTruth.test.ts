/**
 * A screen that is on, with no way in.
 *
 * `navConfig.ts` carried a comment for months saying certain links "stay in the
 * header menu". There has been no header menu for as long. `/benchmarks` — a
 * live surface, enabled by default, with its own axe sweep — was reachable from
 * nothing but a typed URL, and the comment is why nobody noticed: it named a
 * home that did not exist, and reading it felt like an answer.
 *
 * So this asserts the thing the comment claimed. Every path of an enabled
 * surface is in the bottom bar, the rail, More quiet links (`moreSheetTiers`),
 * More sheet rows, or `NAV_EXEMPT` — and `NAV_EXEMPT` costs a written reason,
 * which makes an unreachable screen a founder decision on the record instead of rot.
 *
 * Flow-4 moved quiet links out of `MoreSheet.tsx` into `moreSheetTiers.ts` —
 * import the one definition rather than grepping a deleted private const.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRIMARY_NAV } from '@/lib/primaryNav';
import { RAIL_GROUPS } from '@/lib/navConfig';
import { moreSheetQuietForNav, moreSheetRowHrefs } from '@/lib/moreSheetTiers';
import { SURFACE_PATHS, isSurfaceEnabled, isPathEnabled, type Surface } from '@/lib/surface';

/** Quiet foot links + full More sheet rows (both are real navigation). */
function moreNavHrefs(): string[] {
  return [
    ...moreSheetQuietForNav().map((l) => l.href),
    ...moreSheetRowHrefs(),
  ];
}

/**
 * Enabled screens with no nav entry, each an explicit call rather than an
 * oversight. Reasons are the deliverable: the next agent reads this table
 * instead of guessing whether a missing link was deliberate.
 */
const NAV_EXEMPT: { path: string; reason: string }[] = [
  {
    path: '/assessments',
    reason:
      'ISSA-style intake at Mission Coach generate — not a More/rail feature you go do. Route stays for the sheet and deep links. Logger never waits on it.',
  },
  {
    path: '/benchmarks',
    reason:
      'Founder decision pending: promote to RAIL_GROUPS.toolkit, or keep as a destination the Learn path links into. Recorded here so it is a choice, not the drift it was.',
  },
  {
    path: '/programs',
    reason:
      'Zero in-app links today. Open question whether it is a screen at all or marketing-only; until that is answered a rail entry would be advertising something unfinished.',
  },
  {
    path: '/paths',
    reason: 'Reached from inside /learn, which is in the rail. A second top-level entry to the same content would split it.',
  },
  {
    path: '/guide',
    reason: 'Alias of /learn/guide, which is in More quiet links. One destination needs one nav entry.',
  },
];

/** API prefixes are not screens; nothing navigates to them. */
const isPage = (p: string) => !p.startsWith('/api');

test('every enabled screen is reachable from somewhere in the app', () => {
  const railHrefs = RAIL_GROUPS.flatMap((g) => g.hrefs);
  const primaryHrefs = PRIMARY_NAV.map((i) => i.href);
  const reachable = new Set([...primaryHrefs, ...railHrefs, ...moreNavHrefs()]);

  const stranded: string[] = [];
  for (const [surface, paths] of Object.entries(SURFACE_PATHS) as [Surface, readonly string[]][]) {
    if (!isSurfaceEnabled(surface)) continue;
    for (const p of paths) {
      if (!isPage(p) || reachable.has(p)) continue;
      const exempt = NAV_EXEMPT.find((e) => e.path === p);
      if (exempt) {
        assert.ok(
          exempt.reason.trim().length > 0,
          `NAV_EXEMPT entry for ${p} has no reason — an exemption without one is the header-menu comment again`
        );
        continue;
      }
      stranded.push(`${p} (${surface})`);
    }
  }

  assert.deepEqual(
    stranded,
    [],
    `enabled screens with no nav entry — add one, or add a reasoned NAV_EXEMPT row:\n  ${stranded.join('\n  ')}`
  );
});

/**
 * The mirror. An exemption is a claim that a live screen is deliberately
 * unlinked; a row for a screen the nav already carries, or for one that is
 * parked and unreachable anyway, is neither — and every such row makes the
 * table cheaper to add to, which is how an exemption list stops meaning
 * anything.
 */
test('every NAV_EXEMPT row describes a real, live gap', () => {
  const reachable = new Set([
    ...PRIMARY_NAV.map((i) => i.href),
    ...RAIL_GROUPS.flatMap((g) => g.hrefs),
    ...moreNavHrefs(),
  ]);
  for (const { path: p } of NAV_EXEMPT) {
    assert.ok(
      !reachable.has(p),
      `${p} is in NAV_EXEMPT but the nav already links it — delete the row so the table stays a list of real gaps`
    );
    assert.ok(
      isPathEnabled(p),
      `${p} is in NAV_EXEMPT but its surface is parked — parking already hides it, and the row would go stale unnoticed the day the surface turns on`
    );
  }
});

/** And the other mirror: nav must not link a screen that would 404. */
test('the nav links nothing that is parked', () => {
  for (const href of RAIL_GROUPS.flatMap((g) => g.hrefs)) {
    // The rail filters parked hrefs at render; this asserts the underlying
    // table stays honest, so a parked entry never survives a filter change.
    if (isPathEnabled(href)) continue;
    assert.ok(
      false,
      `RAIL_GROUPS lists ${href}, which belongs to a parked surface — a rail entry that 404s is worse than no entry`
    );
  }
});
