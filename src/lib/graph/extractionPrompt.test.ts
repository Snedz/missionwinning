import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  EDGE_RELATIONS,
  ENTITY_TYPES,
  EXTRACTION_MAX_TOKENS,
  EXTRACTION_MODEL,
  EXTRACTION_SYSTEM,
  GRAPH_SCHEMA,
  MIN_CACHEABLE_PREFIX_TOKENS,
  assertCacheablePrefix,
  buildExtractionRequest,
  buildExtractionUserContent,
} from '@/lib/graph/extractionPrompt';
import type { GraphEpisode } from '@/lib/graph/episodes';

const EPISODE: GraphEpisode = {
  id: 'LOG.md#834',
  source: 'LOG.md',
  title: 'Builder arrange matches the pack (`.834`)',
  referenceTime: '2026-08-15',
  label: '834',
  body: 'Arrange first-painted shorter CTAs, then the EN pack. Drift 169 to 167.',
};

describe('cacheable prefix', () => {
  it('clears the Opus 5 minimum — below it, caching silently does not happen', () => {
    const tokens = assertCacheablePrefix();
    assert.ok(
      tokens >= MIN_CACHEABLE_PREFIX_TOKENS,
      `prefix is ~${tokens} tokens, need ${MIN_CACHEABLE_PREFIX_TOKENS}`
    );
  });

  it('throws with the cost consequence named, not a bare assertion', () => {
    assert.throws(
      () => assertCacheablePrefix('too short'),
      /below the 512-token minimum|silently not happen/
    );
  });

  it('interpolates nothing — one byte of drift costs the whole corpus its cache', () => {
    assert.equal(EXTRACTION_SYSTEM, EXTRACTION_SYSTEM.trim());
    assert.ok(!/\$\{/.test(EXTRACTION_SYSTEM), 'no template interpolation in the prefix');
    // Two independent renders must serialise to the same bytes. The cache key is
    // the rendered prefix, so byte-identity — not object identity — is the
    // property under test, and it must hold across different episodes too.
    const a = JSON.stringify(buildExtractionRequest(EPISODE).system);
    const b = JSON.stringify(
      buildExtractionRequest({ ...EPISODE, id: 'x', label: null, body: 'other' }).system
    );
    assert.equal(a, b, 'the prefix must not vary with the episode');
  });
});

describe('buildExtractionRequest', () => {
  it('puts effort in output_config, not a header — the source config got this wrong', () => {
    const body = buildExtractionRequest(EPISODE) as {
      output_config: { effort: string; format: { type: string } };
      extra_headers?: unknown;
    };
    assert.equal(body.output_config.effort, 'low');
    assert.equal(body.extra_headers, undefined, 'effort as a header is silently ignored');
  });

  it('enforces the schema instead of asking for JSON in prose', () => {
    const body = buildExtractionRequest(EPISODE) as {
      output_config: { format: { type: string; schema: unknown } };
    };
    assert.equal(body.output_config.format.type, 'json_schema');
    assert.equal(body.output_config.format.schema, GRAPH_SCHEMA);
    assert.ok(!/return json only/i.test(EXTRACTION_SYSTEM));
  });

  it('marks the system block cacheable and leaves the episode uncached', () => {
    const body = buildExtractionRequest(EPISODE) as {
      system: { text: string; cache_control?: { type: string } }[];
      messages: { role: string; content: string }[];
    };
    assert.equal(body.system[0]?.cache_control?.type, 'ephemeral');
    assert.equal(body.messages[0]?.role, 'user');
    // The variable half must live after the breakpoint, or nothing ever hits.
    assert.match(body.messages[0]?.content ?? '', /2026-08-15/);
    assert.ok(!body.system[0]?.text.includes('2026-08-15'));
  });

  it('pins the model and leaves headroom for thinking, which is on by default', () => {
    const body = buildExtractionRequest(EPISODE) as { model: string; max_tokens: number };
    assert.equal(body.model, EXTRACTION_MODEL);
    assert.equal(body.max_tokens, EXTRACTION_MAX_TOKENS);
    assert.ok(body.max_tokens >= 4096, 'max_tokens caps thinking + output together on Opus 5');
  });
});

describe('buildExtractionUserContent', () => {
  it('leads with reference_time — no timestamp, no temporal graph', () => {
    const content = buildExtractionUserContent(EPISODE);
    assert.ok(content.startsWith('reference_time: 2026-08-15'));
  });

  it('omits the ship line when an entry carries no label', () => {
    const content = buildExtractionUserContent({ ...EPISODE, label: null });
    assert.ok(!/^ship:/m.test(content));
  });
});

describe('GRAPH_SCHEMA', () => {
  it('satisfies strict decoding: additionalProperties false and required everywhere', () => {
    const walk = (node: unknown, path: string): void => {
      if (!node || typeof node !== 'object') return;
      const n = node as Record<string, unknown>;
      if (n.type === 'object') {
        assert.equal(n.additionalProperties, false, `${path} needs additionalProperties:false`);
        assert.ok(Array.isArray(n.required), `${path} needs required`);
        assert.deepEqual(
          [...(n.required as string[])].sort(),
          Object.keys(n.properties as object).sort(),
          `${path}: strict mode requires every property`
        );
      }
      for (const [k, v] of Object.entries(n)) walk(v, `${path}.${k}`);
    };
    walk(GRAPH_SCHEMA, 'root');
  });

  it('carries no unsupported numeric or length constraints', () => {
    const json = JSON.stringify(GRAPH_SCHEMA);
    for (const banned of ['minLength', 'maxLength', 'minimum', 'maximum', 'multipleOf']) {
      assert.ok(!json.includes(banned), `${banned} is not supported by structured outputs`);
    }
  });

  it('the ontology in the schema matches the ontology in the prompt', () => {
    // The prefix teaches the vocabulary and the schema enforces it. If they
    // drift, the model is told to emit values decoding will reject.
    for (const t of ENTITY_TYPES) {
      assert.ok(EXTRACTION_SYSTEM.includes(`- ${t}:`), `entity type ${t} undocumented in prompt`);
    }
    for (const r of EDGE_RELATIONS) {
      assert.ok(EXTRACTION_SYSTEM.includes(`- ${r}:`), `relation ${r} undocumented in prompt`);
    }
  });
});
