/**
 * The vocabulary. This file is the reason the graph cannot record a feature.
 *
 * ## Why a fixed ontology instead of free text
 *
 * Gartner's 2012 read on why gamification programmes failed was not a number,
 * it was a mechanism: teams copied *points, badges, leaderboards* — the visible
 * surface — and dropped the economy underneath. That is the same failure as
 * `.220` one layer out: a thing named for a scope wider than what it actually
 * captures.
 *
 * So a MECHANIC is never stored as prose. It is stored as a configuration of
 * `PRIMITIVES` below. In this vocabulary **"add badges" is unwritable.** The
 * nearest legal node is
 *
 *     visible-status ladder · trigger=completion · visibility=public
 *     · precondition=population-n · reversibility=no · forgiveness=no
 *
 * and that node's `precondition` fails this product's arithmetic on sight,
 * because the population is zero. Most social mechanics get refused here on
 * **arithmetic, not ideology**, which is the property worth having: a refusal
 * anyone can check beats a refusal anyone can argue with.
 *
 * ## Naming trap
 *
 * What this file calls a **MECHANIC** is MDA's *dynamic*, not MDA's *mechanic*.
 * Stories-the-feature is the skin. "Lowered creation pressure + attendance
 * receipts + a cheap reply channel" is the node. Mining at the wrong layer is
 * exactly the cargo-cult failure above. See root `INDEX.md` §Phase naming trap.
 *
 * The two-stage split — a fixed component ontology, kept separate from the
 * catalogue of patterns expressed in it — is Björk & Holopainen's structure for
 * game-design patterns, and it is what lets two mechanics from unrelated
 * products be compared at all.
 */

export const NODE_TYPES = ['behavior', 'mechanic', 'hypothesis', 'verdict', 'constraint'] as const;
export type NodeType = (typeof NODE_TYPES)[number];

/** `B-01`, `M-03`, `H-07`, `V-02`, `X-01`. The letter carries the type. */
export const ID_PREFIX: Record<NodeType, string> = {
  behavior: 'B',
  mechanic: 'M',
  hypothesis: 'H',
  verdict: 'V',
  constraint: 'X',
};

export const ID_PATTERN = /^([BMHVX])-(\d{2,})$/;

/* ------------------------------------------------------------------ *
 * Behavioural primitives — the whole ontology, closed on purpose.      *
 * ------------------------------------------------------------------ */

export const PRIMITIVES = {
  /** What starts it. */
  trigger: ['calendar', 'completion', 'absence', 'state-change', 'social', 'none'],
  /** Effort the user spends to emit. Stories worked by moving this down. */
  cost_to_produce: ['low', 'med', 'high'],
  /** Who can see the result. */
  visibility: ['private', 'self-only', 'witnessed-by-one', 'public'],
  /** Does it place an obligation on another party. */
  reciprocity: ['yes', 'no'],
  /** How long the artifact survives. */
  durability: ['ephemeral', 'session', 'durable-record'],
  /**
   * Can the athlete pause or undo it. This is the SDT autonomy axis, and it is
   * the one that predicts backfire: a mechanic that raises engagement while
   * removing autonomy reads as a win on daily actives and a loss at 90 days.
   */
  reversibility: ['yes', 'no'],
  /**
   * Is there an insurance or pause mechanism. a streak league's streak works because
   * it can be *protected*; a streak clone without a freeze is the canonical
   * surface-level copy.
   */
  forgiveness: ['yes', 'no'],
  /**
   * Which direction is "good". Whoop's Strain is calibrated against Recovery,
   * so the winning move is sometimes to rest. A metric whose optimum is not
   * `more` is the structural defence against a shame loop in a health product.
   */
  optimum_direction: ['more', 'less', 'personal-band'],
  /**
   * What must already be true for it to work at all. a streak league's leagues need a
   * population; a bike-class app's leaderboard needs concurrency; Strava's kudos need a
   * club. Cargo-culting always drops this field, which is why it is required.
   */
  precondition: ['population-n', 'concurrency', 'social-graph', 'existing-habit', 'none'],
} as const;

export type PrimitiveName = keyof typeof PRIMITIVES;
export const PRIMITIVE_NAMES = Object.keys(PRIMITIVES) as PrimitiveName[];

/* ------------------------------------------------------------------ *
 * Archive axes. The selector keeps one elite per cell.                 *
 * ------------------------------------------------------------------ */

/** Behaviours this product can want more of. Not a funnel; an axis. */
export const BEHAVIOR_CLASSES = ['activate', 'return', 'trust', 'depth', 'tell', 'pay'] as const;
export type BehaviorClass = (typeof BEHAVIOR_CLASSES)[number];

