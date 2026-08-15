/**
 * The extraction call: stable prefix first, episode last.
 *
 * This is the thread's config with four corrections, each of which would
 * otherwise fail silently rather than loudly:
 *
 *  - **`effort` is a body field, not a header.** The source config passed
 *    `extra_headers={"effort": "low"}`; unknown headers are ignored, so every
 *    call would have run at the default `high` — inverting the one decision the
 *    whole design rests on, with a correct-looking config and a 5× bill.
 *  - **The prefix must clear 512 tokens on Opus 5.** Below the minimum, caching
 *    does not error — it just does not happen (`cache_creation_input_tokens: 0`).
 *    The source config printed a ~100-token schema while costing it as 600.
 *    `assertCacheablePrefix` makes that a build-time failure instead of a
 *    quiet 10× overspend, and the ontology below is long because it is *useful*,
 *    not to reach a number.
 *  - **Schema enforcement beats schema request.** "Return JSON only" in prose is
 *    the pre-structured-outputs pattern; `output_config.format` constrains
 *    decoding, so a truncated or chatty completion cannot produce unparseable
 *    output.
 *  - **Thinking is on by default on Opus 5**, unlike Opus 4.8/4.7, and
 *    `max_tokens` caps thinking *plus* output. A 2000-token cap on a
 *    long episode truncates mid-object. Kept on at low effort (the documented
 *    preference over disabling, which can leak `<thinking>` into output) with
 *    headroom to match.
 *
 * Ordering is the cache contract: `tools` → `system` → `messages`. Everything
 * invariant lives in `system`; the episode and its `reference_time` go in the
 * user turn, after the breakpoint. One byte of drift in the prefix costs the
 * whole corpus a cache miss, so nothing per-episode may leak upward.
 */

import type { GraphEpisode } from '@/lib/graph/episodes';
import { estimateTokens } from '@/lib/graph/episodes';

export const EXTRACTION_MODEL = 'claude-opus-5';

/** Opus 5 minimum cacheable prefix. 1024 on Opus 4.8, 2048 on 4.7, 4096 on 4.6. */
export const MIN_CACHEABLE_PREFIX_TOKENS = 512;

/**
 * Thinking + visible output share this cap, so it is sized for the long tail of
 * the archive rather than the median entry.
 */
export const EXTRACTION_MAX_TOKENS = 4096;

export const ENTITY_TYPES = [
  'module',
  'guard',
  'defect',
  'fix',
  'convention',
  'ship',
  'doc',
  'surface',
  'tool',
] as const;

export const EDGE_RELATIONS = [
  'introduced',
  'fixed',
  'guards',
  'caused',
  'supersedes',
  'reverted',
  'documented_in',
  'enforced_by',
  'depends_on',
  'rotated_to',
] as const;

/**
 * The stable prefix. Identical on every call, by construction — it interpolates
 * nothing. Read once, cached for the life of the backfill.
 */
