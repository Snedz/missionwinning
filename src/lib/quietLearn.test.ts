/**
 * Quiet Learn — existing-path-first; empty invents nothing; no paid gate.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { FREE_LEARN_PATHS, type LearnLesson, type LearnPath } from '@/data/learnPaths';
import {
  QUIET_LEARN_COACH_LESSON_ID,
  QUIET_LEARN_DIATAXIS,
  QUIET_LEARN_HREF,
  QUIET_LEARN_LESSON_ID,
  QUIET_LEARN_PATH_ID,
  isQuietLearnFirstSuccess,
  quietLearnHref,
  quietLearnIntro,
} from './quietLearn.ts';

const root = path.join(import.meta.dirname, '..', '..');
const FORBIDDEN = /from ['"]@\/lib\/(premium|trial|bundle|rewards|invite)/;

function catalogLesson(id: string): LearnLesson {
  const lesson = FREE_LEARN_PATHS.flatMap((p) => p.lessons).find((row) => row.id === id);
  assert.ok(lesson, `catalog missing ${id}`);
  return lesson;
}

describe('quietLearn intro', () => {
  it('resolves the existing sb-0 first-success lesson', () => {
    const snap = quietLearnIntro();
    const sb0 = catalogLesson(QUIET_LEARN_LESSON_ID);
    assert.equal(snap.empty, false);
    assert.equal(snap.diataxis, QUIET_LEARN_DIATAXIS);
    assert.equal(snap.pathId, QUIET_LEARN_PATH_ID);
    assert.equal(snap.lesson?.id, QUIET_LEARN_LESSON_ID);
    assert.equal(snap.lesson?.title, sb0.title);
    assert.equal(snap.lesson?.summary, sb0.summary);
    assert.equal(isQuietLearnFirstSuccess(snap.lesson), true);
    assert.match(JSON.stringify(snap.lesson), /log/i);
    assert.match(JSON.stringify(snap.lesson), /coach/i);
    assert.doesNotMatch(JSON.stringify(snap), /ISSA|Discord\.com|WeChat|marketplace/i);
  });

  it('pairs the existing pd-0 Coach CTA and does not invent a href', () => {
    const snap = quietLearnIntro();
    const pd0 = catalogLesson(QUIET_LEARN_COACH_LESSON_ID);
    assert.equal(snap.coachHref, pd0.actionHref);
    assert.equal(snap.coachLabel, pd0.actionLabel);
    assert.equal(quietLearnHref(), QUIET_LEARN_HREF);
  });

  it('missing sb-0 is honest empty', () => {
    const emptyCatalog: LearnPath[] = FREE_LEARN_PATHS.map((path) =>
      path.id === QUIET_LEARN_PATH_ID
        ? { ...path, lessons: path.lessons.filter((l) => l.id !== QUIET_LEARN_LESSON_ID) }
        : path
    );
    const snap = quietLearnIntro(emptyCatalog, emptyCatalog);
    assert.equal(snap.empty, true);
    assert.equal(snap.lesson, null);
    assert.equal(snap.coachHref, null);
    assert.doesNotMatch(JSON.stringify(snap), /Offline Log|invented|ISSA/);
    assert.equal(isQuietLearnFirstSuccess(null), false);
  });

  it('rewritten sb-0 that drops first success stays empty', () => {
    const rewritten: LearnPath[] = FREE_LEARN_PATHS.map((path) =>
      path.id === QUIET_LEARN_PATH_ID
        ? {
            ...path,
            lessons: path.lessons.map((l) =>
              l.id === QUIET_LEARN_LESSON_ID
                ? {
                    ...l,
                    title: 'A new invented tutorial',
                    summary: 'Welcome to the feed.',
                    keyPoints: ['Join Discord.com'],
                  }
                : l
            ),
          }
        : path
    );
    const snap = quietLearnIntro(rewritten, rewritten);
    assert.equal(snap.empty, true);
    assert.equal(snap.lesson, null);
  });

  it('a lesson that drops log or Coach is not first success', () => {
    const logOnly: LearnLesson = {
      id: 'x',
      title: 'Log a set',
      summary: 'Write the numbers down.',
      keyPoints: ['Track sessions'],
    };
    const coachOnly: LearnLesson = {
      id: 'y',
      title: 'Open Coach',
      summary: 'A week appears.',
      keyPoints: ['Coach depth'],
    };
    assert.equal(isQuietLearnFirstSuccess(logOnly), false);
    assert.equal(isQuietLearnFirstSuccess(coachOnly), false);
  });

  it('helper does not import premium, trial, rewards, or invite', () => {
    const src = readFileSync(path.join(root, 'src/lib/quietLearn.ts'), 'utf8');
    assert.doesNotMatch(src, FORBIDDEN);
    assert.doesNotMatch(src, /usePremium|isPremium|PRIVATE_MODE/);
    assert.doesNotMatch(src, /discord\.com|WeChat|marketplace/i);
  });
});
