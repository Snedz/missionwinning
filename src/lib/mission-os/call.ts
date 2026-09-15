/**
 * String-dispatch onto a mounted mini's closed doors.
 *
 * Door-set first: a name outside `identity` / `billing` / `photos` /
 * `storage` is `unknown_capability` (`.1096`). Then scope: an
 * undeclared *known* door is `scope_denied` even when the method
 * name is unknown (deny-before-unknown). A declared door + a name
 * outside the closed set is `unknown_method`. Known methods forward
 * to the existing fake — `.1079`–`.1095` envelopes stay.
 * Never throws. Never returns undefined.
 * Host-level `callMountedDoor` refuses a missing id with `not_mounted`
 * (same code as `MiniHost.unmount`, `.1088`). Does not auto-mount.
 * Lifecycle (`not_mounted`) wins over `unknown_capability`.
 */

import type { ModuleManifest } from '../../../packages/mw-core/src/module';
import {
  BILLING_METHODS,
  IDENTITY_METHODS,
  MISSION_OS_CAPABILITIES,
  PHOTOS_METHODS,
  STORAGE_METHODS,
  type BillingMethod,
  type CallDoorArgs,
  type CapResult,
  type IdentityMethod,
  type MissionOsDoor,
  type MountedMini,
  type PhotosMethod,
} from './types';

export type { CallDoorArgs, MissionOsDoor };

const CLOSED_METHODS: Record<MissionOsDoor, readonly string[]> = {
  identity: IDENTITY_METHODS,
  billing: BILLING_METHODS,
  photos: PHOTOS_METHODS,
  storage: STORAGE_METHODS,
};

export function isMissionOsDoor(value: string): value is MissionOsDoor {
  return (MISSION_OS_CAPABILITIES as readonly string[]).includes(value);
}

/** True when the mini declared any scope on that door (`identity.read`, …). */
export function doorIsDeclared(manifest: ModuleManifest, door: MissionOsDoor): boolean {
  const prefix = `${door}.`;
  return manifest.scopes.some((scope) => scope.startsWith(prefix));
}

export function callDoor(
  mini: MountedMini,
  door: string,
  method: string,
  args: CallDoorArgs = {}
): CapResult<unknown> {
  if (!isMissionOsDoor(door)) {
    return { ok: false, code: 'unknown_capability' };
  }
  if (!doorIsDeclared(mini.manifest, door)) {
    return { ok: false, code: 'scope_denied' };
  }
  if (!CLOSED_METHODS[door].includes(method)) {
    return { ok: false, code: 'unknown_method' };
  }
  return dispatchKnown(mini, door, method, args);
}

function dispatchKnown(
  mini: MountedMini,
  door: MissionOsDoor,
  method: string,
  args: CallDoorArgs
): CapResult<unknown> {
  const key = args.key ?? 'note';
  const value = args.value ?? 'ok';
  switch (door) {
    case 'identity':
      return mini.identity[method as IdentityMethod]();
    case 'billing':
      return mini.billing[method as BillingMethod]();
    case 'photos':
      return mini.photos[method as PhotosMethod]();
    case 'storage':
      if (method === 'get') return mini.storage.get(key);
      if (method === 'set') return mini.storage.set(key, value);
      return mini.storage.remove(key);
  }
}

/**
 * Host-level dispatch. Missing / unmounted id is `not_mounted` —
 * same code as `MiniHost.unmount` (`.1088`). Does not throw.
 * Does not auto-mount. A live row forwards to `callDoor`.
 */
export function callMountedDoor(
  table: ReadonlyMap<string, MountedMini>,
  id: string,
  door: string,
  method: string,
  args: CallDoorArgs = {}
): CapResult<unknown> {
  const mini = table.get(id);
  if (!mini) return { ok: false, code: 'not_mounted' };
  return callDoor(mini, door, method, args);
}
