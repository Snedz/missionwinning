/**
 * Natural-language meal estimate from a short description.
 * Keyword templates + per-item quantities + portion words — no chat UI.
 */

export type NlMealEstimate = {
  name: string;
  protein: number;
  cals: number;
  carbs: number;
  fat: number;
  matched: string[];
  confidence: 'low' | 'medium' | 'high';
  /** Honest source for UI chips */
  source: 'matched' | 'rough';
};

type FoodToken = {
  keywords: string[];
  label: string;
  protein: number;
  cals: number;
  carbs: number;
  fat: number;
};

/** Per-serving template macros (typical plate portion, not per-100g). */
const FOODS: FoodToken[] = [
  { keywords: ['sweet potato', 'sweet potatoes'], label: 'Sweet potato', protein: 4, cals: 160, carbs: 36, fat: 0 },
  { keywords: ['protein shake', 'whey shake'], label: 'Protein shake', protein: 25, cals: 200, carbs: 8, fat: 2 },
  { keywords: ['greek yogurt', 'greek yoghurt'], label: 'Greek yogurt', protein: 18, cals: 150, carbs: 12, fat: 2 },
  { keywords: ['peanut butter', 'pb'], label: 'Peanut butter', protein: 8, cals: 190, carbs: 6, fat: 16 },
  // Never bare "oil" — too many false hits ("boil", "toil" aside, and every
  // "cooking oil" phrase without a brand). Multi-word only.
  { keywords: ['olive oil', 'coconut oil', 'cooking oil', 'avocado oil'], label: 'Oil', protein: 0, cals: 120, carbs: 0, fat: 14 },
  { keywords: ['chicken breast', 'grilled chicken', 'chicken', 'pollo', 'ayam'], label: 'Chicken', protein: 35, cals: 220, carbs: 0, fat: 5 },
  { keywords: ['turkey'], label: 'Turkey', protein: 30, cals: 180, carbs: 0, fat: 3 },
  { keywords: ['salmon', 'fish', 'tuna', 'ikan'], label: 'Fish', protein: 28, cals: 250, carbs: 0, fat: 12 },
  { keywords: ['shrimp', 'prawn'], label: 'Shrimp', protein: 24, cals: 120, carbs: 1, fat: 2 },
  { keywords: ['steak', 'beef', 'carne'], label: 'Beef', protein: 32, cals: 280, carbs: 0, fat: 16 },
  { keywords: ['pork', 'bacon'], label: 'Pork', protein: 22, cals: 260, carbs: 0, fat: 18 },
  { keywords: ['eggs', 'egg', 'huevo', 'huevos'], label: 'Eggs', protein: 12, cals: 140, carbs: 1, fat: 10 },
  { keywords: ['rice', 'nasi', 'arroz'], label: 'Rice', protein: 4, cals: 200, carbs: 45, fat: 0 },
  { keywords: ['potato', 'potatoes'], label: 'Potato', protein: 4, cals: 160, carbs: 36, fat: 0 },
  { keywords: ['pasta', 'noodles', 'spaghetti'], label: 'Pasta', protein: 8, cals: 280, carbs: 54, fat: 2 },
  { keywords: ['bread', 'toast', 'bagel', 'tortilla'], label: 'Bread', protein: 6, cals: 160, carbs: 30, fat: 2 },
  { keywords: ['broccoli', 'brocoli'], label: 'Broccoli', protein: 3, cals: 40, carbs: 6, fat: 0 },
  { keywords: ['salad', 'greens', 'lettuce', 'spinach', 'kale'], label: 'Greens', protein: 2, cals: 25, carbs: 4, fat: 0 },
  { keywords: ['avocado'], label: 'Avocado', protein: 2, cals: 160, carbs: 8, fat: 15 },
  { keywords: ['rice bowl', 'bowl'], label: 'Bowl base', protein: 8, cals: 320, carbs: 50, fat: 4 },
  { keywords: ['oats', 'oatmeal', 'porridge'], label: 'Oats', protein: 6, cals: 180, carbs: 30, fat: 3 },
  { keywords: ['yogurt', 'yoghurt'], label: 'Yogurt', protein: 12, cals: 140, carbs: 16, fat: 3 },
  { keywords: ['protein powder', 'whey protein', 'casein', 'whey'], label: 'Protein powder', protein: 24, cals: 120, carbs: 3, fat: 1 },
  { keywords: ['shake', 'smoothie'], label: 'Protein shake', protein: 25, cals: 200, carbs: 8, fat: 2 },
  { keywords: ['oat milk'], label: 'Oat milk', protein: 3, cals: 120, carbs: 16, fat: 5 },
  { keywords: ['almond milk'], label: 'Almond milk', protein: 1, cals: 40, carbs: 2, fat: 3 },
  { keywords: ['brown rice'], label: 'Brown rice', protein: 5, cals: 215, carbs: 45, fat: 2 },
  { keywords: ['white rice'], label: 'White rice', protein: 4, cals: 200, carbs: 45, fat: 0 },
  { keywords: ['meal prep'], label: 'Meal prep plate', protein: 35, cals: 480, carbs: 40, fat: 12 },
  { keywords: ['banana'], label: 'Banana', protein: 1, cals: 105, carbs: 27, fat: 0 },
  { keywords: ['apple'], label: 'Apple', protein: 0, cals: 95, carbs: 25, fat: 0 },
  { keywords: ['orange', 'berries', 'berries'], label: 'Fruit', protein: 1, cals: 80, carbs: 20, fat: 0 },
  { keywords: ['beans', 'lentils', 'chickpea', 'chickpeas', 'tofu', 'tempeh'], label: 'Legumes', protein: 14, cals: 180, carbs: 22, fat: 4 },
  { keywords: ['cheese', 'queso'], label: 'Cheese', protein: 8, cals: 110, carbs: 1, fat: 9 },
  { keywords: ['milk', 'latte'], label: 'Milk', protein: 8, cals: 120, carbs: 12, fat: 5 },
  { keywords: ['burger', 'sandwich', 'wrap'], label: 'Sandwich', protein: 22, cals: 450, carbs: 40, fat: 18 },
  { keywords: ['pizza'], label: 'Pizza', protein: 14, cals: 500, carbs: 55, fat: 18 },
  { keywords: ['fries', 'chips'], label: 'Fries', protein: 4, cals: 320, carbs: 42, fat: 15 },
  { keywords: ['sushi'], label: 'Sushi', protein: 18, cals: 350, carbs: 45, fat: 6 },
  { keywords: ['taco', 'tacos', 'burrito'], label: 'Taco/burrito', protein: 20, cals: 420, carbs: 40, fat: 16 },
  { keywords: ['curry'], label: 'Curry', protein: 22, cals: 480, carbs: 42, fat: 18 },
  { keywords: ['soup'], label: 'Soup', protein: 10, cals: 200, carbs: 20, fat: 8 },
  { keywords: ['coffee', 'espresso'], label: 'Coffee', protein: 0, cals: 5, carbs: 0, fat: 0 },
  { keywords: ['beer'], label: 'Beer', protein: 1, cals: 150, carbs: 13, fat: 0 },
  { keywords: ['wine'], label: 'Wine', protein: 0, cals: 125, carbs: 4, fat: 0 },
  { keywords: ['almonds', 'nuts', 'cashews'], label: 'Nuts', protein: 6, cals: 170, carbs: 6, fat: 15 },
  { keywords: ['hummus'], label: 'Hummus', protein: 5, cals: 140, carbs: 12, fat: 8 },
  { keywords: ['ramen'], label: 'Ramen', protein: 14, cals: 450, carbs: 55, fat: 16 },
  { keywords: ['quinoa'], label: 'Quinoa', protein: 8, cals: 220, carbs: 39, fat: 4 },
  { keywords: ['cottage cheese'], label: 'Cottage cheese', protein: 24, cals: 180, carbs: 8, fat: 5 },
  { keywords: ['pancake', 'pancakes', 'waffle'], label: 'Pancakes', protein: 8, cals: 350, carbs: 50, fat: 12 },
  { keywords: ['cereal'], label: 'Cereal', protein: 4, cals: 200, carbs: 40, fat: 2 },
  { keywords: ['ice cream', 'icecream'], label: 'Ice cream', protein: 4, cals: 270, carbs: 32, fat: 14 },
  { keywords: ['chocolate'], label: 'Chocolate', protein: 2, cals: 150, carbs: 17, fat: 9 },
  { keywords: ['protein bar'], label: 'Protein bar', protein: 20, cals: 220, carbs: 22, fat: 8 },
  { keywords: ['salad dressing', 'dressing', 'mayo', 'mayonnaise'], label: 'Dressing', protein: 0, cals: 120, carbs: 2, fat: 12 },
  { keywords: ['butter'], label: 'Butter', protein: 0, cals: 100, carbs: 0, fat: 11 },
  { keywords: ['rice cakes', 'rice cake'], label: 'Rice cake', protein: 1, cals: 70, carbs: 15, fat: 0 },
  { keywords: ['edamame'], label: 'Edamame', protein: 17, cals: 180, carbs: 14, fat: 8 },
  { keywords: ['cod', 'tilapia', 'white fish'], label: 'White fish', protein: 26, cals: 140, carbs: 0, fat: 2 },
  { keywords: ['lamb'], label: 'Lamb', protein: 28, cals: 290, carbs: 0, fat: 20 },
  { keywords: ['smoothie bowl', 'acai'], label: 'Smoothie bowl', protein: 8, cals: 380, carbs: 60, fat: 10 },
  { keywords: ['fried rice'], label: 'Fried rice', protein: 12, cals: 450, carbs: 65, fat: 14 },
  { keywords: ['pad thai'], label: 'Pad Thai', protein: 18, cals: 520, carbs: 70, fat: 16 },
  { keywords: ['pho'], label: 'Pho', protein: 22, cals: 400, carbs: 48, fat: 10 },
  { keywords: ['dumpling', 'dumplings', 'gyoza'], label: 'Dumplings', protein: 12, cals: 280, carbs: 35, fat: 10 },
  { keywords: ['croissant'], label: 'Croissant', protein: 5, cals: 270, carbs: 30, fat: 14 },
];

