/**
 * Left room rail on the signed-in athlete shell (.1056).
 *
 * The rail already lived in Sidebar + RAIL_GROUPS and was hidden below `md`.
 * Founder asked for the IA rooms as a persistent LEFT rail — not a second nav
 * system, not a Message tab, not the Patreon costume.
 *
 * Discover the shell markup rather than listing labels in two places: a new
 * Message item, or hiding the rail again, must go red here.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { RAIL_FOOTER_HREFS, RAIL_GROUPS, railFooterForNav, railGroupsForNav } from '@/lib/navConfig';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const ROOM_HREFS = ['/log', '/active', '/coach', '/history', '/library'] as const;
const ROOM_LABELS = ['Today', 'Train', 'Coach', 'History', 'Library'] as const;

test('rail rooms are Today · Train · Coach · History · Library in that order', () => {
  assert.deepEqual(
    RAIL_GROUPS.flatMap((g) => g.hrefs),
    [...ROOM_HREFS]
  );
  const items = railGroupsForNav().flatMap((g) => g.items);
  assert.deepEqual(
    items.map((i) => i.href),
    [...ROOM_HREFS]
  );
  assert.deepEqual(
    items.map((i) => i.label),
    [...ROOM_LABELS]
  );
});

test('rail footer is You, not a primary room', () => {
  assert.deepEqual([...RAIL_FOOTER_HREFS], ['/profile']);
  const footer = railFooterForNav();
  assert.deepEqual(
    footer.map((i) => i.href),
    ['/profile']
  );
  assert.equal(footer[0]?.label, 'You');
  assert.ok(
    !RAIL_GROUPS.flatMap((g) => g.hrefs).includes('/profile'),
    'You is footer, not a fifth-and-a-half room'
  );
});

test('rail never carries Message, Messenger, Studio, or Explore', () => {
  const hrefs = [
    ...RAIL_GROUPS.flatMap((g) => g.hrefs),
    ...RAIL_FOOTER_HREFS,
  ];
  for (const banned of ['/server', '/messages', '/message', '/studio', '/explore', '/coaching']) {
    assert.ok(!hrefs.includes(banned), `${banned} must not be a rail href`);
  }

  const labels = [
    ...railGroupsForNav().flatMap((g) => g.items.map((i) => i.label)),
    ...railFooterForNav().map((i) => i.label),
  ];
  for (const label of labels) {
    assert.doesNotMatch(label, /^message$/i, `rail label "${label}" is a Message item`);
    assert.doesNotMatch(label, /messenger|studio/i, `rail label "${label}" is Garage/Studio`);
  }
});

test('signed-in shell mounts a visible left room rail', () => {
  const layout = read('src/components/layout/AppLayout.tsx');
  assert.match(layout, /import \{ Sidebar \} from '\.\/Sidebar'/);
  assert.match(layout, /<Sidebar/);
  assert.doesNotMatch(
    layout,
    /dynamic\(\(\) => import\('\.\/Sidebar'/,
    'Sidebar must be a static import — a dynamic chunk is how the rail fails to paint'
  );
  assert.doesNotMatch(
    layout,
    /hidden md:block[\s\S]{0,80}<Sidebar/,
    'AppLayout must not hide the rail below md — that is the bare /log bug'
  );

  const side = read('src/components/layout/Sidebar.tsx');
  assert.match(side, /data-testid="room-rail"/);
  assert.match(side, /railGroupsForNav\(/);
  assert.match(side, /railFooterForNav\(/);
  assert.match(side, /onOpenMore/);
  assert.match(side, /navMore/);
  assert.doesNotMatch(side, /hidden md:flex/, 'Sidebar itself must not hide below md');
  assert.doesNotMatch(side, /['"]Message['"]/, 'Sidebar must not render a Message item');
  assert.doesNotMatch(side, /href=\{?['"]\/server['"]\}?/, 'Messenger is More, never a rail link');
});

test('a Message rail item is a hit — the scan is not vacuous', () => {
  const fake = "label: 'Message'";
  assert.match(fake, /['"]Message['"]/);
  assert.match(read('src/lib/roomRail.test.ts'), /doesNotMatch\(side, \/\['"\]Message\['"\]\//);
});
