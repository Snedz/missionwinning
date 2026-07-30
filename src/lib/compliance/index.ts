/**
 * In-repo compliance monitor (Vanta-lite) — catalog load + probes.
 * Not a certification. See docs/COMPLIANCE.md.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { getDeployReadinessReport } from '@/lib/deployReadiness';

const require = createRequire(import.meta.url);
// js-yaml is a transitive dependency (available in node_modules).
const yaml = require('js-yaml') as {
  load: (input: string) => unknown;
};

export type ComplianceFramework = 'soc2' | 'iso27001' | 'hipaa';
export type ComplianceOwner = 'agent' | 'founder';
export type ComplianceProbe =
  | 'doc_exists'
  | 'headers'
  | 'deploy_readiness'
  | 'dependabot'
  | 'ci_audit'
  | 'manual'
  | 'partial'
  | 'n_a';
export type ComplianceSeedStatus = 'automated' | 'manual' | 'partial' | 'n_a';
export type ComplianceResultStatus = 'pass' | 'fail' | 'partial' | 'manual' | 'n_a';

export type ComplianceControl = {
  id: string;
  title: string;
  frameworks: ComplianceFramework[];
  category: string;
  owner: ComplianceOwner;
  evidence: string;
  probe: ComplianceProbe;
  status: ComplianceSeedStatus;
  notes?: string;
};

export type ComplianceCatalog = {
  version: number;
  disclaimer: string;
  controls: ComplianceControl[];
};

export type ControlEvaluation = {
  id: string;
  title: string;
  frameworks: ComplianceFramework[];
  owner: ComplianceOwner;
  probe: ComplianceProbe;
  result: ComplianceResultStatus;
  evidence: string;
  detail: string;
};

export type FrameworkCounts = Record<
  ComplianceFramework,
  Record<ComplianceResultStatus, number>
>;

export type ComplianceReport = {
  generatedAt: string;
  disclaimer: string;
  version: number;
  totals: Record<ComplianceResultStatus, number>;
  byFramework: FrameworkCounts;
  controls: ControlEvaluation[];
};

const FRAMEWORKS: ComplianceFramework[] = ['soc2', 'iso27001', 'hipaa'];
const RESULTS: ComplianceResultStatus[] = ['pass', 'fail', 'partial', 'manual', 'n_a'];

export function defaultCatalogPath(repoRoot = process.cwd()): string {
  return join(repoRoot, 'docs/compliance/controls.yaml');
}

export function loadComplianceCatalog(repoRoot = process.cwd()): ComplianceCatalog {
  const path = defaultCatalogPath(repoRoot);
  const raw = readFileSync(path, 'utf8');
  const doc = yaml.load(raw) as {
    version?: number;
    disclaimer?: string;
    controls?: ComplianceControl[];
  };
  if (!doc?.controls || !Array.isArray(doc.controls)) {
    throw new Error(`Invalid compliance catalog at ${path}`);
  }
  return {
    version: doc.version ?? 1,
    disclaimer: (doc.disclaimer ?? '').trim(),
    controls: doc.controls,
  };
}

function emptyFrameworkCounts(): FrameworkCounts {
  const byFramework = {} as FrameworkCounts;
  for (const fw of FRAMEWORKS) {
    byFramework[fw] = { pass: 0, fail: 0, partial: 0, manual: 0, n_a: 0 };
  }
  return byFramework;
}

function emptyTotals(): Record<ComplianceResultStatus, number> {
  return { pass: 0, fail: 0, partial: 0, manual: 0, n_a: 0 };
}

export function probeHeaders(repoRoot: string): { ok: boolean; detail: string } {
  const path = join(repoRoot, 'vercel.json');
  if (!existsSync(path)) return { ok: false, detail: 'vercel.json missing' };
  const text = readFileSync(path, 'utf8');
  const needed = [
    'Strict-Transport-Security',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy',
  ];
  const missing = needed.filter((h) => !text.includes(h));
  if (missing.length) {
    return { ok: false, detail: `Missing headers: ${missing.join(', ')}` };
  }
  return { ok: true, detail: 'HSTS + core security headers present' };
}

export function probeCiAudit(repoRoot: string): { ok: boolean; detail: string } {
  const path = join(repoRoot, '.github/workflows/ci.yml');
  if (!existsSync(path)) return { ok: false, detail: 'ci.yml missing' };
  const text = readFileSync(path, 'utf8');
  /*
   * Either spelling counts.
   *
   * `.200` moved ci.yml from the raw `npm audit --audit-level=high` to
   * `npm run security-audit`, so that package.json holds the one definition of
   * what the audit *is*. This probe grepped for the raw form and reported the
   * control as failing while the audit still ran — a control that measures a
   * spelling rather than the fact it is about.
   */
  const runsAudit = text.includes('npm audit') || text.includes('npm run security-audit');
  if (!runsAudit) {
    return { ok: false, detail: 'no dependency-audit step found in ci.yml' };
  }
  const soft = text.includes('continue-on-error: true');
  return {
    ok: true,
    detail: soft ? 'npm audit present (soft / continue-on-error)' : 'npm audit present',
  };
}

