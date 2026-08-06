import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldAnnounceUpdate,
  wireUpdatePrompt,
  type UpdateRegistrationLike,
} from '@/lib/pwa/updatePrompt';

class FakeWorker {
  state: string;
  private listeners: Array<() => void> = [];
  constructor(state = 'installing') {
    this.state = state;
  }
  addEventListener(_type: 'statechange', listener: () => void) {
    this.listeners.push(listener);
  }
  setState(state: string) {
    this.state = state;
    for (const l of this.listeners) l();
  }
}

class FakeRegistration implements UpdateRegistrationLike {
  installing: FakeWorker | null = null;
  waiting: FakeWorker | null = null;
  private listeners: Array<() => void> = [];
  addEventListener(_type: 'updatefound', listener: () => void) {
    this.listeners.push(listener);
  }
  fireUpdateFound(worker: FakeWorker) {
    this.installing = worker;
    for (const l of this.listeners) l();
  }
}

describe('shouldAnnounceUpdate', () => {
  it('announces only installed + controlled + not yet announced', () => {
    assert.equal(
      shouldAnnounceUpdate({ workerState: 'installed', hasController: true, alreadyAnnounced: false }),
      true
    );
    for (const workerState of ['installing', 'activating', 'activated', 'redundant', 'parsed']) {
      assert.equal(
        shouldAnnounceUpdate({ workerState, hasController: true, alreadyAnnounced: false }),
        false,
        `state ${workerState} must not announce`
      );
    }
    assert.equal(
      shouldAnnounceUpdate({ workerState: 'installed', hasController: false, alreadyAnnounced: false }),
      false
    );
    assert.equal(
      shouldAnnounceUpdate({ workerState: 'installed', hasController: true, alreadyAnnounced: true }),
      false
    );
  });
});

describe('wireUpdatePrompt', () => {
  it('stays silent on the very first install (no controller)', () => {
    const reg = new FakeRegistration();
    let announces = 0;
    wireUpdatePrompt(reg, () => false, () => announces++);
    const worker = new FakeWorker();
    reg.fireUpdateFound(worker);
    worker.setState('installed');
    worker.setState('activating');
    worker.setState('activated');
    assert.equal(announces, 0);
  });

  it('announces exactly once for an update while controlled', () => {
    const reg = new FakeRegistration();
    let announces = 0;
    wireUpdatePrompt(reg, () => true, () => announces++);
    const worker = new FakeWorker();
    reg.fireUpdateFound(worker);
    assert.equal(announces, 0); // still installing
    worker.setState('installed');
    assert.equal(announces, 1);
    // skipWaiting drives it straight on — no second toast.
    worker.setState('activating');
    worker.setState('activated');
    assert.equal(announces, 1);
  });

  it('catches a worker already installing when attached', () => {
    const reg = new FakeRegistration();
    const worker = new FakeWorker();
    reg.installing = worker; // update found before register() resolved
    let announces = 0;
    wireUpdatePrompt(reg, () => true, () => announces++);
    worker.setState('installed');
    assert.equal(announces, 1);
  });

  it('announces immediately for a worker already installed and waiting', () => {
    const reg = new FakeRegistration();
    reg.waiting = new FakeWorker('installed');
    let announces = 0;
    wireUpdatePrompt(reg, () => true, () => announces++);
    assert.equal(announces, 1);
  });

  it('announces once across two update rounds in one page load', () => {
    const reg = new FakeRegistration();
    let announces = 0;
    wireUpdatePrompt(reg, () => true, () => announces++);
    const first = new FakeWorker();
    reg.fireUpdateFound(first);
    first.setState('installed');
    const second = new FakeWorker();
    reg.fireUpdateFound(second);
    second.setState('installed');
    assert.equal(announces, 1);
  });
});