const WORD_QTY: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
};

const GLOBAL_PORTION: { pattern: RegExp; scale: number }[] = [
  { pattern: /\b(large|big|xl|double|extra)\b/i, scale: 1.35 },
  { pattern: /\b(small|light|half|mini)\b/i, scale: 0.65 },
];

function globalPortionScale(text: string): number {
  for (const p of GLOBAL_PORTION) {
    if (p.pattern.test(text)) return p.scale;
  }
  return 1;
}

type Hit = {
  food: FoodToken;
  qty: number;
  start: number;
  end: number;
};

function findQtyBefore(text: string, kwStart: number): { qty: number; start: number } {
  const before = text.slice(0, kwStart);
  // 100g chicken ≈ 1 serving template (templates are ~100–150g portions)
  const grams = before.match(/(\d{2,4})\s*g(?:rams?)?\s*$/i);
  if (grams) {
    const g = parseInt(grams[1], 10);
    if (g >= 20 && g <= 800) {
      return { qty: Math.round((g / 100) * 10) / 10, start: kwStart - grams[0].length };
    }
  }
  // 6 oz chicken ≈ 170g → ~1.7 template servings
  const ounces = before.match(/(\d+(?:\.\d+)?)\s*(?:oz|ounces?)\s*$/i);
  if (ounces) {
    const oz = parseFloat(ounces[1]);
    if (oz > 0 && oz <= 32) {
      const g = oz * 28.35;
      return { qty: Math.round((g / 100) * 10) / 10, start: kwStart - ounces[0].length };
    }
  }
  // 2 scoops whey — one scoop ≈ one powder template serving
  const scoops = before.match(/(\d+(?:\.\d+)?)\s*(?:scoops?|scoopfuls?)\s*(?:of\s+)?$/i);
  if (scoops) {
    const s = parseFloat(scoops[1]);
    if (s > 0 && s <= 6) {
      return { qty: s, start: kwStart - scoops[0].length };
    }
  }
  // 1 cup rice / 2 cups oats
  const cups = before.match(/(\d+(?:\.\d+)?)\s*cups?\s*$/i);
  if (cups) {
    const c = parseFloat(cups[1]);
    if (c > 0 && c <= 8) {
      return { qty: c, start: kwStart - cups[0].length };
    }
  }
  // 2 tbsp peanut butter
  const tbsp = before.match(/(\d+(?:\.\d+)?)\s*(?:tbsp|tablespoons?)\s*$/i);
  if (tbsp) {
    const t = parseFloat(tbsp[1]);
    if (t > 0 && t <= 12) {
      // templates are ~1–2 tbsp for spreads; treat 1 tbsp ≈ 0.5 serving of PB template
      return { qty: Math.round(t * 0.5 * 10) / 10, start: kwStart - tbsp[0].length };
    }
  }
  const num = before.match(/(\d{1,2})\s*(?:x\s*)?$/i);
  if (num) {
    const n = parseInt(num[1], 10);
    if (n >= 1 && n <= 20) {
      return { qty: n, start: kwStart - num[0].length };
    }
  }
  const word = before.match(/\b(a|an|one|two|three|four|five|six)\s+$/i);
  if (word) {
    const q = WORD_QTY[word[1].toLowerCase()] ?? 1;
    return { qty: q, start: kwStart - word[0].length };
  }
  return { qty: 1, start: kwStart };
}

