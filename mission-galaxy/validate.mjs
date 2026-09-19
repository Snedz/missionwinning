#!/usr/bin/env node
/**
 * Tiny Mission GALAXY validator. No new npm dep.
 * Supports the JSON Schema subset used by directory.schema.json and
 * bluebook/case.schema.json, plus doctrine extras:
 *   trust-tier coupling, capability ticket shape, UNKNOWN first-class,
 *   TRINITY distinct, closed grants, no poison restore.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const CLOSED_TIERS = Object.freeze([
  'host',
  'known',
  'unknown',
  'quarantine',
  'archive',
]);

export const CLOSED_GRANTS = Object.freeze([
  'identity.read',
  'storage.read',
  'storage.write',
]);

export const CLOSED_STAGES = Object.freeze([
  'INGEST',
  'CLASSIFY',
  'INSTRUMENT',
  'RESOLVE',
  'UNKNOWN',
  'INSUFFICIENT',
  'ARCHIVE',
]);

export const CLOSED_CLASSIFICATIONS = Object.freeze([
  'KNOWN_PROSAIC',
  'UNKNOWN',
  'INSUFFICIENT',
]);

/** ISO-8601 instant. Same pattern as directory + case schemas. */
export const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

/**
 * One table for trust-tier coupling. Ticket.tier picks store, submitter,
 * status, presumeBreach, and whether grants may be non-empty.
 * `grants: 'empty'` is the poison-restore stop on archive + quarantine.
 */
export const TRUST_TIER_RULES = Object.freeze({
  host: Object.freeze({
    stores: Object.freeze(['directory']),
    submitter: 'allowlisted',
    statuses: Object.freeze(['open', 'resolved']),
    presumeBreach: false,
    grants: 'closed-or-empty',
  }),
  known: Object.freeze({
    stores: Object.freeze(['directory']),
    submitter: 'allowlisted',
    statuses: Object.freeze(['open', 'resolved']),
    presumeBreach: false,
    grants: 'closed-or-empty',
  }),
  unknown: Object.freeze({
    stores: Object.freeze(['quarantine']),
    submitter: 'unknown',
    statuses: Object.freeze(['open', 'quarantined']),
    presumeBreach: true,
    grants: 'empty',
  }),
  quarantine: Object.freeze({
    stores: Object.freeze(['quarantine']),
    submitter: 'unknown',
    statuses: Object.freeze(['quarantined']),
    presumeBreach: true,
    grants: 'empty',
  }),
  archive: Object.freeze({
    stores: Object.freeze(['archive']),
    submitter: 'either',
    statuses: Object.freeze(['archived']),
    presumeBreach: 'if-unknown',
    grants: 'empty',
  }),
});

/** null = optional (INGEST). 'any' = one of CLOSED_CLASSIFICATIONS. else exact. */
export const STAGE_CLASSIFICATION = Object.freeze({
  INGEST: null,
  CLASSIFY: 'any',
  INSTRUMENT: 'any',
  RESOLVE: 'KNOWN_PROSAIC',
  UNKNOWN: 'UNKNOWN',
  INSUFFICIENT: 'INSUFFICIENT',
  ARCHIVE: 'any',
});

export const TICKET_REQUIRED = Object.freeze([
  'id',
  'tier',
  'status',
  'subject',
  'submittedBy',
  'capabilityAllowlist',
  'presumeBreach',
  'store',
  'createdAt',
]);

export const BANNED_KEYS = Object.freeze([
  'paymentUrl',
  'checkout',
  'clearshot',
  'traction',
  'etProof',
  'alienConfirmed',
  'restore',
  'poisonRestore',
  'unpark',
  'promoteLive',
  'tipPromote',
]);

export function loadPackJson(rel) {
  return JSON.parse(readFileSync(path.join(here, rel), 'utf8'));
}

function loadJson(rel) {
  return loadPackJson(rel);
}

function resolveRef(root, ref) {
  if (typeof ref !== 'string' || !ref.startsWith('#/')) {
    throw new Error(`unsupported $ref: ${ref}`);
  }
  let cur = root;
  for (const part of ref.slice(2).split('/')) {
    if (cur == null || typeof cur !== 'object' || !(part in cur)) {
      throw new Error(`unresolved $ref: ${ref}`);
    }
    cur = cur[part];
  }
  return cur;
}

function deref(schema, root) {
  if (schema && typeof schema === 'object' && '$ref' in schema) {
    return deref(resolveRef(root, schema.$ref), root);
  }
  return schema;
}

