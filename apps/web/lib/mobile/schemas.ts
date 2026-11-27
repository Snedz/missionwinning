import { z } from 'zod';

const syncTimestamp = z.string().datetime({ offset: true });

/** Native mobile — generate/seed coach week. */
export const mobileCoachPlanBodySchema = z.object({
  equipment: z.enum(['bodyweight', 'dumbbells', 'full-gym']).optional().default('bodyweight'),
  withAdaptDemo: z.boolean().optional().default(false),
  revision: z.number().int().min(1).max(999).optional(),
});

/** Native mobile — mark session done / bump revision. */
export const mobileCoachAdaptBodySchema = z.object({
  plan: z.object({
    revision: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER - 1),
    weekStart: z.iso.date(),
    daysPerWeek: z.number().int().min(1).max(7),
    sessions: z.array(z.object({
      id: z.string().min(1).max(80),
      dayOffset: z.number().int().min(0).max(6),
      kind: z.enum(['strength', 'conditioning', 'recovery']),
      name: z.string().max(120),
      focusGroups: z.array(z.string().max(80)).max(32).default([]),
      exercises: z.array(z.object({
        exerciseId: z.string().min(1).max(120),
        sets: z.number().int().min(0).max(200),
        reps: z.number().int().min(0).max(999),
        weight: z.number().min(0).max(1_000_000).default(0),
        whyKey: z.string().max(120).default(''),
      }).passthrough()).max(48).default([]),
      estMinutes: z.number().int().min(0).max(1440),
      status: z.enum(['planned', 'done', 'missed', 'swapped']),
    }).passthrough()).max(14),
    generatedAt: syncTimestamp,
    contextHash: z.string().max(200),
    equipmentProfile: z.enum(['bodyweight', 'dumbbells', 'full-gym']),
  }),
  sessionId: z.string().min(1).max(80),
});

/** Native mobile — log completed workout. */
export const mobileWorkoutLogBodySchema = z.object({
  workoutName: z.string().min(1).max(120),
  durationSeconds: z.number().int().min(1).max(86_400),
  setCount: z.number().int().min(0).max(200),
  totalVolume: z.number().min(0).max(1_000_000),
  sessionId: z.string().max(80).optional(),
  completedAt: syncTimestamp.optional(),
});

/** Full-fidelity set row (mirrors Android SetLogEntity). */
export const mobileSyncSetSchema = z.object({
  id: z.string().min(1).max(80),
  exerciseId: z.string().min(1).max(120),
  exerciseName: z.string().max(200).default(''),
  setIndex: z.number().int().min(0).max(48),
  reps: z.number().int().min(0).max(999),
  weight: z.number().min(0).max(1_000_000),
  completedAt: syncTimestamp,
  sessionId: z.string().max(120).nullable().optional(),
  weightUnit: z.string().max(8).default('kg'),
  rpe: z.number().int().min(6).max(10).nullable().optional(),
  /** Optional 0–5 RIR — independent of RPE 6–10; never required (`.725`). */
  rir: z.number().int().min(0).max(5).nullable().optional(),
  setKind: z.string().max(20).default('normal'),
  // Optional ecc-pause-con (`3-1-1`). Invalid values are dropped at normalize,
  // not here — a bad tempo must not fail the whole set sync (`.734`).
  tempo: z.string().max(11).optional(),
  // Dropped by omission before `.184` — Android sent it, zod stripped it, and every
  // set note died here. 500 chars bounds the jsonb, not the athlete's thought.
  note: z.string().max(500).optional(),
});

export const mobileSyncWorkoutSchema = z.object({
  clientId: z.string().uuid(),
  workoutName: z.string().min(1).max(120),
  completedAt: syncTimestamp,
  durationSeconds: z.number().int().min(1).max(86_400),
  setCount: z.number().int().min(0).max(200),
  totalVolume: z.number().min(0).max(1_000_000),
  sessionId: z.string().max(120).nullable().optional(),
  weightUnit: z.string().max(8).default('kg'),
  revision: z.number().int().min(1).max(1_000_000).default(1),
  updatedAt: syncTimestamp.optional(),
  deletedAt: syncTimestamp.nullable().optional(),
  sets: z.array(mobileSyncSetSchema).max(200).default([]),
});

export const mobileSyncPushBodySchema = z.object({
  workouts: z.array(mobileSyncWorkoutSchema).min(1).max(50),
});

export const mobileSyncRoutineExerciseSchema = z.object({
  exerciseId: z.string().min(1).max(120),
  exerciseName: z.string().max(200).default(''),
  sets: z.number().int().min(1).max(12),
  targetReps: z.number().int().min(1).max(99),
  lastWeight: z.number().min(0).max(1_000_000).default(0),
});

export const mobileSyncRoutineSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1).max(120),
  createdAt: syncTimestamp.optional(),
  sourceWorkoutId: z.string().max(80).nullable().optional(),
  exercises: z.array(mobileSyncRoutineExerciseSchema).max(48).default([]),
  revision: z.number().int().min(1).max(1_000_000).default(1),
  updatedAt: syncTimestamp.optional(),
  deletedAt: syncTimestamp.nullable().optional(),
});

export const mobileSyncRoutinePushBodySchema = z.object({
  routines: z.array(mobileSyncRoutineSchema).min(1).max(50),
});

export const mobileSyncCustomSchema = z.object({
  clientId: z.string().min(1).max(120),
  name: z.string().min(1).max(120),
  createdAt: syncTimestamp.optional(),
  equipment: z.string().max(40).default('any'),
  muscleGroups: z.string().max(200).default(''),
  revision: z.number().int().min(1).max(1_000_000).default(1),
  updatedAt: syncTimestamp.optional(),
  deletedAt: syncTimestamp.nullable().optional(),
});

export const mobileSyncCustomPushBodySchema = z.object({
  exercises: z.array(mobileSyncCustomSchema).min(1).max(50),
});

export const mobileSyncPrefsSchema = z.object({
  weightUnit: z.enum(['kg', 'lb']).default('kg'),
  defaultRestSeconds: z.number().int().min(15).max(600).default(60),
  equipment: z.enum(['bodyweight', 'dumbbells', 'full-gym']).default('bodyweight'),
  barWeightKg: z.number().min(0).max(100).default(20),
  barWeightLb: z.number().min(0).max(200).default(45),
  revision: z.number().int().min(1).max(1_000_000).default(1),
  updatedAt: syncTimestamp.optional(),
});

export const mobileSyncPrefsPushBodySchema = z.object({
  prefs: mobileSyncPrefsSchema,
});

export function parseJsonBody<T>(schema: z.ZodType<T>, body: unknown):
  | { ok: true; data: T }
  | { ok: false; error: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? 'Invalid payload' };
  }
  return { ok: true, data: result.data };
}

export function parseQuery<T>(
  schema: z.ZodType<T>,
  params: URLSearchParams
): { ok: true; data: T } | { ok: false; error: string } {
  const raw = Object.fromEntries(params.entries());
  const result = schema.safeParse(raw);
  if (!result.success) {
    return { ok: false, error: result.error.issues[0]?.message ?? 'Invalid query' };
  }
  return { ok: true, data: result.data };
}
