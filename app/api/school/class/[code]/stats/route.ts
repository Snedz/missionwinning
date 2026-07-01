import { NextRequest, NextResponse } from 'next/server';
import { fetchClassStats } from '@/lib/schoolClassServer';
import { normalizeClassCode } from '@/lib/schoolClass';

/** Aggregate class fitness test stats (no individual athlete data exposed). */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code: raw } = await context.params;
  const code = normalizeClassCode(raw);
  if (!code) {
    return NextResponse.json({ error: 'Invalid class code' }, { status: 400 });
  }

  const stats = await fetchClassStats(code);
  if (!stats) {
    return NextResponse.json({
      code,
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
