/**
 * List teacher's cloud-synced classes.
 * Auth: session | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { fetchTeacherClasses } from '@/lib/schoolClassServer';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';

/** List PE classes created by the signed-in teacher. */
export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  }

  const classes = await fetchTeacherClasses(user.id);
  return NextResponse.json({ classes, source: classes.length ? 'cloud' : 'empty' });
}
