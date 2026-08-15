#!/usr/bin/env tsx
/**
 * Backfill the development history into graph memory.
 *
 * The corpus is this repo's compaction exhaust: `LOG.md` (≤15 entries by rule),
 * everything rotated to `docs/archive/log/`, and `CONTEXT.md`. Roughly 800 dated
 * `##` sections — the defect classes, reverted fixes and guard rationales that
 * every new session currently re-derives from scratch.
 *
 * Thin by design: parsing, redaction and request-shaping are pure modules under
 * `src/lib/graph/` with colocated tests. This file is IO — argv, filesystem,
 * git, and the Batch API.
 *
 * Run:
 *   npm run graph:ingest -- --dry-run    # no network; writes the exact bodies
 *   npm run graph:ingest -- --limit 5    # small live run; verifies the cache hit
 *   npm run graph:ingest                 # full backfill through the Batch API
 *
 * Batching is the point: a backfill is not time-sensitive, so it takes the 50%
 * Batch discount on top of cache reads. Nothing here runs in the product's
 * request path, so the ZDR one-shot rule governing `src/lib/coach/` (no Files,
 * no Collections, no Batch) does not apply — that rule is about athlete traffic
 * on xAI. This reads the repo's own git-tracked prose.
 */

import Anthropic from '@anthropic-ai/sdk';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { resolve, relative, join } from 'node:path';
import { parseLogEpisodes, estimateTokens, type GraphEpisode } from '@/lib/graph/episodes';
import { admitEpisode, parseGitleaksAllowRegexes } from '@/lib/graph/redact';
import {
  EXTRACTION_MODEL,
  assertCacheablePrefix,
  buildExtractionRequest,
} from '@/lib/graph/extractionPrompt';
import { localDateKey } from '@/lib/time/localDate';

const ROOT = resolve(import.meta.dirname, '..');
const OUT_DIR = resolve(ROOT, '.graph');

/** Sources are an allowlist. Anything else needs a deliberate edit here. */
const SOURCES = ['LOG.md', 'CONTEXT.md', 'docs/archive/log'];

/** Batch ceiling is 100k requests / 256MB; the corpus is ~800. Kept as a guard. */
const MAX_BATCH_REQUESTS = 10_000;

type Args = { dryRun: boolean; limit: number | null };

function parseArgs(argv: string[]): Args {
  let limit: number | null = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] ?? '';
    if (a.startsWith('--limit=')) limit = Number(a.slice('--limit='.length));
    else if (a === '--limit') limit = Number(argv[i + 1]);
  }
  return {
    dryRun: argv.includes('--dry-run'),
    limit: Number.isFinite(limit) && (limit as number) > 0 ? (limit as number) : null,
  };
}

/**
 * Git's own answer, in one subprocess. Per-file `check-ignore` would be ~800
 * spawns. A non-zero exit means nothing matched, which is the common case.
 */
