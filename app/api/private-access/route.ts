import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { password } = await request.json().catch(() => ({}));
  const secret = process.env.PRIVATE_ACCESS_SECRET;

  if (!secret) {
    return NextResponse.json({ error: 'Private access not configured. Add PRIVATE_ACCESS_SECRET in Vercel dashboard (Production + Preview) and redeploy.' }, { status: 500 });
  }

  if (password !== secret) {
    return NextResponse.json({ error: 'Incorrect access code' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('mw_private_access', secret, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return response;
}
