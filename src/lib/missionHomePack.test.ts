/**
 * Program 67 Mission HOME pack — README sections exist, pack stays public-safe.
 *
 * Discover `mission-home/*.md` rather than a silent four-file list. A new
 * unreviewed file fails until this set names it; a stale name fails when the
 * file is gone. Refuse tokens stay out of the pack (ClearShot only in Refuse).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..');
const packDir = path.join(root, 'mission-home');

const REVIEWED = new Set([
  'INDEX.md',
  'README.md',
  'REDNOTE_SHIWO.md',
  'MATERIALS.md',
  'SEARCH_SEEDS.md',
]);

const README_HEADINGS = [
  '## What this is',
  '## Refuse',
  '## Coffee fuel wall',
  '## Spiral stair',
  '## Island',
  '## Library',
  '## Shoe closet',
  '## Sliding wardrobe',
] as const;

const BANNED = ['paymentUrl', 'tip-promote'] as const;
const BANNED_HOST = /https?:\/\/|\/checkout\b|\bstripe\.com\b|\bpaypal\.com\b|\bshopify\b|\baffiliate\b/i;
const CHECKOUT_PRICE = /\$\s*\d/;

function packMarkdown(): string[] {
  return readdirSync(packDir)
    .filter((f) => f.endsWith('.md'))
    .sort();
}

function readPack(file: string): string {
  return readFileSync(path.join(packDir, file), 'utf8');
}

function refuseBody(src: string): string {
  const start = src.search(/^## Refuse\b/m);
  assert.notEqual(start, -1, 'ClearShot requires a ## Refuse section');
  const after = src.slice(start);
  const next = after.slice(3).search(/^## /m);
  return next === -1 ? after : after.slice(0, next + 3);
}

test('mission-home markdown set is reviewed (discover, do not silently allow)', () => {
  const found = packMarkdown();
  for (const file of found) {
    assert.ok(
      REVIEWED.has(file),
      `unreviewed pack file ${file} — name it in REVIEWED or drop it`
    );
  }
  for (const file of REVIEWED) {
    assert.ok(found.includes(file), `reviewed pack file missing: ${file}`);
  }
});

test('README.md carries the loft room headings', () => {
  const src = readPack('README.md');
  for (const heading of README_HEADINGS) {
    assert.ok(src.includes(heading), `README.md missing ${heading}`);
  }
});

test('pack files stay public-safe (no checkout, no invented prices)', () => {
  for (const file of packMarkdown()) {
    const src = readPack(file);
    for (const token of BANNED) {
      assert.ok(!src.includes(token), `${file} contains banned token ${token}`);
    }
    assert.doesNotMatch(src, BANNED_HOST, `${file} contains a checkout / http host`);
    assert.doesNotMatch(src, CHECKOUT_PRICE, `${file} invents a checkout price`);

    const shots = src.split('ClearShot');
    if (shots.length > 1) {
      const refuse = refuseBody(src);
      assert.equal(
        shots.length - 1,
        refuse.split('ClearShot').length - 1,
        `${file}: ClearShot may appear only inside ## Refuse`
      );
    }
  }
});
