import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');

describe('ActiveTrainCues', () => {
  it('shows Cue me at 390 — the product width is not icon-only', () => {
    const src = readFileSync(
      path.join(root, 'src/components/speech/ActiveTrainCues.tsx'),
      'utf8'
    );
    assert.match(src, /activeCueMe/);
    assert.match(src, /activeCueMeOn/);
    assert.doesNotMatch(
      src,
      /hidden md:inline/,
      'Cue me must stay labeled on the phone; Plates can stay icon-only'
    );
  });
});