function typeOf(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function push(errors, prefix, message) {
  errors.push({ path: prefix || '$', message });
}

export function validateSchema(schema, data, root = schema, prefix = '') {
  const errors = [];
  const node = deref(schema, root);
  if (!node || typeof node !== 'object') return errors;

  if (node.not) {
    const inner = validateSchema(node.not, data, root, prefix);
    if (inner.length === 0) push(errors, prefix, 'matches a forbidden shape');
  }

  if (Array.isArray(node.allOf)) {
    for (const part of node.allOf) {
      errors.push(...validateSchema(part, data, root, prefix));
    }
  }

  if (Array.isArray(node.anyOf)) {
    const ok = node.anyOf.some((part) => validateSchema(part, data, root, prefix).length === 0);
    if (!ok) push(errors, prefix, 'matches none of anyOf');
  }

  if (node.if) {
    const ifErrs = validateSchema(node.if, data, root, prefix);
    const branch = ifErrs.length === 0 ? node.then : node.else;
    if (branch) errors.push(...validateSchema(branch, data, root, prefix));
  }

  if (node.const !== undefined && data !== node.const) {
    push(errors, prefix, `expected ${JSON.stringify(node.const)}`);
  }

  if (node.enum && !node.enum.includes(data)) {
    push(errors, prefix, `expected one of ${node.enum.join('|')}`);
  }

  if (node.type) {
    const types = Array.isArray(node.type) ? node.type : [node.type];
    if (!types.includes(typeOf(data))) {
      push(errors, prefix, `expected type ${types.join('|')}, got ${typeOf(data)}`);
      return errors;
    }
  }

  if (typeof data === 'string') {
    if (node.minLength != null && data.length < node.minLength) {
      push(errors, prefix, `shorter than minLength ${node.minLength}`);
    }
    if (node.maxLength != null && data.length > node.maxLength) {
      push(errors, prefix, `longer than maxLength ${node.maxLength}`);
    }
    if (node.pattern) {
      let re;
      try {
        re = new RegExp(node.pattern);
      } catch {
        push(errors, prefix, `invalid schema pattern`);
        return errors;
      }
      if (!re.test(data)) {
        push(errors, prefix, `does not match pattern`);
      }
    }
  }

  if (Array.isArray(data)) {
    if (node.minItems != null && data.length < node.minItems) {
      push(errors, prefix, `fewer than minItems ${node.minItems}`);
    }
    if (node.maxItems != null && data.length > node.maxItems) {
      push(errors, prefix, `more than maxItems ${node.maxItems}`);
    }
    if (node.items) {
      data.forEach((item, i) => {
        errors.push(...validateSchema(node.items, item, root, `${prefix}/${i}`));
      });
    }
  }

  if (data && typeOf(data) === 'object' && !Array.isArray(data)) {
    const props = node.properties ?? {};
    for (const key of node.required ?? []) {
      if (!(key in data)) push(errors, prefix, `missing required ${key}`);
    }
    if (node.additionalProperties === false) {
      for (const key of Object.keys(data)) {
        if (!(key in props)) push(errors, prefix, `unknown property ${key}`);
      }
    }
    for (const [key, sub] of Object.entries(props)) {
      if (key in data) {
        errors.push(...validateSchema(sub, data[key], root, `${prefix}/${key}`));
      }
    }
  }

  return errors;
}

function grantErrors(allowlist, prefix) {
  const errors = [];
  if (!Array.isArray(allowlist)) return errors;
  for (const [i, grant] of allowlist.entries()) {
    if (!CLOSED_GRANTS.includes(grant)) {
      push(errors, `${prefix}/${i}`, `grant not in closed world: ${grant}`);
    }
  }
  return errors;
}

/**
 * Capability ticket shape. Directory tickets are this object.
 * Trust-tier coupling lives in TRUST_TIER_RULES — do not fork a second table.
 */
export function validateCapabilityTicket(ticket, prefix = '') {
  const errors = [];
  if (!ticket || typeof ticket !== 'object' || Array.isArray(ticket)) {
    push(errors, prefix, 'ticket must be an object');
    return errors;
  }
  for (const key of TICKET_REQUIRED) {
    if (!(key in ticket)) push(errors, prefix, `missing required ${key}`);
  }

  const rule = TRUST_TIER_RULES[ticket.tier];
  if (ticket.tier != null && !rule) {
    push(errors, `${prefix}/tier`, `unknown trust tier ${ticket.tier}`);
  }
  if (rule) {
    if (ticket.store != null && !rule.stores.includes(ticket.store)) {
      push(
        errors,
        `${prefix}/store`,
        `trust tier ${ticket.tier} must use store ${rule.stores.join('|')}`
      );
    }
    if (ticket.status != null && !rule.statuses.includes(ticket.status)) {
      push(
        errors,
        `${prefix}/status`,
        `trust tier ${ticket.tier} status must be ${rule.statuses.join('|')}`
      );
    }
    const kind = ticket.submittedBy && ticket.submittedBy.kind;
    if (rule.submitter !== 'either' && kind && kind !== rule.submitter) {
      push(
        errors,
        `${prefix}/submittedBy`,
        `trust tier ${ticket.tier} requires submittedBy.kind ${rule.submitter}`
      );
    }
    if ((rule.submitter === 'allowlisted' || kind === 'allowlisted') && !ticket.submittedBy?.agentId) {
      push(errors, `${prefix}/submittedBy`, 'allowlisted submitter requires agentId');
    }
    if (rule.presumeBreach === true && ticket.presumeBreach !== true) {
      push(errors, `${prefix}/presumeBreach`, 'expected true');
    }
    if (rule.presumeBreach === false && ticket.presumeBreach !== false) {
      push(errors, `${prefix}/presumeBreach`, 'expected false');
    }
    if (rule.presumeBreach === 'if-unknown') {
      if (kind === 'unknown' && ticket.presumeBreach !== true) {
        push(errors, `${prefix}/presumeBreach`, 'expected true');
      }
      if (kind === 'allowlisted' && ticket.presumeBreach !== false) {
        push(errors, `${prefix}/presumeBreach`, 'expected false');
      }
    }
    if (rule.grants === 'empty') {
      const list = ticket.capabilityAllowlist;
      if (!Array.isArray(list) || list.length !== 0) {
        const why =
          ticket.tier === 'archive' || ticket.store === 'archive'
            ? 'archive store must be empty allowlist (no poison restore)'
            : 'quarantine store must be empty allowlist';
        push(errors, `${prefix}/capabilityAllowlist`, why);
      }
    }
  }

  errors.push(...grantErrors(ticket.capabilityAllowlist, `${prefix}/capabilityAllowlist`));

  if (ticket.createdAt != null && typeof ticket.createdAt === 'string' && !ISO_INSTANT.test(ticket.createdAt)) {
    push(errors, `${prefix}/createdAt`, 'must be ISO-8601 instant (...Z)');
  }
  return errors;
}

export function extraDirectoryRules(doc) {
  const errors = [];
  if (!doc || typeof doc !== 'object') return errors;
  if (
    Array.isArray(doc.tiers) &&
    (doc.tiers.length !== CLOSED_TIERS.length ||
      CLOSED_TIERS.some((t, i) => doc.tiers[i] !== t))
  ) {
    push(errors, '/tiers', `must be exactly ${CLOSED_TIERS.join(',')}`);
  }
  const tickets = Array.isArray(doc.tickets) ? doc.tickets : [];
  const seen = new Map();
  tickets.forEach((ticket, i) => {
    const p = `/tickets/${i}`;
    errors.push(...validateCapabilityTicket(ticket, p));
    const id = ticket?.id;
    if (typeof id === 'string' && id) {
      if (seen.has(id)) {
        push(errors, `${p}/id`, `duplicate ticket id ${id}`);
      } else {
        seen.set(id, i);
      }
    }
  });
  return errors;
}

export function extraCaseRules(doc) {
  const errors = [];
  if (!doc || typeof doc !== 'object') return errors;
  const t = doc.trinity;
  if (t && typeof t === 'object') {
    const { builder, judge, canary } = t;
    if (builder && judge && builder === judge) {
      push(errors, '/trinity', 'builder must not equal judge');
    }
    if (builder && canary && builder === canary) {
      push(errors, '/trinity', 'builder must not equal canary');
    }
    if (judge && canary && judge === canary) {
      push(errors, '/trinity', 'judge must not equal canary');
    }
  }

  const expected = STAGE_CLASSIFICATION[doc.stage];
  if (doc.stage != null && expected === undefined) {
    push(errors, '/stage', `unknown stage ${doc.stage}`);
  }
  if (expected === 'any') {
    if (!doc.classification) {
      push(errors, '', 'missing required classification');
    } else if (!CLOSED_CLASSIFICATIONS.includes(doc.classification)) {
      push(errors, '/classification', `expected one of ${CLOSED_CLASSIFICATIONS.join('|')}`);
    }
  } else if (typeof expected === 'string' && doc.classification && doc.classification !== expected) {
    push(errors, '/classification', `stage ${doc.stage} requires classification ${expected}`);
  }

  if (doc.classification === 'UNKNOWN') {
    if (!doc.unknownRationale) {
      push(errors, '', 'missing required unknownRationale');
    }
    if ('prosaicHypothesis' in doc) {
      push(errors, '/prosaicHypothesis', 'UNKNOWN forbids a prosaic cover story');
    }
    if (doc.stage === 'RESOLVE') {
      push(errors, '/stage', 'UNKNOWN classification cannot use RESOLVE');
    }
  }
  return errors;
}

function bannedKeyWalk(value, prefix, errors) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, i) => bannedKeyWalk(item, `${prefix}/${i}`, errors));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (BANNED_KEYS.includes(key)) {
      push(errors, `${prefix}/${key}`, `banned key ${key}`);
    }
    bannedKeyWalk(child, `${prefix}/${key}`, errors);
  }
}

