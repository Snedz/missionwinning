import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Today first paint is Lean Summary with the phone measure', () => {
  const home = readFileSync('src/page-components/HomePage.tsx', 'utf8');
  assert.match(home, /<HomeTodayLean\s*\/>/);
  const lean = readFileSync('src/page-components/HomeTodayLean.tsx', 'utf8');
  assert.match(
    lean,
    /max-w-lg md:max-w-none/,
    'Summary must lift the phone cap at md+ like the retired loading shell'
  );
});
