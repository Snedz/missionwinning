/** Meal photo estimation — heuristics + optional color hints; API-ready. */

export type MealEstimate = {
  name: string;
  protein: number;
  cals: number;
  carbs: number;
  fat: number;
  confidence: 'low' | 'medium' | 'high';
  source: 'heuristic' | 'api' | 'vision';
};

export type MealImageHints = {
  /** Dominant palette bucket from client canvas sample */
  palette?: 'green' | 'brown' | 'yellow' | 'red' | 'neutral';
};

type MealTemplate = {
  keywords: string[];
  palettes?: MealImageHints['palette'][];
  name: string;
  protein: number;
  cals: number;
  carbs: number;
  fat: number;
};

const TEMPLATES: MealTemplate[] = [
  { keywords: ['chicken', 'pollo', 'ayam'], palettes: ['brown'], name: 'Grilled chicken meal (est.)', protein: 42, cals: 380, carbs: 12, fat: 8 },
  { keywords: ['salmon', 'fish', 'ikan'], palettes: ['brown', 'red'], name: 'Salmon plate (est.)', protein: 35, cals: 420, carbs: 8, fat: 22 },
  { keywords: ['rice', 'bowl', 'nasi'], palettes: ['yellow', 'neutral'], name: 'Rice bowl (est.)', protein: 12, cals: 480, carbs: 72, fat: 6 },
  { keywords: ['salad', 'greens'], palettes: ['green'], name: 'Protein salad (est.)', protein: 18, cals: 320, carbs: 22, fat: 14 },
  { keywords: ['egg', 'breakfast'], name: 'Egg breakfast (est.)', protein: 22, cals: 350, carbs: 18, fat: 18 },
  { keywords: ['pizza', 'pasta'], palettes: ['yellow', 'red'], name: 'Carb-heavy meal (est.)', protein: 15, cals: 620, carbs: 78, fat: 20 },
  { keywords: ['shake', 'smoothie'], name: 'Protein smoothie (est.)', protein: 28, cals: 280, carbs: 32, fat: 4 },
  { keywords: ['burger', 'sandwich'], palettes: ['brown', 'yellow'], name: 'Sandwich / burger (est.)', protein: 25, cals: 540, carbs: 45, fat: 22 },
  { keywords: ['steak', 'beef'], palettes: ['brown', 'red'], name: 'Steak plate (est.)', protein: 45, cals: 520, carbs: 6, fat: 28 },
  { keywords: ['yogurt', 'greek'], name: 'Yogurt bowl (est.)', protein: 20, cals: 220, carbs: 18, fat: 6 },
];

const FALLBACK: MealTemplate = {
  keywords: [],
  name: 'Balanced meal (est.)',
  protein: 25,
  cals: 450,
  carbs: 40,
  fat: 15,
};

function scoreTemplate(t: MealTemplate, fileName: string, hints?: MealImageHints): number {
  const hay = fileName.toLowerCase();
  let score = 0;
  if (t.keywords.some((k) => hay.includes(k))) score += 10;
  if (hints?.palette && t.palettes?.includes(hints.palette)) score += 4;
  return score;
}

export function matchMealTemplate(fileName: string, hints?: MealImageHints): MealTemplate {
  let best = FALLBACK;
  let bestScore = 0;
  for (const t of TEMPLATES) {
    const s = scoreTemplate(t, fileName, hints);
    if (s > bestScore) {
      bestScore = s;
      best = t;
    }
  }
  if (bestScore === 0 && hints?.palette === 'green') {
    return TEMPLATES.find((t) => t.keywords.includes('salad')) ?? FALLBACK;
  }
  if (bestScore === 0 && hints?.palette === 'brown') {
    return TEMPLATES.find((t) => t.keywords.includes('chicken')) ?? FALLBACK;
  }
  return best;
}

/** Rough portion scale from file size (very approximate demo heuristic). */
export function portionScaleFromBytes(byteSize: number): number {
  const kb = byteSize / 1024;
  if (kb < 80) return 0.75;
  if (kb > 400) return 1.25;
  return 1;
}

