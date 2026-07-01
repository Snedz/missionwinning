import { supabase, getUser } from '@/lib/supabase';
import type { FitnessTestSession } from '@/lib/presidentialFitnessTest';
import { getJoinedClassCode } from '@/lib/schoolClass';

let pushTimer: ReturnType<typeof setTimeout> | null = null;

export function schedulePftPush(session: FitnessTestSession, delayMs = 1500): void {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushPftResult(session);
  }, delayMs);
}

export async function pushPftResult(session: FitnessTestSession): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  const user = await getUser();
  if (!user) return;

  const classCode = getJoinedClassCode();

  const { error } = await supabase.from('fitness_test_results').insert({
    user_id: user.id,
    class_code: classCode,
    session,
    overall_tier: session.overallTier,
    age: session.age,
    completed_at: session.completedAt,
  });

  if (error) console.warn('pft sync', error.message);
}
