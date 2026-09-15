/**
 * Paths that must not enter the public Alpha progress snapshot.
 *
 * The snapshot is a filtered copy of *tracked* files (`git ls-files`).
 * Gitignored secrets (ops/, .hermes/, .env.local) never appear there;
 * NEVER_PREFIXES is a belt in case they ever get staged.
 *
 * docs/archive/ does NOT stay. It was previously claimed to be required by the
 * logBudget + contextBudget tests; verified otherwise — those tests read the
 * WORKING TREE (readFileSync(root + 'docs/archive/...')), not the snapshot. No
 * test constrains the snapshot's contents, so the archive is free to leave it.
 * It held 771 rotated copies of documents this file already denied at the root.
 */

/**
 * The public snapshot is a SOURCE MIRROR, not a progress report.
 *
 * Everything is INTERNAL by default. A path ships only if it matches below, and
 * adding a line is a deliberate, reviewed act. This inverts the old denylist,
 * which shipped anything nobody had remembered to name — on 2026-09-15 that
 * denylist shipped 826 planning-layer files while its own test stayed green.
 *
 * The test asserts the DEFAULT, so a new strategy doc is denied without anyone
 * editing this file. If you are adding a path here, you are promoting it to
 * public: say why in the commit.
 *
 * Replaced 2026-09-15 per
 * `mission-ops/memory/craft/2026-09-15-public-snapshot-allowlist-spec.md` §3.
 */

/** Root files that ship. Anything else at the root is denied. */
export const ALLOW_ROOT = new Set([
  // Governance + licensing
  'LICENSE', 'README.md', 'CHANGELOG.md', 'CONTRIBUTING.md',
  'CODE_OF_CONDUCT.md', 'SECURITY.md', 'PUBLIC_SNAPSHOT.md',
  // Build + tooling config
  'package.json', 'package-lock.json', 'tsconfig.json', 'next.config.js',
  'tailwind.config.js', 'postcss.config.js', 'eslint.config.js',
  'playwright.config.ts', 'components.json', 'vercel.json',
  'docker-compose.graph.yml', 'instrumentation.ts', 'proxy.ts',
  'sentry.client.config.ts', 'sentry.edge.config.ts', 'sentry.server.config.ts',
  'skills-lock.json',
  // Templates + ignore rules (no secrets)
  '.gitignore', '.vercelignore', '.gitleaks.toml', '.env.example',
  '.mcp.json.example',
]);

/** Directories that ship recursively. Anything else is denied. */
export const ALLOW_PREFIXES = [
  'src/', 'app/', 'apps/', 'packages/', 'tests/', 'scripts/',
  'supabase/', 'public/', '.github/',
];

/**
 * docs/ is NOT allowed wholesale — it holds ~110 files and the planning layer is
 * most of them (docs/PLAN.md, docs/THESIS.md, docs/archive/). Product docs only,
 * named. Founded on the same audit that found `docs/archive/` publishing 771
 * rotated copies of documents the denylist had already denied at the root.
 */
export const ALLOW_DOCS = new Set([
  'docs/README.md', 'docs/INDEX.md', 'docs/ARCHITECTURE.md', 'docs/API.md',
  'docs/API_MOBILE.md', 'docs/DESIGN_SYSTEM.md', 'docs/COMPLIANCE.md',
  'docs/LEGAL_SAFETY.md', 'docs/OWASP_AUDIT.md', 'docs/ENV.md',
]);
export const ALLOW_DOCS_PREFIXES = ['docs/help/', 'docs/contracts/'];

export function isAllowed(rel) {
  const n = normalizeRel(rel);
  if (!n) return false;
  if (ALLOW_ROOT.has(n)) return true;
  if (ALLOW_PREFIXES.some((p) => n.startsWith(p))) return true;
  if (ALLOW_DOCS.has(n)) return true;
  if (ALLOW_DOCS_PREFIXES.some((p) => n.startsWith(p))) return true;
  return false;
}

export const DENY_MEDIA_UNDER = [
  {
    prefix: 'docs/gauntlet/',
    suffixes: ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
  },
  {
    // Studio stills. Keep docs/design/concepts/*.html — unit tests read them.
    prefix: 'docs/design/',
    suffixes: ['.png', '.jpg', '.jpeg', '.webp', '.gif'],
  },
  {
    prefix: 'docs/design/variants/',
    suffixes: ['.html'],
  },
];

/** Absolute refuse even if tracked. Trailing slash = directory. */
export const NEVER_PREFIXES = ['ops/', '.hermes/'];

export function normalizeRel(rel) {
  return String(rel || '').replaceAll('\\', '/').replace(/^\.\//, '');
}

function isSecretEnvFile(n) {
  if (n === '.env.example') return false;
  return n === '.env' || n.startsWith('.env.');
}

export function isNever(rel) {
  const n = normalizeRel(rel);
  if (!n) return true;
  if (isSecretEnvFile(n)) return true;
  return NEVER_PREFIXES.some((p) => n === p.slice(0, -1) || n.startsWith(p));
}

export function isDenied(rel) {
  const n = normalizeRel(rel);
  if (!n) return true;
  if (isNever(n)) return true;          // ops/, .hermes/, .env.* — unchanged belt
  if (!isAllowed(n)) return true;       // <-- THE RULE: default deny, explicit promote
  for (const { prefix, suffixes } of DENY_MEDIA_UNDER) {
    if (n.startsWith(prefix) && suffixes.some((s) => n.toLowerCase().endsWith(s))) {
      return true;
    }
  }
  return false;
}

export function selectSnapshotPaths(tracked) {
  return tracked.map(normalizeRel).filter((p) => p && !isDenied(p));
}
