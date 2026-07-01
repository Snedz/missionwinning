import { NextRequest, NextResponse } from 'next/server';
import { searchOpenFoodFacts } from '@/lib/openFoodFacts';

/** Free-tier food search via Open Food Facts (global database). */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ items: [] });
  }

  try {
    const items = await searchOpenFoodFacts(q);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [], error: 'search_timeout' }, { status: 504 });
  }
}
