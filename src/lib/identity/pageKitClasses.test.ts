import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { pageKitLayoutClass } from './pageKitClasses';
import { PAGE_KITS } from '../../../packages/mw-core/src/identity/pageKits';

describe('pageKitLayoutClass', () => {
  it('maps every manifest kit to closed class names (no free CSS)', () => {
    for (const kit of PAGE_KITS) {
      const cls = pageKitLayoutClass(kit);
      assert.match(cls, /athlete-page-kit--/);
      assert.doesNotMatch(cls, /#|rgb|style=/i);
    }
  });

  it('falls back to stack for unknown ids', () => {
    assert.match(pageKitLayoutClass('nope'), /athlete-page-kit--stack/);
  });
});
