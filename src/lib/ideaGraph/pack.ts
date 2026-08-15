/**
 * What a spawn is allowed to read.
 *
 * A context window is not a memory system. Accuracy degrades non-uniformly well
 * before the stated limit — measured across eighteen frontier models — and the
 * sharpest mechanism is distractor interference: semantically similar but
 * irrelevant content actively misleads rather than merely diluting. An idea
 * archive is *made of* near-duplicates, so handing the whole graph to a
 * translator makes it worse at translating, not just slower.
 *
 * So no role ever loads `docs/mechanics/`. It runs `npm run idea:pack <class>`
 * and reads what comes back: every constraint (small, fixed, and the part that
 * must never be missing), the target behaviour, that behaviour's one-hop
 * mechanics, and the anti-library. The bound is mechanical rather than a
 * sentence in a prompt asking an agent to be brief.
 *
 * The decision-relevant material goes last, which is both where attention
 * research wants it and where prompt caching wants it. The two constraints
 * happily agree.
 */

import path from 'node:path';
import { readFileSync } from 'node:fs';
import { readAntiLibrary, type GraphNode, type LoadedGraph } from './load.ts';
import type { BehaviorClass } from './schema.ts';

/**
 * A pack over this size has stopped being a pack. The number is a judgement,
 * stated here so it can be argued with rather than discovered by an agent
 * quietly running out of room.
 */
export const MAX_PACK_BYTES = 24_000;

export interface Pack {
  behaviorClass: BehaviorClass;
  text: string;
  bytes: number;
  overBudget: boolean;
  included: string[];
}

function summarise(node: GraphNode): string {
  const fm = node.fm;
  const lines = [`### ${node.id} — ${fm.title}`, `_${node.file}_`, ''];
  for (const [k, v] of Object.entries(fm)) {
    if (k === 'id' || k === 'type' || k === 'title') continue;
    if (typeof v === 'string') lines.push(`- **${k}:** ${v}`);
    else if (Array.isArray(v)) {
      lines.push(
        `- **${k}:** ` +
          v.map((e) => (typeof e === 'string' ? e : Object.entries(e).map(([a, b]) => `${a}=${b}`).join(' '))).join(' · ')
      );
    } else lines.push(`- **${k}:** ` + Object.entries(v).map(([a, b]) => `${a}=${b}`).join(' · '));
  }
  return lines.join('\n');
}

export function buildPack(root: string, graph: LoadedGraph, behaviorClass: BehaviorClass): Pack {
  const included: string[] = [];
  const sections: string[] = [];

  // 1. Constraints — all of them, first, because a role that has not read the
  //    constitution cannot propose inside it.
  const constraints = graph.nodes.filter((n) => n.type === 'constraint');
  sections.push('## Constraints — every candidate is checked against all of these\n');
  for (const c of constraints) {
    sections.push(`- **${c.id}** ${c.fm.rule} — enforced by \`${c.fm.enforcer}\``);
    included.push(c.id);
  }

  // 2. The anti-library — what is already dead, and what may never be cited.
  const anti = readAntiLibrary(root);
  sections.push('\n## Anti-library — do not re-propose, do not cite\n');
  for (const a of anti) sections.push(`- \`${a.fingerprint}\` — ${a.reason}`);

  // 3. The target behaviours on this axis.
  const behaviors = graph.nodes.filter((n) => n.type === 'behavior' && n.fm.behavior_class === behaviorClass);
  sections.push(`\n## Behaviours on the \`${behaviorClass}\` axis\n`);
  for (const b of behaviors) {
    sections.push(summarise(b));
    included.push(b.id);
  }

  // 4. One hop: mechanics that produce one of those behaviours. One hop, not
  //    two — the second hop is where a pack stops being retrieval and becomes
  //    the whole graph again.
  const wanted = new Set(behaviors.map((b) => b.id));
  const mechanics = graph.nodes.filter(
    (n) => n.type === 'mechanic' && Array.isArray(n.fm.produces) && (n.fm.produces as string[]).some((p) => wanted.has(p))
  );
  sections.push('\n## Mechanics one hop away\n');
  for (const m of mechanics) {
    sections.push(summarise(m));
    included.push(m.id);
  }

  // 5. Hypotheses already standing against these behaviours, so a translator
  //    proposes something new rather than re-deriving what is on the table.
  const existing = graph.nodes.filter((n) => n.type === 'hypothesis' && wanted.has(n.fm.targets as string));
  sections.push('\n## Already proposed on this axis\n');
  for (const h of existing) {
    sections.push(`- **${h.id}** (${h.fm.status}) ${h.fm.one_line}`);
    included.push(h.id);
  }

  // 6. Verdicts that settle those hypotheses, or campaign lessons on this
  //    axis's already-proposed ids. A pack that cannot see what the last loop
  //    learned will re-propose it.
  const wantedH = new Set(existing.map((h) => h.id));
  const verdicts = graph.nodes.filter((n) => {
    if (n.type !== 'verdict') return false;
    if (typeof n.fm.settles === 'string' && wantedH.has(n.fm.settles)) return true;
    return typeof n.fm.campaign === 'string';
  });
  if (verdicts.length > 0) {
    sections.push('\n## Lessons from closed loops\n');
    for (const v of verdicts) {
      const subject = (v.fm.campaign as string | undefined) ?? (v.fm.settles as string | undefined) ?? v.id;
      sections.push(`- **${v.id}** ${subject} · ${v.fm.outcome} — ${v.fm.learned}`);
      included.push(v.id);
    }
  }

  const text = sections.join('\n');
  const bytes = Buffer.byteLength(text, 'utf8');
  return { behaviorClass, text, bytes, overBudget: bytes > MAX_PACK_BYTES, included };
}

/** The protocol file, which every role reads before the pack. Read, not restated. */
export function protocolPath(root: string): string {
  return path.join(root, 'docs/IDEA_LOOP.md');
}

export function protocolStopRules(root: string): string[] {
  const src = readFileSync(protocolPath(root), 'utf8');
  const at = src.indexOf('## Stop rules');
  if (at === -1) return [];
  const end = src.indexOf('\n## ', at + 4);
  return src
    .slice(at, end === -1 ? undefined : end)
    .split('\n')
    .filter((l) => l.startsWith('- '));
}
