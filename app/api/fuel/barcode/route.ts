import { NextRequest, NextResponse } from 'next/server';
import { fetchOpenFoodFactsBarcode } from '@/lib/openFoodFacts';

/** Barcode lookup via Open Food Facts (free tier). */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')?.trim() ?? '';
  const digits = code.replace(/\D/g, '');
  if (digits.length < 8) {
    return NextResponse.json({ item: null, error: 'invalid_barcode' }, { status: 400 });
  }

  try {
    const item = await fetchOpenFoodFactsBarcode(digits);
    if (!item) {
      return NextResponse.json({ item: null, error: 'not_found' });
    }
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ item: null, error: 'lookup_failed' }, { status: 502 });
  }
}
