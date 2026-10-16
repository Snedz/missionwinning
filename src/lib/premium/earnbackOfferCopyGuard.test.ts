/**
 * Tests for earn-back offer copy guard.
 *
 * Verifies:
 * - Detection of "free" variants
 * - Brand name "Mission Winning" is never flagged
 * - Detection of "win" and "prize" variants
 * - Partial-word过滤 (window, freedom, wink not matched)
 * - Edge cases: empty string, non-string input
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  findRiskyOfferWords,
  offerCopyIsClean,
  type CopyFinding,
} from './earnbackOfferCopyGuard.ts';

test('FREE detected with correct index', () => {
  const text = "It's FREE now";
  const findings = findRiskyOfferWords(text);

  assert.strictEqual(findings.length, 1, 'should find one risky word');
  const finding: CopyFinding = findings[0];
  assert.strictEqual(finding.word, 'free', 'word should be free');
  assert.strictEqual(finding.match, 'FREE', 'match should preserve case');
  assert.strictEqual(finding.index, 5, 'index should point to FREE');
});

test('Mission Winning brand never flagged', () => {
  const text = 'Join Mission Winning today';
  const findings = findRiskyOfferWords(text);

  assert.strictEqual(findings.length, 0, 'brand should not be flagged');
  assert.strictEqual(offerCopyIsClean(text), true, 'copy should be clean');
});

test('win and prize found, brand ignored', () => {
  const text = 'Mission Winning: you could win a prize';
  const findings = findRiskyOfferWords(text);

  assert.strictEqual(findings.length, 2, 'should find two risky words');

  const winFinding = findings.find((f: CopyFinding) => f.word === 'win');
  assert.ok(winFinding !== undefined, 'win should be found');
  assert.strictEqual(winFinding.word, 'win');

  const prizeFinding = findings.find((f: CopyFinding) => f.word === 'prize');
  assert.ok(prizeFinding !== undefined, 'prize should be found');
  assert.strictEqual(prizeFinding.word, 'prize');

  // Verify brand "winning" in "Mission Winning" was ignored
  const brandMatch = findings.find((f: CopyFinding) => f.match.toLowerCase() === 'winning');
  assert.strictEqual(brandMatch, undefined, 'brand winning should not be flagged');
});

test('partial words not matched', () => {
  const text = 'window freedom wink';
  const findings = findRiskyOfferWords(text);

  assert.strictEqual(findings.length, 0, 'partial words should not match');
  assert.strictEqual(offerCopyIsClean(text), true, 'copy should be clean');
});

test('Winners matched as win variant', () => {
  const text = 'Winners get refunds';
  const findings = findRiskyOfferWords(text);

  assert.strictEqual(findings.length, 1, 'should find one risky word');
  assert.strictEqual(findings[0].word, 'win', 'word should be win');
  assert.strictEqual(findings[0].match, 'Winners', 'match should preserve case');
});

test('empty string returns empty array and is clean', () => {
  const findings = findRiskyOfferWords('');
  assert.deepStrictEqual(findings, [], 'empty string should return empty array');
  assert.strictEqual(offerCopyIsClean(''), true, 'empty string should be clean');
});

test('non-string input returns empty array and is clean', () => {
  // @ts-expect-error - intentionally testing non-string input
  const findings = findRiskyOfferWords(null);
  assert.deepStrictEqual(findings, [], 'null should return empty array');
  // @ts-expect-error - intentionally testing non-string input
  assert.strictEqual(offerCopyIsClean(undefined), true, 'undefined should be clean');
});
