import { APP_BUILD_LABEL } from '@/lib/buildInfo';
import { getDeployReadinessReport, validateBuildLabel } from '@/lib/deployReadiness';

export type LaunchCheckStatus = 'ready' | 'blocked' | 'manual';

export interface LaunchCheckItem {
  id: string;
  label: string;
  status: LaunchCheckStatus;
  detail: string;
}

export interface LaunchReadinessReport {
  buildLabel: string;
  phaseJComplete: boolean;
  phaseHBlockedOnDeploy: boolean;
  checks: LaunchCheckItem[];
  readyCount: number;
  blockedCount: number;
  manualCount: number;
}

/** Static Phase H + Phase J readiness — no network. */
export function getLaunchReadinessReport(): LaunchReadinessReport {
  const deploy = getDeployReadinessReport();
  const buildOk = validateBuildLabel(deploy.buildLabel);

  const checks: LaunchCheckItem[] = [
    {
      id: 'build-label',
      label: 'Build label valid on Profile',
      status: buildOk ? 'ready' : 'blocked',
      detail: deploy.buildLabel,
    },
    {
      id: 'unit-tests',
      label: 'Unit test suite (npm test)',
      status: 'manual',
      detail: 'Run before merge — 206+ tests expected',
    },
    {
      id: 'phase-j-pathfinder',
      label: 'Phase J — Pathfinder assessment',
      status: 'ready',
      detail: '/assessments care-access step + low-impact gating',
    },
    {
      id: 'phase-j-offline',
      label: 'Phase J — Offline coach + plans',
      status: 'ready',
      detail: 'Connectivity banner, IndexedDB outbox, /builder offline plans',
    },
    {
      id: 'beta-gates',
      label: 'Beta gates — I-Day ≥80%, Basic Training ≥60%',
      status: 'manual',
      detail: 'Profile beta panel + /api/beta/metrics',
    },
    {
      id: 'vercel-env',
      label: 'GitHub Secrets → Sync Vercel env',
      status: 'blocked',
      detail: 'VERCEL_TOKEN, PRIVATE_ACCESS_SECRET, Supabase keys — see ENV.md',
    },
    {
      id: 'supabase-migrations',
      label: 'Supabase migrations (PFT + youth + leaderboard)',
      status: 'manual',
      detail: 'See PRE_LAUNCH_PLAN.md migration table',
    },
    {
      id: 'gate-smoke',
      label: 'Production gate-smoke',
      status: 'manual',
      detail: 'SMOKE_BASE_URL=https://www.missionwinning.com npm run gate-smoke',
    },
    {
      id: 'stripe-i1',
      label: 'Phase I1 — Stripe webhook + Checkout API scaffold',
      status: 'ready',
      detail: '/api/stripe-webhook (verified) + /api/stripe/create-checkout-session — set keys when LLC ready',
    },
    {
      id: 'coach-i2',
      label: 'Phase I2 — Premium AI Coach + plan generator',
      status: 'ready',
      detail: 'Cloud LLM + /api/coach/generate-plan gated; rules/offline free on /log and /builder',
    },
    {
      id: 'i18n-i4',
      label: 'Phase I4 — Tier 1 body copy (Welcome/Fuel/Active/Today)',
      status: 'ready',
      detail: 'Today/Welcome/Fuel/Active full Tier 1; export-locales',
    },
    {
      id: 'mind-i3',
      label: 'Phase I3 — Mind premium guided sessions',
      status: 'ready',
      detail: '/api/premium/mind-sessions + 6 gated sessions on /mind; free tier unchanged',
    },
    {
      id: 'move-i3',
      label: 'Phase I3 — Move premium mobility flows',
      status: 'ready',
      detail: '/api/premium/move-flows + 5 gated flows on /move; free tier unchanged',
    },
    {
      id: 'track-i3',
      label: 'Phase I3 — Track premium activity programs',
      status: 'ready',
      detail: '/api/premium/track-programs + 5 programs on /track; pace insight when premium',
    },
    {
      id: 'demo-premium-off',
      label: 'DEMO_PREMIUM=false in production',
      status: 'blocked',
      detail: 'Set in Vercel before PUBLIC launch',
    },
    {
      id: 'private-mode-off',
      label: 'PRIVATE_MODE=false → public + PWA on',
      status: 'blocked',
      detail: 'Only after beta gates pass — enables installable PWA',
    },
    {
      id: 'hero-mobile-qa',
      label: 'Hero mobile flow QA',
      status: 'manual',
      detail: 'Welcome → Today → workout → sign-in → language switch',
    },
  ];

  const readyCount = checks.filter((c) => c.status === 'ready').length;
  const blockedCount = checks.filter((c) => c.status === 'blocked').length;
  const manualCount = checks.filter((c) => c.status === 'manual').length;

  return {
    buildLabel: APP_BUILD_LABEL,
    phaseJComplete: true,
    phaseHBlockedOnDeploy: blockedCount > 0,
    checks,
    readyCount,
    blockedCount,
    manualCount,
  };
}

export function formatLaunchReadinessText(report: LaunchReadinessReport = getLaunchReadinessReport()): string {
  const lines = [
    `Mission Winning — Launch readiness (${report.buildLabel})`,
    '',
    `Phase J: ${report.phaseJComplete ? 'complete' : 'in progress'}`,
    `Ready: ${report.readyCount} · Manual: ${report.manualCount} · Blocked on deploy: ${report.blockedCount}`,
    '',
  ];
  for (const c of report.checks) {
    const icon = c.status === 'ready' ? '✓' : c.status === 'blocked' ? '⏸' : '○';
    lines.push(`${icon} [${c.status}] ${c.label}`);
    lines.push(`    ${c.detail}`);
  }
  lines.push('');
  lines.push('Do not set PRIVATE_MODE=false until beta gates pass.');
  return lines.join('\n');
}
