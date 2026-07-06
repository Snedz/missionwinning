/**
 * Daily coach one-liner — LLM or rules fallback.
 * Auth: gate + app access | Rate: 12/min/IP
 * See: app/api/INDEX.md, src/lib/coachDailyServer.ts
 */
import { NextRequest, NextResponse } from 'next/server';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { hasAppAccess } from '@/lib/requestAccess';
import {
  coachFromFallback,
  fetchDailyCoachInsight,
} from '@/lib/coachDailyServer';
import { coachDailyContextSchema, parseJsonBody } from '@/lib/apiSchemas';

/** Daily AI coach insight — uses LLM when COACH_LLM_* env set; else rule keys from client. */
export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  const limited = await rateLimitAsync(`coach-daily:${ip}`, 12, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  if (!(await hasAppAccess(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(coachDailyContextSchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const body = parsed.data;

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
