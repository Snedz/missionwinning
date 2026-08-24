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
  assert.match(html, /<h1[^>]*>Log a set\. Offline\./);
  assert.doesNotMatch(html, /href="#"/);
  assert.match(html, /href="\/private"/);
  assert.match(html, /href="\/"/);
});

test('05-exquisite carries the gated CTA pack and refuses invite-only', () => {
  assert.match(html, />Free</);
  assert.match(html, /Enter with code/);
  assert.match(html, /Get notified/);
  assert.doesNotMatch(html, /invite-only/i);
  assert.doesNotMatch(html, /Get an invite/i);
  assert.doesNotMatch(html, /we're live/i);
  assert.doesNotMatch(html, /Free beta/i);
});

test('05-exquisite nested mission: public line on fold 1, Coach beat, quiet later', () => {
  assert.match(html, /<title>Mission Winning — Log a set\. Offline\./);
  assert.match(html, /<h1[^>]*>Log a set\. Offline\./);
  assert.match(html, /<p class="kicker">Anywhere<\/p>/);
  assert.match(html, /Mission Coach/);
  assert.match(html, /class="later">Mission Winning Health\. Later: an athlete page you author\. Not a feed\./);
  assert.doesNotMatch(html, /Train Anywhere\. Win Daily\./i);
  assert.doesNotMatch(html, /WeChat/i);
  assert.doesNotMatch(html, /mini-program/i);
  assert.doesNotMatch(html, /Fuel · Move · Mind/);
  assert.doesNotMatch(html, /class="scene[^"]*scene-later/);
});

test('05-exquisite SET is a full-viewport field, not a split widget', () => {
  const setStart = html.indexOf('id="set"');
  const anywhereStart = html.indexOf('id="anywhere"');
  const setBlock = html.slice(setStart, anywhereStart);
  assert.match(setBlock, /class="set-field"/);
  assert.doesNotMatch(setBlock, /class="inner"/);
  assert.match(setBlock, /No account\. No wearable\./);
});

test('05-exquisite scene order is SET → ANYWHERE → WEEK → DOOR', () => {
  const set = html.indexOf('id="set"');
  const anywhere = html.indexOf('id="anywhere"');
  const week = html.indexOf('id="week"');
  const door = html.indexOf('id="door"');
  assert.ok(set < anywhere && anywhere < week && week < door, 'expected SET, Anywhere, Week, Door');
});

test('05-exquisite nav is a HUD, not a paper bar', () => {
  assert.match(html, /\.nav \{[^}]*position:\s*fixed/);
  assert.match(html, /\.nav \{[^}]*mix-blend-mode:\s*difference/);
  assert.doesNotMatch(html, /\.nav \{[^}]*border-bottom/);
  assert.doesNotMatch(html, /\.nav \{[^}]*position:\s*sticky/);
  assert.doesNotMatch(html, /nav-word/);
});

test('05-exquisite inlines the real MW mark and spends one poster red on Log set', () => {
  assert.match(html, /viewBox="0 0 1000 1000"/);
  assert.match(html, /class="poster"[^>]*>Log set/);
  const posterCount = [...html.matchAll(/class="poster"/g)].length;
  assert.equal(posterCount, 1, `expected one poster control in source, found ${posterCount}`);
});

test('05-exquisite JS-off still has the authored week and the door forms', () => {
  assert.match(html, /<strong>Miss\.<\/strong>/);
  assert.match(html, /<strong>Travel\.<\/strong>/);
  assert.match(html, /<strong>Band\.<\/strong>/);
  assert.match(html, /action="\/private"/);
  assert.match(html, /<noscript>|<button type="button" class="poster"/);
});

test('05-exquisite N1: type on the still, no fake week engine, poster door', () => {
  assert.match(html, /class="on-photo"/);
  assert.doesNotMatch(html, /class="slab"/);
  assert.doesNotMatch(html, /class="week"/);
  assert.doesNotMatch(html, /is-rewritten/);
  assert.match(html, /\.scene-door \{[^}]*var\(--poster\)/);
  assert.match(html, /class="strip"/);
  const setStart = html.indexOf('id="set"');
  const anywhereStart = html.indexOf('id="anywhere"');
  const setBlock = html.slice(setStart, anywhereStart);
  assert.match(setBlock, /TARGET/);
});
