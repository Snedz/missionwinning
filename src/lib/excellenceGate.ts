/**
 * Horizon W excellence process ratchet.
 *
 * Machine-checkable half: `docs/EXCELLENCE_RESULT.md` status + path policy on
 * changed files. Not phone-proof — agents can still write `status: pass`; the
 * ratchet stops *silent* surface expansion while the gate is blank.
 *
 * One definition of the path map: `KNOWN_TOP_LEVELS` + prefix/file infra rules.
 * Staleness tests discover tree top-levels and fail on unknown or stale entries.
 */

import { readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

export type ExcellenceStatus = 'unscored' | 'pass' | 'fail';
export type PathClass = 'wedge' | 'surface' | 'infra' | 'exempt';

export const EXCELLENCE_RESULT_PATH = 'docs/EXCELLENCE_RESULT.md';

const STATUS_RE =
  /(?:^|\n)\s*(?:-\s*)?\*\*status:\*\*\s*(\S+)|(?:^|\n)\s*status:\s*(\S+)/i;

const OVERRIDE_RE = /^Excellence-Override:\s*\S+/m;

/** Exact files always infra (bootstrap + ship protocol). */
const INFRA_FILES = new Set([
  EXCELLENCE_RESULT_PATH,
  'ORCHESTRATION.md',
  'CONTEXT.md',
  'LOG.md',
  'SECURITY.md',
  'AGENTS.md',
  'Claude.md',
  'CLAUDE.md',
  'src/lib/buildInfo.ts',
  'src/lib/excellenceGate.ts',
  'src/lib/excellenceGate.test.ts',
  'scripts/check-excellence-gate.ts',
  // Android Accept B is separate from web RESULT; pointer edits are docs.
  'apps/android/FOUNDER_ACCEPT.md',
  'apps/android/AGENTS.md',
]);

/** Prefixes always infra. */
const INFRA_PREFIXES = ['scripts/', '.github/'];

/** Wedge page shells under src/page-components/. */
const WEDGE_PAGE_COMPONENTS = new Set([
  'src/page-components/ActiveWorkoutPage.tsx',
  'src/page-components/HomePage.tsx',
  'src/page-components/CoachPage.tsx',
]);

/** Wedge hooks (exact). */
const WEDGE_HOOKS = new Set([
  'src/hooks/useCoachPlan.ts',
  'src/hooks/useDailyCoachInsight.ts',
  'src/hooks/useActiveWorkoutPulse.ts',
  'src/hooks/useMissionJourney.ts',
  'src/hooks/useJourneySync.ts',
  'src/hooks/useOutboxDrain.ts',
]);

/**
 * Top-level dirs under product roots → class.
 * Fail-closed: every discovered top-level must appear here (staleness test).
 * Wedge rows match the locked eng design (workout/today/journey/coach + routes).
 */
export const KNOWN_TOP_LEVELS: Readonly<Record<string, 'wedge' | 'surface'>> = {
  // app/(app)
  'app/(app)/accessibility': 'surface',
  'app/(app)/account': 'surface',
  'app/(app)/active': 'wedge',
  'app/(app)/america': 'surface',
  'app/(app)/assessments': 'surface',
  'app/(app)/benchmarks': 'surface',
  'app/(app)/beta': 'surface',
  'app/(app)/builder': 'surface',
  'app/(app)/calculators': 'surface',
  'app/(app)/coach': 'wedge',
  'app/(app)/coaching': 'surface',
  'app/(app)/cookies': 'surface',
  'app/(app)/dmca': 'surface',
  'app/(app)/feedback': 'surface',
  'app/(app)/fitness-test': 'surface',
  'app/(app)/history': 'surface',
  'app/(app)/join': 'surface',
  'app/(app)/leaderboard': 'surface',
  'app/(app)/learn': 'surface',
  'app/(app)/library': 'surface',
  'app/(app)/log': 'wedge',
  'app/(app)/mind': 'surface',
  'app/(app)/move': 'surface',
  'app/(app)/nutrition': 'surface',
  'app/(app)/privacy': 'surface',
  'app/(app)/profile': 'surface',
  'app/(app)/programs': 'surface',
  'app/(app)/refunds': 'surface',
  'app/(app)/regions': 'surface',
  'app/(app)/school': 'surface',
  'app/(app)/service-terms': 'surface',
  'app/(app)/terms': 'surface',
  'app/(app)/track': 'surface',
  'app/(app)/usage': 'surface',
  // src/lib
  'src/lib/activation': 'surface',
  'src/lib/api': 'surface',
  'src/lib/beta': 'surface',
  'src/lib/checkout': 'surface',
  'src/lib/coach': 'wedge',
  'src/lib/compliance': 'surface',
  'src/lib/cryptoCheckout': 'surface',
  'src/lib/design': 'surface',
  'src/lib/fuelCoach': 'surface',
  'src/lib/guidebook': 'surface',
  'src/lib/history': 'surface',
  'src/lib/i18n': 'surface',
  'src/lib/identity': 'surface',
  'src/lib/journal': 'surface',
  'src/lib/journey': 'wedge',
  'src/lib/leaderboard': 'surface',
  'src/lib/learn': 'surface',
  'src/lib/legal': 'surface',
  'src/lib/library': 'surface',
  'src/lib/llm': 'surface',
  'src/lib/mind': 'surface',
  'src/lib/move': 'surface',
  'src/lib/nutrition': 'surface',
  'src/lib/premium': 'surface',
  'src/lib/rewards': 'surface',
  'src/lib/share': 'surface',
  'src/lib/speech': 'surface',
  'src/lib/storage': 'wedge',
  'src/lib/sync': 'wedge',
  'src/lib/time': 'surface',
  'src/lib/transparency': 'surface',
  'src/lib/today': 'wedge',
  'src/lib/track': 'surface',
  'src/lib/trends': 'surface',
  'src/lib/wearables': 'surface',
  'src/lib/workout': 'wedge',
  // src/components
  'src/components/america': 'surface',
  'src/components/auth': 'surface',
  'src/components/benchmarks': 'surface',
  'src/components/beta': 'surface',
  'src/components/brand': 'surface',
  'src/components/builder': 'surface',
  'src/components/calculators': 'surface',
  'src/components/charts': 'surface',
  'src/components/coach': 'wedge',
  'src/components/crypto': 'surface',
  'src/components/fitness-test': 'surface',
  'src/components/form': 'surface',
  'src/components/history': 'surface',
  'src/components/i18n': 'surface',
  'src/components/journey': 'wedge',
  'src/components/landing': 'surface',
  'src/components/layout': 'surface',
  'src/components/leaderboard': 'surface',
  'src/components/learn': 'surface',
  'src/components/library': 'surface',
  'src/components/marketing': 'surface',
  'src/components/metrics': 'surface',
  'src/components/mind': 'surface',
  'src/components/move': 'surface',
  'src/components/nutrition': 'surface',
  'src/components/pillars': 'surface',
  'src/components/profile': 'surface',
  'src/components/public': 'surface',
  'src/components/rewards': 'surface',
  'src/components/session': 'surface',
  'src/components/today': 'wedge',
  'src/components/track': 'surface',
  'src/components/transparency': 'surface',
  'src/components/ui': 'surface',
  'src/components/workout': 'wedge',
  // apps/android (native product — surface until web excellence pass; Accept B separate)
  'apps/android/app': 'surface',
  'apps/android/benchmark': 'surface',
  // `build/` is Gradle output (gitignored) — not a source top-level.
  'apps/android/core': 'surface',
  'apps/android/feature': 'surface',
  'apps/android/gradle': 'surface',
  'apps/android/scripts': 'surface',
  'apps/android/store-assets': 'surface',
  'apps/android/wear': 'surface',
};

/** Coach API: free plan/insight wedge; Bundle voice/chat depth surface. */
const COACH_API_SURFACE_PREFIXES = [
  'app/api/coach/chat/',
  'app/api/coach/plan-voice/',
  'app/api/coach/debrief-voice/',
];

const COACH_API_WEDGE_PREFIX = 'app/api/coach/';

const WEDGE_PREFIXES = [
  'packages/mw-core/',
  'src/store/',
];

const PRODUCT_PREFIXES = ['app/', 'src/', 'apps/android/', 'packages/mw-core/'];

export function readExcellenceStatus(raw: string, warn?: (msg: string) => void): ExcellenceStatus {
  const m = STATUS_RE.exec(raw);
  const token = (m?.[1] ?? m?.[2] ?? '').trim().toLowerCase().replace(/[,.]$/, '');
  if (token === 'pass' || token === 'fail' || token === 'unscored') return token;
  if (token) {
    warn?.(
      `excellenceGate: unknown status "${token}" in ${EXCELLENCE_RESULT_PATH} — treating as unscored`
    );
  }
  return 'unscored';
}

export function allowsSurfaceShip(status: ExcellenceStatus, override: boolean): boolean {
  return status === 'pass' || override === true;
}

export function readExcellenceOverride(opts: {
  commitMessages: string[];
  prBody?: string;
  envOverride?: boolean;
  isCI: boolean;
}): boolean {
  for (const msg of opts.commitMessages) {
    if (OVERRIDE_RE.test(msg)) return true;
  }
  if (opts.prBody && OVERRIDE_RE.test(opts.prBody)) return true;
  if (!opts.isCI && opts.envOverride) return true;
  return false;
}

function normalizeRepoPath(repoRelativePath: string): string {
  return repoRelativePath.replace(/\\/g, '/').replace(/^\.\//, '');
}

function topLevelKeyFor(p: string): string | null {
  const appRoute = /^app\/\(app\)\/([^/]+)/.exec(p);
  if (appRoute) return `app/(app)/${appRoute[1]}`;
  const lib = /^src\/lib\/([^/]+)\//.exec(p);
  if (lib) return `src/lib/${lib[1]}`;
  const comp = /^src\/components\/([^/]+)\//.exec(p);
  if (comp) return `src/components/${comp[1]}`;
  const android = /^apps\/android\/([^/]+)/.exec(p);
  if (android) return `apps/android/${android[1]}`;
  return null;
}

export function classifyPath(repoRelativePath: string): PathClass {
  const p = normalizeRepoPath(repoRelativePath);
  if (!p) return 'exempt';

  if (INFRA_FILES.has(p)) return 'infra';
  for (const pref of INFRA_PREFIXES) {
    if (p === pref.slice(0, -1) || p.startsWith(pref)) return 'infra';
  }

  // Coach API exceptions before general coach API wedge
  for (const pref of COACH_API_SURFACE_PREFIXES) {
    if (p.startsWith(pref) || p === pref.slice(0, -1)) return 'surface';
  }
  if (p === 'app/api/coach' || p.startsWith(COACH_API_WEDGE_PREFIX)) return 'wedge';

  if (WEDGE_PAGE_COMPONENTS.has(p)) return 'wedge';
  if (p.startsWith('src/page-components/')) return 'surface';

  if (WEDGE_HOOKS.has(p)) return 'wedge';
  if (p.startsWith('src/hooks/')) return 'surface';

  for (const pref of WEDGE_PREFIXES) {
    if (p === pref.slice(0, -1) || p.startsWith(pref)) return 'wedge';
  }

  // Flat files under src/lib/
  if (/^src\/lib\/[^/]+\.(ts|tsx|js|mjs)$/.test(p)) {
    if (p === 'src/lib/excellenceGate.ts' || p === 'src/lib/excellenceGate.test.ts') return 'infra';
    if (p === 'src/lib/buildInfo.ts') return 'infra';
    return 'surface';
  }

  const top = topLevelKeyFor(p);
  if (top && KNOWN_TOP_LEVELS[top]) return KNOWN_TOP_LEVELS[top];

  for (const pref of PRODUCT_PREFIXES) {
    if (p === pref.slice(0, -1) || p.startsWith(pref)) return 'surface';
  }

  // Root package files, pure docs (except RESULT), lockfiles
  if (
    p === 'package.json' ||
    p === 'package-lock.json' ||
    p.endsWith('/package-lock.json') ||
    p.startsWith('docs/')
  ) {
    return p === EXCELLENCE_RESULT_PATH ? 'infra' : 'exempt';
  }

  return 'exempt';
}

/** Paths classified surface that would be blocked without pass/override. */
export function blockedSurfacePaths(
  paths: string[],
  status: ExcellenceStatus,
  override: boolean
): string[] {
  if (allowsSurfaceShip(status, override)) return [];
  return paths.filter((p) => classifyPath(p) === 'surface');
}

const DISCOVER_ROOTS: { root: string; keyPrefix: string; mode: 'dirs' }[] = [
  { root: 'app/(app)', keyPrefix: 'app/(app)/', mode: 'dirs' },
  { root: 'src/lib', keyPrefix: 'src/lib/', mode: 'dirs' },
  { root: 'src/components', keyPrefix: 'src/components/', mode: 'dirs' },
  { root: 'apps/android', keyPrefix: 'apps/android/', mode: 'dirs' },
];

/** Discover top-level dir keys for staleness (repo root = process.cwd()). */
export function discoverTopLevelKeys(repoRoot: string = process.cwd()): string[] {
  const out: string[] = [];
  for (const { root, keyPrefix } of DISCOVER_ROOTS) {
    const abs = path.join(repoRoot, root);
    if (!existsSync(abs)) continue;
    for (const name of readdirSync(abs)) {
      if (name.startsWith('.')) continue;
      const full = path.join(abs, name);
      if (!statSync(full).isDirectory()) continue;
      // Skip Next.js special files if any appear as dirs
      if (name === 'layout.tsx' || name === 'loading.tsx') continue;
      out.push(`${keyPrefix}${name}`);
    }
  }
  return out.sort();
}

/**
 * Staleness: every discovered top-level must be in KNOWN_TOP_LEVELS,
 * and every KNOWN entry must still exist on disk (when repoRoot provided).
 */
export function topLevelClassificationGaps(repoRoot: string = process.cwd()): {
  missingFromMap: string[];
  staleInMap: string[];
} {
  const discovered = new Set(discoverTopLevelKeys(repoRoot));
  const known = new Set(Object.keys(KNOWN_TOP_LEVELS));
  const missingFromMap = [...discovered].filter((k) => !known.has(k)).sort();
  const staleInMap = [...known].filter((k) => !discovered.has(k)).sort();
  return { missingFromMap, staleInMap };
}
