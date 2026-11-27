import { z } from 'zod';

export const coachTrainerSchema = z
  .object({
    exerciseName: z.string().trim().min(1).max(120),
    setNumber: z.number().int().min(1).max(40),
    setCount: z.number().int().min(1).max(40),
    reps: z.number().min(0).max(200).default(0),
    weight: z.number().min(0).max(2000).default(0),
    unitLabel: z.string().max(12).default('kg'),
    kind: z.enum(['normal', 'warmup', 'failure', 'drop']).optional(),
    rowType: z.enum(['weight', 'bodyweight', 'duration', 'assisted']),
    durationSeconds: z.number().min(0).max(3600).optional(),
    hardCount: z.number().int().min(0).max(200).default(0),
    bodyweightLabel: z.string().max(12).optional(),
    historyLine: z.string().max(160).optional(),
    question: z.string().max(280).optional(),
  })
  .strict();
