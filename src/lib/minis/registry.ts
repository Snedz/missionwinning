/**
 * In-process mini registry. Unknown id → `unknown_mini`.
 * No Today / Train door. No product chrome.
 */

import {
  UTILITY_CLEARSHOT_MANIFEST,
  resolveRegisteredMini,
  type CapabilityResult,
  type ModuleManifest,
} from '../../../packages/mw-core/src/module';

export const MINI_REGISTRY: ReadonlyMap<string, ModuleManifest> = new Map([
  [UTILITY_CLEARSHOT_MANIFEST.id, UTILITY_CLEARSHOT_MANIFEST],
]);

export function lookupMini(id: string): CapabilityResult<ModuleManifest> {
  return resolveRegisteredMini(id, MINI_REGISTRY);
}
