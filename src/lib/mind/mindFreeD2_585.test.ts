import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GUIDED_MIND_SESSIONS } from '@/data/guidedMindSessions';
import { CONTENT_FLOORS, getContentInventory } from '@/lib/contentInventory';

test('D2 mind free floor is 32 and inventory meets it', () => {
  assert.equal(CONTENT_FLOORS.mindFree, 32);
  assert.equal(GUIDED_MIND_SESSIONS.length, 32);
  assert.ok(getContentInventory().mind.free >= 32);
});

test('new D2 mind sessions have unique ids, tags, and duration mix', () => {
  const ids = GUIDED_MIND_SESSIONS.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);

  const d2 = [
    'pre-lift-box-breath-2',
    'pre-session-quiet-mind-5',
    'post-legs-downshift-4',
    'post-upper-release-3',
    'sleep-before-early-lift-10',
    'sleep-reset-after-late-train-8',
    'desk-stress-reset-5',
    'hotel-focus-arrive-4',
  ];
  for (const id of d2) {
    const s = GUIDED_MIND_SESSIONS.find((x) => x.id === id);
    assert.ok(s, id);
    assert.ok((s!.tags?.length ?? 0) >= 1, id);
    assert.ok(s!.steps.length >= 3, id);
    assert.ok(s!.minutes >= 2 && s!.minutes <= 15, id);
  }

  const tags = d2.flatMap((id) => GUIDED_MIND_SESSIONS.find((s) => s.id === id)!.tags ?? []);
  assert.ok(tags.includes('pre-lift'));
  assert.ok(tags.includes('post-train'));
  assert.ok(tags.includes('sleep'));
  assert.ok(tags.includes('stress') || tags.includes('travel'));
});
