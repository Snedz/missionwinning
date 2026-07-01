import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { getCoachPremiumAccess } from '@/lib/coachPremiumAuth';
import {
  fetchGeneratedCoachPlan,
  type CoachPlanGoal,
  type CoachPlanRequest,
} from '@/lib/coachPlanServer';
import type { CoachPlanEquipment } from '@/lib/coachPlanExercises';

const GOALS: CoachPlanGoal[] = ['general-strength', 'muscle', 'fat-loss', 'mobility', 'endurance'];
const EQUIPMENT: CoachPlanEquipment[] = ['bodyweight', 'dumbbells', 'gym'];

/** Premium Train Coach — adaptive multi-session plan generator. */
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const limited = rateLimit(`coach-plan:${ip}`, 6, 60 * 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many plan requests — try again later' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 3600) } }
    );
  }

  const { premium } = await getCoachPremiumAccess(request);
  if (!premium) {
    return NextResponse.json(
      { error: 'Super Bundle premium required for AI plan generator' },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => null)) as Partial<CoachPlanRequest> | null;
  if (!body || typeof body.readiness !== 'number') {
    return NextResponse.json({ error: 'Invalid plan request' }, { status: 400 });
  }

  const goal = GOALS.includes(body.goal as CoachPlanGoal)
    ? (body.goal as CoachPlanGoal)
    : 'general-strength';
  const equipment = EQUIPMENT.includes(body.equipment as CoachPlanEquipment)
    ? (body.equipment as CoachPlanEquipment)
    : 'bodyweight';
  const sessionsPerWeek = ([2, 3, 4] as const).includes(body.sessionsPerWeek as 2 | 3 | 4)
    ? (body.sessionsPerWeek as 2 | 3 | 4)
    : 3;
  const weeks = ([2, 3, 4] as const).includes(body.weeks as 2 | 3 | 4)
    ? (body.weeks as 2 | 3 | 4)
    : 4;

  const req: CoachPlanRequest = {
    goal,
    equipment,
    sessionsPerWeek,
    weeks,
    readiness: Math.min(100, Math.max(0, body.readiness)),
    strain: Math.min(100, Math.max(0, Number(body.strain) || 50)),
    recovery: Math.min(100, Math.max(0, Number(body.recovery) || 50)),
    primaryGoalLabel: typeof body.primaryGoalLabel === 'string' ? body.primaryGoalLabel : undefined,
  };

  try {
    const plan = await fetchGeneratedCoachPlan(req);
    return NextResponse.json({ plan });
  } catch (e) {
    console.error('coach generate-plan error:', e);
    return NextResponse.json({ error: 'Plan generation failed' }, { status: 500 });
  }
}
