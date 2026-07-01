import type { FoodSearchItem } from '@/lib/foodSearch';

export type OffProduct = {
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

export const OFF_USER_AGENT = 'MissionWinning/1.0 (nutrition; contact: support@missionwinning.com)';

export function mapOffProduct(p: OffProduct): FoodSearchItem | null {
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

export async function searchOpenFoodFacts(query: string): Promise<FoodSearchItem[]> {
  const url =
    `https://world.openfoodfacts.org/cgi/search.pl?` +
    `search_terms=${encodeURIComponent(query)}` +
    `&json=1&page_size=10` +
    `&fields=code,product_name,brands,nutriments`;

  const res = await fetch(url, {
    headers: { 'User-Agent': OFF_USER_AGENT },
    signal: AbortSignal.timeout(8_000),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error('search_failed');
  const data = (await res.json()) as { products?: OffProduct[] };
  return (data.products ?? [])
    .map(mapOffProduct)
    .filter((x): x is FoodSearchItem => x !== null)
    .slice(0, 8);
}

export async function fetchOpenFoodFactsBarcode(barcode: string): Promise<FoodSearchItem | null> {
  const code = barcode.replace(/\D/g, '');
  if (code.length < 8) return null;

  const url = `https://world.openfoodfacts.org/api/v2/product/${code}.json`;
  const res = await fetch(url, {
    headers: { 'User-Agent': OFF_USER_AGENT },
    signal: AbortSignal.timeout(8_000),
    next: { revalidate: 86400 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('barcode_failed');
  const data = (await res.json()) as { product?: OffProduct; status?: number };
  if (data.status === 0 || !data.product) return null;
  return mapOffProduct(data.product);
}
