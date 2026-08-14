/**
 * In-repo compliance monitor (Vanta-lite) — catalog load + probes.
 * Not a certification. See docs/COMPLIANCE.md.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';
import { getDeployReadinessReport } from '@/lib/deployReadiness';

const require = createRequire(import.meta.url);
// js-yaml is a transitive dependency (available in node_modules).
const yaml = require('js-yaml') as {
  load: (input: string) => unknown;
};

export type ComplianceFramework =
  | 'soc2'
  | 'iso27001'
  | 'hipaa'
  | 'ccpa'
  | 'coppa'
  | 'play_data'
  | 'ftc_ai';
export type ComplianceOwner = 'agent' | 'founder';
export type ComplianceProbe =
  | 'doc_exists'
  | 'headers'
  | 'deploy_readiness'
  | 'dependabot'
  | 'ci_audit'
  | 'source_scan'
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
  /** All of these strings must appear in the evidence scan. */
  require?: string[];
  /** None of these strings may appear in the evidence scan. */
  forbid?: string[];
  /**
   * Hunt id (e.g. P2-2). A failing source_scan becomes `partial`.
   * If the scan later *passes*, the result is `fail` (stale allowlist).
   */
  known_open?: string;
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

const FRAMEWORKS: ComplianceFramework[] = [
  'soc2',
  'iso27001',
  'hipaa',
  'ccpa',
  'coppa',
  'play_data',
  'ftc_ai',
];
const FRAMEWORK_SET = new Set<string>(FRAMEWORKS);
const RESULTS: ComplianceResultStatus[] = ['pass', 'fail', 'partial', 'manual', 'n_a'];

export function assertCatalogControls(controls: ComplianceControl[]): void {
  for (const c of controls) {
    if (!c?.id || !c.probe) {
      throw new Error(`Invalid control: missing id or probe`);
    }
    for (const fw of c.frameworks ?? []) {
      if (!FRAMEWORK_SET.has(fw)) {
        throw new Error(`Unknown framework '${fw}' on ${c.id}`);
      }
    }
    if (c.probe === 'source_scan') {
      const req = c.require?.length ?? 0;
      const forb = c.forbid?.length ?? 0;
      if (req + forb === 0) {
        throw new Error(`${c.id}: source_scan needs require or forbid`);
      }
    }
  }
}

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
  assertCatalogControls(doc.controls);
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

const SCAN_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.yml', '.yaml']);
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'coverage',
  'build',
  '.turbo',
]);
const SCAN_FILE_BUDGET = 400;

function collectScanFiles(repoRoot: string, rel: string, out: string[], budget: { n: number }) {
  if (budget.n <= 0) return;
  const abs = join(repoRoot, rel);
  if (!existsSync(abs)) return;
  const st = statSync(abs);
  if (st.isFile()) {
    out.push(rel);
    budget.n -= 1;
    return;
  }
  if (!st.isDirectory()) return;
  for (const name of readdirSync(abs)) {
    if (SKIP_DIRS.has(name)) continue;
    const childRel = rel ? join(rel, name) : name;
    const childAbs = join(repoRoot, childRel);
    let childSt;
    try {
      childSt = statSync(childAbs);
    } catch {
      continue;
    }
    if (childSt.isDirectory()) {
      collectScanFiles(repoRoot, childRel, out, budget);
    } else if (SCAN_EXT.has(extname(name))) {
      out.push(childRel);
      budget.n -= 1;
    }
    if (budget.n <= 0) return;
  }
}

/** Read evidence as one blob: a file as-is, or a directory of source/yaml files. */
export function readEvidenceBlob(repoRoot: string, evidence: string): { ok: boolean; text: string; detail: string } {
  const abs = join(repoRoot, evidence);
  if (!existsSync(abs)) {
    return { ok: false, text: '', detail: `Missing ${evidence}` };
  }
  const st = statSync(abs);
  if (st.isFile()) {
    return { ok: true, text: readFileSync(abs, 'utf8'), detail: evidence };
  }
  const files: string[] = [];
  collectScanFiles(repoRoot, evidence, files, { n: SCAN_FILE_BUDGET });
  if (!files.length) {
    return { ok: false, text: '', detail: `No scannable files under ${evidence}` };
  }
  const parts = files.map((f) => readFileSync(join(repoRoot, f), 'utf8'));
  return {
    ok: true,
    text: parts.join('\n'),
    detail: `${files.length} files under ${evidence}`,
  };
}

export function probeSourceScan(
  control: Pick<ComplianceControl, 'evidence' | 'require' | 'forbid'>,
  repoRoot: string
): { ok: boolean; detail: string } {
  const blob = readEvidenceBlob(repoRoot, control.evidence);
  if (!blob.ok) return { ok: false, detail: blob.detail };
  const missing = (control.require ?? []).filter((s) => !blob.text.includes(s));
  const hits = (control.forbid ?? []).filter((s) => blob.text.includes(s));
  if (missing.length) {
    return { ok: false, detail: `Missing required: ${missing.join(', ')}` };
  }
  if (hits.length) {
    return { ok: false, detail: `Forbidden present: ${hits.join(', ')}` };
  }
  return { ok: true, detail: `source_scan ok (${blob.detail})` };
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
    case 'source_scan': {
      const { ok, detail } = probeSourceScan(control, repoRoot);
      if (control.known_open) {
        if (ok) {
          return {
            ...base,
            result: 'fail',
            detail: `stale known_open ${control.known_open}: probe now passes — remove known_open from the catalog`,
          };
        }
        return {
          ...base,
          result: 'partial',
          detail: `known open (${control.known_open}): ${detail}`,
        };
      }
      return { ...base, result: ok ? 'pass' : 'fail', detail };
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
