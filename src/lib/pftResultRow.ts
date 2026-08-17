/**
 * Row shape for a service-role fitness_test_results insert.
 * overall_tier is scored here. class_code is never taken from the client —
 * there is no server membership table for PE class joins.
 */
import {
  scoreFitnessTestSession,
  type EventResultInput,
  type FitnessSex,
  type FitnessTestSession,
} from '@/lib/presidentialFitnessTest';

export type PftResultSubmitInput = {
  age: number;
  sex: FitnessSex;
  results: EventResultInput[];
  mode?: 'full' | 'mini';
  completedAt?: string;
  id?: string;
};

export type PftResultInsertRow = {
  user_id: string;
  class_code: null;
  overall_tier: FitnessTestSession['overallTier'];
  age: number;
  session: FitnessTestSession;
  completed_at: string;
};

export function buildPftResultRow(
  userId: string,
  input: PftResultSubmitInput
): PftResultInsertRow {
  const session = scoreFitnessTestSession({
    age: input.age,
    sex: input.sex,
    results: input.results,
    mode: input.mode,
    completedAt: input.completedAt,
    id: input.id,
  });
  return {
    user_id: userId,
    class_code: null,
    overall_tier: session.overallTier,
    age: session.age,
    session,
    completed_at: session.completedAt,
  };
}
