import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  COACH_AGENT_TOOLS,
  coachToolNames,
  dispatchCoachTool,
  formatToolCatalog,
} from '@/lib/coach/agent/tools';
import type { CoachAgentWorld } from '@/lib/coach/agent/types';

const world: CoachAgentWorld = {
  logFacts: [
    {
      exerciseId: 'squats',
      exerciseName: 'Squats',
      weight: 80,
      reps: 5,
      at: '2026-08-10T10:00:00.000Z',
    },
  ],
  weekSessions: [
    { name: 'Lower', kind: 'strength', status: 'planned', exerciseIds: ['squats', 'deadlift'] },
  ],
  loadZone: 'steady',
  trainDays14: 4,
  documents: [
    {
      id: 'exercise:squats',
      kind: 'exercise',
      title: 'Squats',
      text: 'Brace. Knees track. Sit down and back.',
      exerciseId: 'squats',
    },
  ],
};

describe('COACH_AGENT_TOOLS', () => {
  it('is a closed MCP-shaped list — every spec has a dispatcher branch', () => {
    const names = coachToolNames();
    assert.ok(names.includes('search_knowledge'));
    assert.ok(names.includes('cite_last_log'));
    for (const spec of COACH_AGENT_TOOLS) {
      assert.equal(spec.inputSchema.type, 'object');
      assert.equal(spec.inputSchema.additionalProperties, false);
      const result = dispatchCoachTool(spec.name, { query: 'squat', exercise_id: 'squats' }, world);
      assert.equal(typeof result.observation, 'string');
      assert.notEqual(result.observation.startsWith('Unknown tool:'), true, spec.name);
    }
  });

  it('catalog text names every tool', () => {
    const catalog = formatToolCatalog();
    for (const name of coachToolNames()) {
      assert.match(catalog, new RegExp(name));
    }
  });
});

describe('dispatchCoachTool', () => {
  it('quotes a logged set and refuses to invent one', () => {
    const hit = dispatchCoachTool('lookup_recent_sets', { exercise_id: 'squats' }, world);
    assert.equal(hit.ok, true);
    assert.match(hit.observation, /80/);
    assert.match(hit.observation, /Squats/);
    const miss = dispatchCoachTool('lookup_recent_sets', { exercise_id: 'bench-press' }, world);
    assert.match(miss.observation, /No logged working set/);
    const empty = dispatchCoachTool('cite_last_log', {}, { ...world, logFacts: [] });
    assert.match(empty.observation, /No sets logged yet/);
  });

  it('lists the week and the load band without forecasting injury', () => {
    const week = dispatchCoachTool('lookup_week_plan', {}, world);
    assert.match(week.observation, /Lower/);
    const band = dispatchCoachTool('lookup_load_band', {}, world);
    assert.match(band.observation, /steady/);
    assert.match(band.observation, /not an injury/i);
  });

  it('search_knowledge and lookup_form read the local corpus', () => {
    const search = dispatchCoachTool('search_knowledge', { query: 'squat brace' }, world);
    assert.match(search.observation, /Squats/);
    const form = dispatchCoachTool('lookup_form', { exercise_id: 'squats' }, world);
    assert.match(form.observation, /Brace/);
    const bad = dispatchCoachTool('search_knowledge', {}, world);
    assert.equal(bad.ok, false);
  });

  it('unknown tool is an observation, not a throw', () => {
    const out = dispatchCoachTool('launch_missiles', {}, world);
    assert.equal(out.ok, false);
    assert.match(out.observation, /Unknown tool/);
  });
});