/**
 * `remove` and `measure` are cells, not afterthoughts. A generator with no
 * subtraction operator grows monotonically — Brooks' second system, with
 * infinite patience and no memory of the first system's pain.
 */
export const MOVE_CLASSES = ['add', 'change', 'remove', 'measure'] as const;
export type MoveClass = (typeof MOVE_CLASSES)[number];

export const COST_CLASSES = ['S', 'M', 'L'] as const;
export type CostClass = (typeof COST_CLASSES)[number];

/* ------------------------------------------------------------------ *
 * Evidence. The anti-fabrication rule, as a type.                      *
 * ------------------------------------------------------------------ */

/**
 * `E0` observed here · `E1` documented elsewhere · `E2` reported · `E3` inferred.
 *
 * A claim may never be written up one class stronger than it is. With no users
 * `E0` is nearly empty, and that is the honest state — `docs/METRICS.md` already
 * says *"We do not invent traction"*, and this is the same rule applied to
 * ideas rather than to numbers.
 */
export const EVIDENCE_CLASSES = ['E0', 'E1', 'E2', 'E3'] as const;
export type EvidenceClass = (typeof EVIDENCE_CLASSES)[number];

/**
 * How the source was actually obtained.
 *
 * `fetched` — the page was opened and read.
 * `indexed` — only a search engine's synthesis of the page was seen.
 *
 * This field exists because the first real harvest ran with every `WebFetch`
 * blocked by the egress proxy. Three scouts produced roughly forty citations
 * with correct URLs and plausible dates, and **not one page had been opened.**
 *
 * A URL nobody read is not a documented claim, so `E1` now requires `fetched`
 * and the whole first batch landed as `E2`. The point is not to be pious about
 * it — it is that the upgrade path becomes mechanical: open the page, flip the
 * field, and only then may the class rise. Without the field, "we'll verify
 * those later" is a promise, and promises are what `X-07` exists to replace.
 */
export const RETRIEVALS = ['fetched', 'indexed'] as const;
export type Retrieval = (typeof RETRIEVALS)[number];

/** Classes strong enough to kill a hypothesis or to pass one. */
export const DECIDING_EVIDENCE: readonly EvidenceClass[] = ['E0', 'E1'];

/* ------------------------------------------------------------------ *
 * Bars. Reused verbatim from GAUNTLET_LOOP §3 rather than re-invented. *
 * ------------------------------------------------------------------ */

/**
 * A hypothesis' instrument must be one of the four kinds the gauntlet already
 * declares legal. There is no fifth species of bar, and inventing one here
 * would put two answers in the repo for one question (`.178`).
 */
export const BAR_KINDS = ['existing-instrument', 'new-ratchet', 'reference-capture', 'founder-result'] as const;
export type BarKind = (typeof BAR_KINDS)[number];

/**
 * Ratchets a hypothesis may name in `ratchets_touched`. Every one is read out
 * of source by `validate.ts` — this list is the set of *names*, never the set
 * of values. A spec that restates `TAP_BUDGET = 5` is a second home for it.
 */
export const RATCHETS: Record<string, { file: string; pattern: RegExp }> = {
  TAP_BUDGET: { file: 'tests/e2e/first-90.spec.ts', pattern: /const TAP_BUDGET = (\d+)/ },
  REACH_BUDGET: { file: 'tests/e2e/mobile-nav.spec.ts', pattern: /const REACH_BUDGET = (\d+)/ },
  TODAY_MAX_TOP_LEVEL_BLOCKS: {
    file: 'src/lib/today/todayBlockBudget.ts',
    pattern: /TODAY_MAX_TOP_LEVEL_BLOCKS = (\d+)/,
  },
  MAX_FIRST_PAINT_COPY_DRIFT: {
    file: 'src/lib/firstPaintFloor.test.ts',
    pattern: /MAX_FIRST_PAINT_COPY_DRIFT = (\d+)/,
  },
  MAX_UNCOVERED_KEYS: { file: 'scripts/i18n-coverage.ts', pattern: /MAX_UNCOVERED_KEYS = (\d+)/ },
  MAX_ACCEPTED_HIGH: { file: 'scripts/security-audit.mjs', pattern: /MAX_ACCEPTED_HIGH = (\d+)/ },
};

/** How a hypothesis proposes to move a ratchet. `raise` is auto-killed. */
export const RATCHET_DIRECTIONS = ['hold', 'lower', 'raise'] as const;
export type RatchetDirection = (typeof RATCHET_DIRECTIONS)[number];

/* ------------------------------------------------------------------ *
 * Node shapes.                                                         *
 * ------------------------------------------------------------------ */

export type FieldKind = 'scalar' | 'list' | 'map' | 'map-list';

