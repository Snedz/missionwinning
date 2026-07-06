/**
 * Barcode lookup via Open Food Facts.
 * Auth: gate | Rate: 30/min/IP | Schema: fuelBarcodeQuerySchema
 * See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { fetchOpenFoodFactsBarcode } from '@/lib/openFoodFacts';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { parseQuery, fuelBarcodeQuerySchema } from '@/lib/apiSchemas';

/** Barcode lookup via Open Food Facts (free tier). */
export const GET = withApiLogging('fuel/barcode', async(request: NextRequest) => {
  const ip = clientIp(request);
  const limited = await rateLimitAsync(`fuel-barcode:${ip}`, 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const parsed = parseQuery(fuelBarcodeQuerySchema, request.nextUrl.searchParams);
  if (!parsed.ok) {
    return NextResponse.json({ item: null, error: 'invalid_barcode' }, { status: 400 });
  }

  const digits = parsed.data.code.replace(/\D/g, '');
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
});
