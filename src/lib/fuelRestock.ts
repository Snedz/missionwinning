/**
 * This week's Fuel restock — a keepable list from the diary they already
 * have, or a messy list they type. Copy / download only. Not a shop.
 */

import { localDateKey, startOfLocalWeek } from '@/lib/time/localDate';
import type { NutritionLogRow } from '@/lib/nutritionQuickLog';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';

export type RestockSource = 'log' | 'typed';

export type RestockItem = {
  name: string;
  times: number;
  source: RestockSource;
};

export type RestockRecipe = {
  name: string;
  ingredients: string;
};

/**
 * Closed set — shop commands, not items. Named so a new filler is a
 * reviewable add, not an open regex that starts eating food words.
 */
const CHECKOUT_FILLER = new Set([
  'get my carts ready',
  'get my cart ready',
  'checkout',
  'check out',
  'place order',
  'order now',
  'you check out',
]);

/**
 * Longest-first. Leading verbs that are not the item. Closed so "get"
 * cannot silently eat a food name unless it is a prefix.
 */
const INTENT_PREFIXES = [
  'i want to order',
  'i need',
  'please get',
  'please buy',
  'order',
  'buy',
  'get',
  'need',
];

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function isCheckoutFiller(value: string): boolean {
  return CHECKOUT_FILLER.has(normalizeKey(value));
}

function stripIntentPrefix(value: string): string {
  const key = normalizeKey(value);
  for (const prefix of INTENT_PREFIXES) {
    if (key === prefix) return '';
    if (key.startsWith(`${prefix} `)) {
      return value.trim().slice(prefix.length).trim();
    }
  }
  return value.trim();
}

function stripPurposeTail(value: string): string {
  return value
    .replace(/\s+for the \w+$/i, '')
    .replace(/\s+for \w+$/i, '')
    .trim();
}

function localDateKeyPlusDays(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  if (!y || !m || !d) return '';
  return localDateKey(new Date(y, m - 1, d + days));
}

export function defaultRestockWeekStart(todayIso: string): string {
  const [y, m, d] = todayIso.split('-').map(Number);
  if (!y || !m || !d) return '';
  return localDateKey(startOfLocalWeek(new Date(y, m - 1, d, 12, 0, 0)));
}

export function rowsThisLocalWeek(
  logs: readonly NutritionLogRow[],
  todayIso: string,
  weekStart: string
): NutritionLogRow[] {
  const weekEnd = localDateKeyPlusDays(weekStart, 6);
  if (!weekStart || !weekEnd) return [];
  return logs.filter((row) => {
    const date = row.date || todayIso;
    return date >= weekStart && date <= weekEnd;
  });
}

export function parseMessyRestockList(text: string): string[] {
  if (!text.trim()) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of text.split(/[,;\n]+/)) {
    const trimmed = raw.trim();
    if (!trimmed || isCheckoutFiller(trimmed)) continue;
    const cleaned = stripPurposeTail(stripIntentPrefix(trimmed));
    if (!cleaned || isCheckoutFiller(cleaned)) continue;
    const key = normalizeKey(cleaned);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(cleaned);
  }
  return out;
}

function splitIngredients(ingredients: string): string[] {
  return ingredients
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function assembleRestockList(opts: {
  logs: readonly NutritionLogRow[];
  todayIso: string;
  weekStart: string;
  typedText?: string;
  recipes?: readonly RestockRecipe[];
}): RestockItem[] {
  const map = new Map<string, RestockItem>();
  const recipeByName = new Map<string, RestockRecipe>();
  for (const recipe of opts.recipes ?? []) {
    const key = normalizeKey(recipe.name);
    if (key) recipeByName.set(key, recipe);
  }

  const add = (name: string, source: RestockSource) => {
    const cleaned = name.trim();
    if (!cleaned || isCheckoutFiller(cleaned)) return;
    const key = normalizeKey(cleaned);
    if (!key) return;
    const prev = map.get(key);
    if (prev) {
      prev.times += 1;
      return;
    }
    map.set(key, { name: cleaned, times: 1, source });
  };

  for (const row of rowsThisLocalWeek(opts.logs, opts.todayIso, opts.weekStart)) {
    const name = (row.name || '').trim();
    if (!name) continue;
    const recipe = recipeByName.get(normalizeKey(name));
    if (recipe) {
      for (const ingredient of splitIngredients(recipe.ingredients)) {
        add(ingredient, 'log');
      }
    } else {
      add(name, 'log');
    }
  }

  for (const line of parseMessyRestockList(opts.typedText ?? '')) {
    add(line, 'typed');
  }

  return [...map.values()];
}

export function formatRestockExport(opts: {
  items: readonly RestockItem[];
  title: string;
  footer: string;
}): string {
  if (opts.items.length === 0) return '';
  const lines = opts.items.map((item, index) => {
    const times = item.times > 1 ? ` ×${item.times}` : '';
    return `${index + 1}. ${item.name}${times}`;
  });
  return [opts.title, ...lines, opts.footer].join('\n');
}

export function loadFuelRestockExtras(): string {
  return readRaw(STORAGE_KEYS.fuelRestockExtras) ?? '';
}

export function saveFuelRestockExtras(text: string): void {
  writeRaw(STORAGE_KEYS.fuelRestockExtras, text);
}
