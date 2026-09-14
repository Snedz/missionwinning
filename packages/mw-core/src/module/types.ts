/**
 * Module host manifests — pure types for future mini-apps and games.
 *
 * docs/contracts/MODULE.md
 */

export type ModuleScope =
  | 'identity.read'
  | 'identity.write'
  | 'health.read'
  | 'health.write'
  | 'economy.earn'
  | 'economy.read'
  | 'social.project'
  | 'social.channel.write'
  | 'photos.read'
  | 'photos.write'
  | 'storage.read'
  | 'storage.write'
  | 'billing.read';

export type ModuleSurface = 'web' | 'android' | 'ios' | 'game';

export interface ModuleManifest {
  /** Reverse-dns style id, e.g. health.train */
  id: string;
  /**
   * Athlete-facing label. Required when `entry` is `mission://minis/{slug}`.
   * Non-empty trimmed, max 40. Not a marketing sentence.
   */
  name?: string;
  /** Semver string */
  version: string;
  scopes: readonly ModuleScope[];
  surfaces: readonly ModuleSurface[];
  /** When true, core entry must remain usable without payment. */
  freeCore: boolean;
  /** Host-relative `/…` path, or `mission://minis/{slug}` for utility minis. */
  entry: string;
}

const SCOPE_SET = new Set<string>([
  'identity.read',
  'identity.write',
  'health.read',
  'health.write',
  'economy.earn',
  'economy.read',
  'social.project',
  'social.channel.write',
  'photos.read',
  'photos.write',
  'storage.read',
  'storage.write',
  'billing.read',
]);

/** Deep-link grammar for utility minis. `{slug}` is `[a-z][a-z0-9]*`. */
export const MISSION_MINI_PREFIX = 'mission://minis/';

const MINI_SLUG = /^[a-z][a-z0-9]*$/;
const MODULE_NAME_MAX = 40;

/** Module ids: lowercase segments joined by dots, at least two segments. */
const MODULE_ID = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;

export function isModuleScope(value: string): value is ModuleScope {
  return SCOPE_SET.has(value);
}

export function parseModuleId(id: string): string | null {
  if (!MODULE_ID.test(id)) return null;
  return id;
}

/** Last dotted segment of a module id (`utility.clearshot` → `clearshot`). */
export function miniSlugFromId(id: string): string {
  const i = id.lastIndexOf('.');
  return i === -1 ? id : id.slice(i + 1);
}

/** `mission://minis/{slug}` → slug, or null if the entry is not that grammar. */
export function parseMissionMiniEntry(entry: string): string | null {
  if (!entry.startsWith(MISSION_MINI_PREFIX)) return null;
  const slug = entry.slice(MISSION_MINI_PREFIX.length);
  if (!MINI_SLUG.test(slug)) return null;
  return slug;
}

function assertModuleName(name: string | undefined, required: boolean): void {
  if (name === undefined) {
    if (required) throw new Error('mission:// minis require a name');
    return;
  }
  const trimmed = name.trim();
  if (!trimmed) throw new Error('module name must be non-empty');
  if (trimmed.length > MODULE_NAME_MAX) {
    throw new Error(`module name exceeds ${MODULE_NAME_MAX} characters`);
  }
}

export function assertModuleManifest(m: ModuleManifest): void {
  if (!parseModuleId(m.id)) {
    throw new Error(`invalid module id: ${m.id}`);
  }
  if (!m.version || !/^\d+\.\d+\.\d+/.test(m.version)) {
    throw new Error(`invalid module version: ${m.version}`);
  }
  for (const s of m.scopes) {
    if (!isModuleScope(s)) throw new Error(`invalid scope: ${s}`);
  }
  const miniSlug = parseMissionMiniEntry(m.entry);
  const utility = m.id.startsWith('utility.');
  if (utility) {
    if (miniSlug === null || miniSlug !== miniSlugFromId(m.id)) {
      throw new Error(
        `utility minis require mission://minis/{slug} matching id: ${m.entry}`
      );
    }
    assertModuleName(m.name, true);
    return;
  }
  if (miniSlug !== null) {
    if (miniSlug !== miniSlugFromId(m.id)) {
      throw new Error(
        `module entry slug must match the last segment of id: ${m.entry}`
      );
    }
    assertModuleName(m.name, true);
    return;
  }
  if (!m.entry.startsWith('/') || m.entry.startsWith('//')) {
    throw new Error(`module entry must be a path or mission://minis/{slug}: ${m.entry}`);
  }
  assertModuleName(m.name, false);
}

/** First-party health wedge — the only free-core that must never be gated. */
export const HEALTH_TRAIN_MANIFEST: ModuleManifest = {
  id: 'health.train',
  version: '1.0.0',
  scopes: ['identity.read', 'health.read', 'health.write', 'economy.earn'],
  surfaces: ['web', 'android'],
  freeCore: true,
  entry: '/active',
};

/** Garage messenger — rooms + local presence. Free core; never gates the logger. */
export const SOCIAL_SERVER_MANIFEST: ModuleManifest = {
  id: 'social.server',
  version: '1.2.0',
  scopes: ['identity.read', 'social.channel.write'],
  surfaces: ['web'],
  freeCore: true,
  entry: '/server',
};

/**
 * Reserved mini-host id. Not a `ModuleManifest` — do not invent a fake `/`
 * entry that would fail `assertModuleManifest`.
 */
export const HOST_SHELL_ID = 'host.shell' as const;

export const HOST_SHELL = {
  id: HOST_SHELL_ID,
  role: 'host',
} as const;

/**
 * First utility mini — reserved. No product UI this ship.
 * Does not receive `health.write` or `billing.read`.
 */
export const UTILITY_CLEARSHOT_MANIFEST: ModuleManifest = {
  id: 'utility.clearshot',
  name: 'ClearShot',
  version: '0.1.0',
  scopes: ['identity.read', 'photos.read', 'photos.write', 'storage.write'],
  surfaces: ['android'],
  freeCore: true,
  entry: 'mission://minis/clearshot',
};