export function estimateMealFromSignals(
  fileName: string,
  byteSize: number,
  hints?: MealImageHints
): MealEstimate {
  const base = matchMealTemplate(fileName, hints);
  const scale = portionScaleFromBytes(byteSize);
  const nameMatch = scoreTemplate(base, fileName, hints) >= 10;
  const paletteMatch = hints?.palette && base.palettes?.includes(hints.palette);

  // Heuristic path never claims `high`. Filename + palette is still a guess on
  // device — "high" is reserved for vision / food-database grounding (Kaizen K2).
  // Palette alone and pure fallback stay low so the UI chip
  // ("Rough estimate (filename / color)") is not contradicted by the badge.
  let confidence: MealEstimate['confidence'] = 'low';
  if (nameMatch) confidence = 'medium';
  else if (paletteMatch) confidence = 'low';

  // Prefer an honest name when we only guessed from color.
  let name = base.name;
  if (!nameMatch && paletteMatch) {
    name = `${base.name.replace(/\s*\(est\.\)\s*$/i, '')} (color guess)`;
  } else if (!nameMatch && base === FALLBACK) {
    name = 'Balanced meal (est.)';
  }

  return {
    name,
    protein: Math.round(base.protein * scale),
    cals: Math.round(base.cals * scale),
    carbs: Math.round(base.carbs * scale),
    fat: Math.round(base.fat * scale),
    confidence,
    source: 'heuristic',
  };
}

export async function estimateMealFromPhoto(
  file: File,
  hints?: MealImageHints
): Promise<MealEstimate> {
  // No artificial delay. This path is a filename/size/colour heuristic, not a model —
  // the UI says so ("Rough estimate (filename / color)"), and a simulated 350ms of
  // "thinking" quietly contradicted that label. When MEAL_VISION_* is configured the
  // real request supplies its own latency.
  return estimateMealFromSignals(file.name, file.size, hints);
}

/** Sample dominant palette from image file (browser only). */
export async function sampleMealImageHints(file: File): Promise<MealImageHints> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {};
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 24;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve({});
          return;
        }
        ctx.drawImage(img, 0, 0, 24, 24);
        const { data } = ctx.getImageData(0, 0, 24, 24);
        let r = 0;
        let g = 0;
        let b = 0;
        const pixels = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        }
        r /= pixels;
        g /= pixels;
        b /= pixels;
        URL.revokeObjectURL(url);

        let palette: MealImageHints['palette'] = 'neutral';
        if (g > r + 15 && g > b + 10) palette = 'green';
        else if (r > 140 && g < 100) palette = 'red';
        else if (r > 110 && g > 90 && b < 80) palette = 'brown';
        else if (r > 120 && g > 110) palette = 'yellow';
        resolve({ palette });
      } catch {
        URL.revokeObjectURL(url);
        resolve({});
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({});
    };
    img.src = url;
  });
}

export async function estimateMealViaApi(
  file: File,
  hints?: MealImageHints,
  opts?: {
    onUploadProgress?: (percent: number) => void;
    signal?: AbortSignal;
  }
): Promise<MealEstimate | null> {
  const form = new FormData();
  form.append('photo', file);
  if (hints?.palette) form.append('palette', hints.palette);
  try {
    // Metering identity for anonymous athletes — counts, never content.
    const { getOrCreateDeviceId } = await import('@/lib/coach/storage');
    form.append('deviceId', getOrCreateDeviceId());
  } catch {
    /* metering identity is best-effort — the estimate never depends on it */
  }

  try {
    const { uploadFormDataWithProgress } = await import('@/lib/uploadWithProgress');
    const data = await uploadFormDataWithProgress<MealEstimate>({
      url: '/api/fuel/estimate-meal',
      formData: form,
      signal: opts?.signal,
      onProgress: (e) => opts?.onUploadProgress?.(e.percent),
    });
    return data ?? null;
  } catch {
    return null;
  }
}
