import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  PREMIUM_INVENTORY,
  PREMIUM_MIND_SESSION_COUNT,
  PREMIUM_MOVE_FLOW_COUNT,
} from '@/data/premiumInventory';
import { FREE_RECIPE_COUNT, PREMIUM_RECIPE_COUNT } from '@/data/recipes/catalogMeta';
import { FREE_RECIPES } from '@/data/recipes/freeRecipes';

function countIdFields(relativePath: string): number {
  const abs = join(process.cwd(), relativePath);
  const src = readFileSync(abs, 'utf8');
  // Prefer id: '...' object entries in session/flow arrays
  const matches = src.match(/\bid:\s*['"][a-z0-9-]+['"]/g);
  return matches?.length ?? 0;
}

function countRecipeNames(relativePath: string): number {
  const abs = join(process.cwd(), relativePath);
  const src = readFileSync(abs, 'utf8');
  return (src.match(/"name":\s*"/g) || []).length;
}

/**
 * Standing advertised-vs-actual guard (reads sources as text to avoid server-only).
 */
describe('contentInventory honesty', () => {
  it('free recipe count matches FREE_RECIPES length', () => {
    assert.equal(FREE_RECIPES.length, FREE_RECIPE_COUNT);
    assert.equal(FREE_RECIPE_COUNT, 20);
  });

  it('premium recipe count matches premiumRecipes data', () => {
    const n = countRecipeNames('src/data/recipes/premiumRecipes.ts');
    assert.equal(n, PREMIUM_RECIPE_COUNT);
    assert.equal(PREMIUM_INVENTORY.recipes, PREMIUM_RECIPE_COUNT);
  });

  it('mind session inventory matches data file', () => {
    const n = countIdFields('src/data/premiumMindSessions.ts');
    assert.equal(n, PREMIUM_MIND_SESSION_COUNT);
    assert.equal(PREMIUM_INVENTORY.mindSessions, n);
    assert.equal(n, 22);
  });

  it('move flow inventory matches data file', () => {
    const n = countIdFields('src/data/premiumMobilityFlows.ts');
    assert.equal(n, PREMIUM_MOVE_FLOW_COUNT);
    assert.equal(PREMIUM_INVENTORY.moveFlows, n);
    assert.equal(n, 18);
  });
});
