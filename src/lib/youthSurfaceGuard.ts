/**
 * Youth / school COPPA APIs must 404 when the surface is parked, even if the
 * request skipped proxy (direct function URL, miswired preview).
 */
import { NextResponse } from 'next/server';
import { isPathEnabled } from '@/lib/surface';

export function youthApiNotFound(): NextResponse | null {
  if (isPathEnabled('/api/youth')) return null;
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