export function validateDirectory(doc, schema = loadJson('directory.schema.json')) {
  const errors = [
    ...validateSchema(schema, doc),
    ...extraDirectoryRules(doc),
  ];
  bannedKeyWalk(doc, '', errors);
  return errors;
}

export function validateCase(doc, schema = loadJson('bluebook/case.schema.json')) {
  const errors = [
    ...validateSchema(schema, doc),
    ...extraCaseRules(doc),
  ];
  bannedKeyWalk(doc, '', errors);
  return errors;
}

export const FIXTURE_EXPECT = Object.freeze({
  'directory.valid.json': { kind: 'directory', ok: true },
  'directory.unknown-without-breach.json': { kind: 'directory', ok: false },
  'directory.poison-restore.json': { kind: 'directory', ok: false },
  'directory.tier-store-mismatch.json': { kind: 'directory', ok: false },
  'case.unknown.json': { kind: 'case', ok: true },
  'case.known-prosaic.json': { kind: 'case', ok: true },
  'case.insufficient.json': { kind: 'case', ok: true },
  'case.unknown-archived.json': { kind: 'case', ok: true },
  'case.builder-is-judge.json': { kind: 'case', ok: false },
  'case.payment-url.json': { kind: 'case', ok: false },
  'case.unknown-cover-story.json': { kind: 'case', ok: false },
});

