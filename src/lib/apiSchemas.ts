/**
 * Zod schemas for API request validation.
 * Consumers: app/api POST/GET handlers | See: docs/API.md
 */
import { z } from 'zod';

const utmField = z.string().max(200).optional();

export const leadsBodySchema = z.object({
  /*
   * `.215` — optional, because a feedback note must not require an account.
   *
   * The whole product thesis is "no account required to log", and requiring an
   * email address to report that something is broken is the same barrier in a
   * smaller place. The route still *requires* it for every non-feedback source,
   * so the waitlist is unchanged: a signup with no address is meaningless, and
   * a bug report with no address is merely unanswerable.
   */
  email: z.string().email().max(320).optional(),
  name: z.string().max(120).optional(),
  goals: z.string().max(2000).optional(),
  /** Preferred attribution channel (e.g. landing-updates, launch-waitlist). */
  source: z.string().max(80).optional(),
  /** Legacy client field — API maps into package_interest when source missing. */
  package_interest: z.string().max(80).optional(),
  referrer: z.string().max(500).optional(),
  utm: z
    .object({
      utm_source: utmField,
      utm_medium: utmField,
      utm_campaign: utmField,
      utm_content: utmField,
      utm_term: utmField,
      landing_path: utmField,
    })
    .optional(),
});

export const privateAccessBodySchema = z.object({
  password: z.string().min(1).max(256),
});

export const schoolPinBodySchema = z.object({
  pin: z.string().min(4).max(32),
});

export const youthConsentVerifySchema = z.object({
  parentEmail: z.string().email().max(320),
  childAge: z.number().int().min(1).max(17),
  code: z.string().min(6).max(12),
});

export const coachDailyContextSchema = z.object({
  readiness: z.number().min(0).max(100),
  strain: z.number().min(0).max(100),
  recovery: z.number().min(0).max(100),
  missionScore: z.number().default(0),
  streak: z.number().default(0),
  focusGroup: z.string().max(40).default('push'),
  pillars: z
    .object({
      moveFlows: z.number().default(0),
      mindSessions: z.number().default(0),
      proteinDays: z.number().default(0),
      trainDays: z.number().default(0),
    })
    .default({ moveFlows: 0, mindSessions: 0, proteinDays: 0, trainDays: 0 }),
  fallback: z.object({
    messageKey: z.string().max(120),
    actionLabelKey: z.string().max(120),
    actionPath: z.string().max(120),
  }),
  /** Metering identity only — counts, never content; see 20260731_llm_usage.sql. */
  deviceId: z.string().min(1).max(64).optional(),
});

export const coachPlanVoiceSchema = z.object({
  plan: z.object({
    weekStart: z.string().max(20),
    sessions: z.array(
      z.object({
        name: z.string().max(120),
        kind: z.string().max(40),
        whyKeys: z.array(z.string().max(80)).default([]),
      })
    ),
  }),
  readiness: z.number().min(0).max(100).optional(),
  strain: z.number().min(0).max(100).optional(),
  recovery: z.number().min(0).max(100).optional(),
  /** Metering identity only — counts, never content; see 20260731_llm_usage.sql. */
  deviceId: z.string().min(1).max(64).optional(),
});

/** Premium coach chat — compact context only (never raw workout logs). */
export const coachChatSchema = z.object({
  message: z.string().min(1).max(1000),
  turns: z
    .array(
      z.object({
        role: z.enum(['user', 'coach']),
        content: z.string().max(1000),
      })
    )
    .max(12)
    .default([]),
  context: z.object({
    readiness: z.number().min(0).max(100),
    strain: z.number().min(0).max(100),
    recovery: z.number().min(0).max(100),
    trainDays14: z.number().min(0).max(14),
    todaySession: z
      .object({
        name: z.string().max(120),
        kind: z.string().max(40),
        estMinutes: z.number().min(0).max(180),
        exercises: z
          .array(
            z.object({
              id: z.string().max(80),
              name: z.string().max(120),
            })
          )
          .max(12),
      })
      .optional(),
    exerciseId: z.string().max(80).optional(),
  }),
  stream: z.boolean().optional(),
  /** Metering identity only — counts, never content; see 20260731_llm_usage.sql. */
  deviceId: z.string().min(1).max(64).optional(),
});

