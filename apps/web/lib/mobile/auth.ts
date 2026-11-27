import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { extractSupabaseAccessToken } from './cookies';
import { isPrivateModeEnabled } from './privateMode';

export function bearerAccessToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization');
  return header?.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() || null : null;
}

export function hasPrivateAccessCookie(request: NextRequest): boolean {
  const secret = process.env.PRIVATE_ACCESS_SECRET;
  const raw = request.cookies.get('mw_private_access')?.value;
  if (!secret || !raw) return false;
  const [payload, signature, extra] = raw.split('.');
  if (!payload || !signature || extra !== undefined) return false;
  const expected = Buffer.from(createHmac('sha256', secret).update(payload).digest('base64url'));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof exp === 'number' && exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function userClient(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anon ? createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  }) : null;
}

export async function hasMobileAppAccess(request: NextRequest): Promise<boolean> {
  if (hasPrivateAccessCookie(request)) return true;
  const token = bearerAccessToken(request) ?? extractSupabaseAccessToken(request.cookies);
  const client = token ? userClient(token) : null;
  if (!token || !client) return false;
  const { data: { user }, error } = await client.auth.getUser(token);
  return Boolean(user && !error);
}

export async function allowMobileCoachBootstrap(request: NextRequest): Promise<boolean> {
  return !isPrivateModeEnabled() || await hasMobileAppAccess(request);
}

export async function requireMobileUser(request: NextRequest): Promise<
  { error: NextResponse } | { supabase: SupabaseClient; user: User }
> {
  const token = bearerAccessToken(request);
  if (!token) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } as const;
  const supabase = userClient(token);
  if (!supabase) {
    const gated = hasPrivateAccessCookie(request);
    return { error: NextResponse.json(
      { error: gated ? 'Unconfigured' : 'Unauthorized' },
      { status: gated ? 503 : 401 },
    ) } as const;
  }
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } as const;
  return { supabase, user } as const;
}
