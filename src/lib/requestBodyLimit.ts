/**
 * Reject oversized JSON request bodies early (cost / DoS guard).
 */
import { NextRequest, NextResponse } from 'next/server';

/** Default 32 KiB — enough for coach context payloads. */
export const DEFAULT_JSON_BODY_MAX = 32 * 1024;

/**
 * If Content-Length is present and exceeds maxBytes, return 413.
 * Missing Content-Length is allowed (chunked); Zod still bounds parsed shape.
 */
export function rejectOversizedBody(
  request: NextRequest,
  maxBytes = DEFAULT_JSON_BODY_MAX
): NextResponse | null {
  const raw = request.headers.get('content-length');
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  if (n > maxBytes) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }
  return null;
}
