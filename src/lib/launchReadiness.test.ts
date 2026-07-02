import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatLaunchReadinessText,
  getLaunchReadinessReport,
} from './launchReadiness';

describe('launchReadiness', () => {
  it('includes Phase J ready checks', () => {
    const r = getLaunchReadinessReport();
    assert.equal(r.phaseJComplete, true);
    assert.ok(r.checks.some((c) => c.id === 'phase-j-pathfinder' && c.status === 'ready'));
    assert.ok(r.checks.some((c) => c.id === 'mind-i3' && c.status === 'ready'));
    assert.ok(r.checks.some((c) => c.id === 'move-i3' && c.status === 'ready'));
    assert.ok(r.checks.some((c) => c.id === 'track-i3' && c.status === 'ready'));
    assert.ok(r.checks.some((c) => c.id === 'private-mode-off' && c.status === 'blocked'));
  });

  it('formats text report', () => {
    const text = formatLaunchReadinessText();
    assert.match(text, /Launch readiness/);
    assert.match(text, /PRIVATE_MODE=false/);
  });
});
