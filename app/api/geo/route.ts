/**
 * Geo hint for first-visit language/units defaults.
 * Auth: public | Rate: 60/min/IP | Headers: x-vercel-ip-country / cf-ipcountry
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { clientIp } from '@/lib/clientIp';
import { rateLimitAsync } from '@/lib/rateLimit';
import { resolveRegionDefaults } from '@/lib/regionDefaults';

export const GET = withApiLogging('geo', async (request: NextRequest) => {
  const ip = clientIp(request);
  const limited = await rateLimitAsync(`geo:${ip}`, 60, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfterSec ?? 60) } }
    );
  }

  const countryHeader =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-country-code');

  const defaults = resolveRegionDefaults({
    countryHeader,
    acceptLanguage: request.headers.get('accept-language'),
  });

  return NextResponse.json(
    {
      country: defaults.country,
      language: defaults.language,
      units: defaults.units,
      source: countryHeader ? 'cdn' : 'accept-language',
    },
    {
      headers: {
        'Cache-Control': 'private, max-age=3600',
      },
    }
  );
});
