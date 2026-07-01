import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FREE_LEARN_PATHS } from '@/data/learnPaths';
import { localizeLearnPaths } from './localizeLearnPaths';

describe('localizeLearnPaths', () => {
  it('returns paths with same structure and lesson count', () => {
    const result = localizeLearnPaths(FREE_LEARN_PATHS, (key, opts) => opts?.defaultValue ?? key);
    assert.equal(result.length, FREE_LEARN_PATHS.length);
    assert.equal(result[0].lessons.length, FREE_LEARN_PATHS[0].lessons.length);
    assert.equal(result[0].title, FREE_LEARN_PATHS[0].title);
  });

  it('applies translation when key resolves', () => {
    const result = localizeLearnPaths(FREE_LEARN_PATHS, (key) => {
      if (key === 'learnPath_strength-basics_title') return 'Translated Title';
      return '';
    });
    assert.equal(result[0].title, 'Translated Title');
  });
});
