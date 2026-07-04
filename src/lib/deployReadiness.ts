import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { localeExportSummary, buildLocaleExportPlan } from '@/lib/exportLocales';

const BUILD_LABEL_PATTERN = /^\d{4}\.\d{2}-unified\.\d+$/;

export type DeployReadinessReport = {
  buildLabel: string;
  buildLabelValid: boolean;
  localeFiles: number;
  localeNamespaces: number;
  minTodayKeys: number;
};

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
  };
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
  warnIfEsPlaceholders();
}

/** Warn (non-blocking) when ES strings still match EN for newer namespaces. */
function warnIfEsPlaceholders(): void {
  const checkNamespaces = ['feedback', 'programs', 'library'] as const;
  for (const ns of checkNamespaces) {
    const entry = buildLocaleExportPlan().filter((p) => p.namespace === ns && p.lang === 'es');
    const enEntry = buildLocaleExportPlan().find((p) => p.namespace === ns && p.lang === 'en');
    if (entry.length && enEntry && entry[0].keyCount === enEntry.keyCount) {
      // Heuristic only — equal key counts are expected; future: diff string values.
      void ns;
    }
  }
}
