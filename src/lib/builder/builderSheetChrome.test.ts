/**
 * Builder first paint is Blank workout. Templates and sign-in live in Show all.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const page = () =>
  readFileSync(
    path.join(import.meta.dirname, '..', '..', 'page-components', 'BuilderPage.tsx'),
    'utf8'
  );

test('the template house is behind Show all, not on first paint', () => {
  const src = page();
  const jsx = src.slice(src.indexOf('<PillarPageShell'));
  const open = jsx.split('<details')[0];
  assert.doesNotMatch(open, /<ProgramTemplatesPanel\b/, 'templates are on first paint');
  assert.doesNotMatch(open, /builderTemplatesTitle/, 'template wall is on first paint');
  assert.doesNotMatch(open, /<SignInPrompt\b/, 'sign-in is on first paint');
  assert.doesNotMatch(open, /builderNoSaved/, 'empty saved wall is on first paint');
  assert.match(jsx, /<details/);
  assert.match(jsx, /data-testid="builder-show-all"/);
  assert.match(jsx, /<ProgramTemplatesPanel\b/);
  assert.match(jsx, /<SignInPrompt\b/);
});

test('first paint is Blank workout', () => {
  const src = page();
  const jsx = src.slice(src.indexOf('<PillarPageShell'));
  const open = jsx.split('<details')[0];
  assert.match(open, /builderStartBlank/);
  assert.match(open, /primary-action/);
  assert.match(open, /startBlank/);
});
