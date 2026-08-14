/**
 * The Super Bundle content floors, alone, with no imports.
 *
 * These numbers were already the single source of truth — but they lived in
 * `contentInventory.ts`, which value-imports `MOBILITY_FLOWS`,
 * `GUIDED_MIND_SESSIONS`, the recipe catalog meta and `formMedia`. Anything that
 * only wanted to *state a count* had to pull that whole graph, so the honest
 * option (derive) cost bundle weight and the cheap option (retype the number by
 * hand) cost accuracy. `payments.ts` took the cheap one and drifted: it
 * advertised 40 free recipes against 48, 102+ premium against 110, 24 mobility
 * flows against 32, 40 premium flows against 48, and 24 mind sessions against
 * 32 — every one of them *understating* shipped content, on the page whose job
 * is to say what the Bundle contains.
 *
 * `/log` and `/active` are over the gzip budget today, so the fix cannot be "import
 * the catalogs from the pricing module". Hence this file: a literal, importable
 * from anywhere for free. `contentInventory.ts` re-exports it, so every existing
 * `import { CONTENT_FLOORS } from '@/lib/contentInventory'` keeps working.
 *
 * **Floors, not actuals — deliberately.** `contentInventory.test.ts` asserts
 * `actual >= floor` for every row, so copy written from these numbers can only
 * ever under-promise. Raising a floor is a deliberate edit that the same test
 * has to agree with.
 */

/** Depth plan D1 floors (see .hermes/plans/*super-bundle-depth*). Current = shipped floor. */
export const CONTENT_FLOORS = {
  moveFree: 32,
  movePremium: 48,
  mindFree: 32,
  mindPremium: 60,
  recipesFree: 48,
  recipesPremium: 110,
  learnPremiumSections: 24,
  /**
   * Free guidebook chapters (`BEYOND_THE_BASICS_CHAPTERS`), which is also exactly
   * how many `/guide/*` URLs the sitemap emits — `app/sitemap.ts:86` maps the array.
   *
   * Enforced in `contentInventory.test.ts` rather than by `getContentInventory()`,
   * on purpose: `chapters.ts` is ~29 KB of prose already reaching every route
   * through `guidebookProgress`, and putting it behind an inventory getter that
   * client code imports would entrench that. A test-only import costs nothing in
   * the bundle and still fails if the array and this number diverge.
   */
  guidebookFreeChapters: 6,
  /**
   * Public `/exercises/<id>` pages — the deduped catalog after
   * `ensureFullExerciseCatalog()` (126 base + 99 extended + 30 volume 2 = 254 raw,
   * 26 ids shared, 228 unique). `app/sitemap.ts:33` awaits the splice before
   * mapping, so this is the page count and not just an array length.
   *
   * `compareStories.ts` advertised **217** in four places. The comment in
   * `app/sitemap.ts:25-31` records the *other* direction of this same bug — the
   * sitemap once claimed 219 URLs while only 126 were prerendered, because it read
   * the catalog without awaiting. Same fact, three numbers, two files.
   */
  exercisePages: 228,
  /** Eyes-on form pack side stills (FORM_PACK_SIDE_IDS). */
  formPackSide: 19,
} as const;
