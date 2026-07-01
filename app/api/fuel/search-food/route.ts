import { NextRequest, NextResponse } from 'next/server';
import type { FoodSearchItem } from '@/lib/foodSearch';

type OffProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  nutriments?: {
    proteins_100g?: number;
    'proteins_serving'?: number;
    energy_kcal_100g?: number;
    'energy-kcal_serving'?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    serving_size?: string;
  };
};

function mapProduct(p: OffProduct): FoodSearchItem | null {
  const name = (p.product_name || '').trim();
  if (!name) return null;
  const n = p.nutriments ?? {};
  const protein = Math.round(n['proteins_serving'] ?? n.proteins_100g ?? 0);
  const calories = Math.round(n['energy-kcal_serving'] ?? n.energy_kcal_100g ?? 0);
  const carbs = Math.round(n.carbohydrates_100g ?? 0);
  const fat = Math.round(n.fat_100g ?? 0);
  if (protein <= 0 && calories <= 0) return null;
  return {
    id: p.code || name,
    name,
    brand: p.brands?.split(',')[0]?.trim(),
    protein,
    calories,
    carbs,
    fat,
    servingLabel: n.serving_size || '100g',
  };
}

/** Free-tier food search via Open Food Facts (global database). */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) {
    return NextResponse.json({ items: [] as FoodSearchItem[] });
  }

  const url =
    `https://world.openfoodfacts.org/cgi/search.pl?` +
    `search_terms=${encodeURIComponent(q)}` +
    `&json=1&page_size=10` +
    `&fields=code,product_name,brands,nutriments`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MissionWinning/1.0 (nutrition search)' },
      signal: AbortSignal.timeout(8_000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ items: [], error: 'search_unavailable' }, { status: 502 });
    }
    const data = (await res.json()) as { products?: OffProduct[] };
    const items = (data.products ?? [])
      .map(mapProduct)
      .filter((x): x is FoodSearchItem => x !== null)
      .slice(0, 8);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [], error: 'search_timeout' }, { status: 504 });
  }
}
