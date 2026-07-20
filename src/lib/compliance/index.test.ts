/**
 * Unit tests for compliance catalog + probes.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import {
  loadComplianceCatalog,
  evaluateControl,
  buildComplianceReport,
  upsertComplianceSnapshotMd,
  SNAPSHOT_START,
  SNAPSHOT_END,
  type ComplianceControl,
} from './index.ts';

const ROOT = join(import.meta.dirname, '../../..');

describe('compliance catalog', () => {
  it('loads controls.yaml with frameworks', () => {
    const catalog = loadComplianceCatalog(ROOT);
    assert.ok(catalog.controls.length >= 40);
    assert.ok(catalog.disclaimer.toLowerCase().includes('not'));
    const frameworks = new Set(catalog.controls.flatMap((c) => c.frameworks));
    assert.ok(frameworks.has('soc2'));
    assert.ok(frameworks.has('iso27001'));
    assert.ok(frameworks.has('hipaa'));
  });

  it('HIPAA claim control stays n_a', () => {
    const catalog = loadComplianceCatalog(ROOT);
    const claim = catalog.controls.find((c) => c.id === 'MW-HIPAA-005');
    assert.ok(claim);
    const ev = evaluateControl(claim!, ROOT);
    assert.equal(ev.result, 'n_a');
  });

  it('doc_exists passes for PROTECTION.md', () => {
    const control: ComplianceControl = {
      id: 'T',
      title: 't',
      frameworks: ['soc2'],
      category: 'test',
      owner: 'agent',
      evidence: 'PROTECTION.md',
      probe: 'doc_exists',
      status: 'automated',
    };
    assert.equal(evaluateControl(control, ROOT).result, 'pass');
  });

  it('headers probe passes on vercel.json', () => {
    const control: ComplianceControl = {
      id: 'H',
      title: 'h',
      frameworks: ['hipaa'],
      category: 'encryption',
      owner: 'agent',
      evidence: 'vercel.json',
      probe: 'headers',
      status: 'automated',
    };
    assert.equal(evaluateControl(control, ROOT).result, 'pass');
  });

  it('buildComplianceReport has no automated doc failures', () => {
    const report = buildComplianceReport(ROOT);
    assert.ok(report.totals.pass > 10);
    const fails = report.controls.filter((c) => c.result === 'fail');
    assert.deepEqual(
      fails.map((f) => f.id),
      [],
      fails.map((f) => `${f.id}: ${f.detail}`).join('; ')
    );
  });

  it('upsertComplianceSnapshotMd replaces markers', () => {
    const report = buildComplianceReport(ROOT);
    const md = `# Hub\n\n## Current snapshot\n\n${SNAPSHOT_START}\nold\n${SNAPSHOT_END}\n`;
    const next = upsertComplianceSnapshotMd(md, report);
    assert.ok(next.includes('soc2'));
    assert.equal(next.indexOf(SNAPSHOT_START), next.lastIndexOf(SNAPSHOT_START));
  });
});
