/**
 * Live hop contract — `docs/harness/HOP.md`.
 *
 * The queue names the ticket. This file is what a fresh spawn reads after a
 * crash: what this hop is, what done means in one sentence, and the command
 * that is allowed to say so. `npm run harness:done` is the closer. The agent's
 * last message is not.
 *
 * Discover the hop file rather than hardcoding a second path. Zero or two
 * `HOP.md` files under `docs/` is a defect — one fact, one home.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

export const PINNED_MAX_LINES = 40;

export type HopContract = {
  ticket: string;
  doneMeans: string;
  accept: string;
  file: string;
};

export type HopParseFail = { error: string };

export function isHopParseFail(v: object): v is HopParseFail {
  return v !== null && 'error' in v;
}

function walkMdNamed(dir: string, name: string, out: string[]): void {
  if (!existsSync(dir)) return;
  for (const ent of readdirSync(dir)) {
    if (ent.startsWith('.')) continue;
    const full = path.join(dir, ent);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walkMdNamed(full, name, out);
    else if (ent === name) out.push(full);
  }
}

/** Every `HOP.md` under `docs/`. Fail closed if the count is not one. */
export function discoverHopFiles(root: string): string[] {
  const found: string[] = [];
  walkMdNamed(path.join(root, 'docs'), 'HOP.md', found);
  found.sort();
  return found;
}

export function discoverHopFile(root: string): { file: string } | HopParseFail {
  const found = discoverHopFiles(root);
  if (found.length === 0) return { error: 'no HOP.md under docs/ — the live hop has no home' };
  if (found.length > 1) {
    const rel = found.map((f) => path.relative(root, f)).join(', ');
    return { error: `expected one HOP.md under docs/, found ${found.length}: ${rel}` };
  }
  return { file: found[0] };
}

function field(src: string, key: string): string {
  // Spaces/tabs only — `\s*` would eat the newline and swallow the next key.
  const re = new RegExp(`^${key}:[ \\t]*(.*)$`, 'm');
  const m = re.exec(src);
  return (m?.[1] ?? '').trim();
}

export function parseHop(src: string, file = 'docs/harness/HOP.md'): HopContract | HopParseFail {
  const ticket = field(src, 'ticket');
  const doneMeans = field(src, 'done_means');
  const accept = field(src, 'accept');
  if (!ticket) return { error: `${file}: empty ticket — write the hop before claiming it` };
  if (!doneMeans) return { error: `${file}: empty done_means — done is one sentence, written first` };
  if (!accept) return { error: `${file}: empty accept — done is a command, not "looks right"` };
  return { ticket, doneMeans, accept, file };
}

export function readHop(root: string): HopContract | HopParseFail {
  const found = discoverHopFile(root);
  if (isHopParseFail(found)) return found;
  return parseHop(readFileSync(found.file, 'utf8'), path.relative(root, found.file));
}

/** Live ticket from `route()`. Harvest / stalled have none. */
export function hopMatchesTicket(hop: HopContract, liveId: string | null): string | null {
  if (!liveId) {
    return 'no live ticket — harness:done does not close a harvest, a stall, or founder phone';
  }
  if (hop.ticket !== liveId) {
    return `HOP.md ticket ${hop.ticket} ≠ live ticket ${liveId} — stale hop file`;
  }
  return null;
}

export function pinnedLineCount(src: string): number {
  return src.split(/\r?\n/).length;
}
