import { NextResponse, type NextRequest } from 'next/server';
import { clientIp, rejectOversizedBody, withApiLogging } from '../../../../lib/mobile/http';
import { rateLimitAsync } from '../../../../lib/mobile/rateLimit';
import { replyTrainer } from '../../../../lib/trainerReply';
import { coachTrainerSchema } from '../../../../lib/trainerSchema';
import { parseJsonBody } from '../../../../lib/mobile/schemas';

export const POST = withApiLogging('coach/trainer', async (request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 8 * 1024);
  if (oversized) return oversized;

  const limited = await rateLimitAsync(`coach-trainer:${clientIp(request)}`, 12, 60_000);
  if (!limited.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const parsed = parseJsonBody(coachTrainerSchema, await request.json().catch(() => null));
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  return NextResponse.json(await replyTrainer(parsed.data));
});
