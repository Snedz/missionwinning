/**
 * String-dispatch onto a mounted mini's closed doors.
 *
 * Scope gate first: an undeclared door is `scope_denied` even when the
 * method name is unknown (deny-before-unknown). A declared door + a
 * name outside the closed set is `unknown_method`. Known methods
 * forward to the existing fake — `.1079`–`.1084` envelopes stay.
 * Never throws. Never returns undefined.
 */

import type { ModuleManifest } from '../../../packages/mw-core/src/module';
import {
  BILLING_METHODS,
  IDENTITY_METHODS,
  MISSION_OS_CAPABILITIES,
  PHOTOS_METHODS,
  STORAGE_METHODS,
  type BillingMethod,
  type CapResult,
  type IdentityMethod,
  type MountedMini,
  type PhotosMethod,
} from './types';

export type MissionOsDoor = (typeof MISSION_OS_CAPABILITIES)[number];

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

export type CallDoorArgs = {
  key?: string;
  value?: string;
};

export function callDoor(
  mini: MountedMini,
  door: MissionOsDoor,
  method: string,
  args: CallDoorArgs = {}
): CapResult<unknown> {
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
      return method === 'get' ? mini.storage.get(key) : mini.storage.set(key, value);
  }
}
