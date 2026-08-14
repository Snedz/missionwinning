import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { COACH_AGENT_TOOLS } from '@/lib/coach/agent/tools';
import {
  COACH_MCP_PROTOCOL_VERSION,
  handleCoachMcp,
  toMcpToolList,
} from '@/lib/coach/agent/mcp';
import type { CoachAgentWorld } from '@/lib/coach/agent/types';

const world: CoachAgentWorld = {
  logFacts: [],
  weekSessions: [],
  loadZone: 'unknown',
  trainDays14: 0,
};

describe('handleCoachMcp', () => {
  it('initializes, lists the same tools as the registry, and calls one', () => {
    const init = handleCoachMcp({ jsonrpc: '2.0', id: 1, method: 'initialize' }, world);
    assert.equal(init.error, undefined);
    const info = init.result as { protocolVersion: string; serverInfo: { name: string } };
    assert.equal(info.protocolVersion, COACH_MCP_PROTOCOL_VERSION);
    assert.equal(info.serverInfo.name, 'mission-winning-coach');

    const listed = handleCoachMcp({ jsonrpc: '2.0', id: 2, method: 'tools/list' }, world);
    const tools = (listed.result as { tools: { name: string }[] }).tools;
    assert.deepEqual(
      tools.map((t) => t.name),
      COACH_AGENT_TOOLS.map((t) => t.name)
    );
    assert.deepEqual(
      toMcpToolList().map((t) => t.name),
      tools.map((t) => t.name)
    );

    const call = handleCoachMcp(
      {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: { name: 'cite_last_log', arguments: {} },
      },
      world
    );
    const body = call.result as { content: { type: string; text: string }[]; isError: boolean };
    assert.equal(body.isError, false);
    assert.match(body.content[0]!.text, /No sets logged yet/);
  });

  it('rejects bad jsonrpc, unknown methods, and a call without a name', () => {
    const bad = handleCoachMcp({ jsonrpc: '1.0' as '2.0', id: 1, method: 'initialize' }, world);
    assert.equal(bad.error?.code, -32600);
    const unknown = handleCoachMcp({ jsonrpc: '2.0', id: 2, method: 'prompts/list' }, world);
    assert.equal(unknown.error?.code, -32601);
    const noName = handleCoachMcp({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: {} }, world);
    assert.equal(noName.error?.code, -32602);
  });
});

describe('agent folder stays a closed tool set', () => {
  it('every agent module is one of the known files — a stray file is a new concern', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const files = readdirSync(dir).filter((f) => f.endsWith('.ts')).sort();
    assert.deepEqual(files, [
      'corpus.test.ts',
      'corpus.ts',
      'facts.test.ts',
      'facts.ts',
      'mcp.test.ts',
      'mcp.ts',
      'react.test.ts',
      'react.ts',
      'retrieve.test.ts',
      'retrieve.ts',
      'tools.test.ts',
      'tools.ts',
      'types.ts',
    ]);
  });
});
