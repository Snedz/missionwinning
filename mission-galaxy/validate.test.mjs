import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  CLOSED_GRANTS,
  CLOSED_TIERS,
  validateAllFixtures,
  validateCase,
  validateDirectory,
  validateFixtureFile,
} from './validate.mjs';

const validDirectory = () => ({
  schemaVersion: '1.0.0',
  tiers: [...CLOSED_TIERS],
  tickets: [
    {
      id: 'tkt-known-1',
      tier: 'known',
      status: 'open',
      subject: 'Allowlisted hop review',
      submittedBy: { kind: 'allowlisted', agentId: 'builder.alpha' },
      capabilityAllowlist: ['identity.read'],
      presumeBreach: false,
      store: 'directory',
      createdAt: '2026-09-18T21:00:00.000Z',
    },
  ],
});

const validUnknownCase = () => ({
  id: 'bb-unk-1',
  stage: 'UNKNOWN',
  classification: 'UNKNOWN',
  trinity: { builder: 'builder.alpha', judge: 'judge.beta', canary: 'canary.gamma' },
  antiSamson: true,
  infiniteLife: true,
  unexplainedQuotaNote: 'Closed program may leave ~20% of cases UNKNOWN.',
  unknownRationale: 'No named prosaic cause yet.',
  createdAt: '2026-09-18T21:10:00.000Z',
});

test('closed fixture set is reviewed and matches expect', () => {
  const { extra, missing, results } = validateAllFixtures();
  assert.deepEqual(extra, []);
  assert.deepEqual(missing, []);
  assert.equal(results.length, 7);
  for (const { name, expect, errors } of results) {
    assert.equal(
      errors.length === 0,
      expect.ok,
      `${name} expected ${expect.ok ? 'accept' : 'refuse'} (${errors.map((e) => e.message).join('; ')})`
    );
  }
});

test('UNKNOWN is first-class (fixture accept)', () => {
  const { errors } = validateFixtureFile('case.unknown.json');
  assert.equal(errors.length, 0);
});

test('unknown submitter without presumeBreach is refuse', () => {
  const { errors } = validateFixtureFile('directory.unknown-without-breach.json');
  assert.ok(errors.length > 0);
  assert.ok(
    errors.some((e) => /presumeBreach|expected true|forbidden|one of unknown\|quarantine|quarantine/.test(e.message + e.path)),
    JSON.stringify(errors)
  );
});

test('TRINITY builder=judge is refuse', () => {
  const { errors } = validateFixtureFile('case.builder-is-judge.json');
  assert.ok(errors.some((e) => /builder must not equal judge/.test(e.message)));
});

test('paymentUrl on a case is refuse', () => {
  const { errors } = validateFixtureFile('case.payment-url.json');
  assert.ok(errors.some((e) => /paymentUrl|unknown property|banned key/.test(e.message)));
});

test('checkout grant is not in the closed world', () => {
  assert.ok(!CLOSED_GRANTS.includes('checkout'));
  assert.ok(!CLOSED_GRANTS.includes('paymentUrl'));
  const doc = validDirectory();
  doc.tickets[0].capabilityAllowlist = ['checkout'];
  const errors = validateDirectory(doc);
  assert.ok(errors.some((e) => /closed world/.test(e.message)));
});

test('quarantine store cannot carry grants', () => {
  const doc = validDirectory();
  doc.tickets[0] = {
    id: 'tkt-q',
    tier: 'quarantine',
    status: 'quarantined',
    subject: 'Isolated',
    submittedBy: { kind: 'unknown' },
    capabilityAllowlist: ['identity.read'],
    presumeBreach: true,
    store: 'quarantine',
    createdAt: '2026-09-18T21:00:00.000Z',
  };
  const errors = validateDirectory(doc);
  assert.ok(errors.some((e) => /empty allowlist/.test(e.message)));
});

test('shuffled tiers refuse', () => {
  const doc = validDirectory();
  doc.tiers = ['archive', 'host', 'known', 'unknown', 'quarantine'];
  const errors = validateDirectory(doc);
  assert.ok(errors.some((e) => /tiers/.test(e.path)));
});

test('UNKNOWN case does not require prosaicHypothesis', () => {
  const doc = validUnknownCase();
  assert.equal('prosaicHypothesis' in doc, false);
  assert.equal(validateCase(doc).length, 0);
});

test('KNOWN_PROSAIC without hypothesis refuses', () => {
  const doc = validUnknownCase();
  doc.classification = 'KNOWN_PROSAIC';
  doc.stage = 'RESOLVE';
  delete doc.unknownRationale;
  const errors = validateCase(doc);
  assert.ok(errors.some((e) => /prosaicHypothesis/.test(e.message)));
});

test('antiSamson false refuses', () => {
  const doc = validUnknownCase();
  doc.antiSamson = false;
  const errors = validateCase(doc);
  assert.ok(errors.length > 0);
});
