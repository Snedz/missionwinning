/**
 * CSV export of class standings — teacher only.
 * Auth: teacher | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import {
  canAccessTeacherDashboard,
  fetchClassPftLeaderboard,
  fetchClassStats,
  formatClassStandingsCsv,
  toPublicLeaderboardEntries,
} from '@/lib/schoolClassServer';
import { formatClassReportHtml } from '@/lib/schoolClassReportHtml';
import { normalizeClassCode } from '@/lib/schoolClass';
import { getUserFromRequest } from '@/lib/supabaseRequestAuth';
import { TEACHER_PIN_HEADER } from '@/lib/schoolClassAccess';

/** Authenticated class export — CSV (default) or printable HTML (Print to PDF). */
export const GET = withApiLogging('school/class/[code]/export', async(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) => {
  const { code: raw } = await context.params;
  const code = normalizeClassCode(raw);
  if (!code) {
    return NextResponse.json({ error: 'Invalid class code' }, { status: 400 });
  }

  const user = await getUserFromRequest(request);
  const pin =
    request.headers.get(TEACHER_PIN_HEADER)?.trim() ||
    request.nextUrl.searchParams.get('pin')?.trim() ||
    '';
  const access = await canAccessTeacherDashboard(code, user?.id ?? null, pin || null);
  if (!access.unlocked) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const format = request.nextUrl.searchParams.get('format')?.toLowerCase() ?? 'csv';
  const [stats, entries] = await Promise.all([
    fetchClassStats(code),
    fetchClassPftLeaderboard(code),
  ]);
  const className = stats?.className ?? 'PE Class';
  const publicEntries = toPublicLeaderboardEntries(entries);

  if (format === 'html') {
    const html = formatClassReportHtml(
      className,
      code,
      {
        uniqueAthletes: stats?.uniqueAthletes ?? 0,
        totalTests: stats?.totalTests ?? 0,
        tierCounts: stats?.tierCounts ?? {},
      },
      publicEntries.map((e) => ({
        rank: e.rank,
        userId: e.athleteId,
        athleteLabel: e.athleteLabel,
        bestTier: e.bestTier,
        score: e.score,
        lastTestAt: e.lastTestAt,
      }))
    );
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="mission-winning-report-${code}.html"`,
      },
    });
  }

  const csv = formatClassStandingsCsv(
    className,
    code,
    publicEntries.map((e) => ({
      rank: e.rank,
      userId: e.athleteId,
      athleteLabel: e.athleteLabel,
      bestTier: e.bestTier,
      score: e.score,
      lastTestAt: e.lastTestAt,
    }))
  );
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="mission-winning-standings-${code}.csv"`,
    },
  });
});
