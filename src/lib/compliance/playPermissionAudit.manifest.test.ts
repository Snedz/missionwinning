/**
 * Integration test: auditManifest against the real AndroidManifest.xml
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { auditManifest } from './playPermissionAudit.ts';

describe('playPermissionAudit - real manifest', () => {
  it('audits the real AndroidManifest.xml and returns expected findings', () => {
    // Read the real manifest
    const manifestPath = path.resolve(process.cwd(), 'apps/android/app/src/main/AndroidManifest.xml');
    
    // Skip test if manifest doesn't exist (e.g., in CI without android folder)
    if (!fs.existsSync(manifestPath)) {
      console.log('AndroidManifest.xml not found, skipping test');
      return;
    }

    const xml = fs.readFileSync(manifestPath, 'utf-8');
    const findings = auditManifest(xml);

    // Explicit expected findings based on current manifest
    // Update this array when AndroidManifest.xml permissions change
    const expected: Array<{ permission: string; risk: 'restricted' | 'sensitive'; note: string }> = [
      {
        permission: 'android.permission.FOREGROUND_SERVICE_SPECIAL_USE',
        risk: 'sensitive',
        note: 'Foreground service FOREGROUND_SERVICE_SPECIAL_USE — requires prominent disclosure',
      },
      {
        permission: 'android.permission.health.WRITE_EXERCISE',
        risk: 'sensitive',
        note: 'Health permission health.WRITE_EXERCISE — Google Fit API recommended',
      },
      {
        permission: 'android.permission.health.WRITE_ACTIVE_CALORIES_BURNED',
        risk: 'sensitive',
        note: 'Health permission health.WRITE_ACTIVE_CALORIES_BURNED — Google Fit API recommended',
      },
      {
        permission: 'android.permission.health.READ_STEPS',
        risk: 'sensitive',
        note: 'Health permission health.READ_STEPS — Google Fit API recommended',
      },
    ];

    assert.deepEqual(
      findings,
      expected,
      `Manifest audit found ${findings.length} findings, expected ${expected.length}. ` +
      `Findings: ${JSON.stringify(findings, null, 2)}`
    );
  });

  it('documents all findings for the card report', () => {
    const manifestPath = path.resolve(process.cwd(), 'apps/android/app/src/main/AndroidManifest.xml');
    
    if (!fs.existsSync(manifestPath)) {
      console.log('AndroidManifest.xml not found, skipping test');
      return;
    }

    const xml = fs.readFileSync(manifestPath, 'utf-8');
    const findings = auditManifest(xml);

    // Log findings for card report (table format)
    if (findings.length > 0) {
      console.log('\n=== Permission Audit Findings ===');
      console.log('| Permission | Risk | Note |');
      console.log('|------------|------|------|');
      findings.forEach(f => {
        console.log(`| ${f.permission} | ${f.risk} | ${f.note} |`);
      });
      console.log('=================================\n');
    } else {
      console.log('\n=== No restricted/sensitive permissions found ===\n');
    }

    // This test always passes - it's for reporting
    assert.ok(true, 'Report logged');
  });
});