export interface FieldSpec {
  kind: FieldKind;
  required: boolean;
  /** Closed vocabulary for a scalar, when there is one. */
  oneOf?: readonly string[];
}

export const COMMON_FIELDS: Record<string, FieldSpec> = {
  id: { kind: 'scalar', required: true },
  type: { kind: 'scalar', required: true, oneOf: NODE_TYPES },
  title: { kind: 'scalar', required: true },
};

export const FIELDS: Record<NodeType, Record<string, FieldSpec>> = {
  behavior: {
    ...COMMON_FIELDS,
    /** Which archive axis this behaviour sits on. */
    behavior_class: { kind: 'scalar', required: true, oneOf: BEHAVIOR_CLASSES },
    /** What would show that it happened, named from the existing event union. */
    observable: { kind: 'scalar', required: true },
    /** `live` when it can be measured today; `blocked-on-telemetry` when it cannot. */
    measurable: { kind: 'scalar', required: true, oneOf: ['live', 'blocked-on-telemetry', 'never'] },
    source: { kind: 'list', required: true },
  },
  mechanic: {
    ...COMMON_FIELDS,
    primitives: { kind: 'map', required: true },
    seen_in: { kind: 'map-list', required: true },
    /**
     * Required, and the reason is Rosenzweig. "Mine successful companies for
     * their mechanics" is *Connecting the Winning Dots* — the halo delusion
     * with extra steps. Threads, Quibi, Wave and Google+ all had mechanics too.
     * A mechanic that shows up in winners *and* losers is table stakes or
     * noise, and cannot be told apart from a working one without this field.
     */
    also_seen_in_failures: { kind: 'list', required: true },
    produces: { kind: 'list', required: true },
    /** Documented harm. The negative edge is worth as much as the positive. */
    backfires: { kind: 'map-list', required: false },
  },
  hypothesis: {
    ...COMMON_FIELDS,
    one_line: { kind: 'scalar', required: true },
    targets: { kind: 'scalar', required: true },
    translates: { kind: 'scalar', required: true },
    /**
     * What this deletes or replaces. **Mandatory, no exceptions.** Apple's
     * "innovation is saying no to a thousand things" as a schema constraint
     * rather than a virtue — a virtue does not fail a build.
     */
    removes: { kind: 'scalar', required: true },
    move_class: { kind: 'scalar', required: true, oneOf: MOVE_CLASSES },
    cost_class: { kind: 'scalar', required: true, oneOf: COST_CLASSES },
    smallest_test: { kind: 'scalar', required: true },
    bar_kind: { kind: 'scalar', required: true, oneOf: BAR_KINDS },
    instrument: { kind: 'scalar', required: true },
    kill_criterion: { kind: 'scalar', required: true },
    /**
     * The paired metric that gets *worse* if the mechanic turns coercive.
     * Facebook's 2018 "Meaningful Social Interactions" re-rank is the case:
     * a well-meant composite metric met an optimizer and the angry reaction
     * carried five times the weight of a like. A lone engagement number in a
     * fitness product converges on streak anxiety, which is the one mechanic
     * class with peer-reviewed evidence of harm.
     */
    guardrail: { kind: 'scalar', required: true },
    reversibility: { kind: 'scalar', required: true },
    preconditions_hold: { kind: 'map', required: true },
    ratchets_touched: { kind: 'map', required: false },
    status: {
      kind: 'scalar',
      required: true,
      oneOf: ['candidate', 'emitted', 'already-true', 'blocked-on-telemetry', 'killed'],
    },
    violates: { kind: 'list', required: false },
  },
  verdict: {
    ...COMMON_FIELDS,
    /**
     * The hypothesis this settles, when the loop was an `H-NN`. Optional when
     * `campaign` is set — a gauntlet is not a hypothesis, and pretending GNT-2
     * settled H-07 is how a ledger starts lying.
     */
    settles: { kind: 'scalar', required: false },
    /** `GNT-n` when the loop was a campaign. Optional when `settles` is set. */
    campaign: { kind: 'scalar', required: false },
    outcome: { kind: 'scalar', required: true, oneOf: ['pass', 'fail', 'already-true', 'abandoned'] },
    evidence: { kind: 'scalar', required: true },
    learned: { kind: 'scalar', required: true },
  },
  constraint: {
    ...COMMON_FIELDS,
    rule: { kind: 'scalar', required: true },
    /**
     * The file that makes this constraint fail a build. A constraint with no
     * live enforcer is prose, and prose is what "Do not invent X2" was.
     */
    enforcer: { kind: 'scalar', required: true },
    /** A string that must appear in the enforcer, so a rename cannot orphan it. */
    enforcer_anchor: { kind: 'scalar', required: true },
    authority: { kind: 'scalar', required: true },
  },
};