function gitIgnoredSet(paths: string[]): Set<string> {
  if (paths.length === 0) return new Set();
  const r = spawnSync('git', ['check-ignore', '--stdin'], {
    cwd: ROOT,
    input: paths.join('\n'),
    encoding: 'utf8',
  });
  return new Set(
    (r.stdout || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

function collectFiles(): string[] {
  const out: string[] = [];
  for (const src of SOURCES) {
    const abs = resolve(ROOT, src);
    if (!existsSync(abs)) continue;
    if (statSync(abs).isDirectory()) {
      for (const f of readdirSync(abs)) {
        if (f.endsWith('.md')) out.push(relative(ROOT, join(abs, f)));
      }
    } else {
      out.push(src);
    }
  }
  return out.sort();
}

/**
 * `custom_id` is the only join back to the episode — batch results arrive in
 * arbitrary order, so position is never a key. Ids are sanitised to a
 * conservative charset and collisions are impossible by construction (index
 * prefix), with the map carrying the real id.
 */
function batchKey(index: number): string {
  return `ep-${String(index).padStart(5, '0')}`;
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

async function submitBatch(episodes: GraphEpisode[]): Promise<void> {
  const client = new Anthropic();
  const byKey = new Map<string, GraphEpisode>();
  const requests = episodes.map((e, i) => {
    const key = batchKey(i);
    byKey.set(key, e);
    return { custom_id: key, params: buildExtractionRequest(e) as never };
  });

  console.log(`\n  submitting ${requests.length} requests…`);
  const batch = await client.messages.batches.create({ requests });
  console.log(`  batch ${batch.id} — ${batch.processing_status}`);

  let status = batch.processing_status;
  while (status !== 'ended') {
    await sleep(15_000);
    const b = await client.messages.batches.retrieve(batch.id);
    status = b.processing_status;
    const c = b.request_counts;
    console.log(
      `  ${status} — ok ${c.succeeded} · err ${c.errored} · left ${c.processing}`
    );
  }

  const entities: unknown[] = [];
  const edges: unknown[] = [];
  const failures: { id: string; type: string }[] = [];
  let cacheRead = 0;
  let cacheWrite = 0;
  let uncached = 0;
  let output = 0;

  for await (const r of await client.messages.batches.results(batch.id)) {
    const episode = byKey.get(r.custom_id);
    if (r.result.type !== 'succeeded') {
      failures.push({ id: episode?.id ?? r.custom_id, type: r.result.type });
      continue;
    }
    const msg = r.result.message;
    cacheRead += msg.usage.cache_read_input_tokens ?? 0;
    cacheWrite += msg.usage.cache_creation_input_tokens ?? 0;
    uncached += msg.usage.input_tokens ?? 0;
    output += msg.usage.output_tokens ?? 0;

    const text = msg.content.find((b) => b.type === 'text');
    if (!text || text.type !== 'text') {
      failures.push({ id: episode?.id ?? r.custom_id, type: 'no-text-block' });
      continue;
    }
    try {
      const parsed = JSON.parse(text.text) as { entities?: unknown[]; edges?: unknown[] };
      for (const e of parsed.entities ?? []) entities.push({ ...(e as object), episode: episode?.id });
      for (const e of parsed.edges ?? []) edges.push({ ...(e as object), episode: episode?.id });
    } catch {
      // Structured outputs make this near-impossible; if decoding was cut short
      // by max_tokens it can still happen, and a silent drop would leave a hole
      // in the graph nobody notices.
      failures.push({ id: episode?.id ?? r.custom_id, type: 'unparseable-json' });
    }
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const outPath = join(OUT_DIR, 'graph.json');
  writeFileSync(outPath, JSON.stringify({ entities, edges }, null, 2));

  console.log(`\n  entities ${entities.length} · edges ${edges.length}`);
  console.log(`  wrote ${relative(ROOT, outPath)}`);
  console.log(
    `  tokens — cache read ${cacheRead} · cache write ${cacheWrite} · uncached ${uncached} · out ${output}`
  );

  // The whole cost model rests on this number being non-zero. A silent
  // invalidator (a byte of drift in the prefix) shows up here and nowhere else:
  // the run still succeeds, it just costs ~10x. Loud, not fatal — the graph is
  // already built and re-running would cost more than it saves.
  if (requests.length > 1 && cacheRead === 0) {
    console.warn(
      '\n  WARNING: zero cache reads across the batch. The prefix did not cache.\n' +
        '  Check that the system block is byte-identical on every request and clears\n' +
        '  the 512-token minimum. This run billed at roughly 10x the cached rate.'
    );
  }
  if (failures.length > 0) {
    console.warn(`\n  ${failures.length} failed:`);
    for (const f of failures.slice(0, 20)) console.warn(`    ${f.id} — ${f.type}`);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  // Before anything else: if the prefix cannot cache, the cost model is wrong
  // and the run should not start. Throws with the consequence named.
  const prefixTokens = assertCacheablePrefix();

  const gitleaks = resolve(ROOT, '.gitleaks.toml');
  const allow = existsSync(gitleaks)
    ? parseGitleaksAllowRegexes(readFileSync(gitleaks, 'utf8'))
    : [];
  if (allow.length === 0) {
    console.warn('  warn: no placeholder allowlist parsed from .gitleaks.toml — expect noise');
  }

  const files = collectFiles();
  const ignored = gitIgnoredSet(files);

  const admitted: GraphEpisode[] = [];
  const refused: { id: string; reason: string; detail?: string }[] = [];

  for (const file of files) {
    const md = readFileSync(resolve(ROOT, file), 'utf8');
    for (const ep of parseLogEpisodes(file, md)) {
      const verdict = admitEpisode({
        source: ep.source,
        body: ep.body,
        ignored: ignored.has(file),
        allow,
      });
      if (verdict.ok) admitted.push(ep);
      else
        refused.push({
          id: ep.id,
          reason: verdict.reason,
          // Rule names and line numbers only — never the matched text.
          detail: verdict.hits?.map((h) => `${h.rule}:L${h.line}`).join(','),
        });
    }
  }

  const selected = args.limit ? admitted.slice(0, args.limit) : admitted;
  const bodyTokens = selected.reduce((n, e) => n + estimateTokens(e.body), 0);

  console.log(`graph-ingest — ${localDateKey()}`);
  console.log(`  model          ${EXTRACTION_MODEL}`);
  console.log(`  files          ${files.length}`);
  console.log(`  episodes       ${admitted.length} admitted, ${refused.length} refused`);
  console.log(`  selected       ${selected.length}`);
  console.log(`  cached prefix  ~${prefixTokens} tokens/call`);
  console.log(`  episode text   ~${bodyTokens} tokens total`);

  if (refused.length > 0) {
    console.log('  refused:');
    for (const r of refused.slice(0, 20)) {
      console.log(`    ${r.id} — ${r.reason}${r.detail ? ` (${r.detail})` : ''}`);
    }
    if (refused.length > 20) console.log(`    …and ${refused.length - 20} more`);
  }

  if (selected.length === 0) {
    console.error('\n  nothing to ingest.');
    process.exit(1);
  }
  if (selected.length > MAX_BATCH_REQUESTS) {
    console.error(`\n  ${selected.length} exceeds the ${MAX_BATCH_REQUESTS} guard; use --limit.`);
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  if (args.dryRun) {
    const preview = selected.map((e) => ({
      id: e.id,
      referenceTime: e.referenceTime,
      title: e.title,
      request: buildExtractionRequest(e),
    }));
    const path = join(OUT_DIR, 'dry-run.json');
    writeFileSync(path, JSON.stringify(preview, null, 2));
    console.log(`\n  dry run — wrote ${selected.length} request bodies to ${relative(ROOT, path)}`);
    console.log('  no network call was made.');
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('\n  ANTHROPIC_API_KEY is not set. Add it to .env.local (see .env.example).');
    process.exit(1);
  }

  await submitBatch(selected);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
