import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', '..', '..');

describe('CoachChatPanel peels (.437)', () => {
  it('mounts free-form ask + soft tip from colocated components', () => {
    const panel = readFileSync(
      path.join(root, 'src/components/coach/CoachChatPanel.tsx'),
      'utf8'
    );
    const ask = readFileSync(
      path.join(root, 'src/components/coach/CoachFreeFormAskPanel.tsx'),
      'utf8'
    );
    const tip = readFileSync(
      path.join(root, 'src/components/coach/CoachSoftBundleChatTip.tsx'),
      'utf8'
    );
    assert.match(panel, /CoachFreeFormAskPanel/);
    assert.match(panel, /CoachSoftBundleChatTip/);
    assert.match(ask, /coach-free-form-ask/);
    assert.match(tip, /coach-chat-soft-tip/);
    assert.doesNotMatch(panel, /function FreeFormAskPanel/);
    assert.doesNotMatch(panel, /function SoftBundleChatTip/);
  });
});
