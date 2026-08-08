/**
 * The Athlete Card's cosmetics — a pure function of tier, deliberately not a table.
 *
 * `.610` — the identity hole. Before this, 1 of 19 profile cards was identity, there
 * was no avatar, no display name on `/profile`, no public profile, and rank and
 * badges lived in `localStorage` where nobody — including a second device — could
 * ever see them. The product had ten ranks and thirteen medallions and no way to
 * wear any of it.
 *
 * **Why there is no unlocks table.** Unlocks are deterministic from tier, so a table
 * would be a denormalized copy of this function that can disagree with it. Storing
 * derived state is how a client comes to own something the rules never granted.
 * `CLUB_PLAN.md`'s invariant is the same idea one level up: *"No client grant API. A
 * client that can insert its own ledger rows can forge its own rank."*
 *
 * **Why the cosmetics are structural, not decorative.** The design system allows no
 * gradients, no glows, no shadows, no rounded corners, and four grays plus three
 * reds — so "customization" cannot mean sparkles. What it can mean is the system's
 * own vocabulary handed out progressively: a hairline becomes a 2px rule becomes a
 * double rule becomes a poster block. The card gets visibly richer without a single
 * off-palette pixel, and — the part that matters operationally — **picks-from-sets
 * has no free text and no uploads, so it is moderation-safe by construction.**
 *
 * Lives in `mw-core` because Android will need the identical mapping, and two
 * implementations of "what has this athlete earned" is exactly the drift this
 * package exists to prevent.
 */

export type CardTier = 1 | 2 | 3 | 4;

export type CardFrameId = 'hairline' | 'rule' | 'double-rule' | 'poster';
export type CardBackdropId = 'paper' | 'grid' | 'rule-field' | 'poster-block';

export interface AthleteCardConfig {
  frame: CardFrameId;
  backdrop: CardBackdropId;
  /** Badge ids the athlete chose to show. Capped by tier; order is theirs. */
  badges: string[];
}

/** The defaults every athlete has from their first session. Never locked. */
export const DEFAULT_CARD_CONFIG: AthleteCardConfig = {
  frame: 'hairline',
  backdrop: 'paper',
  badges: [],
};

const FRAMES_BY_TIER: Record<CardTier, CardFrameId[]> = {
  1: ['hairline'],
  2: ['hairline', 'rule'],
  3: ['hairline', 'rule', 'double-rule'],
  4: ['hairline', 'rule', 'double-rule', 'poster'],
};

const BACKDROPS_BY_TIER: Record<CardTier, CardBackdropId[]> = {
  1: ['paper'],
  2: ['paper', 'grid'],
  3: ['paper', 'grid', 'rule-field'],
  4: ['paper', 'grid', 'rule-field', 'poster-block'],
};

/** How many badges the card will show at each tier — the trophy shelf grows. */
const BADGE_SLOTS_BY_TIER: Record<CardTier, number> = { 1: 1, 2: 2, 3: 3, 4: 4 };

/**
 * Rank level → tier. The ten ranks (Pathfinder … Lifelong) already exist and are
 * already civilian-friendly by design; this groups them rather than inventing a
 * second ladder the athlete would have to learn.
 */
export function tierForLevel(level: number): CardTier {
  if (!Number.isFinite(level) || level < 3) return 1;
  if (level < 6) return 2;
  if (level < 9) return 3;
  return 4;
}

export function unlockedFrames(tier: CardTier): CardFrameId[] {
  return [...FRAMES_BY_TIER[tier]];
}

export function unlockedBackdrops(tier: CardTier): CardBackdropId[] {
  return [...BACKDROPS_BY_TIER[tier]];
}

export function badgeSlots(tier: CardTier): number {
  return BADGE_SLOTS_BY_TIER[tier];
}

/**
 * Clamp a stored config to what the athlete has actually earned.
 *
 * This is the whole security model of a local cosmetic system, and it is why the
 * function exists rather than the component reading `card_config` directly. The
 * config is athlete-editable state — in `localStorage` today, a `jsonb` column the
 * day a card syncs — so it can name a tier-4 frame at tier 1, whether through a
 * demotion that cannot happen, a hand-edited store, or a future bug. Resolution is
 * the one place that question gets answered, and it answers it by **falling back to
 * the earned default, never by rendering the locked pick**.
 *
 * Owned badges are passed in rather than trusted from the config for the same
 * reason: a card may only show a medallion its holder has.
 */
export function resolveCardCosmetics(
  config: Partial<AthleteCardConfig> | null | undefined,
  level: number,
  ownedBadgeIds: readonly string[] = []
): AthleteCardConfig {
  const tier = tierForLevel(level);
  const frames = FRAMES_BY_TIER[tier];
  const backdrops = BACKDROPS_BY_TIER[tier];

  const frame =
    config?.frame && frames.includes(config.frame) ? config.frame : DEFAULT_CARD_CONFIG.frame;
  const backdrop =
    config?.backdrop && backdrops.includes(config.backdrop)
      ? config.backdrop
      : DEFAULT_CARD_CONFIG.backdrop;

  const owned = new Set(ownedBadgeIds);
  const picked = (config?.badges ?? []).filter((id) => owned.has(id));
  // De-dupe before slicing, or a repeated pick spends two shelf slots on one badge.
  const badges = [...new Set(picked)].slice(0, badgeSlots(tier));

  return { frame, backdrop, badges };
}
