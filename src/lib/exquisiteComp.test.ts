/**
 * The overnight cinematic comp must open with no build, real doors, and the CTA pack.
 * docs/design/WWW_NIGHT.md
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', '..');
const html = readFileSync(path.join(root, 'docs/design/concepts/05-exquisite.html'), 'utf8');

test('05-exquisite is a self-contained HTML document', () => {
  assert.match(html, /<!DOCTYPE html>/i);
  assert.match(html, /<h1[^>]*>Log a set\./);
  assert.doesNotMatch(html, /href="#"/);
  assert.match(html, /href="\/private"/);
  assert.match(html, /href="\/"/);
});

test('05-exquisite carries the gated CTA pack and refuses invite-only', () => {
  assert.match(html, /Free beta/);
  assert.match(html, /Enter with code/);
  assert.match(html, /Get notified/);
  assert.doesNotMatch(html, /invite-only/i);
  assert.doesNotMatch(html, /Get an invite/i);
  assert.doesNotMatch(html, /we're live/i);
});

test('05-exquisite inlines the real MW mark and spends one poster red on Log set', () => {
  assert.match(html, /viewBox="0 0 1000 1000"/);
  assert.match(html, /class="poster"[^>]*>Log set/);
  const posterCount = [...html.matchAll(/class="poster"/g)].length;
  assert.equal(posterCount, 1, `expected one poster control in source, found ${posterCount}`);
});

test('05-exquisite JS-off still has the week instrument and the door forms', () => {
  assert.match(html, /is-rewritten/);
  assert.match(html, /Hotel/);
  assert.match(html, /action="\/private"/);
  assert.match(html, /<noscript>|<button type="button" class="poster"/);
});