export const EXTRACTION_SYSTEM = `You extract a temporal knowledge graph from the development log of one software project (Mission Winning — a Next.js PWA plus a native Android app, built by a solo founder working with AI agents).

Each input is one dated entry from that log: an account of a single shipped change. Your job is to turn it into entities and typed, dated edges that another agent can traverse later instead of re-reading the whole archive.

ENTITY TYPES — use exactly these values for "type":
- module: a code unit named by path or symbol (src/lib/coach/, planEngine.ts, /api/coach/chat)
- guard: an automated check that can fail — a test, a gate step, a lint rule, a CI job
- defect: something that was wrong, including a class of wrongness ("a guard whose name claims more than its enumeration")
- fix: the specific change that addressed a defect
- convention: a durable rule the repo enforces on itself (never call localStorage directly; every cloud write rides the outbox)
- ship: a released build, identified by its label (834, 833) — the entry itself
- doc: a documentation file that carries a rule or a decision
- surface: a user-visible area (Train, Fuel, Coach, Today, the www marketing site, the Android app)
- tool: an external dependency, service, or command the project relies on

EDGE RELATIONS — use exactly these values for "relation":
- introduced: a ship or fix brought an entity into existence
- fixed: a fix resolved a defect
- guards: a guard protects a module, convention, or surface
- caused: one thing produced another (a defect caused an outage; a convention caused a constraint)
- supersedes: a newer entity replaces an older one
- reverted: work that was undone, with what replaced it
- documented_in: a rule or decision is written down in a doc
- enforced_by: a convention is checked by a specific guard
- depends_on: one module or tool requires another
- rotated_to: content moved from an active file to an archive file

RULES
- Use canonical names. The same module must get the same name everywhere: prefer the repo-relative path when the entry gives one (src/lib/sync/outbox.ts), otherwise the exact symbol or file name as written. Resolve obvious aliases to one form: "the outbox", "outbox.ts" and "src/lib/sync/outbox.ts" are one entity. Do not invent paths that the entry does not contain.
- Build labels are entities of type "ship" and their name is the bare number, without the leading dot: 834, not ".834".
- Every edge must be supported by the text. Never infer a relationship because it is plausible for a project of this kind. If the entry says a guard was added but does not say what it protects, emit the guard entity and no "guards" edge.
- valid_from is the date the entry describes, in YYYY-MM-DD form. Default it to the reference_time given in the user turn. Only use a different date when the entry explicitly names one ("the defect shipped on 2026-07-22").
- Descriptions are one sentence, factual, and drawn from the entry. They exist so a later reader knows what the node is without opening the source. Do not editorialise and do not restate the name.
- Prefer fewer, well-supported nodes over many speculative ones. An entry that ships one copy change is two or three entities, not fifteen. The archive is large; precision is what makes it traversable.
- This log documents a fitness product. It contains no personal data about its users and you must not synthesise any. If an entry appears to contain a credential, an API key, or a token, ignore that text entirely and extract nothing from it.`;

/**
 * Structured-output schema. `additionalProperties: false` plus `required` on
 * every object is a hard requirement of strict decoding; numeric and length
 * constraints are unsupported and deliberately absent.
 */
export const GRAPH_SCHEMA = {
  type: 'object',
  properties: {
    entities: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          type: { type: 'string', enum: [...ENTITY_TYPES] },
          description: { type: 'string' },
        },
        required: ['name', 'type', 'description'],
        additionalProperties: false,
      },
    },
    edges: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source: { type: 'string' },
          target: { type: 'string' },
          relation: { type: 'string', enum: [...EDGE_RELATIONS] },
          valid_from: { type: 'string' },
        },
        required: ['source', 'target', 'relation', 'valid_from'],
        additionalProperties: false,
      },
    },
  },
  required: ['entities', 'edges'],
  additionalProperties: false,
} as const;

/**
 * Fails the build when the prefix drops below the cacheable minimum.
 *
 * Called from the ingest script before a single request is sent, and asserted in
 * the colocated test. The estimate is deliberately conservative (~4 chars per
 * token): being wrong in the direction of "we thought it was too short" costs
 * nothing, being wrong the other way costs 10× on every episode with no signal.
 */
export function assertCacheablePrefix(prefix: string = EXTRACTION_SYSTEM): number {
  const tokens = estimateTokens(prefix);
  if (tokens < MIN_CACHEABLE_PREFIX_TOKENS) {
    throw new Error(
      `Extraction prefix is ~${tokens} tokens, below the ${MIN_CACHEABLE_PREFIX_TOKENS}-token ` +
        `minimum for ${EXTRACTION_MODEL}. Prompt caching would silently not happen and every ` +
        `episode would bill at full input rate. Lengthen the ontology or drop the cache_control.`
    );
  }
  return tokens;
}

/** The user turn: reference_time first, then the episode. Never cached. */
export function buildExtractionUserContent(episode: GraphEpisode): string {
  return [
    `reference_time: ${episode.referenceTime}`,
    `source: ${episode.source}`,
    episode.label ? `ship: ${episode.label}` : '',
    '',
    `# ${episode.title}`,
    '',
    episode.body,
  ]
    .filter((l) => l !== '')
    .join('\n');
}

/**
 * One Messages-API request body. Shared verbatim by the batch and single paths —
 * a second copy for batching is how the two drift and the cached prefix stops
 * matching.
 */
export function buildExtractionRequest(episode: GraphEpisode): Record<string, unknown> {
  return {
    model: EXTRACTION_MODEL,
    max_tokens: EXTRACTION_MAX_TOKENS,
    system: [
      {
        type: 'text',
        text: EXTRACTION_SYSTEM,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: buildExtractionUserContent(episode) }],
    output_config: {
      effort: 'low',
      format: { type: 'json_schema', schema: GRAPH_SCHEMA },
    },
  };
}
