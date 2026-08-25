/**
 * Start this again lives on the close receipt and History. Not a shop.
 * Today stays one Start. Receipt first paint stays outline, not a red Start.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const SHOP = /marketplace|template shop|3.template|discord\.com|WeChat|Trainer-rail|four-scene/i;
const PREMIUM = /from ['"]@\/lib\/(premium|trial|bundle)/;

describe('start again surface lock (.991)', () => {
  it('receipt first paint has outline Start this again, not a red Start', () => {
    const sheet = read('src/components/workout/WorkoutVictorySheet.tsx');
    const jsx = sheet.slice(sheet.indexOf('return ('));
    const open = jsx.split('<details')[0];
    assert.match(sheet, /decideStartAgain/);
    assert.match(open, /data-testid="victory-start-again"/);
    assert.match(open, /honorSaveAsRoutine|victory-save-routine/);
    assert.doesNotMatch(open, /primary-action|bg-primary-fill/);
    assert.match(jsx, /data-testid="victory-next-dock"/);
    assert.doesNotMatch(sheet, SHOP);
    assert.doesNotMatch(sheet, PREMIUM);
  });

  it('History list / details / day call the same helper', () => {
    for (const rel of [
      'src/page-components/HistoryPage.tsx',
      'src/page-components/HistoryDayPage.tsx',
    ]) {
      const src = read(rel);
      assert.match(src, /decideStartAgain/, rel);
      assert.doesNotMatch(src, SHOP, rel);
      assert.doesNotMatch(src, /SavedWorkout\[\]|template folder|routine shop/i, rel);
    }
    const list = read('src/page-components/HistoryPage.tsx');
    assert.match(list, /history-save-routine|honorSaveAsRoutine/);
    assert.match(list, /Start this again|historyTrainAgain/);
  });

  it('Today stays one Start; primary action does not import startAgain', () => {
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.match(lean, /dock="start"/);
    assert.doesNotMatch(lean, /from '@\/lib\/workout\/startAgain'/);
    const primary = read('src/lib/todayPrimaryAction.ts');
    assert.doesNotMatch(primary, /startAgain|decideStartAgain/);
    const priv = read('app/private/page.tsx');
    assert.doesNotMatch(priv, /decideStartAgain|victory-start-again/);
  });
});