function collectHits(text: string): Hit[] {
  const ranked = [...FOODS].sort(
    (a, b) =>
      Math.max(...b.keywords.map((k) => k.length)) - Math.max(...a.keywords.map((k) => k.length))
  );
  const hits: Hit[] = [];
  const used: { start: number; end: number }[] = [];

  for (const food of ranked) {
    for (const kw of food.keywords) {
      let from = 0;
      while (from < text.length) {
        const idx = text.indexOf(kw, from);
        if (idx < 0) break;
        const end = idx + kw.length;
        // word boundary-ish: avoid matching inside longer words
        const leftOk = idx === 0 || /[\s,+/&-]/.test(text[idx - 1] ?? '');
        const rightOk = end >= text.length || /[\s,+/&-]/.test(text[end] ?? '');
        if (!leftOk || !rightOk) {
          from = idx + 1;
          continue;
        }
        const { qty, start } = findQtyBefore(text, idx);
        const spanStart = start;
        const overlaps = used.some((s) => spanStart < s.end && end > s.start);
        if (!overlaps) {
          used.push({ start: spanStart, end });
          hits.push({ food, qty, start: spanStart, end });
        }
        from = end;
      }
    }
  }

  hits.sort((a, b) => a.start - b.start);
  return hits;
}

/**
 * Parse a free-text meal description into summed macros.
 * Matches multiple food tokens (e.g. "chicken rice broccoli") and quantities ("3 eggs").
 */
