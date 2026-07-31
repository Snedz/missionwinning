/**
 * Send parent consent notification email.
 * Auth: optional session | Rate: 3/min/IP | Schema: youthConsentNotifySchema
 * See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { Resend } from 'resend';
import { rateLimitAsync } from '@/lib/rateLimit';
import { COPPA_AGE_THRESHOLD } from '@/lib/youthConsent';
import {
  consentConfirmUrl,
  createConsentVerifyToken,
  generateConsentCode,
} from '@/lib/youthConsentToken';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { clientIp } from '@/lib/clientIp';
import { parseJsonBody, youthConsentNotifySchema } from '@/lib/apiSchemas';
import { rejectOversizedBody } from '@/lib/requestBodyLimit';

/** Email parent/guardian a verification code + confirm link. */
export const POST = withApiLogging('youth/consent-notify', async(request: NextRequest) => {
  const oversized = rejectOversizedBody(request, 4 * 1024);
  if (oversized) return oversized;

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`youth-consent-notify:${ip}`, 3, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many consent requests. Try again shortly.' },
      {
        status: 429,
        headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) },
      }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'Email not configured' }, { status: 503 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseJsonBody(youthConsentNotifySchema, raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const parentEmail = parsed.data.parentEmail.trim();
  const childAge = parsed.data.childAge;
  if (childAge >= COPPA_AGE_THRESHOLD) {
    return NextResponse.json({ error: 'Invalid consent payload' }, { status: 400 });
  }

  const user = await getUserFromRequest(request);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.missionwinning.com';
  const code = generateConsentCode(parentEmail, childAge);
  const token = createConsentVerifyToken(parentEmail, childAge, undefined, user?.id);
  const confirmLink = consentConfirmUrl(token, appUrl);

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM || 'Mission Winning <onboarding@resend.dev>';

  const { error } = await resend.emails.send({
    from,
    to: parentEmail,
    subject: 'Mission Winning — verify youth fitness consent',
    text: [
      'Mission Winning — parent/guardian verification',
      '',
      `A child (age ${childAge}) requested to use the Presidential Fitness Test tools.`,
      '',
      `Verification code (tell your athlete): ${code}`,
      '',
      `Or confirm on this device: ${confirmLink}`,
      user
        ? ''
        : [
            '',
            'Tip: have your athlete sign in before requesting consent so approval syncs across devices.',
          ].join('\n'),
      '',
      'Mission Winning provides educational fitness tools only — not medical advice.',
      '',
      `Privacy: ${appUrl}/privacy`,
      '',
      'If you did not approve this, contact support@missionwinning.com.',
    ]
      .filter(Boolean)
      .join('\n'),
  });

  if (error) {
    console.error('youth consent notify', error);
    // `.211` — opaque to the client, detailed in the server log.
    console.error('[youth/consent-notify] %s', error.message);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, codeSent: true });
});
