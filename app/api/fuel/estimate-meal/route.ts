/**
 * Photo meal macro estimate (heuristic).
 * Auth: gate | Rate: 10/min/IP | Body: multipart photo
 * See: app/api/INDEX.md
 */
import { NextRequest, NextResponse } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { estimateMealFromSignals, type MealImageHints } from '@/lib/estimateMealFromPhoto';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { hasAppAccess } from '@/lib/requestAccess';

const MAX_BYTES = 6 * 1024 * 1024;

/** POST multipart photo → macro estimate (heuristic; vision API hook when configured). */
export const POST = withApiLogging('fuel/estimate-meal', async(request: NextRequest) => {
  if (!(await hasAppAccess(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip = clientIp(request);
  const limited = await rateLimitAsync(`fuel-meal:${ip}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const form = await request.formData();
    const photo = form.get('photo');
    if (!(photo instanceof File)) {
      return NextResponse.json({ error: 'Missing photo' }, { status: 400 });
    }
    if (!photo.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    if (photo.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 });
    }

    const palette = form.get('palette');
    const hints: MealImageHints | undefined =
      palette === 'green' ||
      palette === 'brown' ||
      palette === 'yellow' ||
      palette === 'red' ||
      palette === 'neutral'
        ? { palette }
        : undefined;

    // Vision path when configured; always fall back to heuristic on failure.
    try {
      const { isMealVisionConfigured, fetchMealVisionEstimate } = await import(
        '@/lib/mealVisionClient'
      );
      if (isMealVisionConfigured()) {
        const buf = Buffer.from(await photo.arrayBuffer());
        const b64 = buf.toString('base64');
        const vision = await fetchMealVisionEstimate(b64, photo.type || 'image/jpeg');
        if (vision.ok) {
          const conf =
            vision.estimate.confidence >= 0.7
              ? 'high'
              : vision.estimate.confidence >= 0.4
                ? 'medium'
                : 'low';
          return NextResponse.json({
            name: vision.estimate.name,
            protein: vision.estimate.protein,
            cals: vision.estimate.cals,
            carbs: vision.estimate.carbs,
            fat: vision.estimate.fat,
            confidence: conf,
            source: 'vision' as const,
          });
        }
      }
    } catch {
      /* fall through to heuristic */
    }

    const estimate = estimateMealFromSignals(photo.name, photo.size, hints);
    return NextResponse.json({ ...estimate, source: estimate.source === 'api' ? 'api' : 'heuristic' });
  } catch {
    return NextResponse.json({ error: 'Estimate failed' }, { status: 500 });
  }
});
