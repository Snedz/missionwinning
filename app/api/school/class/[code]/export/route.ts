import { NextRequest, NextResponse } from 'next/server';
import {
  canAccessTeacherDashboard,
  fetchClassPftLeaderboard,
  fetchClassStats,
  formatClassStandingsCsv,
} from '@/lib/schoolClassServer';
import { formatClassReportHtml } from '@/lib/schoolClassReportHtml';
import { normalizeClassCode } from '@/lib/schoolClass';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';

/** Authenticated class export — CSV (default) or printable HTML (Print to PDF). */
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

  const format = request.nextUrl.searchParams.get('format')?.toLowerCase() ?? 'csv';
  const [stats, entries] = await Promise.all([
    fetchClassStats(code),
    fetchClassPftLeaderboard(code),
  ]);
  const className = stats?.className ?? 'PE Class';

  if (format === 'html') {
    const html = formatClassReportHtml(
      className,
      code,
      {
        uniqueAthletes: stats?.uniqueAthletes ?? 0,
        totalTests: stats?.totalTests ?? 0,
        tierCounts: stats?.tierCounts ?? {},
      },
      entries
    );
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="mission-winning-report-${code}.html"`,
      },
    });
  }

  const csv = formatClassStandingsCsv(className, code, entries);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="mission-winning-standings-${code}.csv"`,
    },
  });
}
