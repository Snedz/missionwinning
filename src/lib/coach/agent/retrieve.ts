/**
 * In-process retrieval for Mission Coach.
 *
 * Not vendor RAG (xAI Collections / Files are ZDR-forbidden). This is a
 * bi-encoder stand-in: BM25-lite over a local corpus, HyDE-style query
 * expansion without a second model, then a lexical cross-encoder rerank.
 * Ranking quality is scored with NDCG and MRR in the colocated tests.
 */

import type { CoachKnowledgeDoc, CoachRetrievalHit } from '@/lib/coach/agent/types';

const STOP = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'to',
  'of',
  'in',
  'on',
  'for',
  'with',
  'how',
  'do',
  'i',
  'my',
  'me',
  'is',
  'it',
  'this',
  'that',
  'should',
  'can',
  'what',
  'when',
  'why',
]);

const BM25_K1 = 1.2;
const BM25_B = 0.75;

/**
 * Closed alias table for HyDE-style expansion. Each key is a token we have
 * actually seen in coach questions; values are terms that live on the
 * matching catalog / guidebook chunks. A free-form synonym list would
 * pretend we have an embedding model we do not.
 */
const HYDE_ALIASES: Readonly<Record<string, readonly string[]>> = {
  squat: ['squats', 'front-squat', 'air-squat', 'sit', 'knees', 'brace'],
  squats: ['squat', 'front-squat', 'air-squat'],
  bench: ['bench-press', 'chest', 'bar'],
  deadlift: ['hinge', 'bar', 'mid-foot', 'lock'],
  press: ['overhead-press', 'overhead', 'shoulders'],
  pullup: ['pull-ups', 'chin', 'lat'],
  'pull-up': ['pull-ups', 'chin', 'lat'],
  said: ['adaptation', 'imposed', 'demands', 'specific'],
  form: ['cues', 'steps', 'mistakes', 'brace'],
  cue: ['cues', 'form', 'steps'],
};

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOP.has(t));
}

/**
 * Hypothetical-document expansion: the query plus movement aliases plus a
 * one-line "coach note about …" wrapper. No extra LLM call — ZDR one-shot
 * budget stays on the ReAct loop.
 */
export function expandQueryHyde(query: string): string {
  const raw = query.trim();
  if (!raw) return '';
  const tokens = tokenize(raw);
  const extra: string[] = [];
  const seen = new Set<string>();
  for (const token of tokens) {
    const aliases = HYDE_ALIASES[token];
    if (!aliases) continue;
    for (const alias of aliases) {
      if (seen.has(alias)) continue;
      seen.add(alias);
      extra.push(alias);
    }
  }
  const hypo = `A coach note answering: ${raw}. Form cues, last logged set, and the matching exercise.`;
  return extra.length > 0 ? `${raw} ${extra.join(' ')} ${hypo}` : `${raw} ${hypo}`;
}

function termFreq(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

function idf(docFreq: number, nDocs: number): number {
  return Math.log(1 + (nDocs - docFreq + 0.5) / (docFreq + 0.5));
}

function bm25Scores(queryTokens: string[], docs: CoachKnowledgeDoc[]): number[] {
  if (docs.length === 0 || queryTokens.length === 0) return docs.map(() => 0);
  const tokenized = docs.map((d) => tokenize(`${d.title} ${d.text}`));
  const avgdl = tokenized.reduce((s, t) => s + t.length, 0) / tokenized.length || 1;
  const df = new Map<string, number>();
  for (const q of new Set(queryTokens)) {
    let n = 0;
    for (const tokens of tokenized) {
      if (tokens.includes(q)) n += 1;
    }
    df.set(q, n);
  }
  return tokenized.map((tokens) => {
    const tf = termFreq(tokens);
    const dl = tokens.length || 1;
    let score = 0;
    for (const q of queryTokens) {
      const f = tf.get(q) ?? 0;
      if (f === 0) continue;
      const w = idf(df.get(q) ?? 0, docs.length);
      const denom = f + BM25_K1 * (1 - BM25_B + BM25_B * (dl / avgdl));
      score += w * ((f * (BM25_K1 + 1)) / denom);
    }
    return score;
  });
}

/**
 * Cross-encoder stand-in: phrase match, title coverage, id token hit.
 * Applied on top of BM25 so a named exercise beats a long guide paragraph
 * that merely shares stopword-adjacent tokens.
 */
export function rerankHits(query: string, hits: CoachRetrievalHit[]): CoachRetrievalHit[] {
  const q = query.trim().toLowerCase();
  const qTokens = tokenize(query);
  return hits
    .map((hit) => {
      let bonus = 0;
      const title = hit.title.toLowerCase();
      const body = hit.text.toLowerCase();
      if (q && (title.includes(q) || body.includes(q))) bonus += 1.5;
      const titleTokens = new Set(tokenize(hit.title));
      const covered = qTokens.filter((t) => titleTokens.has(t)).length;
      if (qTokens.length > 0 && covered === qTokens.length) bonus += 2;
      else if (covered > 0) bonus += 0.5 * covered;
      if (hit.exerciseId && qTokens.includes(hit.exerciseId.replace(/-/g, ''))) bonus += 0.75;
      if (qTokens.some((t) => hit.id.toLowerCase().includes(t))) bonus += 0.35;
      return { ...hit, score: hit.score + bonus };
    })
    .sort((a, b) => b.score - a.score);
}

export function retrieveCoachKnowledge(
  query: string,
  docs: readonly CoachKnowledgeDoc[],
  options?: { k?: number; hyde?: boolean }
): CoachRetrievalHit[] {
  const k = options?.k ?? 5;
  const expanded = options?.hyde === false ? query : expandQueryHyde(query);
  const qTokens = tokenize(expanded);
  if (qTokens.length === 0 || docs.length === 0 || k <= 0) return [];
  const corpus = docs.slice();
  const scores = bm25Scores(qTokens, corpus);
  const ranked: CoachRetrievalHit[] = corpus
    .map((doc, i) => ({ ...doc, score: scores[i] ?? 0 }))
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score);
  const reranked = rerankHits(query, ranked);
  return reranked.slice(0, k);
}

/** Discounted cumulative gain at k. Relevance is 0+ graded. */
export function dcgAtK(relevances: number[], k: number): number {
  const n = Math.min(k, relevances.length);
  let s = 0;
  for (let i = 0; i < n; i++) {
    const rel = relevances[i] ?? 0;
    s += rel / Math.log2(i + 2);
  }
  return s;
}

export function ndcgAtK(rankedIds: string[], relevant: Readonly<Record<string, number>>, k: number): number {
  const gained = rankedIds.slice(0, k).map((id) => relevant[id] ?? 0);
  const ideal = Object.values(relevant)
    .filter((v) => v > 0)
    .sort((a, b) => b - a);
  const idealDcg = dcgAtK(ideal, k);
  if (idealDcg === 0) return 0;
  return dcgAtK(gained, k) / idealDcg;
}

/** Reciprocal rank of the first relevant id, or 0. */
export function mrr(rankedIds: string[], relevantIds: ReadonlySet<string>): number {
  for (let i = 0; i < rankedIds.length; i++) {
    const id = rankedIds[i];
    if (id && relevantIds.has(id)) return 1 / (i + 1);
  }
  return 0;
}

export function formatRetrievalBlock(hits: readonly CoachRetrievalHit[]): string {
  if (hits.length === 0) return 'Retrieved: none.';
  return [
    'Retrieved (quote, do not invent):',
    ...hits.map((h, i) => `${i + 1}. [${h.kind} ${h.id}] ${h.title} — ${h.text.slice(0, 280)}`),
  ].join('\n');
}
