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
  | 'social.project';

export type ModuleSurface = 'web' | 'android' | 'ios' | 'game';

export interface ModuleManifest {
  /** Reverse-dns style id, e.g. health.train */
  id: string;
  /** Semver string */
  version: string;
  scopes: readonly ModuleScope[];
  surfaces: readonly ModuleSurface[];
  /** When true, core entry must remain usable without payment. */
  freeCore: boolean;
  /** App route or deep link entry (host-relative). */
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
]);

/** Module ids: lowercase segments joined by dots, at least two segments. */
const MODULE_ID = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/;

export function isModuleScope(value: string): value is ModuleScope {
  return SCOPE_SET.has(value);
}

export function parseModuleId(id: string): string | null {
  if (!MODULE_ID.test(id)) return null;
  return id;
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
  if (!m.entry.startsWith('/')) {
    throw new Error(`module entry must be a path: ${m.entry}`);
  }
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
