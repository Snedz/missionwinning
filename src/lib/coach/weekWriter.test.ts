/**
 * Mission Coach is the only week writer.
 *
 * docs/IA_SKELETON.md WEEK loop: own logs → /coach → generateWeek.
 * Join / Builder / Garage must not mint a week. Discover callers rather
 * than listing them — a fourth writer under a name that says "only
 * useCoachPlan" is the recurring defect.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(path.join(root, dir));
  } catch {
    return out;
  }
  for (const name of entries) {
    const rel = `${dir}/${name}`;
    const st = statSync(path.join(root, rel));
    if (st.isDirectory()) {
      if (name === 'node_modules' || name === 'dist') continue;
      walk(rel, out);
    } else if (/\.(ts|tsx)$/.test(name) && !/\.(test|routetest)\.(ts|tsx)$/.test(name)) {
      out.push(rel);
    }
  }
  return out;
}

const PRODUCT = [
  ...walk('src'),
  ...walk('app'),
  ...walk('packages/mw-core/src'),
];

const CALL = /\bgenerateWeek\s*\(/;
const DEFINITION = /export\s+function\s+generateWeek\s*\(/;

/** The definition, and the one product door that may call it. */
const WEEK_WRITER_ALLOW = new Set(['src/lib/coach/planEngine.ts', 'src/hooks/useCoachPlan.ts']);

test('generateWeek is only called from useCoachPlan in product source', () => {
  const callers: string[] = [];
  let sawDefinition = false;
  let sawDoor = false;

  for (const file of PRODUCT) {
    const src = readFileSync(path.join(root, file), 'utf8');
    if (DEFINITION.test(src)) {
      sawDefinition = true;
      assert.equal(file, 'src/lib/coach/planEngine.ts', `generateWeek definition moved to ${file}`);
    }
    if (!CALL.test(src)) continue;
    const withoutDef = src.replace(DEFINITION, '');
    if (!CALL.test(withoutDef)) continue;
    if (!WEEK_WRITER_ALLOW.has(file)) callers.push(file);
    if (file === 'src/hooks/useCoachPlan.ts') sawDoor = true;
  }

  assert.ok(sawDefinition, 'generateWeek definition was not found — the scan drifted');
  assert.ok(sawDoor, 'useCoachPlan no longer calls generateWeek — the door moved');
  assert.deepEqual(
    callers,
    [],
    `WEEK loop: Mission Coach is the only week writer. Extra callers:\n${callers.join('\n')}`
  );
});

test('week-writer allowlist still exists', () => {
  for (const file of WEEK_WRITER_ALLOW) {
    assert.ok(
      PRODUCT.includes(file),
      `${file} is on the week-writer allowlist but missing from the product walk`
    );
  }
});
