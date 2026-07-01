import { NextRequest, NextResponse } from 'next/server';
import { fetchClassPftLeaderboard } from '@/lib/schoolClassServer';
import { normalizeClassCode } from '@/lib/schoolClass';

/** Class PFT leaderboard — best tier per signed-in athlete (no emails exposed). */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { code: raw } = await context.params;
  const code = normalizeClassCode(raw);
  if (!code) {
    return NextResponse.json({ error: 'Invalid class code' }, { status: 400 });
  }

  const entries = await fetchClassPftLeaderboard(code);
  return NextResponse.json({ code, entries, source: entries.length ? 'cloud' : 'empty' });
}
