/**
 * In-set cues (`.973`) — short written setup on the open live exercise.
 *
 * Mutants: inventing a brace line with no guide; 4+ lines; remote clip URL;
 * mounting cues on Today / `/private` / Fuel.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import type { FormGuide } from '@/types/formGuide';
import { getFormGuideOrCues } from '@/lib/formGuides';
import { finishPartialFromActive } from './sessionResume.ts';
import {
  IN_SET_CUE_CAP,
  honestInSetStillUrl,
  resolveInSetCues,
  shouldShowInSetCues,
} from './inSetCues.ts';
import type { ActiveWorkout } from '@/types';

const root = path.join(import.meta.dirname, '..', '..', '..');
const read = (rel: string) => readFileSync(path.join(root, rel), 'utf8');

const BENCH: FormGuide = {
  readyPosition: 'Lie on bench, eyes under bar',
  setup: [
    'Feet flat, slight arch, shoulder blades pinched',
    'Grip slightly wider than shoulders',
    'Wrists stacked over elbows',
  ],
  execute: [
    'Lower bar to mid-chest with control',
    'Elbows ~45° from torso',
    'Press up in slight arc to lockout',
  ],
  commonErrors: ['Bouncing bar off chest'],
  breathing: 'Brace · Exhale through top',
  mediaUrl: '/form-guides/bench-press.svg',
  mediaType: 'image',
};

describe('resolveInSetCues', () => {
  it('setup first, then execute, cap 3', () => {
    const out = resolveInSetCues(BENCH);
    assert.equal(IN_SET_CUE_CAP, 3);
    assert.deepEqual(out.lines, [
      'Feet flat, slight arch, shoulder blades pinched',
      'Grip slightly wider than shoulders',
      'Lower bar to mid-chest with control',
    ]);
    assert.ok(out.lines.length <= IN_SET_CUE_CAP);
    assert.equal(out.stillUrl, '/form-guides/bench-press.svg');
    assert.ok(!out.lines.includes('Bouncing bar off chest'));
    assert.ok(!out.lines.includes('Brace · Exhale through top'));
    assert.ok(!out.lines.includes('Lie on bench, eyes under bar'));
  });

  it('catalog-cues-only guide uses execute; empty invents nothing', () => {
    const cuesOnly = getFormGuideOrCues('not-a-catalog-id', {
      exercise: {
        id: 'not-a-catalog-id',
        name: 'Carry',
        muscleGroups: ['Core'],
        equipment: 'Dumbbells',
        cues: 'One weight at side, resist lean, walk steady.',
      },
    });
    const out = resolveInSetCues(cuesOnly);
    assert.ok(out.lines.length > 0);
    assert.ok(out.lines.length <= IN_SET_CUE_CAP);
    assert.ok(out.lines.some((l) => /weight at side|resist lean|walk steady/i.test(l)));
    assert.doesNotMatch(out.lines.join(' '), /https?:|youtube|place order/i);

    assert.deepEqual(resolveInSetCues(null), { lines: [], stillUrl: null });
    assert.deepEqual(resolveInSetCues(undefined), { lines: [], stillUrl: null });
    assert.deepEqual(resolveInSetCues({ setup: [], execute: [] }), {
      lines: [],
      stillUrl: null,
    });
    assert.deepEqual(resolveInSetCues({ setup: ['  '], execute: [''] }), {
      lines: [],
      stillUrl: null,
    });
  });

  it('does not invent a generic brace line when there is no guide', () => {
    const helper = read('src/lib/workout/inSetCues.ts');
    assert.match(helper, /if \(!guide\) return \{ lines: \[\], stillUrl: null \}/);
    assert.doesNotMatch(helper, /brace your core|stable footing/i);
    const empty = resolveInSetCues(null);
    assert.deepEqual(empty.lines, []);
    assert.equal(empty.stillUrl, null);
  });

  it('still is the existing local still / poster; remote hosts die', () => {
    const video = resolveInSetCues({
      setup: ['Ribs down'],
      execute: ['Press straight up'],
      mediaUrl: '/form/overhead-press/side.webm',
      mediaType: 'video',
      mediaPosterUrl: '/form/overhead-press/side.webp',
    });
    assert.equal(video.stillUrl, '/form/overhead-press/side.webp');

    const bareVideo = resolveInSetCues({
      setup: ['Ribs down'],
      execute: [],
      mediaUrl: '/form/overhead-press/side.mp4',
      mediaType: 'video',
    });
    assert.equal(bareVideo.stillUrl, null);

    assert.equal(honestInSetStillUrl('https://youtube.com/watch?v=x'), null);
    assert.equal(honestInSetStillUrl('http://cdn.example/clip.mp4'), null);
    assert.equal(honestInSetStillUrl('//cdn.example/clip.webp'), null);
    assert.equal(honestInSetStillUrl('/form-guides/deadlift.svg'), '/form-guides/deadlift.svg');

    const remote = resolveInSetCues({
      setup: ['Stand tall'],
      execute: [],
      mediaUrl: 'https://youtube.com/watch?v=x',
      mediaType: 'video',
    });
    assert.equal(remote.stillUrl, null);
    assert.doesNotMatch(JSON.stringify(remote), /https?:|youtube/i);
  });
});

describe('shouldShowInSetCues', () => {
  it('only the open live lift; skip / hide / empty stay off', () => {
    const lines = ['Feet flat'];
    assert.equal(
      shouldShowInSetCues({ holdsActiveExercise: true, lines }),
      true
    );
    assert.equal(
      shouldShowInSetCues({ holdsActiveExercise: false, lines }),
      false
    );
    assert.equal(
      shouldShowInSetCues({
        holdsActiveExercise: true,
        skippedThisSession: true,
        lines,
      }),
      false
    );
    assert.equal(
      shouldShowInSetCues({ holdsActiveExercise: true, hidden: true, lines }),
      false
    );
    assert.equal(
      shouldShowInSetCues({ holdsActiveExercise: true, lines: [] }),
      false
    );
  });
});

describe('in-set cue wiring', () => {
  it('active card uses the helper and gates on holdsActiveExercise', () => {
    const card = read('src/components/workout/ActiveExerciseCard.tsx');
    assert.match(card, /resolveInSetCues/);
    assert.match(card, /shouldShowInSetCues/);
    assert.match(card, /holdsActiveExercise/);
    assert.match(card, /<InSetCueList/);
    assert.doesNotMatch(card, /from\s+['"]@\/lib\/speech/);
    assert.doesNotMatch(card, /from\s+['"]@\/lib\/rewards/);
    assert.doesNotMatch(card, /youtube|discord\.com|marketplace/i);
  });

  it('Today / Fuel / /private / door do not import in-set cues', () => {
    const surfaces = [
      'src/page-components/HomePage.tsx',
      'src/page-components/HomeTodayLean.tsx',
      'src/page-components/HomeTodayDashboard.tsx',
      'src/components/today/TodayQuietWeekStrip.tsx',
      'src/page-components/NutritionPage.tsx',
      'app/private/PrivateTeaserClient.tsx',
    ];
    for (const rel of surfaces) {
      const src = read(rel);
      assert.doesNotMatch(src, /inSetCues|InSetCueList/, rel);
      assert.doesNotMatch(src, /youtube|clip feed|marketplace of clips/i, rel);
    }
  });

  it('helper stays free of social / speech / shop; Log set never waits', () => {
    const helper = read('src/lib/workout/inSetCues.ts');
    assert.doesNotMatch(helper, /from\s+['"]@\/lib\/speech/);
    assert.doesNotMatch(helper, /from\s+['"]@\/lib\/rewards/);
    assert.doesNotMatch(helper, /from\s+['"]@\/lib\/social/);
    assert.doesNotMatch(helper, /generateWeek|leaderboard|Force Sync|Session Expired/);
    assert.doesNotMatch(helper, /from\s+['"]https?:/);

    const card = read('src/components/workout/ActiveExerciseCard.tsx');
    assert.match(card, /onLogSet/);
    assert.doesNotMatch(card, /await\s+resolveInSetCues/);

    const list = read('src/components/workout/InSetCueList.tsx');
    assert.doesNotMatch(list, /primary-action/);
    assert.doesNotMatch(list, /Top 8|\blikes\b|\bXP\b|Discord|comments|\bDMs\b/i);
    assert.match(list, /data-testid="in-set-cues"/);
    assert.match(list, /data-testid="in-set-cues-skip"/);
  });

  it('resume / finish-partial stays: leftover empty sets invent no volume', () => {
    const live: ActiveWorkout = {
      workoutName: 'Push',
      startedAt: 't0',
      clientId: 'sess-1',
      revision: 1,
      updatedAt: 't0',
      exercises: [
        {
          exerciseId: 'bench-press',
          sets: [
            { id: 'a', reps: 5, weight: 100, completed: true, kind: 'normal' },
            { id: 'b', reps: 0, weight: 0, completed: false, kind: 'normal' },
          ],
        },
      ],
    };
    const out = finishPartialFromActive(live);
    assert.ok(out);
    assert.equal(out.exercises[0]?.sets.length, 1);
    assert.equal(out.exercises[0]?.sets[0]?.reps, 5);
  });
});
