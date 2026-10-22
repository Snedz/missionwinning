/**
 * Gate-off `/` leads with the door the hero spec measures.
 *
 * `.1159` replaced that first screen with the forge sheet. The hero spec
 * still requires the door, and it did not run while the bundle budget
 * failed first. The sheet stays in the document; it is not the h1.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

test('the landing leads with the door, then the forge sheet', () => {
  const landing = read('src/page-components/LandingPage.tsx');
  const door = read('src/page-components/LandingDoor.tsx');
  const doorAt = landing.indexOf('<LandingDoor />');
  const sheetAt = landing.indexOf('className={`${s.root}');
  assert.ok(doorAt !== -1, 'LandingPage must mount LandingDoor');
  assert.ok(sheetAt !== -1 && doorAt < sheetAt, 'the door is the first screen');
  assert.match(door, /footerTagline/);
  assert.match(door, /defaultValue: 'Log a set\. Offline\.'/);
  assert.match(door, /href="\/welcome"/);
  assert.match(door, /house-btn house-btn-primary/);
  assert.match(door, /className="polish-shot"/);
  assert.match(door, /landingHeroLine1/);
  assert.match(door, /defaultValue: 'Log a set\.'/);
  assert.doesNotMatch(door, /primary-action/);
  assert.doesNotMatch(landing, /<h1 className=\{s\.heroTitle\}/);
  assert.match(landing, /<h2 className=\{s\.heroTitle\}/);
});
