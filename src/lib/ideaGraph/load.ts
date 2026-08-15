/**
 * Discovery, not enumeration.
 *
 * Every reader in this folder finds nodes by walking `docs/mechanics/` and
 * fails on an **unreviewed file**, never by consulting a list of the files
 * someone remembered to add. A name that claims a scope wider than its
 * enumeration is this repo's recurring defect (`.220`), and an idea graph is
 * exactly the kind of tree that grows a file nobody wires up.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { parseFrontMatter, type FrontMatter } from './parse.ts';
import { ID_PATTERN, ID_PREFIX, NODE_TYPES, type NodeType } from './schema.ts';

export const GRAPH_DIR = 'docs/mechanics';

/** Folders under `docs/mechanics/` that hold nodes, keyed by the type they hold. */
export const NODE_DIRS: Record<string, NodeType> = {
  behaviors: 'behavior',
  mechanics: 'mechanic',
  hypotheses: 'hypothesis',
  verdicts: 'verdict',
  constraints: 'constraint',
};

/**
 * Files under `docs/mechanics/` that are *not* nodes, each with a reason.
 *
 * An exemption list rather than a pattern list, deliberately: a pattern is
 * silent about what it misses, while leaving a file out of the graph becomes
 * something a reviewer can disagree with. `.255` is the entry that taught this.
 */
export const NOT_A_NODE: Record<string, string> = {
  'INDEX.md': 'folder index — routing, not a node',
  'ANTILIBRARY.md': 'killed ideas and unciteable claims; one line each, not node shape',
  'LEDGER.md': 'per-run cost and yield accounting',
  'README.md': 'inbox instructions',
};

export interface GraphNode {
  id: string;
  type: NodeType;
  file: string;
  fm: FrontMatter;
  body: string;
}

export interface LoadedGraph {
  nodes: GraphNode[];
  byId: Map<string, GraphNode>;
  /** Files that live under a node folder and could not be read as nodes. */
  problems: string[];
  /** Every file walked, node or not — so a guard can assert the walk reached the tree. */
  filesSeen: string[];
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.md')) out.push(full);
  }
  return out;
}

export function loadGraph(root: string): LoadedGraph {
  const base = path.join(root, GRAPH_DIR);
  const nodes: GraphNode[] = [];
  const problems: string[] = [];
  const filesSeen: string[] = [];

  let files: string[];
  try {
    files = walk(base);
  } catch {
    return { nodes: [], byId: new Map(), problems: [`${GRAPH_DIR} does not exist`], filesSeen: [] };
  }

  for (const full of files) {
    const rel = path.relative(root, full).split(path.sep).join('/');
    filesSeen.push(rel);

    const parts = rel.split('/');
    const folder = parts[2]; // docs / mechanics / <folder> / ...
    const basename = parts[parts.length - 1];

    // `inbox/` holds raw observations. They are not nodes and must not become
    // nodes without an anatomist pass, so they are skipped rather than parsed.
    if (folder === 'inbox') continue;
    if (parts.length === 3 && NOT_A_NODE[basename]) continue;

    const expected = folder ? NODE_DIRS[folder] : undefined;
    if (!expected) {
      problems.push(
        `${rel} is under ${GRAPH_DIR} but not in a node folder (${Object.keys(NODE_DIRS).join(', ')}) ` +
          `and not exempted in NOT_A_NODE — add it to one or the other, do not leave it unreviewed`
      );
      continue;
    }

    let fm: FrontMatter;
    let body: string;
    try {
      const src = readFileSync(full, 'utf8');
      fm = parseFrontMatter(src, rel);
      body = src.slice(src.indexOf('\n---', 3) + 4);
    } catch (err) {
      problems.push(err instanceof Error ? err.message : String(err));
      continue;
    }

    const id = typeof fm.id === 'string' ? fm.id : '';
    const type = typeof fm.type === 'string' ? fm.type : '';
    if (!NODE_TYPES.includes(type as NodeType)) {
      problems.push(`${rel} declares type \`${type}\`, which is not a node type`);
      continue;
    }
    if (type !== expected) {
      problems.push(`${rel} declares type \`${type}\` but sits in \`${folder}/\` (holds \`${expected}\`)`);
      continue;
    }
    const m = ID_PATTERN.exec(id);
    if (!m) {
      problems.push(`${rel} has id \`${id}\`, which is not \`${ID_PREFIX[expected]}-NN\``);
      continue;
    }
    if (m[1] !== ID_PREFIX[expected]) {
      problems.push(`${rel} id \`${id}\` carries the wrong letter for a ${expected} (want ${ID_PREFIX[expected]}-)`);
      continue;
    }

    nodes.push({ id, type: type as NodeType, file: rel, fm, body });
  }

  const byId = new Map<string, GraphNode>();
  for (const n of nodes) {
    if (byId.has(n.id)) {
      problems.push(`${n.id} is declared twice: ${byId.get(n.id)!.file} and ${n.file}`);
      continue;
    }
    byId.set(n.id, n);
  }

  return { nodes, byId, problems, filesSeen };
}

export function nodesOfType(graph: LoadedGraph, type: NodeType): GraphNode[] {
  return graph.nodes.filter((n) => n.type === type);
}

/** Read the anti-library's fingerprint lines. Kept small enough to always load. */
export function readAntiLibrary(root: string): { fingerprint: string; reason: string; line: number }[] {
  const file = path.join(root, GRAPH_DIR, 'ANTILIBRARY.md');
  let src: string;
  try {
    src = readFileSync(file, 'utf8');
  } catch {
    return [];
  }
  const out: { fingerprint: string; reason: string; line: number }[] = [];
  src.split('\n').forEach((raw, i) => {
    // `| fingerprint | why | citation |`
    if (!raw.startsWith('| `')) return;
    const cells = raw.split('|').map((c) => c.trim());
    if (cells.length < 4) return;
    const fingerprint = cells[1].replace(/`/g, '').trim();
    if (fingerprint.length === 0) return;
    out.push({ fingerprint, reason: cells[2], line: i + 1 });
  });
  return out;
}
