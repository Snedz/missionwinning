/**
 * Coach tools — MCP-shaped specs, local dispatch.
 *
 * Each tool quotes a fact the athlete can check, or says it is missing.
 * No network, no vendor RAG, no social/rewards reads.
 */

import {
  formatRetrievalBlock,
  retrieveCoachKnowledge,
} from '@/lib/coach/agent/retrieve';
import type {
  CoachAgentWorld,
  CoachToolResult,
  CoachToolSpec,
} from '@/lib/coach/agent/types';

export const COACH_AGENT_TOOLS: readonly CoachToolSpec[] = [
  {
    name: 'search_knowledge',
    description:
      'Search form cues, exercise catalog, and guidebook notes. Use for how-to, SAID, and movement questions.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'What to look up' },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'lookup_recent_sets',
    description:
      'Quote the last logged working set for an exercise from the athlete facts in this request. Never invent a set.',
    inputSchema: {
      type: 'object',
      properties: {
        exercise_id: {
          type: 'string',
          description: 'Catalog exercise id, e.g. squats',
        },
      },
      required: ['exercise_id'],
      additionalProperties: false,
    },
  },
  {
    name: 'cite_last_log',
    description:
      'Quote the single most recent logged working set across all exercises, or say no sets are logged.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: 'lookup_week_plan',
    description: 'List this week’s planned sessions and their status.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
  {
    name: 'lookup_form',
    description: 'Return form cues and common mistakes for one exercise.',
    inputSchema: {
      type: 'object',
      properties: {
        exercise_id: { type: 'string', description: 'Catalog exercise id' },
      },
      required: ['exercise_id'],
      additionalProperties: false,
    },
  },
  {
    name: 'lookup_load_band',
    description:
      'Return the descriptive acute:chronic load band (unknown/light/steady/high). Not an injury prediction.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
] as const;

export function coachToolNames(): readonly string[] {
  return COACH_AGENT_TOOLS.map((t) => t.name);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function lookupFact(world: CoachAgentWorld, exerciseId: string) {
  const needle = exerciseId.toLowerCase();
  return (
    world.logFacts.find((f) => f.exerciseId.toLowerCase() === needle) ??
    world.logFacts.find((f) => f.exerciseName.toLowerCase() === needle) ??
    world.logFacts.find((f) => f.exerciseName.toLowerCase().includes(needle))
  );
}

export function dispatchCoachTool(
  name: string,
  input: Record<string, unknown>,
  world: CoachAgentWorld
): CoachToolResult {
  switch (name) {
    case 'search_knowledge': {
      const query = asString(input.query);
      if (!query) return { ok: false, observation: 'search_knowledge needs query.' };
      const docs = world.documents ?? [];
      const hits = retrieveCoachKnowledge(query, docs, { k: 4 });
      return { ok: true, observation: formatRetrievalBlock(hits) };
    }
    case 'lookup_recent_sets': {
      const exerciseId = asString(input.exercise_id);
      if (!exerciseId) {
        return { ok: false, observation: 'lookup_recent_sets needs exercise_id.' };
      }
      const fact = lookupFact(world, exerciseId);
      if (!fact) {
        return {
          ok: true,
          observation: `No logged working set for ${exerciseId}.`,
        };
      }
      return {
        ok: true,
        observation: `From your log: ${fact.exerciseName} ${fact.weight} × ${fact.reps} · ${fact.at}`,
      };
    }
    case 'cite_last_log': {
      const fact = world.logFacts[0];
      if (!fact) {
        return {
          ok: true,
          observation: 'No sets logged yet — log one and Coach builds the week from it.',
        };
      }
      return {
        ok: true,
        observation: `From your log: ${fact.exerciseName} ${fact.weight} × ${fact.reps} · ${fact.at}`,
      };
    }
    case 'lookup_week_plan': {
      if (world.weekSessions.length === 0) {
        return { ok: true, observation: 'No coach week on this device.' };
      }
      const lines = world.weekSessions.map(
        (s) => `${s.name} (${s.kind}, ${s.status}) — ${s.exerciseIds.join(', ') || 'no lifts'}`
      );
      return { ok: true, observation: `This week:\n${lines.join('\n')}` };
    }
    case 'lookup_form': {
      const exerciseId = asString(input.exercise_id);
      if (!exerciseId) return { ok: false, observation: 'lookup_form needs exercise_id.' };
      const docs = world.documents ?? [];
      const hit =
        docs.find((d) => d.kind === 'exercise' && d.exerciseId === exerciseId) ??
        retrieveCoachKnowledge(exerciseId, docs, { k: 1 })[0];
      if (!hit) return { ok: true, observation: `No form notes for ${exerciseId}.` };
      return { ok: true, observation: `${hit.title}: ${hit.text.slice(0, 400)}` };
    }
    case 'lookup_load_band': {
      return {
        ok: true,
        observation: `Load band ${world.loadZone} · train days last 14: ${world.trainDays14}. Descriptive only — not an injury forecast.`,
      };
    }
    default:
      return { ok: false, observation: `Unknown tool: ${name}` };
  }
}

export function formatToolCatalog(tools: readonly CoachToolSpec[] = COACH_AGENT_TOOLS): string {
  return tools
    .map((t) => {
      const keys = Object.keys(t.inputSchema.properties);
      const args = keys.length > 0 ? keys.join(', ') : '(none)';
      return `- ${t.name}(${args}): ${t.description}`;
    })
    .join('\n');
}
