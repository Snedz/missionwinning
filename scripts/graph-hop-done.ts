#!/usr/bin/env npx tsx
/**
 * Mechanical hop closer. The agent's last message is not done.
 *
 * Fails unless HOP.md names the live GRAPH_LOOP ticket, done_means and accept
 * are filled, accept exits 0, and (when app paths moved) the build-label check
 * passes. Never writes GRAPH_LOOP.md — the `done` edit is still the baton.
 *
 * Run: npm run harness:done
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseQueue } from '../src/lib/loopQueue/parse.ts';
import { route } from '../src/lib/loopQueue/route.ts';
import {
  hopMatchesTicket,
  isHopParseFail,
  readHop,
} from '../src/lib/loopQueue/hop.ts';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const QUEUE = 'docs/GRAPH_LOOP.md';

function fail(msg: string): never {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

function git(...args: string[]): string {
  const r = spawnSync('git', args, { encoding: 'utf8', cwd: root });
  return r.status === 0 ? (r.stdout ?? '').trim() : '';
}

function touchesApp(names: string): boolean {
  return names.split('\n').some((f) => /^(src|app|scripts|supabase)\//.test(f));
}

const hop = readHop(root);
if (isHopParseFail(hop)) fail(hop.error);

let src: string;
try {
  src = readFileSync(path.join(root, QUEUE), 'utf8');
} catch {
  fail(`cannot read ${QUEUE}`);
}

const queue = parseQueue(src, QUEUE);
if (queue.problems.length > 0) {
  fail(`${QUEUE} is not decidable:\n  ${queue.problems.join('\n  ')}`);
}

const r = route(root, queue);
const liveId = r.row?.id ?? null;
const mismatch = hopMatchesTicket(hop, liveId);
if (mismatch) fail(mismatch);
if (r.row && r.row.status !== 'open') {
  fail(`${liveId} status is ${r.row.status} — closer does not run on a closed row`);
}

const vsBase = git('diff', '--name-only', 'origin/master...HEAD');
const dirty = [git('diff', '--name-only'), git('diff', '--cached', '--name-only')].join('\n');
const appMoved = touchesApp(vsBase) || touchesApp(dirty);
if (appMoved) {
  const label = spawnSync('node', ['scripts/check-build-label.mjs'], {
    encoding: 'utf8',
    cwd: root,
  });
  if (label.status !== 0) {
    fail(`app paths moved and check-build-label failed\n${label.stdout}${label.stderr}`);
  }
  const head = git('rev-parse', 'HEAD');
  const base = git('rev-parse', 'origin/master') || git('rev-parse', 'master');
  if (head && base && head === base && touchesApp(dirty)) {
    fail('app files changed but the label is not committed yet');
  }
}

console.log(`running accept: ${hop.accept}`);
const accept = spawnSync(hop.accept, { encoding: 'utf8', cwd: root, shell: true });
if (accept.stdout) process.stdout.write(accept.stdout);
if (accept.stderr) process.stderr.write(accept.stderr);
if (accept.status !== 0) {
  fail(`accept exited ${accept.status} — hop is not done`);
}

console.log(`GRAPH_DONE · ${hop.ticket} · accept exit 0`);
