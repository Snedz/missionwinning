import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyHarvestPaste,
  incrementSectionId,
  lastHarvestSectionId,
  nextHarvestSectionId,
} from './pasteHarvest.ts';

const stub = `
### Now — AT (harvest · 2026-08-16)

| # | Loop | Moves | Status |
|---|------|-------|--------|
| **IL-H-07** | dose | [H-07](mechanics/hypotheses/H-07.md) | \`done\` |

### After H0 (orientation)

| Horizon | Agent-allowed |
`;

test('AT increments to AU, Z to AA', () => {
  assert.equal(incrementSectionId('AT'), 'AU');
  assert.equal(incrementSectionId('Z'), 'AA');
  assert.equal(incrementSectionId('AZ'), 'BA');
});

test('next harvest section after AT is AU', () => {
  assert.equal(lastHarvestSectionId(stub), 'AT');
  assert.equal(nextHarvestSectionId(stub), 'AU');
});

test('paste inserts one IL- row before After H0 and refuses a second copy', () => {
  const first = applyHarvestPaste(
    stub,
    { id: 'H-15', title: 'Next lift waits', href: 'mechanics/hypotheses/H-15.md' },
    '2026-08-16'
  );
  assert.equal(first.ok, true);
  if (!first.ok) return;
  assert.equal(first.already, false);
  assert.equal(first.sectionId, 'AU');
  assert.equal(first.rowId, 'IL-H-15');
  assert.match(first.src, /### Now — AU \(harvest · 2026-08-16\)/);
  assert.match(first.src, /\*\*IL-H-15\*\*/);
  assert.match(first.src, /Do not invent AU2/);
  assert.ok(first.src.indexOf('### Now — AU') < first.src.indexOf('### After H0'));

  const again = applyHarvestPaste(
    first.src,
    { id: 'H-15', title: 'Next lift waits', href: 'mechanics/hypotheses/H-15.md' },
    '2026-08-16'
  );
  assert.equal(again.ok && again.already, true);
});
