import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { stableClientId } from '@/lib/sync/workoutCloud';
import { parseWeightUnit } from '@/lib/units';
import type { CoachPlan } from '@/lib/coach/types';
import type { SavedWorkout, WorkoutExerciseTemplate } from '@/types';

const planSchema = z.object({
  revision: z.number().int().nonnegative(),
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  daysPerWeek: z.number().int().min(1).max(7),
  equipmentProfile: z.enum(['bodyweight', 'dumbbells', 'full-gym']),
  generatedAt: z.string(),
  contextHash: z.string(),
  sessions: z.array(z.object({
    id: z.string(), name: z.string(), dayOffset: z.number().int(),
    kind: z.enum(['strength', 'conditioning', 'recovery']),
    status: z.enum(['planned', 'done', 'missed', 'swapped']),
    focusGroups: z.array(z.string()), estMinutes: z.number(),
    exercises: z.array(z.object({
      exerciseId: z.string(), sets: z.number().int().nonnegative(), reps: z.number(),
      weight: z.number(), whyKey: z.string(),
    }).passthrough()),
  }).passthrough()),
}).passthrough();

const templateExerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.array(z.object({ reps: z.number(), weight: z.number() }).passthrough()),
}).passthrough();

const routineExerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().int().min(1).max(12),
  targetReps: z.number().int().min(0).max(999),
  lastWeight: z.number().nonnegative().default(0),
  webTemplate: templateExerciseSchema.optional(),
  webNote: z.string().optional(),
});

type RoutineRow = {
  client_id: string;
  name: string;
  created_at: string;
  exercises: unknown[];
  deleted_at: string | null;
};

function readPlan(raw: unknown, units: unknown): CoachPlan | null {
  if (raw == null) return null;
  const parsed = planSchema.safeParse(raw);
  if (!parsed.success) throw new Error('Coach plan is incompatible.');
  const plan = parsed.data as CoachPlan;
  const weightUnit = parseWeightUnit(plan.weightUnit) ?? (units === 'imperial' ? 'lb' : units === 'metric' ? 'kg' : undefined);
  return { ...plan, ...(weightUnit ? { weightUnit } : {}) };
}

function fromRoutine(row: RoutineRow): SavedWorkout {
  const exercises: WorkoutExerciseTemplate[] = [];
  let note: string | undefined;
  for (const raw of row.exercises) {
    const parsed = routineExerciseSchema.safeParse(raw);
    if (!parsed.success) continue;
    const { exerciseId, sets, targetReps, lastWeight, webTemplate, webNote } = parsed.data;
    note ??= webNote;
    exercises.push(webTemplate?.exerciseId === exerciseId ? webTemplate : {
      exerciseId, sets: Array.from({ length: sets }, () => ({ reps: targetReps, weight: lastWeight })),
    });
  }
  return { id: row.client_id, name: row.name, createdAt: row.created_at, exercises, ...(note ? { note } : {}) };
}

function toRoutineExercises(template: SavedWorkout) {
  return template.exercises.filter((exercise) => exercise.sets.length).map((exercise, index) => ({
    exerciseId: exercise.exerciseId,
    sets: Math.min(exercise.sets.length, 12),
    targetReps: Math.max(1, Math.min(exercise.sets[0].reps, 99)),
    lastWeight: exercise.sets[0].weight,
    webTemplate: exercise,
    ...(index === 0 && template.note ? { webNote: template.note } : {}),
  }));
}

export function createNotebookCloud(client: SupabaseClient, owner: string) {
  async function profile() {
    const { data, error } = await client.from('profiles').select('coach_plan,units,updated_at').eq('id', owner).maybeSingle();
    if (error) throw new Error('Could not read Coach plan.');
    return data;
  }

  async function pullPlan() {
    const row = await profile();
    return readPlan(row?.coach_plan, row?.units);
  }

  async function pushPlan(plan: CoachPlan) {
    const row = await profile();
    const remote = readPlan(row?.coach_plan, row?.units);
    if (remote && remote.revision >= plan.revision) return true;
    const updated_at = 'now';
    if (!row) {
      const { error } = await client.from('profiles').insert({ id: owner, coach_plan: plan, updated_at });
      return !error;
    }
    const write = client.from('profiles').update({ coach_plan: plan, updated_at }).eq('id', owner);
    const { data, error } = await (row.updated_at ? write.eq('updated_at', row.updated_at) : write.is('updated_at', null))
      .select('id').maybeSingle();
    return !error && Boolean(data);
  }

  async function pullTemplates(getLocal: () => SavedWorkout[]) {
    const rows: RoutineRow[] = [];
    let after: string | undefined;
    while (true) {
      const query = client.from('routines').select('client_id,name,created_at,exercises,deleted_at')
        .eq('user_id', owner).order('client_id').limit(200);
      const { data, error } = await (after ? query.gt('client_id', after) : query);
      if (error) throw new Error('Could not read workout templates.');
      rows.push(...data);
      if (data.length < 200) break;
      after = data[data.length - 1].client_id;
    }
    const known = new Set(rows.map((row) => row.client_id));
    const unsynced = new Map<string, SavedWorkout>();
    for (const template of getLocal()) {
      const id = await stableClientId('routine', template.id);
      if (!known.has(id)) unsynced.set(id, template);
    }
    return {
      templates: [...rows.filter((row) => !row.deleted_at).map(fromRoutine), ...unsynced.values()],
      unsynced,
    };
  }

  async function pushTemplate(clientId: string, template: SavedWorkout) {
    // A native edit or tombstone owns an existing row; v2 only uploads new/imported templates.
    const { error } = await client.from('routines').upsert({
      user_id: owner, client_id: clientId, name: template.name,
      created_at: template.createdAt, exercises: toRoutineExercises(template),
    }, { onConflict: 'user_id,client_id', ignoreDuplicates: true });
    return !error;
  }

  return { pullPlan, pushPlan, pullTemplates, pushTemplate };
}
