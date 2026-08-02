/**
 * One reader for "has the first-steps card been dismissed".
 *
 * The card it replaced owned its own dismissal, and `todayGuidanceMount.ts` said
 * so on purpose: *"this answers only may it appear at all, never has it been
 * dismissed — the card owns that, and duplicating it here is how the two answers
 * drift apart."* That reasoning is right about duplication and wrong about cost.
 *
 * The block is declared `pinned`, and `planTodayBlocks` computes
 * `room = max - pinned.length` from the **candidate list**, not from what each
 * candidate renders. So a card that returns `null` still consumes a pinned slot,
 * and an athlete who dismissed the banner once loses one top-level Today block
 * to it **forever** — the budget spent on a component that draws nothing. The
 * screen gets shorter by exactly the card the budget was protecting.
 *
 * The fix is not to duplicate the check. It is to have one definition with two
 * callers: the card asks so it can hide, the mount site asks so it never
 * declares. `.178` — a value that decides two things lives in one place.
 */

import { readRaw } from '@/lib/storage/safeStorage';

/**
 * Deliberately **not** `mw_beta_banner_dismissed`. An athlete who dismissed the
 * old prose banner months ago did not thereby decline a checklist that did not
 * exist, and reusing that key would silently hide the new card from every
 * existing install — the cohort it is most useful to. The old key is left in
 * place, unread; nothing is gained by deleting a value off someone's device.
 */
export const FIRST_STEPS_DISMISS_KEY = 'mw_first_steps_dismissed';

/**
 * Device-local, like every other reading position in this app — a dismissal is
 * not data. Returns `false` on the server so the block is declared during SSR
 * and the client can retract it, rather than popping in after hydration.
 */
export function isFirstStepsDismissed(): boolean {
  return readRaw(FIRST_STEPS_DISMISS_KEY) === '1';
}
