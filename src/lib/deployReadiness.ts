import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { localeExportSummary, buildLocaleExportPlan, countEsPlaceholderKeys } from '@/lib/exportLocales';

const BUILD_LABEL_PATTERN = /^\d{4}\.\d{2}-unified\.\d+$/;

export type DeployTarget = 'ci' | 'preview' | 'production';

export type DeployReadinessReport = {
  buildLabel: string;
  buildLabelValid: boolean;
  localeFiles: number;
  localeNamespaces: number;
  minTodayKeys: number;
  target: DeployTarget;
};

export function getDeployTarget(): DeployTarget {
  const raw = process.env.DEPLOY_READINESS_TARGET?.trim().toLowerCase();
  if (raw === 'production' || raw === 'preview') return raw;
  return 'ci';
}

export function validateBuildLabel(label: string): boolean {
  return BUILD_LABEL_PATTERN.test(label);
}

/** Static checks — no network or shell required. */
export function getDeployReadinessReport(): DeployReadinessReport {
  const summary = localeExportSummary();
  const enToday = buildLocaleExportPlan().find(
    (p) => p.lang === 'en' && p.namespace === 'today'
  );
  return {
    buildLabel: APP_BUILD_LABEL,
    buildLabelValid: validateBuildLabel(APP_BUILD_LABEL),
    localeFiles: summary.files,
    localeNamespaces: summary.namespaces,
    minTodayKeys: enToday?.keyCount ?? 0,
    target: getDeployTarget(),
  };
}

/** Production launch env — call when DEPLOY_READINESS_TARGET=production (e.g. Vercel prod build). */
export function assertProductionEnvConfig(): void {
  if (process.env.DEMO_PREMIUM === 'true') {
    throw new Error('DEMO_PREMIUM=true is forbidden for production deploy');
  }
  if (process.env.PRIVATE_MODE !== 'false') {
    throw new Error(
      'PRIVATE_MODE must be explicitly false for public launch (found: ' +
        (process.env.PRIVATE_MODE ?? 'unset') +
        ')'
    );
  }
  const required = [
    'YOUTH_CONSENT_SECRET',
    'NUDGE_SECRET',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ] as const;
  for (const key of required) {
    if (!process.env[key]?.trim()) {
      throw new Error(`Missing required production env: ${key}`);
    }
  }
  if (!process.env.PRIVATE_ACCESS_SECRET?.trim()) {
    throw new Error('PRIVATE_ACCESS_SECRET must be set (rotate off dev placeholder)');
  }
}

/** Preview/staging — gate may stay on; demo premium still forbidden in prod builds. */
export function assertPreviewEnvConfig(): void {
  if (process.env.NODE_ENV === 'production' && process.env.DEMO_PREMIUM === 'true') {
    throw new Error('DEMO_PREMIUM=true is forbidden in production builds (preview included)');
  }
}

export function assertDeployReady(): void {
  const r = getDeployReadinessReport();
  if (!r.buildLabelValid) {
    throw new Error(`Invalid APP_BUILD_LABEL: ${r.buildLabel}`);
  }
  if (r.localeFiles < 72) {
    throw new Error(`Expected ≥72 locale export files in plan, got ${r.localeFiles}`);
  }
  if (r.minTodayKeys < 100) {
    throw new Error(`Today locale export too small (${r.minTodayKeys} keys)`);
  }

  if (r.target === 'production') {
    assertProductionEnvConfig();
  } else if (r.target === 'preview') {
    assertPreviewEnvConfig();
  }

  warnIfEsPlaceholders();
}

/** Warn (non-blocking) when ES Tier-1 namespaces still mirror EN for many keys. */
function warnIfEsPlaceholders(): void {
  const tier1 = ['welcome', 'today', 'fuel', 'activeWorkout'] as const;
  for (const ns of tier1) {
    const { total, placeholders } = countEsPlaceholderKeys(ns);
    if (total === 0) continue;
    const ratio = placeholders / total;
    if (ratio > 0.35) {
      console.warn(
        `[i18n] es/${ns}: ${placeholders}/${total} keys still match EN (${Math.round(ratio * 100)}%)`
      );
    }
  }
}
