/**
 * Coach chat empty load is BW, not 0 (`.1021`).
 * Logger cites already print 8 × BW. Chat still interpolated 0 × 8.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { formatCoachLogFactCite } from './coach/agent/facts.ts';
import { dispatchCoachTool } from './coach/agent/tools.ts';
import type { CoachAgentWorld } from './coach/agent/types.ts';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

const emptyFact = {
  exerciseId: 'push-ups',
  exerciseName: 'Push-ups',
  weight: 0,
  reps: 8,
  at: 'monday',
};

const loadedWorld: CoachAgentWorld = {
  logFacts: [
    {
      exerciseId: 'squats',
      exerciseName: 'Squats',
      weight: 80,
      reps: 5,
      at: 'tuesday',
    },
  ],
  weekSessions: [],
  loadZone: 'steady',
  trainDays14: 1,
  documents: [],
};

describe('coach chat empty load is BW, not 0 (.1021)', () => {
  it('push-ups 0 × 8 print as 8 × BW', () => {
    const line = formatCoachLogFactCite(emptyFact);
    assert.match(line, /8 × BW/);
    assert.doesNotMatch(line, /0 × 8/);
    assert.match(line, /Push-ups/);
  });

  it('cite_last_log and lookup_recent_sets use the helper', () => {
    const world: CoachAgentWorld = {
      ...loadedWorld,
      logFacts: [emptyFact],
    };
    const last = dispatchCoachTool('cite_last_log', {}, world);
    assert.match(last.observation, /8 × BW/);
    assert.doesNotMatch(last.observation, /0 × 8/);
    const lookup = dispatchCoachTool('lookup_recent_sets', { exercise_id: 'push-ups' }, world);
    assert.match(lookup.observation, /8 × BW/);
    const loaded = dispatchCoachTool('cite_last_log', {}, loadedWorld);
    assert.match(loaded.observation, /80/);
    assert.doesNotMatch(loaded.observation, /8 × BW/);
  });

  it('tools and ReAct share formatCoachLogFactCite — no second 0 interpolator', () => {
    const tools = read('src/lib/coach/agent/tools.ts');
    const react = read('src/lib/coach/agent/react.ts');
    const facts = read('src/lib/coach/agent/facts.ts');
    assert.match(facts, /formatSetLoadLine/);
    assert.match(tools, /formatCoachLogFactCite/);
    assert.match(react, /formatCoachLogFactCite/);
    assert.doesNotMatch(tools, /fact\.weight\} × \$\{fact\.reps/);
    assert.doesNotMatch(react, /f\.weight\} × \$\{f\.reps/);
    const lean = read('src/page-components/HomeTodayLean.tsx');
    assert.equal([...lean.matchAll(/dock="start"/g)].length, 1);
  });
});
