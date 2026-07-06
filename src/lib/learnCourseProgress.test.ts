import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getPremiumChapterProgress } from '@/lib/learnCourseProgress';

describe('learnCourseProgress', () => {
  it('computes chapter progress percent', () => {
    const chapter = {
      sections: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
    };
    const completed = new Set(['a', 'b']);
    const p = getPremiumChapterProgress(chapter, completed);
    assert.equal(p.done, 2);
    assert.equal(p.total, 4);
    assert.equal(p.pct, 50);
  });
});
