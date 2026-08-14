/**
 * Private beta gate password form — sets signed httpOnly cookie.
 * Auth: public | Rate: 8/min/IP | Schema: privateAccessBodySchema
 * See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import {
  attachPrivateAccessCookie,
  matchesPrivateAccessPassword,
  normalizePrivateAccessCode,
} from '@/lib/privateSession';
import { isPrivateModeEnabledFromEnv } from '@/lib/privateModeFlag';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { privateAccessBodySchema, parseJsonBody } from '@/lib/apiSchemas';

export const POST = withApiLogging('private-access', async(request: NextRequest) => {
  const secret = process.env.PRIVATE_ACCESS_SECRET;

  if (!secret) {
    return NextResponse.json(
      {
        error:
          'Private access not configured. Add PRIVATE_ACCESS_SECRET in Vercel dashboard (Production + Preview) and redeploy.',
      },
      { status: 500 }
    );
  }

  const ip = clientIp(request);
  // Upstash when configured — in-memory alone is weak across multi-instance Vercel.
  const limited = await rateLimitAsync(`private-access:${ip}`, 8, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  const raw = await request.json().catch(() => ({}));
  const parsed = parseJsonBody(privateAccessBodySchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const listed = matchesPrivateAccessPassword(
    parsed.data.password,
    secret,
    process.env.PRIVATE_ACCESS_CODES
  );
  /*
   * Preview / local are ungated. The founder code still has to mint the same
   * cookie so `/` can show the homepage instead of I-Day. Production still
   * requires the codes list.
   */
  const previewWalk =
    !isPrivateModeEnabledFromEnv(process.env) &&
    normalizePrivateAccessCode(parsed.data.password).toLowerCase() === 'done';
  if (!listed && !previewWalk) {
    return NextResponse.json({ error: 'Incorrect access code' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  attachPrivateAccessCookie(response.cookies, secret);
  return response;
});
