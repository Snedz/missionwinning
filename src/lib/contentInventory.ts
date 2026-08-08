/**
 * Client-safe Super Bundle content floors — single place for UI honesty + tests.
 * Premium session bodies stay server-only; counts live in premiumInventory / catalogMeta.
 */

import { MOBILITY_FLOWS } from '@/data/mobilityFlows';
import { GUIDED_MIND_SESSIONS } from '@/data/guidedMindSessions';
import {
  FREE_RECIPE_COUNT,
  PREMIUM_RECIPE_COUNT,
} from '@/data/recipes/catalogMeta';
import {
  PREMIUM_LEARN_SECTION_COUNT,
  PREMIUM_MIND_SESSION_COUNT,
  PREMIUM_MOVE_FLOW_COUNT,
  PREMIUM_INVENTORY,
} from '@/data/premiumInventory';
import { FORM_PACK_SIDE_IDS, FORM_PACK_VIDEO_IDS } from '@/lib/formMedia';

/**
 * The floors now live in `contentFloors.ts` — a literal with no imports — so a
 * module that only needs to *state* a count does not have to value-import the
 * catalogs above to get one. Re-exported here so existing call sites are
 * unchanged. See that file for why the split exists.
 */
export { CONTENT_FLOORS } from '@/lib/contentFloors';

export type ContentInventory = {
  move: { free: number; premium: number };
  mind: { free: number; premium: number };
  recipes: { free: number; premium: number };
  learn: { premiumSections: number };
  formPack: { side: number; video: number };
  /** Combined free+premium usable under FREE_BETA unlock. */
  unlockedTotal: {
    move: number;
    mind: number;
    recipes: number;
  };
};

export function getContentInventory(): ContentInventory {
  const moveFree = MOBILITY_FLOWS.length;
  const mindFree = GUIDED_MIND_SESSIONS.length;
  const recipesFree = FREE_RECIPE_COUNT;
  const movePremium = PREMIUM_MOVE_FLOW_COUNT;
  const mindPremium = PREMIUM_MIND_SESSION_COUNT;
  const recipesPremium = PREMIUM_RECIPE_COUNT;
  const learnPremium = PREMIUM_LEARN_SECTION_COUNT;
  const formSide = FORM_PACK_SIDE_IDS.size;
  const formVideo = FORM_PACK_VIDEO_IDS.size;

  return {
    move: { free: moveFree, premium: movePremium },
    mind: { free: mindFree, premium: mindPremium },
    recipes: { free: recipesFree, premium: recipesPremium },
    learn: { premiumSections: learnPremium },
    formPack: { side: formSide, video: formVideo },
    unlockedTotal: {
      move: moveFree + movePremium,
      mind: mindFree + mindPremium,
      recipes: recipesFree + recipesPremium,
    },
  };
}

/** True when inventory object matches the named premium constants (drift guard). */
export function premiumInventoryIsConsistent(): boolean {
  return (
    PREMIUM_INVENTORY.moveFlows === PREMIUM_MOVE_FLOW_COUNT &&
    PREMIUM_INVENTORY.mindSessions === PREMIUM_MIND_SESSION_COUNT &&
    PREMIUM_INVENTORY.recipes === PREMIUM_RECIPE_COUNT &&
    PREMIUM_INVENTORY.learnSections === PREMIUM_LEARN_SECTION_COUNT
  );
}

export function flowTotalDurationSec(steps: { durationSec: number }[]): number {
  return steps.reduce((s, step) => s + (Number(step.durationSec) || 0), 0);
}
