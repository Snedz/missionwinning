/**
 * Photo meal macro estimate (heuristic).
 * Auth: gate; vision branch additionally premium + daily quota | Rate: 10/min/IP | Body: multipart photo
 * See: app/api/INDEX.md
 */
import { NextRequest, NextResponse, after } from 'next/server';
import { withApiLogging } from '@/lib/api/withApiLogging';
import { estimateMealFromSignals, type MealImageHints } from '@/lib/estimateMealFromPhoto';
import { rateLimitAsync } from '@/lib/rateLimit';
import { clientIp } from '@/lib/clientIp';
import { hasAppAccess } from '@/lib/requestAccess';
import { resolveLlmCaller } from '@/lib/llm/identity';
import { allowLlmInference } from '@/lib/llm/quota';
import { recordLlmUsage } from '@/lib/llm/metering';

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

    /*
     * Vision path when configured; always fall back to heuristic on failure.
     * Since `.188` the vision branch — the only part that spends money — is
     * additionally gated on premium (bypass during free beta) and the daily
     * per-identity quota. Before that, ANY gate-cookie holder could drive paid
     * vision inference with no premium check at all. Either refusal lands on
     * `estimateMealFromSignals`, the same heuristic every free athlete gets.
     */
    try {
      const { isMealVisionConfigured, fetchMealVisionEstimate } = await import(
        '@/lib/mealVisionClient'
      );
      const rawDeviceId = form.get('deviceId');
      const caller = await resolveLlmCaller(
        request,
        typeof rawDeviceId === 'string' ? rawDeviceId : null
      );
      const useVision =
        isMealVisionConfigured() &&
        caller.premium &&
        (await allowLlmInference('meal_vision', caller)).ok;
      if (useVision) {
        const buf = Buffer.from(await photo.arrayBuffer());
        const b64 = buf.toString('base64');
        const t0 = Date.now();
        const vision = await fetchMealVisionEstimate(b64, photo.type || 'image/jpeg');
        if (vision.ok) {
          after(() =>
            recordLlmUsage({
              feature: 'meal_vision',
              identity: caller,
              usage: vision.usage,
              ok: true,
              durationMs: Date.now() - t0,
            })
          );
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
