import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BANNED_KEYS,
  CLOSED_CLASSIFICATIONS,
  CLOSED_GRANTS,
  CLOSED_STAGES,
  CLOSED_TIERS,
  ISO_INSTANT,
  STAGE_CLASSIFICATION,
  TICKET_REQUIRED,
  TRUST_TIER_RULES,
  extraCaseRules,
  loadPackJson,
  validateAllFixtures,
  validateCapabilityTicket,
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

const validTicket = (over = {}) => ({
  id: 'tkt-shape-1',
  tier: 'known',
  status: 'open',
  subject: 'Capability ticket shape',
  submittedBy: { kind: 'allowlisted', agentId: 'builder.alpha' },
  capabilityAllowlist: ['identity.read'],
  presumeBreach: false,
  store: 'directory',
  createdAt: '2026-09-18T21:00:00.000Z',
  ...over,
});

test('closed fixture set is reviewed and matches expect', () => {
  const { extra, missing, results } = validateAllFixtures();
  assert.deepEqual(extra, []);
  assert.deepEqual(missing, []);
  assert.equal(results.length, 11);
  for (const { name, expect, errors } of results) {
    assert.equal(
      errors.length === 0,
      expect.ok,
      `${name} expected ${expect.ok ? 'accept' : 'refuse'} (${errors.map((e) => e.message).join('; ')})`
    );
  }
});

test('UNKNOWN is first-class (fixture accept + closed tables)', () => {
  const { errors } = validateFixtureFile('case.unknown.json');
  assert.equal(errors.length, 0);
  assert.ok(CLOSED_CLASSIFICATIONS.includes('UNKNOWN'));
  assert.ok(CLOSED_STAGES.includes('UNKNOWN'));
  assert.equal(STAGE_CLASSIFICATION.UNKNOWN, 'UNKNOWN');
  assert.equal(STAGE_CLASSIFICATION.ARCHIVE, 'any');
});

test('UNKNOWN archived is first-class (not a defect)', () => {
  const { errors } = validateFixtureFile('case.unknown-archived.json');
  assert.equal(errors.length, 0);
});

test('UNKNOWN cover story is refuse', () => {
  const { errors } = validateFixtureFile('case.unknown-cover-story.json');
  assert.ok(
    errors.some((e) => e.message === 'UNKNOWN forbids a prosaic cover story'),
    'extraCaseRules must name the cover story — schema `not` alone is a different spelling'
  );
  const extras = extraCaseRules({
    ...validUnknownCase(),
    prosaicHypothesis: 'Forced cover story',
  });
  assert.ok(extras.some((e) => e.message === 'UNKNOWN forbids a prosaic cover story'));
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
  assert.ok(!CLOSED_GRANTS.includes('billing.read'));
  assert.ok(!CLOSED_GRANTS.includes('photos.read'));
  const doc = validDirectory();
  doc.tickets[0].capabilityAllowlist = ['checkout'];
  const errors = validateDirectory(doc);
  assert.ok(errors.some((e) => /closed world|expected one of/.test(e.message)));
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

test('TRUST_TIER_RULES is the closed ordered table', () => {
  assert.deepEqual(Object.keys(TRUST_TIER_RULES), [...CLOSED_TIERS]);
  assert.deepEqual(TRUST_TIER_RULES.archive.stores, ['archive']);
  assert.equal(TRUST_TIER_RULES.archive.grants, 'empty');
  assert.equal(TRUST_TIER_RULES.unknown.presumeBreach, true);
  assert.equal(TRUST_TIER_RULES.host.submitter, 'allowlisted');
});

test('trust tier known cannot sit in quarantine store', () => {
  const { errors } = validateFixtureFile('directory.tier-store-mismatch.json');
  assert.ok(errors.some((e) => /trust tier known must use store directory|expected one of/.test(e.message)));
});

test('archive with grants is poison restore (refuse)', () => {
  const { errors } = validateFixtureFile('directory.poison-restore.json');
  assert.ok(errors.some((e) => /poison restore|empty allowlist/.test(e.message)));
});

test('restore key is banned (poison restore)', () => {
  const doc = validDirectory();
  doc.tickets[0].restore = true;
  const errors = validateDirectory(doc);
  assert.ok(errors.some((e) => /banned key restore|unknown property|forbidden/.test(e.message)));
  for (const key of ['restore', 'poisonRestore', 'unpark', 'promoteLive', 'tipPromote']) {
    assert.ok(BANNED_KEYS.includes(key), `missing banned key ${key}`);
  }
});

test('capability ticket shape: required fields + closed grants', () => {
  const ok = validateCapabilityTicket(validTicket());
  assert.equal(ok.length, 0, ok.map((e) => e.message).join('; '));
  for (const key of TICKET_REQUIRED) {
    const missing = { ...validTicket() };
    delete missing[key];
    const errors = validateCapabilityTicket(missing);
    assert.ok(
      errors.some((e) => e.message.includes(`missing required ${key}`)),
      `deleting ${key} should refuse`
    );
  }
});

test('allowlisted submitter without agentId refuses', () => {
  const errors = validateCapabilityTicket(
    validTicket({ submittedBy: { kind: 'allowlisted' } })
  );
  assert.ok(errors.some((e) => /agentId/.test(e.message)));
});

test('createdAt must be ISO-8601 instant', () => {
  assert.ok(ISO_INSTANT.test('2026-09-18T21:00:00.000Z'));
  assert.ok(!ISO_INSTANT.test('2026-09-18'));
  const errors = validateCapabilityTicket(validTicket({ createdAt: '2026-09-18' }));
  assert.ok(errors.some((e) => /ISO-8601|pattern/.test(e.message)));
});

test('duplicate ticket ids refuse', () => {
  const doc = validDirectory();
  doc.tickets.push({ ...doc.tickets[0], subject: 'Clone' });
  const errors = validateDirectory(doc);
  assert.ok(errors.some((e) => /duplicate ticket id/.test(e.message)));
});

test('INGEST may omit classification', () => {
  const doc = validUnknownCase();
  doc.stage = 'INGEST';
  delete doc.classification;
  delete doc.unknownRationale;
  assert.equal(validateCase(doc).length, 0);
});

test('UNKNOWN classification cannot use RESOLVE', () => {
  const doc = validUnknownCase();
  doc.stage = 'RESOLVE';
  const errors = validateCase(doc);
  assert.ok(errors.some((e) => /RESOLVE|KNOWN_PROSAIC|cover story/.test(e.message)));
});

test('schema grant enum matches CLOSED_GRANTS (no billing/photos)', () => {
  const schema = loadPackJson('directory.schema.json');
  const listed = schema.$defs.ticket.properties.capabilityAllowlist.items.enum;
  assert.deepEqual(listed, [...CLOSED_GRANTS]);
});

test('Blue Book schema keeps UNKNOWN as stage and classification', () => {
  const schema = loadPackJson('bluebook/case.schema.json');
  assert.ok(schema.properties.stage.enum.includes('UNKNOWN'));
  assert.ok(schema.properties.classification.enum.includes('UNKNOWN'));
});
