import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { COPPA_AGE_THRESHOLD } from '@/lib/youthConsent';
import {
  consentConfirmUrl,
  createConsentVerifyToken,
  generateConsentCode,
} from '@/lib/youthConsentToken';

/** Email parent/guardian a verification code + confirm link. */
export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'Email not configured' }, { status: 503 });
  }

  let body: { parentEmail?: string; childAge?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parentEmail = body.parentEmail?.trim() ?? '';
  const childAge = Number(body.childAge);
  if (!parentEmail.includes('@') || !Number.isFinite(childAge) || childAge >= COPPA_AGE_THRESHOLD) {
    return NextResponse.json({ error: 'Invalid consent payload' }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.missionwinning.com';
  const code = generateConsentCode(parentEmail, childAge);
  const token = createConsentVerifyToken(parentEmail, childAge);
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
      '',
      'Mission Winning provides educational fitness tools only — not medical advice.',
      '',
      `Privacy: ${appUrl}/privacy`,
      '',
      'If you did not approve this, contact support@missionwinning.com.',
    ].join('\n'),
  });

  if (error) {
    console.error('youth consent notify', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, codeSent: true });
}
