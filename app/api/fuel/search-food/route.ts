/**
 * Open Food Facts search proxy.
 * Auth: gate | Rate: 30/min/IP | Schema: fuelSearchQuerySchema
 * See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { searchOpenFoodFacts } from '@/lib/openFoodFacts';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { parseQuery, fuelSearchQuerySchema } from '@/lib/apiSchemas';

/** Free-tier food search via Open Food Facts (global database). */
export const GET = withApiLogging('fuel/search-food', async(request: NextRequest) => {
  const ip = clientIp(request);
  const limited = await rateLimitAsync(`fuel-search:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const parsed = parseQuery(fuelSearchQuerySchema, request.nextUrl.searchParams);
  if (!parsed.ok) {
    return NextResponse.json({ items: [] });
  }

  const q = parsed.data.q.trim();

  try {
    const items = await searchOpenFoodFacts(q);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [], error: 'search_timeout' }, { status: 504 });
  }
});
