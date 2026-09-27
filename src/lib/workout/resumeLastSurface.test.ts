import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(join(root, rel), 'utf8');

const GUILT =
  /\b(streak|shame|guilt|missed day|behind|failed|don't break|do not break)\b/i;

test('Train mounts Resume last and the copy stays calm', () => {
  const chip = read('src/components/workout/ResumeLastChip.tsx');
  const page = read('src/page-components/ActiveWorkoutPage.tsx');
  const empty = read('src/components/house/TrainComposeEmpty.tsx');
  const offer = read('src/lib/workout/resumeLastOffer.ts');
  assert.match(chip, /data-testid="resume-last-chip"/);
  assert.match(chip, /RESUME_LAST_TONE/);
  assert.match(chip, /RESUME_LAST_CHIP_LABEL/);
  assert.match(page, /ResumeLastChip/);
  assert.match(page, /decideResumeLast/);
  assert.match(page, /applyResumeLastPrefill/);
  assert.match(empty, /ResumeLastChip/);
  assert.doesNotMatch(chip, GUILT);
  const copyLines = offer
    .split('\n')
    .filter((line) => /RESUME_LAST_(CHIP_LABEL|SAME_LABEL|TONE) =/.test(line));
  assert.equal(copyLines.length, 3);
  assert.doesNotMatch(copyLines.join('\n'), GUILT);
  assert.match(offer, /from '@\/lib\/workout\/historyRetrain'/);
  const offerImports = offer.split('\n').filter((line) => line.startsWith('import '));
  assert.doesNotMatch(offerImports.join('\n'), /sessionResume|decideThisDeviceResume|protectLiveStart/);
  assert.doesNotMatch(chip, /getUser\(|SignInPrompt|paymentUrl/);
  assert.doesNotMatch(page, /free-exercise-db/);
});

test('Victory vs-last is green or amber and the diary does not gate Next', () => {
  const lifts = read('src/components/workout/VictoryVsLastLifts.tsx');
  const diary = read('src/components/workout/VictoryDiaryLine.tsx');
  const sheet = read('src/components/workout/WorkoutVictorySheet.tsx');
  const tone = read('src/lib/workout/victoryVsLastLifts.ts');
  const line = read('src/lib/workout/victoryDiaryLine.ts');
  assert.match(lifts, /data-testid="victory-vs-last-lifts"/);
  assert.match(lifts, /liftDeltaClass/);
  assert.match(tone, /text-status-ok/);
  assert.match(tone, /text-status-warn/);
  assert.doesNotMatch(tone, /text-status-danger/);
  assert.doesNotMatch(lifts, /text-status-danger|shame|streak/);
  assert.match(diary, /data-testid="victory-diary-line"/);
  assert.match(diary, /<input/);
  assert.doesNotMatch(diary, /required=\{true\}|aria-required=\{true\}/);
  assert.match(line, /return false/);
  assert.match(sheet, /VictoryVsLastLifts/);
  assert.match(sheet, /VictoryDiaryLine/);
  const dock = sheet.slice(sheet.indexOf('data-testid="victory-next-dock"'));
  assert.doesNotMatch(dock, /diary|sessionNote/);
  assert.doesNotMatch(sheet, /free-exercise-db|importCsv/);
});
