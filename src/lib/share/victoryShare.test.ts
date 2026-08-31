import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  buildVictorySharePayload,
  nextVictoryShareAfterFile,
  nextVictoryShareAfterText,
} from '@/lib/share/victoryShare';

describe('buildVictorySharePayload', () => {
  it('prefers referral ref over utm', () => {
    const withRef = buildVictorySharePayload({
      origin: 'https://www.missionwinning.com',
      refCode: 'abc 1',
      shareText: 'Session done.',
    });
    assert.equal(
      withRef.shareUrl,
      'https://www.missionwinning.com/?ref=abc%201'
    );
    assert.match(withRef.fullText, /Session done\./);

    const utm = buildVictorySharePayload({
      origin: 'https://www.missionwinning.com',
      refCode: null,
      shareText: 'Locked.',
    });
    assert.equal(
      utm.shareUrl,
      'https://www.missionwinning.com/?utm_source=share&utm_medium=victory'
    );
  });
});

describe('nextVictoryShareAfterFile', () => {
  it('stops on shared or cancelled — no clipboard fallthrough (.452)', () => {
    assert.equal(nextVictoryShareAfterFile('shared'), 'done');
    assert.equal(nextVictoryShareAfterFile('cancelled'), 'done');
    assert.equal(nextVictoryShareAfterFile('unavailable'), 'try_text');
  });
});

describe('nextVictoryShareAfterText', () => {
  it('routes cancel/fail to clipboard when available', () => {
    assert.equal(nextVictoryShareAfterText('shared', true), 'shared');
    assert.equal(nextVictoryShareAfterText('cancelled', true), 'clipboard');
    assert.equal(nextVictoryShareAfterText('cancelled', false), 'failed');
    assert.equal(nextVictoryShareAfterText('unavailable', true), 'clipboard');
  });
});

describe('WorkoutVictorySheet does not leftover share (.1061)', () => {
  it('does not wire payload + file/text next helpers on the overlay', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'WorkoutVictorySheet.tsx'),
      'utf8'
    );
    assert.doesNotMatch(src, /buildVictorySharePayload/);
    assert.doesNotMatch(src, /nextVictoryShareAfterFile/);
    assert.doesNotMatch(src, /nextVictoryShareAfterText/);
    assert.doesNotMatch(
      src,
      /utm_source=share&utm_medium=victory/,
      'share URL lives in buildVictorySharePayload'
    );
  });

  it('does not leftover fail-only share recovery on the overlay', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'WorkoutVictorySheet.tsx'),
      'utf8'
    );
    assert.doesNotMatch(src, /shareFailHint/);
    assert.doesNotMatch(src, /victory-share-fail/);
    assert.doesNotMatch(src, /handleShare/);
  });
});
