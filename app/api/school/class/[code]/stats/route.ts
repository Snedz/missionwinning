/**
 * Class aggregate stats — teacher PIN or creator only.
 * Auth: teacher | Header: x-teacher-pin
 * See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { fetchClassStats } from '@/lib/schoolClassServer';
import { resolveTeacherClassAccess } from '@/lib/schoolClassAccess';

/** Aggregate class fitness test stats — teacher or creator only. */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code: raw } = await context.params;
  const access = await resolveTeacherClassAccess(request, raw);
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  const stats = await fetchClassStats(access.code);
  if (!stats) {
    return NextResponse.json({
      code: access.code,
      className: null,
      totalTests: 0,
      uniqueAthletes: 0,
      tierCounts: {},
      source: 'local_only',
      message: 'Cloud stats unavailable — complete tests while signed in to sync.',
    });
  }

  return NextResponse.json({ ...stats, source: 'cloud' });
}