export const fuelSearchQuerySchema = z.object({
  q: z.string().min(2).max(120),
});

export const fuelBarcodeQuerySchema = z.object({
  code: z.string().min(8).max(32),
});

/** Super Bundle Checkout Session plan IDs (matches bundleConfig BundlePlanId). */
export const checkoutBodySchema = z.object({
  planId: z.enum(['monthly', '12mo', 'lifetime']),
});

export const cryptoCheckoutConfirmSchema = z.object({
  intentId: z.string().uuid(),
  signature: z.string().min(32).max(128),
});

/** Referral redeem — MW- + 5 chars (no I/O/0/1 ambiguity). */
export const referralRedeemBodySchema = z.object({
  code: z
    .string()
    .regex(/^MW-[A-HJ-NP-Z2-9]{5}$/, 'Invalid referral code format'),
});

/** Beta invite land/redeem — MW-B- + 5 chars. */
export const inviteCodeBodySchema = z.object({
  code: z
    .string()
    .regex(/^MW-B-[A-HJ-NP-Z2-9]{5}$/, 'Invalid invite code format'),
});

/** Admin issue invite. */
export const inviteCreateBodySchema = z.object({
  label: z.string().trim().min(1).max(120),
  email: z
    .string()
    .trim()
    .max(320)
    .optional()
    .refine((v) => !v || v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email'),
  notes: z.string().trim().max(500).optional(),
});

export const schoolClassCreateSchema = z.object({
  code: z.string().min(4).max(16),
  name: z.string().max(120).optional(),
  teacherPin: z.string().min(4).max(32).optional(),
});

export const youthConsentNotifySchema = z.object({
  parentEmail: z.string().email().max(320),
  childAge: z.number().int().min(1).max(17),
});

export const journeyNudgeBodySchema = z.object({
  label: z.string().max(120).optional(),
  description: z.string().max(500).optional(),
  href: z.string().max(200).optional(),
  stepLabel: z.string().max(80).optional(),
});

export const wearableDisconnectSchema = z.object({
  provider: z.string().min(2).max(40),
  deleteSamples: z.boolean().optional().default(true),
});

export const wearableSyncSchema = z.object({
  provider: z.string().min(2).max(40),
  sinceIso: z.string().max(40).optional(),
});

export const wearableHubIngestSchema = z.object({
  source: z.enum(['healthkit', 'health_connect', 'google_fit']),
  samples: z
    .array(
      z.object({
        kind: z.enum(['workout', 'activity', 'sleep', 'hr', 'hrv', 'steps', 'recovery']),
        startedAt: z.string().min(4).max(40),
        endedAt: z.string().max(40).optional(),
        externalId: z.string().min(1).max(200),
        metrics: z
          .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
          .optional(),
      })
    )
    .max(500),
});

/** Native mobile — generate/seed coach week. */
export const mobileCoachPlanBodySchema = z.object({
  equipment: z.enum(['bodyweight', 'dumbbells', 'full-gym']).optional().default('bodyweight'),
  withAdaptDemo: z.boolean().optional().default(false),
  revision: z.number().int().min(1).max(999).optional(),
});

/** Native mobile — mark session done / bump revision. */
export const mobileCoachAdaptBodySchema = z.object({
  plan: z.object({
    revision: z.number().int().min(0),
    weekStart: z.string().max(20),
    daysPerWeek: z.number().int().min(1).max(7),
    sessions: z.array(z.record(z.string(), z.unknown())).max(14),
    generatedAt: z.string().max(40),
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
  completedAt: z.string().max(40).optional(),
});

/** Full-fidelity set row (mirrors Android SetLogEntity). */
export const mobileSyncSetSchema = z.object({
  id: z.string().min(1).max(80),
  exerciseId: z.string().min(1).max(120),
  exerciseName: z.string().max(200).default(''),
  setIndex: z.number().int().min(0).max(48),
  reps: z.number().int().min(0).max(999),
  weight: z.number().min(0).max(1_000_000),
  completedAt: z.string().max(40),
  sessionId: z.string().max(120).nullable().optional(),
  weightUnit: z.string().max(8).default('kg'),
  rpe: z.number().int().min(6).max(10).nullable().optional(),
  setKind: z.string().max(20).default('normal'),
  // Dropped by omission before `.184` — Android sent it, zod stripped it, and every
  // set note died here. 500 chars bounds the jsonb, not the athlete's thought.
  note: z.string().max(500).optional(),
});

export const mobileSyncWorkoutSchema = z.object({
  clientId: z.string().uuid(),
  workoutName: z.string().min(1).max(120),
  completedAt: z.string().max(40),
  durationSeconds: z.number().int().min(1).max(86_400),
  setCount: z.number().int().min(0).max(200),
  totalVolume: z.number().min(0).max(1_000_000),
  sessionId: z.string().max(120).nullable().optional(),
  weightUnit: z.string().max(8).default('kg'),
  revision: z.number().int().min(1).max(1_000_000).default(1),
  updatedAt: z.string().max(40).optional(),
  deletedAt: z.string().max(40).nullable().optional(),
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
  createdAt: z.string().max(40).optional(),
  sourceWorkoutId: z.string().max(80).nullable().optional(),
  exercises: z.array(mobileSyncRoutineExerciseSchema).max(48).default([]),
  revision: z.number().int().min(1).max(1_000_000).default(1),
  updatedAt: z.string().max(40).optional(),
  deletedAt: z.string().max(40).nullable().optional(),
});

export const mobileSyncRoutinePushBodySchema = z.object({
  routines: z.array(mobileSyncRoutineSchema).min(1).max(50),
});

export const mobileSyncCustomSchema = z.object({
  clientId: z.string().min(1).max(120),
  name: z.string().min(1).max(120),
  createdAt: z.string().max(40).optional(),
  equipment: z.string().max(40).default('any'),
  muscleGroups: z.string().max(200).default(''),
  revision: z.number().int().min(1).max(1_000_000).default(1),
  updatedAt: z.string().max(40).optional(),
  deletedAt: z.string().max(40).nullable().optional(),
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
  updatedAt: z.string().max(40).optional(),
});

export const mobileSyncPrefsPushBodySchema = z.object({
  prefs: mobileSyncPrefsSchema,
});

/**
 * Push subscribe — works with or without a session.
 *
 * `deviceId` is required even when signed in: it is what links a subscription made
 * anonymously to the account created later, so the athlete is not asked to opt in
 * a second time.
 */
export const pushSubscribeBodySchema = z.object({
  endpoint: z.string().url().max(1000),
  p256dh: z.string().min(1).max(500),
  auth: z.string().min(1).max(500),
  deviceId: z.string().min(1).max(64),
  /** Cadence only — never workout history. See supabase/migrations/20260728_anonymous_push.sql. */
  lastSessionAt: z.string().max(40).optional(),
  daysPerWeek: z.number().int().min(1).max(7).optional(),
  timeZone: z.string().max(64).optional(),
  /** Chosen evening hour for the day-review push (`.194`). Never behavior data. */
  // `.nullable()` as well as `.optional()`: null is "turn the evening review
  // off" and must reach the column, while absent is "this sync has nothing to
  // say about it". See the note on `SubscriptionRowInput.dayReviewHour`.
  dayReviewHour: z.number().int().min(18).max(22).nullable().optional(),
  /**
   * One bit: did the last session run above this athlete's own band. Computed on the
   * device from history the server never sees — the zone and the sets stay local.
   */
  lastSessionHigh: z.boolean().optional(),
});

export const pushUnsubscribeBodySchema = z.object({
  endpoint: z.string().url().max(1000),
});

/** Account deletion (GDPR Art. 17) — the literal is the second confirmation. */
export const accountDeleteBodySchema = z.object({
  confirm: z.literal('DELETE'),
  /** mw_device_id, so anonymous push/AI-metering rows for this device go too. */
  deviceId: z.string().max(64).optional(),
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
