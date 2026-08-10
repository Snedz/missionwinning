/**
 * Public compare stories free-beta mute — our Super Bundle merch must not pitch pay;
 * competitor product names (Freeletics Super Bundle) may remain.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  compareStoryForSurface,
  getCompareStory,
  muteOurSuperBundleMerch,
} from '@/data/compareStories';

const root = join(import.meta.dirname, '..', '..');

test('CompareStoryPage applies compareStoryForSurface with free beta', () => {
  const src = readFileSync(join(root, 'src/page-components/CompareStoryPage.tsx'), 'utf8');
  assert.match(src, /compareStoryForSurface/);
  assert.match(src, /isFreeBeta/);
});

test('muteOurSuperBundleMerch rewrites our merch, keeps Freeletics product name', () => {
  assert.match(
    muteOurSuperBundleMerch(
      'Free tracker stays free. Super Bundle unlocks Coach and deeper pillar content.'
    ),
    /Open beta unlocks/
  );
  assert.doesNotMatch(
    muteOurSuperBundleMerch(
      'Free tracker stays free. Super Bundle unlocks Coach and deeper pillar content.'
    ),
    /Super Bundle unlocks/
  );
  // Competitor product name preserved
  assert.match(
    muteOurSuperBundleMerch('Their Super Bundle framing inspired the industry.'),
    /Their Super Bundle framing/
  );
});

test('compareStoryForSurface free-beta mutes freeletics + caliber merch', () => {
  const freeletics = getCompareStory('freeletics');
  assert.ok(freeletics);
  const muted = compareStoryForSurface(freeletics!, true);
  assert.doesNotMatch(muted.ctaNote, /Super Bundle unlocks/i);
  assert.match(muted.ctaNote, /Open beta unlocks/i);
  // Eyebrow keeps competitor SKU name
  assert.match(muted.eyebrow, /Freeletics Super Bundle/);
  const body = (muted.body ?? []).flatMap((s) => s.paragraphs).join('\n');
  assert.doesNotMatch(body, /Super Bundle funds depth/);
  assert.match(body, /Paid depth can fund/);

  const caliber = getCompareStory('caliber');
  assert.ok(caliber);
  const calMuted = compareStoryForSurface(caliber!, true);
  const calBody = (calMuted.body ?? []).flatMap((s) => s.paragraphs).join('\n');
  assert.doesNotMatch(calBody, /Mission Coach and Super Bundle/);
  assert.match(calBody, /Mission Coach and pillar tools/);

  // Paid path unchanged
  const paid = compareStoryForSurface(freeletics!, false);
  assert.equal(paid.ctaNote, freeletics!.ctaNote);
});
