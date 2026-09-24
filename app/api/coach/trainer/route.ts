/**
 * Free AI personal trainer — Gemini Flash, else COACH_LLM, else the set line.
 * No premium check. No checkout URL. Rate: 12/min/IP. Body: 8KB.
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { coachTrainerSchema, parseJsonBody } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';
import { replyTrainer } from '@/lib/coach/trainerReply';

export const POST = withApiLogging('coach/trainer', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 8 * 1024);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`coach-trainer:${ip}`, 12, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const raw = await request.json().catch(() => null);
  const parsed = parseJsonBody(coachTrainerSchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const reply = await replyTrainer(parsed.data);
  return NextResponse.json({
    text: reply.text,
    source: reply.source,
    ...(reply.model ? { model: reply.model } : {}),
  });
});