export function evaluateControl(
  control: ComplianceControl,
  repoRoot = process.cwd()
): ControlEvaluation {
  const base = {
    id: control.id,
    title: control.title,
    frameworks: control.frameworks,
    owner: control.owner,
    probe: control.probe,
    evidence: control.evidence,
  };

  switch (control.probe) {
    case 'n_a':
      return { ...base, result: 'n_a', detail: control.notes || 'Not applicable' };
    case 'manual':
      return { ...base, result: 'manual', detail: control.notes || 'Founder / manual evidence' };
    case 'partial':
      return { ...base, result: 'partial', detail: control.notes || 'Partial control' };
    case 'doc_exists': {
      const path = join(repoRoot, control.evidence);
      const ok = existsSync(path);
      return {
        ...base,
        result: ok ? 'pass' : 'fail',
        detail: ok ? `Found ${control.evidence}` : `Missing ${control.evidence}`,
      };
    }
    case 'dependabot': {
      const path = join(repoRoot, control.evidence || '.github/dependabot.yml');
      const ok = existsSync(path);
      return {
        ...base,
        result: ok ? 'pass' : 'fail',
        detail: ok ? 'Dependabot config present' : 'Dependabot config missing',
      };
    }
    case 'headers': {
      const { ok, detail } = probeHeaders(repoRoot);
      return { ...base, result: ok ? 'pass' : 'fail', detail };
    }
    case 'ci_audit': {
      const { ok, detail } = probeCiAudit(repoRoot);
      // Soft audit is intentional → partial when present
      if (!ok) return { ...base, result: 'fail', detail };
      return { ...base, result: 'partial', detail };
    }
    case 'deploy_readiness': {
      try {
        const r = getDeployReadinessReport();
        const ok = r.buildLabelValid && r.localeFiles >= 72;
        return {
          ...base,
          result: ok ? 'pass' : 'fail',
          detail: ok
            ? `Deploy readiness OK (label ${r.buildLabel}, ${r.localeFiles} locale files)`
            : `Deploy readiness failed (labelValid=${r.buildLabelValid}, files=${r.localeFiles})`,
        };
      } catch (e) {
        return {
          ...base,
          result: 'fail',
          detail: e instanceof Error ? e.message : String(e),
        };
      }
    }
    default:
      return { ...base, result: 'fail', detail: `Unknown probe: ${control.probe}` };
  }
}

export function buildComplianceReport(repoRoot = process.cwd()): ComplianceReport {
  const catalog = loadComplianceCatalog(repoRoot);
  const controls = catalog.controls.map((c) => evaluateControl(c, repoRoot));
  const totals = emptyTotals();
  const byFramework = emptyFrameworkCounts();

  for (const ev of controls) {
    totals[ev.result] += 1;
    for (const fw of ev.frameworks) {
      if (byFramework[fw]) byFramework[fw][ev.result] += 1;
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    disclaimer: catalog.disclaimer,
    version: catalog.version,
    totals,
    byFramework,
    controls,
  };
}

export function formatComplianceConsole(report: ComplianceReport): string {
  const lines: string[] = [
    'Compliance status (not a certification)',
    report.disclaimer.slice(0, 120) + (report.disclaimer.length > 120 ? '…' : ''),
    '',
    `Totals: pass=${report.totals.pass} partial=${report.totals.partial} manual=${report.totals.manual} n_a=${report.totals.n_a} fail=${report.totals.fail}`,
    '',
  ];
  for (const fw of FRAMEWORKS) {
    const c = report.byFramework[fw];
    lines.push(
      `${fw}: pass=${c.pass} partial=${c.partial} manual=${c.manual} n_a=${c.n_a} fail=${c.fail}`
    );
  }
  const fails = report.controls.filter((c) => c.result === 'fail');
  if (fails.length) {
    lines.push('', 'Failures:');
    for (const f of fails) {
      lines.push(`  - ${f.id}: ${f.detail}`);
    }
  }
  return lines.join('\n');
}

const SNAPSHOT_START = '<!-- compliance-snapshot:start -->';
const SNAPSHOT_END = '<!-- compliance-snapshot:end -->';

export function renderSnapshotMarkdown(report: ComplianceReport): string {
  const rows = FRAMEWORKS.map((fw) => {
    const c = report.byFramework[fw];
    return `| ${fw} | ${c.pass} | ${c.partial} | ${c.manual} | ${c.n_a} | ${c.fail} |`;
  }).join('\n');

  return [
    SNAPSHOT_START,
    '',
    `_Generated ${report.generatedAt} (catalog v${report.version}). Re-run \`npm run compliance:status -- --write-md\`._`,
    '',
    '| Framework | Pass | Partial | Manual | N/A | Fail |',
    '|-----------|------|---------|--------|-----|------|',
    rows,
    '',
    `**Overall:** pass=${report.totals.pass} · partial=${report.totals.partial} · manual=${report.totals.manual} · n_a=${report.totals.n_a} · fail=${report.totals.fail}`,
    '',
    SNAPSHOT_END,
  ].join('\n');
}

export function upsertComplianceSnapshotMd(
  markdown: string,
  report: ComplianceReport
): string {
  const block = renderSnapshotMarkdown(report);
  if (markdown.includes(SNAPSHOT_START) && markdown.includes(SNAPSHOT_END)) {
    const re = new RegExp(
      `${SNAPSHOT_START}[\\s\\S]*?${SNAPSHOT_END}`,
      'm'
    );
    return markdown.replace(re, block);
  }
  return `${markdown.trimEnd()}\n\n## Current snapshot\n\n${block}\n`;
}

export { FRAMEWORKS, RESULTS, SNAPSHOT_START, SNAPSHOT_END };
