import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  MIND_COLLECTIONS,
  filterMindByCollection,
  parseMindCollectionParam,
} from '@/lib/mind/filterSessions';
import {
  MIND_SERIES,
  mindSeriesByCollectionId,
  orderSessionsForSeries,
} from '@/lib/mind/mindSeries';

const root = join(import.meta.dirname, '..', '..', '..');

test('sleep-week is a Mind collection and parses from URL', () => {
  assert.ok(MIND_COLLECTIONS.some((c) => c.id === 'sleep-week'));
  assert.equal(parseMindCollectionParam('sleep-week'), 'sleep-week');
  assert.equal(parseMindCollectionParam('nope'), 'all');
});

test('mind series defines ordered sleep-week nights', () => {
  const s = mindSeriesByCollectionId('sleep-week');
  assert.ok(s);
  assert.deepEqual(s!.sessionIds, [
    'sleep-week-night-1',
    'sleep-week-night-2',
    'sleep-week-night-3',
    'sleep-week-night-4',
    'sleep-week-night-5',
    'sleep-week-night-6',
    'sleep-week-night-7',
  ]);
  assert.equal(MIND_SERIES.length, 1);
});

test('orderSessionsForSeries keeps night order', () => {
  const mixed = [
    { id: 'sleep-week-night-3' },
    { id: 'other' },
    { id: 'sleep-week-night-1' },
    { id: 'sleep-week-night-2' },
  ];
  const series = mindSeriesByCollectionId('sleep-week')!;
  assert.deepEqual(
    orderSessionsForSeries(mixed, series).map((x) => x.id),
    ['sleep-week-night-1', 'sleep-week-night-2', 'sleep-week-night-3', 'other']
  );
});

test('filter by sleep-week tag matches series tag only', () => {
  const sessions = [
    { id: 'a', title: 'A', subtitle: '', minutes: 3, tags: ['sleep'], steps: [] },
    {
      id: 'sleep-week-night-1',
      title: 'N1',
      subtitle: '',
      minutes: 7,
      tags: ['sleep', 'series-sleep-week'],
      steps: [],
    },
  ];
  const out = filterMindByCollection(sessions, 'sleep-week');
  assert.deepEqual(
    out.map((s) => s.id),
    ['sleep-week-night-1']
  );
});

test('MindPage does not leftover series banner', () => {
  const src = readFileSync(join(root, 'src/page-components/MindPage.tsx'), 'utf8');
  assert.match(src, /<DailyCheckIn\b/);
  assert.doesNotMatch(src, /mind-series-banner/);
  assert.doesNotMatch(src, /orderSessionsForSeries/);
  assert.doesNotMatch(src, /mindSeriesByCollectionId/);
});
