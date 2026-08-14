import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  expandQueryHyde,
  mrr,
  ndcgAtK,
  retrieveCoachKnowledge,
  tokenize,
} from '@/lib/coach/agent/retrieve';
import type { CoachKnowledgeDoc } from '@/lib/coach/agent/types';

const DOCS: CoachKnowledgeDoc[] = [
  {
    id: 'exercise:squats',
    kind: 'exercise',
    title: 'Squats',
    text: 'Brace before you descend. Knees track over mid-foot. Sit hips down and back.',
    exerciseId: 'squats',
  },
  {
    id: 'exercise:bench-press',
    kind: 'exercise',
    title: 'Bench Press',
    text: 'Shoulders packed, feet planted. Touch chest with control. Press up without bouncing.',
    exerciseId: 'bench-press',
  },
  {
    id: 'exercise:deadlift',
    kind: 'exercise',
    title: 'Deadlift',
    text: 'Bar over mid-foot. Push the floor. Lock hips and knees together.',
    exerciseId: 'deadlift',
  },
  {
    id: 'guide:human-performance/ch1-s1',
    kind: 'guide',
    title: 'Human Performance Science: The SAID Principle',
    text: 'Your body adapts specifically to the stress you apply. Specific Adaptation to Imposed Demands.',
  },
];

describe('tokenize', () => {
  it('drops stopwords and short tokens', () => {
    assert.deepEqual(tokenize('How do I squat?'), ['squat']);
    assert.deepEqual(tokenize(''), []);
  });
});

describe('expandQueryHyde', () => {
  it('wraps a hypothetical coach note and adds squat aliases', () => {
    const expanded = expandQueryHyde('how do I squat');
    assert.match(expanded, /coach note/i);
    assert.match(expanded, /squats/);
    assert.equal(expandQueryHyde('   '), '');
  });
});

describe('retrieveCoachKnowledge', () => {
  it('ranks the named lift over a neighboring press', () => {
    const hits = retrieveCoachKnowledge('how do I squat with good form', DOCS, { k: 3 });
    assert.ok(hits.length > 0);
    assert.equal(hits[0]?.id, 'exercise:squats');
    assert.ok((hits[0]?.score ?? 0) > (hits[1]?.score ?? 0));
  });

  it('finds SAID by name', () => {
    const hits = retrieveCoachKnowledge('SAID principle adaptation', DOCS, { k: 2 });
    assert.equal(hits[0]?.id, 'guide:human-performance/ch1-s1');
  });

  it('returns empty for blank query or empty corpus', () => {
    assert.deepEqual(retrieveCoachKnowledge('   ', DOCS), []);
    assert.deepEqual(retrieveCoachKnowledge('squat', []), []);
    assert.deepEqual(retrieveCoachKnowledge('squat', DOCS, { k: 0 }), []);
  });

  it('caps at k', () => {
    const hits = retrieveCoachKnowledge('form brace chest floor', DOCS, { k: 2, hyde: false });
    assert.ok(hits.length <= 2);
  });
});

describe('ndcgAtK / mrr', () => {
  it('is 1 when the gold doc is first and 0 when nothing relevant ranks', () => {
    const relevant = { 'exercise:squats': 2, 'guide:human-performance/ch1-s1': 1 };
    assert.equal(ndcgAtK(['exercise:squats'], { 'exercise:squats': 2 }, 1), 1);
    assert.equal(
      ndcgAtK(['exercise:squats', 'guide:human-performance/ch1-s1'], relevant, 2),
      1
    );
    assert.ok(ndcgAtK(['exercise:bench-press', 'exercise:squats'], relevant, 2) < 1);
    assert.equal(ndcgAtK(['exercise:bench-press'], { 'exercise:squats': 2 }, 1), 0);
    assert.equal(mrr(['exercise:bench-press', 'exercise:squats'], new Set(['exercise:squats'])), 0.5);
    assert.equal(mrr(['exercise:deadlift'], new Set(['exercise:squats'])), 0);
  });

  it('gold set: squat / SAID / bench beat a shuffled catalog', () => {
    const cases: { q: string; gold: string }[] = [
      { q: 'how do I squat', gold: 'exercise:squats' },
      { q: 'SAID principle', gold: 'guide:human-performance/ch1-s1' },
      { q: 'bench press form', gold: 'exercise:bench-press' },
    ];
    for (const c of cases) {
      const ids = retrieveCoachKnowledge(c.q, DOCS, { k: 3 }).map((h) => h.id);
      assert.equal(ids[0], c.gold, c.q);
      assert.ok(ndcgAtK(ids, { [c.gold]: 2 }, 3) >= 0.9, c.q);
      assert.equal(mrr(ids, new Set([c.gold])), 1, c.q);
    }
  });
});
