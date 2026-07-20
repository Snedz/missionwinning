/**
 * Optional meal vision — OpenAI-compatible multimodal chat.
 * Mirrors coachLlmClient conventions; never throws to the route (typed result).
 */

import {
  isTruthyEnv,
  parseZeroDataRetentionHeader,
} from '@/lib/coachLlmClient';

export type MealVisionEstimate = {
  name: string;
  protein: number;
  cals: number;
  carbs: number;
  fat: number;
  confidence: number; // 0–1
  source: 'vision';
};

export type MealVisionResult =
  | { ok: true; estimate: MealVisionEstimate; zeroDataRetention: boolean | null }
  | {
      ok: false;
      reason: 'unconfigured' | 'http_error' | 'parse' | 'network' | 'timeout' | 'zdr_inactive';
      status?: number;
    };

export type MealVisionEnv = {
  apiUrl?: string;
  apiKey?: string;
  model?: string;
  requireZdr?: boolean;
};

export function mealVisionEnvFromProcess(
  env: NodeJS.ProcessEnv = process.env
): MealVisionEnv {
  return {
    apiUrl: env.MEAL_VISION_API_URL?.trim(),
    apiKey: env.MEAL_VISION_API_KEY?.trim(),
    model: env.MEAL_VISION_MODEL?.trim() || 'gpt-4o-mini',
    requireZdr: isTruthyEnv(env.MEAL_VISION_REQUIRE_ZDR),
  };
}

export function isMealVisionConfigured(cfg = mealVisionEnvFromProcess()): boolean {
  return Boolean(cfg.apiUrl && cfg.apiKey);
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

/** Pure parse + clamp of model JSON (unit-tested). */
export function parseMealVisionJson(raw: string): MealVisionEstimate | null {
  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    const parsed = JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
    const name = String(parsed.name ?? parsed.food ?? 'Meal (est.)')
      .trim()
      .slice(0, 80);
    if (!name) return null;
    const protein = clamp(Number(parsed.protein ?? parsed.protein_g ?? 0), 0, 250);
    const cals = clamp(Number(parsed.cals ?? parsed.calories ?? parsed.kcal ?? 0), 0, 3000);
    const carbs = clamp(Number(parsed.carbs ?? parsed.carbohydrates ?? 0), 0, 400);
    const fat = clamp(Number(parsed.fat ?? parsed.fats ?? 0), 0, 200);
    let confidence = Number(parsed.confidence ?? 0.5);
    if (confidence > 1) confidence = confidence / 100;
    confidence = clamp(confidence, 0, 1);
    return {
      name,
      protein: Math.round(protein),
      cals: Math.round(cals),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      confidence,
      source: 'vision',
    };
  } catch {
    return null;
  }
}

export async function fetchMealVisionEstimate(
  imageBase64: string,
  mimeType = 'image/jpeg',
  cfg = mealVisionEnvFromProcess(),
  fetchImpl: typeof fetch = fetch
): Promise<MealVisionResult> {
  if (!cfg.apiUrl || !cfg.apiKey) {
    return { ok: false, reason: 'unconfigured' };
  }

  const dataUrl = imageBase64.startsWith('data:')
    ? imageBase64
    : `data:${mimeType};base64,${imageBase64}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetchImpl(cfg.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: cfg.model || 'gpt-4o-mini',
        temperature: 0.2,
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content:
              'You estimate meal macros from a photo. Reply JSON only: {"name":"string≤80","protein":g,"cals":kcal,"carbs":g,"fat":g,"confidence":0-1}. No medical advice.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Estimate this meal macros.' },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
    });

    const zdr = parseZeroDataRetentionHeader(res.headers.get('x-zero-data-retention'));
    if (cfg.requireZdr && zdr === false) {
      return { ok: false, reason: 'zdr_inactive', status: res.status };
    }
    if (!res.ok) {
      return { ok: false, reason: 'http_error', status: res.status };
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? '';
    const estimate = parseMealVisionJson(content);
    if (!estimate) return { ok: false, reason: 'parse' };
    return { ok: true, estimate, zeroDataRetention: zdr };
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      return { ok: false, reason: 'timeout' };
    }
    return { ok: false, reason: 'network' };
  } finally {
    clearTimeout(timer);
  }
}
