/**
 * Geo hint for first-visit language/units defaults + territory hard-block flag.
 * Auth: public | Rate: 60/min/IP | Headers: cf-ipcountry / x-vercel-ip-country
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { clientIp } from '@/lib/clientIp';
import { rateLimitAsync } from '@/lib/rateLimit';
import { resolveRegionDefaults } from '@/lib/regionDefaults';
import {
  countryFromRequestHeaders,
  hostedServiceAccessFromHeaders,
  TERRITORY_BLOCK_MESSAGES,
} from '@/lib/legal/supportedRegions';

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
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('x-country-code');

  const defaults = resolveRegionDefaults({
    countryHeader,
    acceptLanguage: request.headers.get('accept-language'),
  });

  const territory = hostedServiceAccessFromHeaders(request.headers);
  const cdnCountry = territory.country ?? countryFromRequestHeaders(request.headers);
  const blockReason = territory.allowed ? null : territory.reason;
  const blocked = !territory.allowed;

  return NextResponse.json(
    {
      country: cdnCountry ?? defaults.country,
      language: defaults.language,
      units: defaults.units,
      source: countryHeader ? 'cdn' : 'accept-language',
      blocked,
      blockReason: blockReason,
      blockMessage: blockReason ? TERRITORY_BLOCK_MESSAGES[blockReason] : null,
    },
    {
      headers: {
        // Territory flags must not stick across VPN/travel in the same browser hour.
        'Cache-Control': 'private, no-store',
      },
    }
  );
});