export function validateFixtureFile(name) {
  const expect = FIXTURE_EXPECT[name];
  if (!expect) throw new Error(`unreviewed fixture: ${name}`);
  const doc = loadJson(path.join('fixtures', name));
  const errors = expect.kind === 'directory' ? validateDirectory(doc) : validateCase(doc);
  return { name, expect, errors };
}

export function validateAllFixtures() {
  const names = readdirSync(path.join(here, 'fixtures'))
    .filter((n) => n.endsWith('.json'))
    .sort();
  const listed = Object.keys(FIXTURE_EXPECT).sort();
  const extra = names.filter((n) => !FIXTURE_EXPECT[n]);
  const missing = listed.filter((n) => !names.includes(n));
  const results = names.filter((n) => FIXTURE_EXPECT[n]).map(validateFixtureFile);
  return { names, extra, missing, results };
}

function grantEnumFromSchema(dirSchema) {
  return dirSchema?.$defs?.ticket?.properties?.capabilityAllowlist?.items?.enum ?? [];
}

function main() {
  const dirSchema = loadJson('directory.schema.json');
  const caseSchema = loadJson('bluebook/case.schema.json');
  if (dirSchema.title !== 'Mission GALAXY Directory') {
    console.error('directory.schema.json title drifted');
    process.exit(1);
  }
  if (caseSchema.title !== 'Mission GALAXY Blue Book case') {
    console.error('bluebook/case.schema.json title drifted');
    process.exit(1);
  }
  const schemaGrants = grantEnumFromSchema(dirSchema);
  if (
    schemaGrants.length !== CLOSED_GRANTS.length ||
    CLOSED_GRANTS.some((g, i) => schemaGrants[i] !== g)
  ) {
    console.error('directory.schema.json grant enum drifted from CLOSED_GRANTS');
    process.exit(1);
  }
  const classEnum = caseSchema.properties?.classification?.enum ?? [];
  if (!classEnum.includes('UNKNOWN')) {
    console.error('bluebook/case.schema.json dropped UNKNOWN as a classification');
    process.exit(1);
  }
  const stageEnum = caseSchema.properties?.stage?.enum ?? [];
  if (!stageEnum.includes('UNKNOWN')) {
    console.error('bluebook/case.schema.json dropped UNKNOWN as a stage');
    process.exit(1);
  }
  if (Object.keys(TRUST_TIER_RULES).join(',') !== CLOSED_TIERS.join(',')) {
    console.error('TRUST_TIER_RULES keys drifted from CLOSED_TIERS');
    process.exit(1);
  }

  const { extra, missing, results } = validateAllFixtures();
  let failed = false;
  if (extra.length) {
    console.error(`unreviewed fixtures: ${extra.join(', ')}`);
    failed = true;
  }
  if (missing.length) {
    console.error(`missing listed fixtures: ${missing.join(', ')}`);
    failed = true;
  }
  for (const { name, expect, errors } of results) {
    const ok = errors.length === 0;
    if (ok !== expect.ok) {
      console.error(`${name}: expected ${expect.ok ? 'accept' : 'refuse'}, got ${ok ? 'accept' : 'refuse'}`);
      for (const e of errors) console.error(`  ${e.path}: ${e.message}`);
      failed = true;
    } else {
      console.log(`${expect.ok ? 'accept' : 'refuse'} ${name}`);
    }
  }
  if (failed) process.exit(1);
  console.log('mission-galaxy fixtures: ok');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
