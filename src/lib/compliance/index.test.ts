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
  assertCatalogControls,
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
    assert.ok(frameworks.has('ccpa'));
    assert.ok(frameworks.has('coppa'));
    assert.ok(frameworks.has('play_data'));
    assert.ok(frameworks.has('ftc_ai'));
    assert.ok(catalog.version >= 2);
  });

  it('HIPAA claim control stays n_a', () => {
    const catalog = loadComplianceCatalog(ROOT);
    const claim = catalog.controls.find((c) => c.id === 'MW-HIPAA-005');
    assert.ok(claim);
    const ev = evaluateControl(claim!, ROOT);
    assert.equal(ev.result, 'n_a');
  });

  it('doc_exists passes for docs/PROTECTION.md', () => {
    const control: ComplianceControl = {
      id: 'T',
      title: 't',
      frameworks: ['soc2'],
      category: 'test',
      owner: 'agent',
      evidence: 'docs/PROTECTION.md',
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

  it('buildComplianceReport has no unexpected fails', () => {
    const report = buildComplianceReport(ROOT);
    assert.ok(report.totals.pass > 10);
    const fails = report.controls.filter((c) => c.result === 'fail');
    assert.deepEqual(
      fails.map((f) => f.id),
      [],
      fails.map((f) => `${f.id}: ${f.detail}`).join('; ')
    );
    const knownOpen = report.controls.filter((c) => c.detail.startsWith('known open'));
    assert.ok(
      knownOpen.every((c) => c.id !== 'MW-HEALTH-001' && c.id !== 'MW-HEALTH-002'),
      'health-bucket known_open flags are stale'
    );
    const health001 = report.controls.find((c) => c.id === 'MW-HEALTH-001');
    assert.equal(health001?.result, 'pass', health001?.detail);
    const health002 = report.controls.find((c) => c.id === 'MW-HEALTH-002');
    assert.equal(health002?.result, 'pass', health002?.detail);
    const access006 = report.controls.find((c) => c.id === 'MW-ACCESS-006');
    assert.equal(access006?.result, 'pass', access006?.detail);
    assert.ok(report.byFramework.ccpa.pass >= 1);
  });

  it('source_scan fails when a required string is missing', () => {
    const control: ComplianceControl = {
      id: 'T-SCAN',
      title: 't',
      frameworks: ['soc2'],
      category: 'test',
      owner: 'agent',
      evidence: 'src/lib/privateSession.ts',
      probe: 'source_scan',
      require: ['this-string-is-not-in-privateSession'],
      status: 'automated',
    };
    const ev = evaluateControl(control, ROOT);
    assert.equal(ev.result, 'fail');
    assert.match(ev.detail, /Missing required/);
  });

  it('source_scan fails when a forbidden string is present', () => {
    const control: ComplianceControl = {
      id: 'T-FORBID',
      title: 't',
      frameworks: ['ccpa'],
      category: 'test',
      owner: 'agent',
      evidence: 'src/page-components/NutritionPage.tsx',
      probe: 'source_scan',
      forbid: ['saveNutritionEntry'],
      status: 'automated',
    };
    assert.equal(evaluateControl(control, ROOT).result, 'fail');
  });

  it('known_open remaps a failing scan to partial', () => {
    const control: ComplianceControl = {
      id: 'T-OPEN',
      title: 't',
      frameworks: ['ccpa'],
      category: 'test',
      owner: 'agent',
      evidence: 'src/lib/accountDataServer.ts',
      probe: 'source_scan',
      require: ['ignoreUnlinkedClientDeviceId'],
      known_open: 'P2-1',
      status: 'partial',
    };
    const ev = evaluateControl(control, ROOT);
    assert.equal(ev.result, 'partial');
    assert.match(ev.detail, /P2-1/);
  });

  it('known_open becomes a fail when the probe starts passing', () => {
    const control: ComplianceControl = {
      id: 'T-STALE',
      title: 't',
      frameworks: ['soc2'],
      category: 'test',
      owner: 'agent',
      evidence: 'src/lib/privateSession.ts',
      probe: 'source_scan',
      require: ['createHmac'],
      known_open: 'P9-9',
      status: 'partial',
    };
    const ev = evaluateControl(control, ROOT);
    assert.equal(ev.result, 'fail');
    assert.match(ev.detail, /stale known_open/);
  });

  it('rejects an unknown framework and an empty source_scan', () => {
    assert.throws(
      () =>
        assertCatalogControls([
          {
            id: 'BAD-FW',
            title: 't',
            frameworks: ['gdpr' as never],
            category: 'test',
            owner: 'agent',
            evidence: 'docs/PROTECTION.md',
            probe: 'doc_exists',
            status: 'automated',
          },
        ]),
      /Unknown framework/
    );
    assert.throws(
      () =>
        assertCatalogControls([
          {
            id: 'BAD-SCAN',
            title: 't',
            frameworks: ['soc2'],
            category: 'test',
            owner: 'agent',
            evidence: 'src/lib/privateSession.ts',
            probe: 'source_scan',
            status: 'automated',
          },
        ]),
      /require or forbid/
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
