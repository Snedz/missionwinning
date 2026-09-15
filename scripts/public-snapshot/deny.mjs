/**
 * Paths that must not enter the public Alpha progress snapshot.
 *
 * The snapshot is a filtered copy of *tracked* files (`git ls-files`).
 * Gitignored secrets (ops/, .hermes/, .env.local) never appear there;
 * NEVER_PREFIXES is a belt in case they ever get staged.
 *
 * docs/archive/ stays. logBudget + contextBudget tests require the rotation
 * history; it is already on the working public copy and is not war-room.
 */

/**
 * Strategy and operating material. Added 2026-09-15 after an exposure audit found
 * the public snapshot serving `vision.md`, `ORCHESTRATION.md`, a 53 KB
 * `CONTEXT.md`, `LOG.md`, `seo/` (competitors, outreach, launch) and
 * `docs/THESIS.md` — including a publicly searchable self-assessment
 * ("no defensible moat"). Making the working repo private did not remove any of
 * it, because the snapshot is a *generated export* of this tree.
 *
 * ⚠ THIS IS STILL A DENYLIST. A new strategy file leaks by default. The real fix
 * is to invert the control: default INTERNAL, explicitly promote to PUBLIC (see
 * the exposure audit §4). Until then, anything strategic added at the root must
 * be named here or it ships.
 */
export const DENY_EXACT = new Set([
  'PLAN.md',
  'IMPROVEMENT_LOG.md',
  // Strategy / future direction
  'vision.md',
  'ORCHESTRATION.md',
  // Operating state + history
  'CONTEXT.md',
  'LOG.md',
  'INDEX.md',
  // Agent operating manual — internal process, not product
  'CLAUDE.md',
  'AGENTS.md',
  'GEMINI.md',
  // Strategy docs (competitive self-assessment, wedge, ICP, region policy)
  'docs/THESIS.md',
  'docs/CREATIVE_MONOPOLY.md',
]);

export const DENY_PREFIXES = [
  'docs/overnight/',
  'docs/places/',
  'docs/plans/',
  // GTM intelligence: competitor sets, outreach, launch plan, keywords
  'seo/',
];

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
  if (isNever(n)) return true;
  if (DENY_EXACT.has(n)) return true;
  if (DENY_PREFIXES.some((p) => n === p.slice(0, -1) || n.startsWith(p))) return true;
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
