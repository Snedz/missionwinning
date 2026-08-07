/**
 * Legal prose ↔ code truth guards.
 *
 * The privacy policy states facts the code owns (retention windows, vendor
 * list). A policy that drifts from the code is worse than no policy — it
 * attests to the wrong thing. These tests pin the statements to their source.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { NON_TRAINING_RETENTION_DAYS } from '@/lib/history/monthGrid';
import { infoStringsFor } from '@/i18n/infoLocales';

const en = infoStringsFor('en');
const root = process.cwd();

describe('legalContent', () => {
  it('retention prose states the number the code enforces', () => {
    assert.ok(
      en.infoPrivacyRetentionLi2.includes(`${NON_TRAINING_RETENTION_DAYS} days`),
      `infoPrivacyRetentionLi2 must state the real on-device retention (${NON_TRAINING_RETENTION_DAYS} days from monthGrid.ts). ` +
        'If NON_TRAINING_RETENTION_DAYS changed, update the policy prose in the same commit.'
    );
  });

  it('every vendor the code depends on is named in the subprocessor list', () => {
    const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });

    // Closed spelling map, by necessity: npm package names do not map
    // mechanically to the vendor names prose uses. Each new analytics / infra /
    // payments dependency must extend this map (a dep with no row is invisible
    // to this guard — that is the known limit, stated here on purpose).
    const DEP_TO_VENDOR: Array<[depPrefix: string, vendor: string]> = [
      ['@supabase/', 'Supabase'],
      ['stripe', 'Stripe'],
      ['resend', 'Resend'],
      ['posthog-js', 'PostHog'],
      ['@sentry/', 'Sentry'],
      ['@upstash/', 'Upstash'],
      ['@solana/', 'Solana'],
    ];
    const body = en.infoPrivacySubprocessorsBody;
    for (const [depPrefix, vendor] of DEP_TO_VENDOR) {
      const installed = deps.some((d) => d === depPrefix || d.startsWith(depPrefix));
      if (!installed) continue;
      assert.ok(
        body.includes(vendor),
        `package.json depends on ${depPrefix}* but the privacy policy's subprocessor list does not name ${vendor}.`
      );
    }
  });

  it('API-only vendors are named while their integration modules exist', () => {
    const API_VENDORS: Array<[sourceFile: string, vendor: string]> = [
      ['src/lib/openFoodFacts.ts', 'OpenFoodFacts'],
    ];
    for (const [file, vendor] of API_VENDORS) {
      if (!existsSync(path.join(root, file))) continue;
      assert.ok(
        en.infoPrivacySubprocessorsBody.includes(vendor),
        `${file} exists but the subprocessor list does not name ${vendor}.`
      );
    }
  });

  it('the new policy sections actually render — keys wired into the pages (.252 defect class)', () => {
    const privacySource = readFileSync(
      path.join(root, 'src/page-components/PrivacyPage.tsx'),
      'utf8'
    );
    for (const id of [
      'lawful-bases',
      'health-data',
      'retention',
      'intl-transfers',
      'rights',
      'cookies',
      'children',
      'security-breach',
      'changes',
    ]) {
      assert.ok(
        privacySource.includes(`'${id}'`),
        `PrivacyPage.tsx does not render section id '${id}' — a translated string nobody renders is the .252 blank-line defect.`
      );
    }
    const termsSource = readFileSync(path.join(root, 'src/page-components/TermsPage.tsx'), 'utf8');
    assert.ok(termsSource.includes(`'eu-consumers'`), 'TermsPage.tsx must render the EU/UK consumer carve-out section.');
  });

  it('the EU carve-out disarms the arbitration clause, not just mentions it', () => {
    assert.ok(
      en.infoTermsEuConsumersBody.includes('do not apply'),
      'infoTermsEuConsumersBody must state the arbitration clause and class waiver do not apply to EU/UK consumers.'
    );
    assert.ok(
      en.infoTermsDisputesBody.includes('EU'),
      'infoTermsDisputesBody must point EU consumers at the carve-out so the clause is not read alone.'
    );
  });
});
