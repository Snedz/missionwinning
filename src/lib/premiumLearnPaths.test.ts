import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PREMIUM_LEARN_PATH_DATA } from '@/data/premiumLearnPathData';
import { PREMIUM_LEARN_PATH_COUNT } from '@/lib/learnPremiumMeta';

describe('premiumLearnPaths (Phase I3)', () => {
  it('defines 6 specialist programs', () => {
    assert.equal(PREMIUM_LEARN_PATH_DATA.length, 6);
  });

  it('count matches meta constant for locked teaser', () => {
    assert.equal(PREMIUM_LEARN_PATH_DATA.length, PREMIUM_LEARN_PATH_COUNT);
  });

  it('each path has unique id and at least 3 lessons', () => {
    const ids = new Set<string>();
    for (const path of PREMIUM_LEARN_PATH_DATA) {
      assert.ok(path.id.length > 0);
      assert.ok(!ids.has(path.id), `duplicate path id ${path.id}`);
      ids.add(path.id);
      assert.ok(path.lessons.length >= 3, `${path.id} needs lessons`);
      const lessonIds = new Set<string>();
      for (const lesson of path.lessons) {
        assert.ok(lesson.id.length > 0);
        assert.ok(!lessonIds.has(lesson.id), `duplicate lesson id ${lesson.id} in ${path.id}`);
        lessonIds.add(lesson.id);
        assert.ok(lesson.title.length > 0);
        assert.ok(lesson.summary.length > 0);
        assert.ok(lesson.keyPoints.length >= 3, `${lesson.id} needs key points`);
      }
    }
  });
});
