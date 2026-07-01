import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import {
  coachFromFallback,
  fetchDailyCoachInsight,
  type DailyCoachContext,
} from '@/lib/coachDailyServer';

/** Daily AI coach insight — uses LLM when COACH_LLM_* env set; else rule keys from client. */
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const limited = rateLimit(`coach-daily:${ip}`, 12, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  const body = (await request.json().catch(() => null)) as DailyCoachContext | null;
  if (
    !body ||
    typeof body.readiness !== 'number' ||
    typeof body.strain !== 'number' ||
    typeof body.recovery !== 'number' ||
    !body.fallback?.messageKey ||
    !body.fallback?.actionPath
  ) {
    return NextResponse.json({ error: 'Invalid context' }, { status: 400 });
  }

  const result = await fetchDailyCoachInsight(body);

  if (result.source === 'rules') {
    const fb = coachFromFallback(body);
    return NextResponse.json({
      messageKey: fb.message,
      actionLabelKey: fb.actionLabel,
      actionPath: fb.actionPath,
      source: 'rules' as const,
    });
  }

  return NextResponse.json({
    message: result.message,
    actionLabel: result.actionLabel,
    actionPath: result.actionPath,
    source: 'llm' as const,
  });
}
