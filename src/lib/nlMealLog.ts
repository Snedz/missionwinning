/**
 * 0xCal-lite natural-language meal estimate from a short description.
 * Keyword templates + portion words — no chat UI. See DESIGN_RESEARCH Wave 2.
 */

export type NlMealEstimate = {
  name: string;
  protein: number;
  cals: number;
  carbs: number;
  fat: number;
  matched: string[];
  confidence: 'low' | 'medium' | 'high';
};

type FoodToken = {
  keywords: string[];
  label: string;
  protein: number;
  cals: number;
  carbs: number;
  fat: number;
};

const FOODS: FoodToken[] = [
  { keywords: ['chicken', 'pollo', 'ayam'], label: 'Chicken', protein: 35, cals: 220, carbs: 0, fat: 5 },
  { keywords: ['turkey'], label: 'Turkey', protein: 30, cals: 180, carbs: 0, fat: 3 },
  { keywords: ['salmon', 'fish', 'tuna', 'ikan'], label: 'Fish', protein: 28, cals: 250, carbs: 0, fat: 12 },
  { keywords: ['steak', 'beef', 'carne'], label: 'Beef', protein: 32, cals: 280, carbs: 0, fat: 16 },
  { keywords: ['egg', 'eggs', 'huevo'], label: 'Eggs', protein: 12, cals: 140, carbs: 1, fat: 10 },
  { keywords: ['rice', 'nasi', 'arroz'], label: 'Rice', protein: 4, cals: 200, carbs: 45, fat: 0 },
  { keywords: ['potato', 'potatoes', 'sweet potato'], label: 'Potato', protein: 4, cals: 160, carbs: 36, fat: 0 },
  { keywords: ['pasta', 'noodles'], label: 'Pasta', protein: 8, cals: 280, carbs: 54, fat: 2 },
  { keywords: ['bread', 'toast', 'bagel'], label: 'Bread', protein: 6, cals: 160, carbs: 30, fat: 2 },
  { keywords: ['broccoli', 'brocoli'], label: 'Broccoli', protein: 3, cals: 40, carbs: 6, fat: 0 },
  { keywords: ['salad', 'greens', 'lettuce', 'spinach'], label: 'Greens', protein: 2, cals: 25, carbs: 4, fat: 0 },
  { keywords: ['avocado'], label: 'Avocado', protein: 2, cals: 160, carbs: 8, fat: 15 },
  { keywords: ['rice bowl', 'bowl'], label: 'Bowl base', protein: 8, cals: 320, carbs: 50, fat: 4 },
  { keywords: ['oats', 'oatmeal'], label: 'Oats', protein: 6, cals: 180, carbs: 30, fat: 3 },
  { keywords: ['yogurt', 'greek'], label: 'Yogurt', protein: 18, cals: 150, carbs: 12, fat: 2 },
  { keywords: ['shake', 'smoothie', 'whey', 'protein shake'], label: 'Protein shake', protein: 25, cals: 200, carbs: 8, fat: 2 },
  { keywords: ['banana'], label: 'Banana', protein: 1, cals: 105, carbs: 27, fat: 0 },
  { keywords: ['apple'], label: 'Apple', protein: 0, cals: 95, carbs: 25, fat: 0 },
  { keywords: ['beans', 'lentils', 'chickpea', 'tofu'], label: 'Legumes', protein: 14, cals: 180, carbs: 22, fat: 4 },
  { keywords: ['cheese'], label: 'Cheese', protein: 8, cals: 110, carbs: 1, fat: 9 },
  { keywords: ['milk'], label: 'Milk', protein: 8, cals: 120, carbs: 12, fat: 5 },
  { keywords: ['burger', 'sandwich'], label: 'Sandwich', protein: 22, cals: 450, carbs: 40, fat: 18 },
  { keywords: ['pizza'], label: 'Pizza', protein: 14, cals: 500, carbs: 55, fat: 18 },
  { keywords: ['fries', 'chips'], label: 'Fries', protein: 4, cals: 320, carbs: 42, fat: 15 },
];

const PORTION_SCALE: { pattern: RegExp; scale: number }[] = [
  { pattern: /\b(large|big|xl|double|extra)\b/i, scale: 1.35 },
  { pattern: /\b(small|light|half|mini)\b/i, scale: 0.65 },
  { pattern: /\b(2|two|x2)\b/i, scale: 1.8 },
];

function portionScale(text: string): number {
  for (const p of PORTION_SCALE) {
    if (p.pattern.test(text)) return p.scale;
  }
  return 1;
}

/**
 * Parse a free-text meal description into summed macros.
 * Matches multiple food tokens in one string (e.g. "chicken rice broccoli").
 */
export function estimateMealFromDescription(raw: string): NlMealEstimate | null {
  const text = raw.trim().toLowerCase();
  if (text.length < 2) return null;

  const scale = portionScale(text);
  const matched: FoodToken[] = [];
  const usedSpans: { start: number; end: number }[] = [];

  // Longer keywords first so "sweet potato" / "protein shake" win
  const ranked = [...FOODS].sort(
    (a, b) => Math.max(...b.keywords.map((k) => k.length)) - Math.max(...a.keywords.map((k) => k.length))
  );

  for (const food of ranked) {
    for (const kw of food.keywords) {
      const idx = text.indexOf(kw);
      if (idx < 0) continue;
      const end = idx + kw.length;
      const overlaps = usedSpans.some((s) => idx < s.end && end > s.start);
      if (overlaps) continue;
      usedSpans.push({ start: idx, end });
      matched.push(food);
      break;
    }
  }

  if (!matched.length) {
    // Fallback balanced meal when user typed something but no keywords hit
    return {
      name: raw.trim().slice(0, 48) || 'Meal (est.)',
      protein: Math.round(25 * scale),
      cals: Math.round(450 * scale),
      carbs: Math.round(40 * scale),
      fat: Math.round(15 * scale),
      matched: [],
      confidence: 'low',
    };
  }

  const protein = Math.round(matched.reduce((s, f) => s + f.protein, 0) * scale);
  const cals = Math.round(matched.reduce((s, f) => s + f.cals, 0) * scale);
  const carbs = Math.round(matched.reduce((s, f) => s + f.carbs, 0) * scale);
  const fat = Math.round(matched.reduce((s, f) => s + f.fat, 0) * scale);
  const labels = matched.map((f) => f.label);

  return {
    name: labels.join(' + '),
    protein,
    cals,
    carbs,
    fat,
    matched: labels,
    confidence: matched.length >= 2 ? 'high' : 'medium',
  };
}
