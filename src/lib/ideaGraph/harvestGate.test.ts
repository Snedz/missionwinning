import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateHarvestLegalFrom, parseLedgerGenerates } from './harvestGate.ts';

const header = `| run | date | scout | anatomist | translator | red team | cap declared | spent | emitted | survived red team | later PASS |
|---|---|---|---|---|---|---|---|---|---|---|`;

test('discovers generate rows by header name, skips paste-only scout 0', () => {
  const src = `${header}
| seed | 2026-08-15 | — | — | — | — | 1 PR | 1 PR | 0 | — | — |
| harvest-1 | 2026-08-15 | 3 | inline | inline | inline | 0 PR | 1 PR | 0 | 5 of 5 | — |
| harvest-2 | 2026-08-16 | 0 | — | — | — | 1 PR | 1 PR | 1 | — | — |
| harvest-9 | 2026-08-16 | 3 | 1 | 3 | 1 | 0 PR | 0 PR | 0 | 0 of 3 | — |
`;
  const parsed = parseLedgerGenerates(src);
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.deepEqual(
    parsed.generates.map((g) => g.run),
    ['harvest-1', 'harvest-9']
  );
  assert.equal(parsed.generates[0].survivedZero, false);
  assert.equal(parsed.generates[1].survivedZero, true);
});

test('two trailing zero-survivor generates are mined out', () => {
  const src = `${header}
| harvest-8 | 2026-08-16 | 3 | 1 | 1 | 1 | 0 | 0 | 0 | 0 of 2 | — |
| harvest-9 | 2026-08-16 | 3 | 1 | 1 | 1 | 0 | 0 | 0 | 0 of 3 | — |
`;
  assert.equal(generateHarvestLegalFrom(src), false);
});

test('a later generate that spared one candidate re-opens generate', () => {
  const src = `${header}
| harvest-9 | 2026-08-16 | 3 | 1 | 3 | 1 | 0 | 0 | 0 | 0 of 3 | — |
| harvest-11 | 2026-08-16 | 3 | 1 | 2 | 1 | 0 | 0 | 0 | 1 of 2 | — |
`;
  assert.equal(generateHarvestLegalFrom(src), true);
});

test('missing survived column fails closed', () => {
  const src = `| run | scout |
|---|---|
| harvest-1 | 3 |
`;
  const parsed = parseLedgerGenerates(src);
  assert.equal(parsed.ok, false);
  assert.equal(generateHarvestLegalFrom(src), false);
});
