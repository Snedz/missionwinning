/**
 * Which non-wedge surfaces are reachable.
 *
 * The repo carries far more surface than the wedge needs: a US/PFT school track
 * with COPPA and teacher support, class leaderboards, wearable OAuth, and two
 * payment rails beyond Stripe. Each one costs first paint, i18n parity, sitemap
 * entries, an API attack surface and a QA matrix — before a single user exists.
 *
 * This generalises the pattern already used by `isAmericaTrackEnabled`
 * (`src/lib/americaConfig.ts`) and `isFreeBeta` (`src/lib/freeBeta.ts`): parking is
 * reversible with one env var and deletes no code.
 *
 * The wedge — Today, Train, Coach, Fuel, You and the logger's own tools — is not
 * representable here on purpose. **The free logger is never gated** (CONTEXT.md
 * hard rule 2), so it must not be possible to express "logger off".
 */

/** Surfaces that may be parked. Anything absent from this union is always on. */
export type Surface =
  // Non-wedge by construction — legal, hardware or payment-rail surface.
  | 'america'
  | 'school'
  | 'wearables'
  | 'leaderboard'
  | 'cryptoRails'
  | 'paypal'
  // Secondary pillars and side tools. On by default (vision.md keeps six pillars
  // free-usable); `NEXT_PUBLIC_SURFACES=wedge` parks them for a wedge-only beta.
  | 'move'
  | 'mind'
  | 'track'
  | 'learn'
  | 'guidebook'
  | 'benchmarks'
  | 'calculators'
  | 'programs';

/**
 * Parked unless explicitly enabled. These add compliance, hardware or
 * payment-rail surface that the Train + Coach wedge does not need.
 */
const PARKED_BY_DEFAULT: readonly Surface[] = [
  'america',
  'school',
  'wearables',
  'leaderboard',
  'cryptoRails',
  'paypal',
];

/** Parked by `NEXT_PUBLIC_SURFACES=wedge`. */
const SECONDARY_PILLARS: readonly Surface[] = [
  'move',
  'mind',
  'track',
  'learn',
  'guidebook',
  'benchmarks',
  'calculators',
  'programs',
];

function rawList(): string[] {
  return (process.env.NEXT_PUBLIC_SURFACES ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * `NEXT_PUBLIC_SURFACES` — comma separated, case-insensitive:
 * - a surface name turns that surface **on** (e.g. `wearables,leaderboard`)
 * - `wedge` turns every secondary pillar **off**, leaving Today/Train/Coach/Fuel/You
 * - `all` turns everything on (useful for a full-surface QA pass)
 * - `-name` turns a surface off even if a preset enabled it
 */
export function isSurfaceEnabled(surface: Surface): boolean {
  const list = rawList();

  if (list.includes(`-${surface}`)) return false;
  if (list.includes(surface)) return true;
  if (list.includes('all')) return true;

  if (list.includes('wedge')) {
    // Wedge-only: nothing optional survives.
    return false;
  }

  if (PARKED_BY_DEFAULT.includes(surface)) return false;
  return SECONDARY_PILLARS.includes(surface);
}

/** Paths owned by each parkable surface — routes, API prefixes and sitemap entries. */
export const SURFACE_PATHS: Record<Surface, readonly string[]> = {
  america: ['/america', '/fitness-test'],
  school: ['/school/class', '/join/class', '/api/school', '/api/youth', '/youth/consent'],
  wearables: ['/api/wearables'],
  leaderboard: ['/leaderboard'],
  cryptoRails: ['/api/crypto-checkout'],
  paypal: ['/api/paypal-webhook'],
  move: ['/move'],
  mind: ['/mind'],
  track: ['/track'],
  learn: ['/learn', '/paths'],
  guidebook: ['/learn/guide', '/guide'],
  benchmarks: ['/benchmarks'],
  calculators: ['/calculators'],
  programs: ['/programs'],
};

/**
 * The surface owning `pathname`, or null when it belongs to the wedge.
 * Longest match wins so `/learn/guide` resolves to `guidebook`, not `learn`.
 */
export function surfaceForPath(pathname: string): Surface | null {
  let best: { surface: Surface; length: number } | null = null;
  for (const [surface, paths] of Object.entries(SURFACE_PATHS) as [Surface, string[]][]) {
    for (const path of paths) {
      if (pathname !== path && !pathname.startsWith(`${path}/`)) continue;
      if (!best || path.length > best.length) best = { surface, length: path.length };
    }
  }
  return best?.surface ?? null;
}

/** False when `pathname` belongs to a parked surface. Wedge paths are always true. */
export function isPathEnabled(pathname: string): boolean {
  const surface = surfaceForPath(pathname);
  return surface === null || isSurfaceEnabled(surface);
}

/** Every parked surface — for deploy warnings and the founder panel. */
export function parkedSurfaces(): Surface[] {
  return [...PARKED_BY_DEFAULT, ...SECONDARY_PILLARS].filter((s) => !isSurfaceEnabled(s));
}
