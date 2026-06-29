/** On-device meal estimate stub — filename heuristics until vision API ships. */

export type MealEstimate = {
  name: string;
  protein: number;
  cals: number;
  carbs: number;
  fat: number;
  confidence: 'low' | 'medium';
};

type MealTemplate = {
  keywords: string[];
  name: string;
  protein: number;
  cals: number;
  carbs: number;
  fat: number;
};

const TEMPLATES: MealTemplate[] = [
  { keywords: ['chicken', 'pollo', 'ayam'], name: 'Grilled chicken meal (est.)', protein: 42, cals: 380, carbs: 12, fat: 8 },
  { keywords: ['salmon', 'fish', 'ikan'], name: 'Salmon plate (est.)', protein: 35, cals: 420, carbs: 8, fat: 22 },
  { keywords: ['rice', 'bowl', 'nasi'], name: 'Rice bowl (est.)', protein: 12, cals: 480, carbs: 72, fat: 6 },
  { keywords: ['salad', 'greens'], name: 'Protein salad (est.)', protein: 18, cals: 320, carbs: 22, fat: 14 },
  { keywords: ['egg', 'breakfast'], name: 'Egg breakfast (est.)', protein: 22, cals: 350, carbs: 18, fat: 18 },
  { keywords: ['pizza', 'pasta'], name: 'Carb-heavy meal (est.)', protein: 15, cals: 620, carbs: 78, fat: 20 },
  { keywords: ['shake', 'smoothie'], name: 'Protein smoothie (est.)', protein: 28, cals: 280, carbs: 32, fat: 4 },
  { keywords: ['burger', 'sandwich'], name: 'Sandwich / burger (est.)', protein: 25, cals: 540, carbs: 45, fat: 22 },
];

const FALLBACK: MealTemplate = {
  keywords: [],
  name: 'Balanced meal (est.)',
  protein: 25,
  cals: 450,
  carbs: 40,
  fat: 15,
};

function matchTemplate(fileName: string): MealTemplate {
  const hay = fileName.toLowerCase();
  for (const t of TEMPLATES) {
    if (t.keywords.some((k) => hay.includes(k))) return t;
  }
  return FALLBACK;
}

/** Rough portion scale from file size (very approximate demo heuristic). */
function portionScale(file: File): number {
  const kb = file.size / 1024;
  if (kb < 80) return 0.75;
  if (kb > 400) return 1.25;
  return 1;
}

export async function estimateMealFromPhoto(file: File): Promise<MealEstimate> {
  // Small delay so UI feels like processing (on-device only).
  await new Promise((r) => setTimeout(r, 400));

  const base = matchTemplate(file.name);
  const scale = portionScale(file);

  return {
    name: base.name,
    protein: Math.round(base.protein * scale),
    cals: Math.round(base.cals * scale),
    carbs: Math.round(base.carbs * scale),
    fat: Math.round(base.fat * scale),
    confidence: base === FALLBACK ? 'low' : 'medium',
  };
}
