/**
 * MCP JSON-RPC surface over the same coach tool registry.
 *
 * This is the protocol layer (initialize / tools/list / tools/call), not a
 * network server. A future stdio host can wrap handleCoachMcp without a
 * second tool list. Athlete data stays in the world the caller passed —
 * this module does not read storage or open sockets.
 */

import { COACH_AGENT_TOOLS, dispatchCoachTool } from '@/lib/coach/agent/tools';
import type { CoachAgentWorld, CoachToolSpec } from '@/lib/coach/agent/types';

export const COACH_MCP_PROTOCOL_VERSION = '2024-11-05';
export const COACH_MCP_SERVER_INFO = {
  name: 'mission-winning-coach',
  version: '1.0.0',
} as const;

export type CoachMcpId = string | number | null;

export type CoachMcpRequest = {
  jsonrpc: '2.0';
  id?: CoachMcpId;
  method: string;
  params?: unknown;
};

export type CoachMcpError = {
  code: number;
  message: string;
};

export type CoachMcpResponse = {
  jsonrpc: '2.0';
  id: CoachMcpId;
  result?: unknown;
  error?: CoachMcpError;
};

export function toMcpToolList(tools: readonly CoachToolSpec[] = COACH_AGENT_TOOLS): {
  name: string;
  description: string;
  inputSchema: CoachToolSpec['inputSchema'];
}[] {
  return tools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function handleCoachMcp(
  request: CoachMcpRequest,
  world: CoachAgentWorld
): CoachMcpResponse {
  const id = request.id ?? null;
  if (request.jsonrpc !== '2.0') {
    return { jsonrpc: '2.0', id, error: { code: -32600, message: 'jsonrpc must be 2.0' } };
  }

  switch (request.method) {
    case 'initialize':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: COACH_MCP_PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: COACH_MCP_SERVER_INFO,
        },
      };
    case 'notifications/initialized':
      return { jsonrpc: '2.0', id, result: {} };
    case 'tools/list':
      return { jsonrpc: '2.0', id, result: { tools: toMcpToolList() } };
    case 'tools/call': {
      const params = isRecord(request.params) ? request.params : {};
      const name = typeof params.name === 'string' ? params.name : '';
      const args = isRecord(params.arguments) ? params.arguments : {};
      if (!name) {
        return { jsonrpc: '2.0', id, error: { code: -32602, message: 'tools/call needs name' } };
      }
      const result = dispatchCoachTool(name, args, world);
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: result.observation }],
          isError: !result.ok,
        },
      };
    }
    default:
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Unknown method: ${request.method}` },
      };
  }
}
