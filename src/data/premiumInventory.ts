/**
 * Client-safe premium inventory counts (server content stays in server-only modules).
 * Keep numbers in sync when adding premium Mind/Move sessions.
 */

import { PREMIUM_RECIPE_COUNT } from '@/data/recipes/catalogMeta';

export const PREMIUM_MIND_SESSION_COUNT = 48;
export const PREMIUM_MOVE_FLOW_COUNT = 48;
export const PREMIUM_LEARN_SECTION_COUNT = 16;

export { PREMIUM_RECIPE_COUNT };

export const PREMIUM_INVENTORY = {
  recipes: PREMIUM_RECIPE_COUNT,
  mindSessions: PREMIUM_MIND_SESSION_COUNT,
  moveFlows: PREMIUM_MOVE_FLOW_COUNT,
  learnSections: PREMIUM_LEARN_SECTION_COUNT,
} as const;
