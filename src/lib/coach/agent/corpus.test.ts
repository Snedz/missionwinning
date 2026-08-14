import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  buildCoachKnowledgeCorpus,
  resetCoachKnowledgeCorpusCache,
} from '@/lib/coach/agent/corpus';
import { retrieveCoachKnowledge, ndcgAtK, mrr } from '@/lib/coach/agent/retrieve';

describe('buildCoachKnowledgeCorpus', () => {
  it('indexes catalog lifts and guidebook SAID, and memoises the list', () => {
    resetCoachKnowledgeCorpusCache();
    const a = buildCoachKnowledgeCorpus();
    const b = buildCoachKnowledgeCorpus();
    assert.equal(a, b);
    assert.ok(a.some((d) => d.id === 'exercise:squats'));
    assert.ok(a.some((d) => d.id === 'guide:human-performance/ch1-s1'));
    assert.ok(a.every((d) => d.title && d.text));
  });

  it('retrieves squat form and SAID from the live corpus (NDCG/MRR)', () => {
    const docs = buildCoachKnowledgeCorpus();
    const squat = retrieveCoachKnowledge('how do I squat with good form', docs, { k: 5 });
    assert.ok(squat.some((h) => h.id === 'exercise:squats'));
    const squatIds = squat.map((h) => h.id);
    assert.ok(ndcgAtK(squatIds, { 'exercise:squats': 2 }, 5) > 0);
    assert.ok(mrr(squatIds, new Set(['exercise:squats'])) > 0);

    const said = retrieveCoachKnowledge('SAID principle specific adaptation', docs, { k: 5 });
    assert.ok(said.some((h) => h.id === 'guide:human-performance/ch1-s1'));
  });

  it('does not import rewards, leaderboard, or social', () => {
    const src = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'corpus.ts'), 'utf8');
    assert.doesNotMatch(src, /@\/lib\/rewards/);
    assert.doesNotMatch(src, /@\/lib\/leaderboard/);
    assert.doesNotMatch(src, /@\/lib\/social/);
  });
});
