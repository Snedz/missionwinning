import type { ProgramSession } from '@/data/programTemplates';
import {
  coachExerciseIdsForEquipment,
  isCoachPlanExerciseId,
  type CoachPlanEquipment,
} from '@/lib/coachPlanExercises';
import { getOfflinePlan } from '@/lib/offlinePlanTemplates';

export type CoachPlanGoal =
  | 'general-strength'
  | 'muscle'
  | 'fat-loss'
  | 'mobility'
  | 'endurance';

export interface CoachPlanRequest {
  goal: CoachPlanGoal;
  equipment: CoachPlanEquipment;
  sessionsPerWeek: 2 | 3 | 4;
  weeks: 2 | 3 | 4;
  readiness: number;
  strain: number;
  recovery: number;
  primaryGoalLabel?: string;
}

export interface GeneratedCoachPlan {
  id: string;
  name: string;
  description: string;
  duration: string;
  focus: string;
  sessions: ProgramSession[];
  source: 'llm' | 'rules';
}

const GOAL_LABELS: Record<CoachPlanGoal, string> = {
  'general-strength': 'General strength',
  muscle: 'Muscle building',
  'fat-loss': 'Fat loss & conditioning',
  mobility: 'Mobility & recovery',
  endurance: 'Endurance',
};

export function buildCoachPlanPrompt(req: CoachPlanRequest): string {
  const exerciseIds = coachExerciseIdsForEquipment(req.equipment).join(', ');
  const goalLabel = req.primaryGoalLabel?.trim() || GOAL_LABELS[req.goal];

  return [
    'You are Mission Winning Train Coach — evidence-based programming. No medical claims.',
    `Goal: ${goalLabel}. Equipment: ${req.equipment}. ${req.weeks} weeks, ${req.sessionsPerWeek} sessions/week.`,
    `Athlete readiness ${req.readiness}/100, strain ${req.strain}/100, recovery ${req.recovery}/100.`,
    'If strain > 75 or recovery < 35, bias volume down and add mobility.',
    `Use ONLY these exerciseId values: ${exerciseIds}`,
    'Each session: 4–6 exercises, 3 sets each, reps 6–15 (hold seconds for planks/stretches). weight always 0.',
    'Reply JSON only:',
    '{"name":"...","description":"...","duration":"...","focus":"...","sessions":[{"id":"s1","name":"Week 1 Day A","weekLabel":"Week 1","notes":"...","exercises":[{"exerciseId":"squats","sets":[{"reps":10,"weight":0}]}]}]}',
    `Generate exactly ${req.weeks * req.sessionsPerWeek} sessions with unique ids.`,
  ].join('\n');
}

function normalizeSets(
  raw: unknown
): { reps: number; weight: number }[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const sets = raw.slice(0, 5).map((row) => {
    const r = row as { reps?: number; weight?: number };
    const reps = Math.min(60, Math.max(1, Math.round(Number(r.reps) || 10)));
    return { reps, weight: 0 };
  });
  return sets.length ? sets : null;
}

export function parseCoachPlanJson(
  raw: string,
  req: CoachPlanRequest
): GeneratedCoachPlan | null {
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start < 0 || end <= start) return null;

    const parsed = JSON.parse(raw.slice(start, end + 1)) as {
      name?: string;
      description?: string;
      duration?: string;
      focus?: string;
      sessions?: Array<{
        id?: string;
        name?: string;
        weekLabel?: string;
        notes?: string;
        exercises?: Array<{ exerciseId?: string; sets?: unknown }>;
      }>;
    };

    if (!parsed.name || !Array.isArray(parsed.sessions) || parsed.sessions.length === 0) {
      return null;
    }

    const maxSessions = req.weeks * req.sessionsPerWeek + 2;
    const sessions: ProgramSession[] = [];

    for (const [idx, session] of parsed.sessions.slice(0, maxSessions).entries()) {
      if (!session.name) continue;
      const exercises = (session.exercises ?? [])
        .slice(0, 8)
        .map((ex) => {
          const exerciseId = String(ex.exerciseId ?? '');
          if (!isCoachPlanExerciseId(exerciseId, req.equipment)) return null;
          const sets = normalizeSets(ex.sets);
          if (!sets) return null;
          return { exerciseId, sets };
        })
        .filter(Boolean) as ProgramSession['exercises'];

      if (exercises.length < 3) continue;

      sessions.push({
        id: String(session.id ?? `coach-${idx + 1}`).slice(0, 40),
        name: session.name.trim().slice(0, 80),
        weekLabel: session.weekLabel?.trim().slice(0, 40),
        notes: session.notes?.trim().slice(0, 240),
        exercises,
      });
    }

    if (sessions.length < 2) return null;

    return {
      id: `coach-plan-${Date.now()}`,
      name: parsed.name.trim().slice(0, 80),
      description: (parsed.description ?? '').trim().slice(0, 280),
      duration: (parsed.duration ?? `${req.weeks} weeks`).trim().slice(0, 40),
      focus: (parsed.focus ?? GOAL_LABELS[req.goal]).trim().slice(0, 60),
      sessions,
      source: 'llm',
    };
  } catch {
    return null;
  }
}

export function ruleBasedCoachPlan(req: CoachPlanRequest): GeneratedCoachPlan {
  const templateId =
    req.goal === 'mobility' || req.recovery < 40
      ? 'mobility-recovery-4w'
      : req.equipment === 'bodyweight'
        ? 'bodyweight-strength-4w'
        : 'bodyweight-strength-4w';

  const template = getOfflinePlan(templateId) ?? getOfflinePlan('bodyweight-strength-4w')!;
  const targetCount = Math.min(req.weeks * req.sessionsPerWeek, template.sessions.length);

  const sessions: ProgramSession[] = template.sessions.slice(0, targetCount).map((s, idx) => ({
    id: `rules-${idx + 1}`,
    name: s.dayLabel,
    weekLabel: s.dayLabel.split('—')[0]?.trim(),
    notes: 'Rule-based plan — upgrade for adaptive AI programming.',
    exercises: s.exercises,
  }));

  return {
    id: `coach-rules-${Date.now()}`,
    name: `${GOAL_LABELS[req.goal]} (${req.equipment})`,
    description: template.description,
    duration: `${req.weeks} weeks · ${req.sessionsPerWeek}×/week`,
    focus: GOAL_LABELS[req.goal],
    sessions,
    source: 'rules',
  };
}

export async function fetchGeneratedCoachPlan(req: CoachPlanRequest): Promise<GeneratedCoachPlan> {
  const apiUrl = process.env.COACH_LLM_API_URL;
  const apiKey = process.env.COACH_LLM_API_KEY;
  if (!apiUrl || !apiKey) {
    return ruleBasedCoachPlan(req);
  }

  const model = process.env.COACH_LLM_MODEL || 'gpt-4o-mini';
  const body = {
    model,
    messages: [
      { role: 'system', content: 'Reply with valid JSON only.' },
      { role: 'user', content: buildCoachPlanPrompt(req) },
    ],
    max_tokens: 2200,
    temperature: 0.5,
  };

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) return ruleBasedCoachPlan(req);

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return ruleBasedCoachPlan(req);

    const parsed = parseCoachPlanJson(content, req);
    return parsed ?? ruleBasedCoachPlan(req);
  } catch {
    return ruleBasedCoachPlan(req);
  }
}
