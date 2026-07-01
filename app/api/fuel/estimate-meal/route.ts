import { NextRequest, NextResponse } from 'next/server';
import { estimateMealFromSignals, type MealImageHints } from '@/lib/estimateMealFromPhoto';

const MAX_BYTES = 6 * 1024 * 1024;

/** POST multipart photo → macro estimate (heuristic; vision API hook when configured). */
export async function POST(request: NextRequest) {
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

    // Future: if (process.env.MEAL_VISION_API_URL) { ... }
    const estimate = estimateMealFromSignals(photo.name, photo.size, hints);
    return NextResponse.json(estimate);
  } catch {
    return NextResponse.json({ error: 'Estimate failed' }, { status: 500 });
  }
}
