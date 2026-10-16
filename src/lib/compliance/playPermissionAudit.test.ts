/**
 * Unit tests for playPermissionAudit — inline XML fixtures only.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { auditManifest } from './playPermissionAudit.ts';

describe('playPermissionAudit', () => {
  it('returns empty array for empty manifest', () => {
    const xml = `<?xml version="1.0"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
</manifest>`;
    const findings = auditManifest(xml);
    assert.deepEqual(findings, []);
  });

  it('finds one restricted + one sensitive + one harmless', () => {
    const xml = `<?xml version="1.0"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission android:name="android.permission.READ_SMS" />
  <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
  <uses-permission android:name="android.permission.INTERNET" />
</manifest>`;
    const findings = auditManifest(xml);
    assert.equal(findings.length, 2, `Expected 2 findings, got ${JSON.stringify(findings)}`);

    const perms = findings.map(f => f.permission);
    assert.ok(perms.includes('android.permission.READ_SMS'), 'should include READ_SMS');
    assert.ok(perms.includes('android.permission.ACTIVITY_RECOGNITION'), 'should include ACTIVITY_RECOGNITION');
    assert.ok(!perms.includes('android.permission.INTERNET'), 'should NOT include INTERNET');

    const readSms = findings.find(f => f.permission === 'android.permission.READ_SMS');
    assert.ok(readSms, 'READ_SMS found');
    assert.equal(readSms!.risk, 'restricted', 'READ_SMS is restricted');

    const activity = findings.find(f => f.permission === 'android.permission.ACTIVITY_RECOGNITION');
    assert.ok(activity, 'ACTIVITY_RECOGNITION found');
    assert.equal(activity!.risk, 'sensitive', 'ACTIVITY_RECOGNITION is sensitive');
  });

  it('detects all listed restricted permissions', () => {
    const xml = `<?xml version="1.0"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission android:name="android.permission.READ_SMS" />
  <uses-permission android:name="android.permission.SEND_SMS" />
  <uses-permission android:name="android.permission.RECEIVE_SMS" />
  <uses-permission android:name="android.permission.READ_CALL_LOG" />
  <uses-permission android:name="android.permission.WRITE_CALL_LOG" />
  <uses-permission android:name="android.permission.PROCESS_OUTGOING_CALLS" />
  <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
  <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
  <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />
  <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />
</manifest>`;
    const findings = auditManifest(xml);
    const restricted = findings.filter(f => f.risk === 'restricted');
    assert.equal(restricted.length, 10, `Expected 10 restricted, got ${restricted.length}: ${JSON.stringify(restricted.map(f => f.permission))}`);
  });

  it('detects all listed sensitive permissions', () => {
    const xml = `<?xml version="1.0"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission android:name="android.permission.ACTIVITY_RECOGNITION" />
  <uses-permission android:name="android.permission.BODY_SENSORS" />
  <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
  <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
</manifest>`;
    const findings = auditManifest(xml);
    const sensitive = findings.filter(f => f.risk === 'sensitive');
    assert.equal(sensitive.length, 4, `Expected 4 sensitive, got ${sensitive.length}: ${JSON.stringify(sensitive.map(f => f.permission))}`);
  });

  it('handles health.* wildcard permissions', () => {
    const xml = `<?xml version="1.0"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission android:name="android.permission.health.READ_HEALTH_DATA" />
  <uses-permission android:name="android.permission.health.WRITE_HEALTH_DATA" />
</manifest>`;
    const findings = auditManifest(xml);
    assert.equal(findings.length, 2, `Expected 2 health findings, got ${findings.length}`);
    findings.forEach(f => {
      assert.equal(f.risk, 'sensitive', `${f.permission} should be sensitive`);
    });
  });

  it('handles foreground service wildcard permissions', () => {
    const xml = `<?xml version="1.0"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
  <uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
</manifest>`;
    const findings = auditManifest(xml);
    assert.equal(findings.length, 2, `Expected 2 foreground findings, got ${findings.length}`);
    findings.forEach(f => {
      assert.equal(f.risk, 'sensitive', `${f.permission} should be sensitive`);
    });
  });

  it('ignores permissions without android.permission. prefix', () => {
    const xml = `<?xml version="1.0"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission android:name="com.custom.PERMISSION" />
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
</manifest>`;
    const findings = auditManifest(xml);
    assert.equal(findings.length, 0, `Expected 0 findings for unknown/custom permissions, got ${findings.length}`);
  });

  it('handles manifest without uses-permission tags', () => {
    const xml = `<?xml version="1.0"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <application android:label="MyApp">
  </application>
</manifest>`;
    const findings = auditManifest(xml);
    assert.deepEqual(findings, []);
  });

  it('handles whitespace variations in XML', () => {
    const xml = `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission   android:name  =  "android.permission.READ_SMS"   />
  <uses-permission android:name="android.permission.BODY_SENSORS"/>
</manifest>`;
    const findings = auditManifest(xml);
    assert.equal(findings.length, 2);
  });
});
