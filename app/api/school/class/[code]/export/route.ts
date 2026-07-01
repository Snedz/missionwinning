import { NextRequest, NextResponse } from 'next/server';
import {
  canAccessTeacherDashboard,
  fetchClassPftLeaderboard,
  fetchClassStats,
  formatClassStandingsCsv,
} from '@/lib/schoolClassServer';
import { normalizeClassCode } from '@/lib/schoolClass';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';

/** Authenticated CSV export of class standings (creator or PIN). */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code: raw } = await context.params;
  const code = normalizeClassCode(raw);
  if (!code) {
    return NextResponse.json({ error: 'Invalid class code' }, { status: 400 });
  }

  const user = await getUserFromRequest(request);
  const pin = request.nextUrl.searchParams.get('pin');
  const access = await canAccessTeacherDashboard(code, user?.id ?? null, pin);
  if (!access.unlocked) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [stats, entries] = await Promise.all([
    fetchClassStats(code),
    fetchClassPftLeaderboard(code),
  ]);
  const className = stats?.className ?? 'PE Class';
  const csv = formatClassStandingsCsv(className, code, entries);

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="mission-winning-standings-${code}.csv"`,
    },
  });
}
