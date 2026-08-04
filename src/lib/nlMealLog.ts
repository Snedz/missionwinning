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
  // `half` is a quantity word (`half a cup`, `half chicken`) — not a plate-size
  // adjective. Keeping it here double-scaled word-half qty to ~0.65× (.424).
  { pattern: /\b(small|light|mini)\b/i, scale: 0.65 },
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

/**
 * Portion-word scale relative to a template serving.
 * Cups / plates ≈ one serving; handful / slice are smaller snack bites;
 * piece counts as one unit (egg, chicken piece, fruit); tsp is a dab (~⅓ tbsp).
 */
function portionWordScale(word: string): number {
  const w = word.toLowerCase();
  if (/^cups?$/.test(w)) return 1;
  if (/^plates?$/.test(w)) return 1;
  if (/^pieces?$|^pcs?$/.test(w)) return 1;
  if (/^handfuls?$/.test(w)) return 0.5;
  if (/^slices?$/.test(w)) return 0.5;
  if (/^scoops?$|^scoopfuls?$/.test(w)) return 1;
  if (/^tsps?$|^teaspoons?$/.test(w)) return 0.5 / 3; // ≈⅓ tbsp path
  return 1;
}

/** Shared portion-word token for numbered / word / bare parsers. */
const PORTION_WORD =
  'scoops?|scoopfuls?|cups?|pieces?|pcs?|handfuls?|slices?|plates?|tsps?|teaspoons?';

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
  // 250ml milk ≈ 1 cup / liquid serving
  const milliliters = before.match(/(\d{2,4})\s*ml(?:s)?\s*$/i);
  if (milliliters) {
    const ml = parseInt(milliliters[1], 10);
    if (ml >= 20 && ml <= 2000) {
      return {
        qty: Math.round((ml / 250) * 10) / 10,
        start: kwStart - milliliters[0].length,
      };
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
  // Unicode vulgar fractions before ASCII — phone paste often uses ½ ⅓ ⅔ ¾ (.436)
  const unicodeMixed = before.match(
    new RegExp(`(\\d*)([½⅓⅔¾])\\s*(${PORTION_WORD})\\s*(?:of\\s+)?$`, 'i')
  );
  if (unicodeMixed) {
    const VULGAR: Record<string, number> = { '½': 0.5, '⅓': 1 / 3, '⅔': 2 / 3, '¾': 0.75 };
    const whole = unicodeMixed[1] ? parseInt(unicodeMixed[1], 10) : 0;
    const frac = VULGAR[unicodeMixed[2]];
    if (frac != null && whole >= 0 && whole <= 12) {
      const scale = portionWordScale(unicodeMixed[3]);
      const qty = Math.round((whole + frac) * scale * 10) / 10;
      if (qty > 0 && qty <= 12) {
        return { qty, start: kwStart - unicodeMixed[0].length };
      }
    }
  }
  const bareUnicode = before.match(/(\d*)([½⅓⅔¾])\s*$/);
  if (bareUnicode) {
    const VULGAR: Record<string, number> = { '½': 0.5, '⅓': 1 / 3, '⅔': 2 / 3, '¾': 0.75 };
    const whole = bareUnicode[1] ? parseInt(bareUnicode[1], 10) : 0;
    const frac = VULGAR[bareUnicode[2]];
    if (frac != null && whole >= 0 && whole <= 12) {
      const qty = Math.round((whole + frac) * 10) / 10;
      if (qty > 0 && qty <= 12) {
        return { qty, start: kwStart - bareUnicode[0].length };
      }
    }
  }
  // Mixed numbers before bare fractions: "1 1/2 cup rice" must not become
  // qty 0.5 via matching only the trailing `1/2 cup`.
  const mixedPortion = before.match(
    new RegExp(
      `(\\d+)\\s+(\\d+)\\s*/\\s*(\\d+)\\s*(${PORTION_WORD})\\s*(?:of\\s+)?$`,
      'i'
    )
  );
  if (mixedPortion) {
    const whole = parseInt(mixedPortion[1], 10);
    const num = parseInt(mixedPortion[2], 10);
    const den = parseInt(mixedPortion[3], 10);
    if (
      whole > 0 &&
      whole <= 12 &&
      num > 0 &&
      den > 0 &&
      den <= 16 &&
      num < den
    ) {
      const scale = portionWordScale(mixedPortion[4]);
      const qty = Math.round((whole + num / den) * scale * 10) / 10;
      if (qty > 0 && qty <= 12) {
        return { qty, start: kwStart - mixedPortion[0].length };
      }
    }
  }
  const bareMixed = before.match(/(\d+)\s+(\d+)\s*\/\s*(\d+)\s*$/);
  if (bareMixed) {
    const whole = parseInt(bareMixed[1], 10);
    const num = parseInt(bareMixed[2], 10);
    const den = parseInt(bareMixed[3], 10);
    if (
      whole > 0 &&
      whole <= 12 &&
      num > 0 &&
      den > 0 &&
      den <= 16 &&
      num < den
    ) {
      const qty = Math.round((whole + num / den) * 10) / 10;
      if (qty > 0 && qty <= 12) {
        return { qty, start: kwStart - bareMixed[0].length };
      }
    }
  }
  // Fractions before whole numbers: "1/2 cup rice" must not become qty 2
  // via the trailing digit of the denominator.
  const fractionPortion = before.match(
    new RegExp(`(\\d+)\\s*/\\s*(\\d+)\\s*(${PORTION_WORD})\\s*(?:of\\s+)?$`, 'i')
  );
  if (fractionPortion) {
    const num = parseInt(fractionPortion[1], 10);
    const den = parseInt(fractionPortion[2], 10);
    if (num > 0 && den > 0 && den <= 16 && num < den * 8) {
      const scale = portionWordScale(fractionPortion[3]);
      const qty = Math.round((num / den) * scale * 10) / 10;
      if (qty > 0 && qty <= 12) {
        return { qty, start: kwStart - fractionPortion[0].length };
      }
    }
  }
  const bareFraction = before.match(/(\d+)\s*\/\s*(\d+)\s*$/);
  if (bareFraction) {
    const num = parseInt(bareFraction[1], 10);
    const den = parseInt(bareFraction[2], 10);
    if (num > 0 && den > 0 && den <= 16 && num < den * 8) {
      const qty = Math.round((num / den) * 10) / 10;
      if (qty > 0 && qty <= 12) {
        return { qty, start: kwStart - bareFraction[0].length };
      }
    }
  }
  // Numbered portion words: "2 scoops whey", "1 cup rice", "2 handfuls almonds",
  // "3 pieces chicken", "2 slices bread", "a plate of rice", "2 tsp oil"
  // — optional "of" before the food. Leading digit must not be a fraction denom.
  const numberedPortion = before.match(
    new RegExp(`(?<![\\d/])(\\d+(?:\\.\\d+)?)\\s*(${PORTION_WORD})\\s*(?:of\\s+)?$`, 'i')
  );
  if (numberedPortion) {
    const n = parseFloat(numberedPortion[1]);
    const scale = portionWordScale(numberedPortion[2]);
    if (n > 0 && n <= 12) {
      return {
        qty: Math.round(n * scale * 10) / 10,
        start: kwStart - numberedPortion[0].length,
      };
    }
  }
  // "one and a half cups" / "2 and a half cups" before the food.
  // Must run before bare `half cup` — otherwise "one and a half cups" matches
  // as qty 0.5 via the trailing "half cups" (.424).
  const andAHalfBefore = before.match(
    new RegExp(
      `\\b(a|an|one|two|three|four|five|six|\\d+)\\s+and\\s+a\\s+half\\s+(${PORTION_WORD})\\s*(?:of\\s+)?$`,
      'i'
    )
  );
  if (andAHalfBefore) {
    const raw = andAHalfBefore[1].toLowerCase();
    const n = WORD_QTY[raw] ?? parseFloat(raw);
    const scale = portionWordScale(andAHalfBefore[2]);
    if (n > 0 && n <= 12) {
      const qty = Math.round((n + 0.5) * scale * 10) / 10;
      if (qty > 0 && qty <= 12) {
        return { qty, start: kwStart - andAHalfBefore[0].length };
      }
    }
  }
  // "a cup and a half of rice" — portion word before "and a half"
  const portionAndAHalf = before.match(
    new RegExp(
      `\\b(a|an|one|two|three|four|five|six|\\d+)\\s+(${PORTION_WORD})\\s+and\\s+a\\s+half\\s*(?:of\\s+)?$`,
      'i'
    )
  );
  if (portionAndAHalf) {
    const raw = portionAndAHalf[1].toLowerCase();
    const n = WORD_QTY[raw] ?? parseFloat(raw);
    const scale = portionWordScale(portionAndAHalf[2]);
    if (n > 0 && n <= 12) {
      const qty = Math.round((n + 0.5) * scale * 10) / 10;
      if (qty > 0 && qty <= 12) {
        return { qty, start: kwStart - portionAndAHalf[0].length };
      }
    }
  }
  // Word half + portion: "half a cup of rice", "half cup rice" → 0.5× (.424)
  // Also "a quarter cup" / "quarter of a cup" → 0.25× (.433)
  // "a third cup" / "two thirds cup" / "two-thirds cup" / "three quarters cup" (.435/.436)
  const threeQuarters = before.match(
    new RegExp(
      `\\bthree\\s+quarters?(?:\\s+of)?\\s+(?:an?\\s+)?(${PORTION_WORD})\\s*(?:of\\s+)?$`,
      'i'
    )
  );
  if (threeQuarters) {
    const scale = portionWordScale(threeQuarters[1]);
    const qty = Math.round(0.75 * scale * 10) / 10;
    if (qty > 0 && qty <= 12) {
      return { qty, start: kwStart - threeQuarters[0].length };
    }
  }
  const thirdsPortion = before.match(
    new RegExp(
      `\\b(an?|one|two)?\\s*-?\\s*thirds?(?:\\s+of)?\\s+(?:an?\\s+)?(${PORTION_WORD})\\s*(?:of\\s+)?$`,
      'i'
    )
  );
  if (thirdsPortion) {
    const lead = (thirdsPortion[1] ?? 'one').toLowerCase();
    const n = lead === 'two' ? 2 / 3 : 1 / 3;
    const scale = portionWordScale(thirdsPortion[2]);
    const qty = Math.round(n * scale * 10) / 10;
    if (qty > 0 && qty <= 12) {
      return { qty, start: kwStart - thirdsPortion[0].length };
    }
  }
  const quarterPortion = before.match(
    new RegExp(
      `\\b(?:an?\\s+)?quarter(?:\\s+of)?\\s+(?:an?\\s+)?(${PORTION_WORD})\\s*(?:of\\s+)?$`,
      'i'
    )
  );
  if (quarterPortion) {
    const scale = portionWordScale(quarterPortion[1]);
    const qty = Math.round(0.25 * scale * 10) / 10;
    if (qty > 0 && qty <= 12) {
      return { qty, start: kwStart - quarterPortion[0].length };
    }
  }
  // Word half + portion: "half a cup", "half of a cup", "half cup" → 0.5× (.424/.436)
  const halfPortion = before.match(
    new RegExp(`\\bhalf\\s+(?:of\\s+)?(?:an?\\s+)?(${PORTION_WORD})\\s*(?:of\\s+)?$`, 'i')
  );
  if (halfPortion) {
    const scale = portionWordScale(halfPortion[1]);
    const qty = Math.round(0.5 * scale * 10) / 10;
    if (qty > 0 && qty <= 12) {
      return { qty, start: kwStart - halfPortion[0].length };
    }
  }
  // Bare "half chicken" / "half a chicken" — quantity, not plate-size adjective
  const bareHalf = before.match(/\bhalf\s+(?:an?\s+)?$/i);
  if (bareHalf) {
    return { qty: 0.5, start: kwStart - bareHalf[0].length };
  }
  // Word + portion: "a cup of rice", "two handfuls of almonds", "a plate of chicken"
  const wordPortion = before.match(
    new RegExp(
      `\\b(a|an|one|two|three|four|five|six)\\s+(${PORTION_WORD})\\s*(?:of\\s+)?$`,
      'i'
    )
  );
  if (wordPortion) {
    const n = WORD_QTY[wordPortion[1].toLowerCase()] ?? 1;
    const scale = portionWordScale(wordPortion[2]);
    return {
      qty: Math.round(n * scale * 10) / 10,
      start: kwStart - wordPortion[0].length,
    };
  }
  // Bare portion word without count: "cup of oats", "handful almonds", "plate of rice"
  const barePortion = before.match(
    new RegExp(`\\b(${PORTION_WORD})\\s*(?:of\\s+)?$`, 'i')
  );
  if (barePortion) {
    return {
      qty: portionWordScale(barePortion[1]),
      start: kwStart - barePortion[0].length,
    };
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
  // 2 tsp olive oil (same scale as portion-word tsp)
  const tsp = before.match(/(\d+(?:\.\d+)?)\s*(?:tsp|teaspoons?)\s*$/i);
  if (tsp) {
    const t = parseFloat(tsp[1]);
    if (t > 0 && t <= 24) {
      return {
        qty: Math.round(t * portionWordScale('tsp') * 10) / 10,
        start: kwStart - tsp[0].length,
      };
    }
  }
  const num = before.match(/(?<![\d/])(\d{1,2})\s*(?:x\s*)?$/i);
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
