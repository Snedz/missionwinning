import {
  isOAuthProviderConfigured,
  isWearablesEnabled,
} from './flags';
import { HUB_PROVIDER_META } from './hubs';
import {
  OAUTH_PROVIDER_ORDER,
  PROVIDER_LABELS,
  type WearableConnectionStatus,
  type WearableOAuthProviderId,
} from './types';
import type { ConnectionRow } from './connections';

export function buildProviderStatusList(
  connections: ConnectionRow[]
): WearableConnectionStatus[] {
  if (!isWearablesEnabled()) return [];

  const byProvider = new Map(connections.map((c) => [c.provider, c]));
  const list: WearableConnectionStatus[] = [];

  for (const id of OAUTH_PROVIDER_ORDER) {
    const row = byProvider.get(id);
    list.push({
      provider: id,
      label: PROVIDER_LABELS[id],
      category: 'oauth',
      configured: isOAuthProviderConfigured(id),
      connected: row?.status === 'connected',
      lastSyncAt: row?.last_sync_at ?? null,
      status: !isOAuthProviderConfigured(id)
        ? 'not_configured'
        : row?.status === 'connected'
          ? 'connected'
          : 'available',
    });
  }

  for (const hub of HUB_PROVIDER_META) {
    const row = byProvider.get(hub.id);
    list.push({
      provider: hub.id,
      label: hub.label,
      category: 'hub',
      configured: false,
      connected: row?.status === 'connected',
      lastSyncAt: row?.last_sync_at ?? null,
      status: hub.status,
    });
  }

  list.push({
    provider: 'ble_hr',
    label: PROVIDER_LABELS.ble_hr,
    category: 'session',
    configured: true,
    connected: false,
    lastSyncAt: null,
    status: 'session_only',
  });

  return list;
}

export function isKnownOAuthProvider(id: string): id is WearableOAuthProviderId {
  return (OAUTH_PROVIDER_ORDER as string[]).includes(id);
}