export function estimateMealFromDescription(raw: string): NlMealEstimate | null {
  const trimmed = raw.trim();
  if (trimmed.length < 2) return null;

  const text = trimmed.toLowerCase();
  const plateScale = globalPortionScale(text);
  const hits = collectHits(text);

  if (!hits.length) {
    // Low, conservative guess — user must edit before trusting
    return {
      name: trimmed.slice(0, 48) || 'Meal (est.)',
      protein: Math.round(15 * plateScale),
      cals: Math.round(300 * plateScale),
      carbs: Math.round(30 * plateScale),
      fat: Math.round(10 * plateScale),
      matched: [],
      confidence: 'low',
      source: 'rough',
    };
  }

  let protein = 0;
  let cals = 0;
  let carbs = 0;
  let fat = 0;
  const labels: string[] = [];

  for (const hit of hits) {
    const q = hit.qty;
    protein += hit.food.protein * q;
    cals += hit.food.cals * q;
    carbs += hit.food.carbs * q;
    fat += hit.food.fat * q;
    labels.push(q === 1 ? hit.food.label : `${q}× ${hit.food.label}`);
  }

  protein = Math.round(protein * plateScale);
  cals = Math.round(cals * plateScale);
  carbs = Math.round(carbs * plateScale);
  fat = Math.round(fat * plateScale);

  // Two+ distinct foods is the only "high" — quantity alone is still a guess
  // about portion size, not composition.
  const confidence: NlMealEstimate['confidence'] =
    hits.length >= 2 ? 'high' : hits[0].qty !== 1 ? 'medium' : 'medium';

  return {
    name: labels.join(' + '),
    protein,
    cals,
    carbs,
    fat,
    matched: labels,
    confidence,
    source: 'matched',
  };
}
