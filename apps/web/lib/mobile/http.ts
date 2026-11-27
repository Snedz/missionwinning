import { NextResponse, type NextRequest } from 'next/server';
import { hasPrivateAccessCookie } from './auth';
import { isPrivateModeEnabled } from './privateMode';

export function clientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') || 'unknown';
}

export function rejectOversizedBody(request: NextRequest, maxBytes = 32 * 1024) {
  const length = Number(request.headers.get('content-length'));
  return Number.isFinite(length) && length > maxBytes
    ? NextResponse.json({ error: 'Payload too large' }, { status: 413 }) : null;
}

export function withApiLogging(route: string, handler: (request: NextRequest) => Promise<Response>) {
  return async (request: NextRequest) => {
    const privateMode = isPrivateModeEnabled();
    let response: Response;
    try {
      response = privateMode && !hasPrivateAccessCookie(request)
        ? NextResponse.json({ error: 'Private development gate' }, { status: 403 })
        : await handler(request);
    } catch (error) {
      console.error('[%s] %s request failed (%s)', route, request.method, error instanceof Error ? error.name : 'unknown');
      response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
    response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate');
    if (privateMode) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  };
}
