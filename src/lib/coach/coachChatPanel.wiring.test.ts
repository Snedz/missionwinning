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

  it('mounts transcript + composer for premium open UI (.448)', () => {
    const panel = readFileSync(
      path.join(root, 'src/components/coach/CoachChatPanel.tsx'),
      'utf8'
    );
    const transcript = readFileSync(
      path.join(root, 'src/components/coach/CoachChatTranscript.tsx'),
      'utf8'
    );
    const composer = readFileSync(
      path.join(root, 'src/components/coach/CoachChatComposer.tsx'),
      'utf8'
    );
    assert.match(panel, /CoachChatTranscript/);
    assert.match(panel, /CoachChatComposer/);
    assert.match(transcript, /role="log"/);
    assert.match(composer, /coach-chat-input/);
    assert.match(composer, /coachChatSend/);
    assert.doesNotMatch(composer, /coach-chat-mic/, 'Talk path has no mic');
    assert.doesNotMatch(panel, /coach-chat-mic/, 'Talk path has no mic');
    assert.doesNotMatch(
      panel,
      /role="log"/,
      'transcript log lives in CoachChatTranscript'
    );
    assert.doesNotMatch(
      panel,
      /coach-chat-input/,
      'composer input lives in CoachChatComposer'
    );
  });
});

describe('Coach live voice (signed-in + online)', () => {
  it('CoachPage does not leftover live talk on the week writer', () => {
    const page = readFileSync(
      path.join(root, 'src/page-components/CoachPage.tsx'),
      'utf8'
    );
    const live = readFileSync(
      path.join(root, 'src/components/coach/CoachLiveVoice.tsx'),
      'utf8'
    );
    assert.doesNotMatch(page, /CoachLiveVoice/);
    assert.match(live, /coach-live-voice/);
    assert.match(live, /postCoachChatMessage/);
    assert.match(live, /nextCoachVoicePhase/);
  });
});
