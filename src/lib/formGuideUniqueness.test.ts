/**
 * Form-guide SVGs must be distinct poses — not relabeled template clones.
 *
 * Expansion batch (pre-T0) shipped several near-identical stick figures with
 * only phase labels changed (e.g. bicep-curl ≈ face-pull). Mid-set that reads
 * as unfinished. The defect class is **shared geometry with different labels**,
 * so the guard compares geometry after stripping text / title / aria / colour
 * tokens — exact equality is the clone signal.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const dir = path.join(root, 'public', 'form-guides');

/**
 * Geometry fingerprint: labels and brand colour hexes removed so a "clone with
 * different phase names" still collides. Whitespace collapsed.
 */
export function geometryFingerprint(svg: string): string {
  return svg
    .replace(/<text[\s\S]*?<\/text>/g, '')
    .replace(/<title>[\s\S]*?<\/title>/g, '')
    .replace(/aria-label="[^"]*"/g, '')
    .replace(/#[0-9a-fA-F]{6}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Pose numbers only (circles + lines, skip ground y=185). For near-clone soft check. */
export function poseNumberSequence(svg: string): number[] {
  const out: number[] = [];
  for (const m of svg.matchAll(/<(circle|line)([^/>]*)\/?>/g)) {
    const attrs = m[2];
    if (/y1="185"/.test(attrs) && /y2="185"/.test(attrs)) continue;
    for (const n of attrs.matchAll(/="([\d.]+)"/g)) {
      out.push(Math.round(Number(n[1])));
    }
  }
  return out;
}

/** Dice on adjacent number pairs — high only when pose coords nearly match. */
export function poseDice(a: number[], b: number[]): number {
  if (a.length < 2 || b.length < 2) return 0;
  const bag = (nums: number[]) => {
    const s = new Set<string>();
    for (let i = 0; i < nums.length - 1; i += 1) s.add(`${nums[i]},${nums[i + 1]}`);
    return s;
  };
  const A = bag(a);
  const B = bag(b);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter += 1;
  return (2 * inter) / (A.size + B.size);
}

/**
 * Soft near-clone threshold on pose number pairs.
 * Gold push-ups vs deadlift sits ~0.2; true template twins sit ~1.0.
 * 0.92 catches "moved one joint by 2px" clones without flagging distinct lifts.
 */
export const POSE_CLONE_THRESHOLD = 0.92;

test('form guides do not share geometry fingerprints (label-only clones)', () => {
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.svg'))
    .sort();
  assert.ok(files.length >= 20, `expected ≥20 form guides, found ${files.length}`);

  const byFp = new Map<string, string[]>();
  for (const f of files) {
    const fp = geometryFingerprint(readFileSync(path.join(dir, f), 'utf8'));
    assert.ok(fp.length > 80, `${f}: fingerprint too short — walker/strip broke`);
    const list = byFp.get(fp) ?? [];
    list.push(f);
    byFp.set(fp, list);
  }

  const clones = [...byFp.values()]
    .filter((g) => g.length > 1)
    .map((g) => g.join(' ≡ '));

  assert.deepEqual(
    clones,
    [],
    'form guides share geometry (only labels differ) — redraw so each movement is unmistakable:\n  ' +
      clones.join('\n  ')
  );
});

test('form guides do not share near-identical pose number sequences', () => {
  const files = readdirSync(dir)
    .filter((f) => f.endsWith('.svg'))
    .sort();
  const poses = files.map((f) => ({
    f,
    nums: poseNumberSequence(readFileSync(path.join(dir, f), 'utf8')),
  }));

  const near: string[] = [];
  for (let i = 0; i < poses.length; i += 1) {
    for (let j = i + 1; j < poses.length; j += 1) {
      const s = poseDice(poses[i].nums, poses[j].nums);
      if (s >= POSE_CLONE_THRESHOLD) {
        near.push(`${poses[i].f} ≈ ${poses[j].f} (pose dice ${s.toFixed(3)})`);
      }
    }
  }

  assert.deepEqual(
    near,
    [],
    'form guides share near-identical joint coordinates:\n  ' + near.join('\n  ')
  );
});

test('every form guide has a11y title and role=img', () => {
  const files = readdirSync(dir).filter((f) => f.endsWith('.svg'));
  const problems: string[] = [];
  for (const f of files) {
    const svg = readFileSync(path.join(dir, f), 'utf8');
    if (!/role="img"/.test(svg)) problems.push(`${f}: missing role="img"`);
    if (!/<title>/.test(svg)) problems.push(`${f}: missing <title>`);
    if (!/aria-label=/.test(svg)) problems.push(`${f}: missing aria-label`);
  }
  assert.deepEqual(problems, [], problems.join('\n'));
});

test('gold pair is not a clone under poseDice (threshold sanity)', () => {
  const push = poseNumberSequence(readFileSync(path.join(dir, 'push-ups.svg'), 'utf8'));
  const dead = poseNumberSequence(readFileSync(path.join(dir, 'deadlift.svg'), 'utf8'));
  const s = poseDice(push, dead);
  assert.ok(
    s < POSE_CLONE_THRESHOLD,
    `push-ups vs deadlift pose dice ${s.toFixed(3)} — threshold too aggressive`
  );
  assert.ok(poseDice(push, push) === 1, 'poseDice must be reflexive');
});
