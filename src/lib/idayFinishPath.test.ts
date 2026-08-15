import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { idayFinishPath } from './idayFinishPath.ts';

const root = path.join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('idayFinishPath', () => {
  it('edit mode always returns Profile', () => {
    assert.equal(
      idayFinishPath({ isEdit: true, hasLoggedWork: false, gateOn: true }),
      '/profile'
    );
    assert.equal(
      idayFinishPath({ isEdit: true, hasLoggedWork: true, gateOn: false }),
      '/profile'
    );
  });

  it('in-progress logged work resumes Active (gate on or off)', () => {
    assert.equal(
      idayFinishPath({ isEdit: false, hasLoggedWork: true, gateOn: true }),
      '/active'
    );
    assert.equal(
      idayFinishPath({ isEdit: false, hasLoggedWork: true, gateOn: false }),
      '/active'
    );
  });

  it('cold I-Day always lands Today, gate on or off', () => {
    assert.equal(
      idayFinishPath({ isEdit: false, hasLoggedWork: false, gateOn: true }),
      '/log'
    );
    assert.equal(
      idayFinishPath({ isEdit: false, hasLoggedWork: false, gateOn: false }),
      '/log'
    );
  });
});

describe('Welcome finish wiring', () => {
  it('finish() delegates the destination to idayFinishPath', () => {
    const src = read('src/page-components/WelcomePage.tsx');
    assert.match(src, /idayFinishPath\(/);
    assert.match(src, /isClientPrivateGateEnabled\(/);
    assert.match(src, /hasLoggedWork\(/);
  });
});
