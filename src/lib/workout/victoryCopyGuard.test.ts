import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');

/** Default English on Victory must stay plain — not coach-bro / AI slop. */
const BANNED =
  /\b(unlock your|elevate|crush it|beast mode|journey to|transform your|supercharge|game.?changer)\b/i;

test('Victory sheet defaults avoid AI-slop phrases', () => {
  const sheet = readFileSync(
    join(root, 'src/components/workout/WorkoutVictorySheet.tsx'),
    'utf8'
  );
  assert.doesNotMatch(sheet, BANNED);
  assert.match(sheet, /Session locked/);
});

test('Victory honor next is AdaptiveOverlay footer, not Dialog scroll', () => {
  const sheet = readFileSync(
    join(root, 'src/components/workout/WorkoutVictorySheet.tsx'),
    'utf8'
  );
  const overlay = readFileSync(
    join(root, 'src/components/ui/AdaptiveOverlay.tsx'),
    'utf8'
  );
  assert.match(sheet, /AdaptiveOverlay/);
  assert.match(sheet, /footer=\{/);
  assert.match(sheet, /footerClassName="p-0"/);
  assert.doesNotMatch(
    sheet,
    /DialogContent/,
    'Victory must not use DialogContent — max-h overflow-y-auto parked NEXT under the rail'
  );
  const footerAt = sheet.indexOf('footer={');
  const nextAt = sheet.indexOf('<VictoryNextActionStrip');
  assert.ok(footerAt >= 0, 'Victory must pass footer={}');
  assert.ok(
    nextAt > footerAt,
    'VictoryNextActionStrip must sit in the pinned footer, not the scroll body'
  );
  assert.match(
    overlay,
    /footerClassName = 'p-4'/,
    'other AdaptiveOverlay callers keep default footer padding'
  );
});

test('empty-finish copy is calm guidance', () => {
  const finish = readFileSync(join(root, 'src/lib/workout/activeSessionFinish.ts'), 'utf8');
  assert.match(finish, /Log a set first/);
  assert.doesNotMatch(finish, /variant: 'destructive'/);
  assert.match(finish, /finishBlockedReason/);
});

test('Victory collapses long details; Active gates empty finish', () => {
  const sheet = readFileSync(
    join(root, 'src/components/workout/WorkoutVictorySheet.tsx'),
    'utf8'
  );
  assert.match(sheet, /shouldCollapseVictoryDetails/);
  assert.match(sheet, /victorySessionDetails|Session details/);
  const stats = readFileSync(
    join(root, 'src/components/workout/VictoryStatsStrip.tsx'),
    'utf8'
  );
  assert.match(stats, /grid-cols-3/, 'Hevy receipt header is Duration · Volume · Sets');
  assert.match(stats, /text-muted-foreground/, 'vs-last deltas stay muted in both directions');
  const receipt = readFileSync(
    join(root, 'src/components/workout/VictoryReceiptStrip.tsx'),
    'utf8'
  );
  assert.match(receipt, /activeColPrev/, 'receipt shows last-time load, not only a delta');
  assert.match(receipt, /data-testid="victory-prev"/);
  assert.doesNotMatch(
    receipt,
    /<thead className="sr-only">/,
    'Set · Prev · Load headers stay visible — a receipt you can read'
  );
  const receiptAt = sheet.indexOf('VictoryReceiptStrip');
  const detailsAt = sheet.indexOf('<details');
  assert.ok(receiptAt >= 0, 'Victory mounts the vs-last receipt');
  assert.ok(
    detailsAt < 0 || receiptAt < detailsAt,
    'receipt must sit above Session details, not inside it'
  );
  assert.doesNotMatch(sheet, /share-to-unlock|unlock.{0,20}share/i);

  const active = readFileSync(
    join(root, 'src/page-components/ActiveWorkoutPage.tsx'),
    'utf8'
  );
  assert.match(active, /finishBlockedReason/);

  const store = readFileSync(join(root, 'src/store/workoutStore.ts'), 'utf8');
  assert.match(store, /empty Finish is a no-op/);
});
