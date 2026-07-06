/**
 * Class leaderboard — redacted athlete ids, teacher auth.
 * Auth: teacher | See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { fetchClassPftLeaderboard, toPublicLeaderboardEntries } from '@/lib/schoolClassServer';
import { resolveTeacherClassAccess } from '@/lib/schoolClassAccess';

/** Class PFT leaderboard — teacher or creator only; athlete ids redacted. */
export const GET = withApiLogging('school/class/[code]/leaderboard', async(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) => {
  const { code: raw } = await context.params;
  const access = await resolveTeacherClassAccess(request, raw);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const entries = await fetchClassPftLeaderboard(access.code);
  return NextResponse.json({
    code: access.code,
    entries: toPublicLeaderboardEntries(entries),
    source: entries.length ? 'cloud' : 'empty',
  });
});
