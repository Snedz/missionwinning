/**
 * local.properties is a laptop file. Release BuildConfig must not read it.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const gradle = readFileSync(
  path.join(import.meta.dirname, '..', '..', 'apps/android/app/build.gradle.kts'),
  'utf8'
);

function blockAfter(marker: string): string {
  const start = gradle.indexOf(marker);
  assert.notEqual(start, -1, marker);
  const open = gradle.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < gradle.length; i++) {
    const ch = gradle[i];
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return gradle
          .slice(open, i + 1)
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/^[ \t]*\/\/.*$/gm, '');
      }
    }
  }
  throw new Error(`unbalanced block after ${marker}`);
}

test('only the debug build type reads local.properties into BuildConfig', () => {
  const defaults = blockAfter('defaultConfig {');
  const release = blockAfter('release {');
  const debug = blockAfter('debug {');

  assert.doesNotMatch(defaults, /local\.properties/);
  assert.doesNotMatch(defaults, /getProperty\(/);
  assert.match(defaults, /https:\/\/www\.missionwinning\.com/);
  assert.match(defaults, /PRIVATE_ACCESS_COOKIE", "\\"/);

  assert.doesNotMatch(release, /local\.properties/);
  assert.doesNotMatch(release, /localProps/);
  assert.doesNotMatch(release, /mw\.apiBaseUrl/);
  assert.doesNotMatch(release, /mw\.privateAccessCookie/);

  assert.match(debug, /local\.properties/);
  assert.match(debug, /mw\.apiBaseUrl/);
  assert.match(debug, /mw\.privateAccessCookie/);
  assert.match(debug, /mw\.supabaseAnonKey/);
  assert.match(debug, /SENTRY_DSN/);
});
