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

describe('WorkoutVictorySheet wires victoryShare helpers (.452)', () => {
  it('uses payload + file/text next helpers rather than inlining ladder', () => {
    const src = readFileSync(
      path.join(import.meta.dirname, '..', '..', 'components', 'workout', 'WorkoutVictorySheet.tsx'),
      'utf8'
    );
    assert.match(src, /buildVictorySharePayload/);
    assert.match(src, /nextVictoryShareAfterFile/);
    assert.match(src, /nextVictoryShareAfterText/);
    assert.doesNotMatch(
      src,
      /utm_source=share&utm_medium=victory/,
      'share URL lives in buildVictorySharePayload'
    );
  });
});
