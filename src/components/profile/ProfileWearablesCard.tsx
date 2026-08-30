'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useLocaleFormat } from '@/hooks/useLocaleFormat';
import { Watch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/Skeleton';
import { isWearablesPubliclyEnabled } from '@/lib/wearables/flags';
import type { WearableConnectionStatus } from '@/lib/wearables/types';
import { importActivitiesFromJson } from '@/lib/healthImport';
import { logPillarWin } from '@/lib/pillarLog';

type Props = {
  signedIn: boolean;
};

/**
 * Profile wearables connect/sync/disconnect — gated by NEXT_PUBLIC_WEARABLES.
 * Live OAuth requires provider env credentials; hubs wait for thin native shells.
 */
export function ProfileWearablesCard({ signedIn }: Props) {
  const { t } = useTranslation();
  const fmt = useLocaleFormat();
  const enabled = isWearablesPubliclyEnabled();
  const [providers, setProviders] = useState<WearableConnectionStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled || !signedIn) return;
    setLoading(true);
    try {
      const res = await fetch('/api/wearables/status');
      const data = (await res.json()) as { providers?: WearableConnectionStatus[]; error?: string };
      if (res.ok) setProviders(data.providers ?? []);
      else setMessage(data.error || 'Could not load wearables status');
    } catch {
      setMessage('Could not load wearables status');
    } finally {
      setLoading(false);
    }
  }, [enabled, signedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const w = params.get('wearables');
    if (!w) return;
    const provider = params.get('provider');
    if (w === 'connected') {
      setMessage(
        t('wearablesConnected', {
          provider: provider || 'provider',
          defaultValue: `Connected ${provider || 'provider'}. You can sync now.`,
        })
      );
      void refresh();
    } else if (w !== 'disabled') {
      setMessage(
        t('wearablesOauthResult', {
          code: w.replace(/_/g, ' '),
          defaultValue: `Wearables: ${w.replace(/_/g, ' ')}`,
        })
      );
    }
  }, [refresh, t]);

  if (!enabled) return null;

  const connect = (provider: string) => {
    window.location.href = `/api/wearables/oauth/${provider}/start`;
  };

  const sync = async (provider: string) => {
    setBusy(provider);
    setMessage('');
    try {
      const res = await fetch('/api/wearables/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      const data = (await res.json()) as {
        inserted?: number;
        activityHints?: Array<{
          date: string;
          type: string;
          durationMin: number;
          distanceKm?: number;
          notes: string;
        }>;
        error?: string;
      };
      if (!res.ok) {
        setMessage(data.error || 'Sync failed');
        return;
      }
      const hints = data.activityHints ?? [];
      if (hints.length) {
        const result = importActivitiesFromJson(hints);
        if (result.imported > 0) {
          logPillarWin('track', `Synced ${result.imported} from ${provider}`, { source: provider });
        }
      }
      setMessage(
        t('wearablesSyncOk', {
          count: data.inserted ?? 0,
          track: hints.length,
          defaultValue: `Synced ${data.inserted ?? 0} samples (${hints.length} Track activities).`,
        })
      );
      void refresh();
    } catch {
      setMessage('Sync failed');
    } finally {
      setBusy(null);
    }
  };

  const disconnect = async (provider: string) => {
    setBusy(provider);
    setMessage('');
    try {
      const res = await fetch('/api/wearables/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, deleteSamples: true }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error || 'Disconnect failed');
        return;
      }
      setMessage(t('wearablesDisconnected', { defaultValue: 'Disconnected.' }));
      void refresh();
    } catch {
      setMessage('Disconnect failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="house-card space-y-3 text-sm" data-testid="account-wearables-card">
      <h3 className="flex items-center gap-2 text-2xl font-semibold leading-none tracking-tight">
        <Watch className="h-4 w-4 text-primary" aria-hidden />
        {t('wearablesTitle', { defaultValue: 'Wearables' })}
      </h3>
      <p className="text-muted-foreground leading-relaxed">
        {t('wearablesLead', {
          defaultValue:
            'Optional. Connect Whoop, Strava, and more when configured. Apple Health and Google Health Connect need the app shell later. Mission Score still comes from your logs.',
        })}
      </p>
        {!signedIn ? (
          <p className="text-muted-foreground">
            {t('wearablesSignIn', {
              defaultValue: 'Sign in to connect wearable accounts.',
            })}
          </p>
        ) : loading && !providers.length ? (
          <div className="space-y-3" role="status" aria-busy="true" aria-label="Loading">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <ul className="space-y-3">
            {providers.map((p) => (
              <li
                key={p.provider}
                className="flex flex-col gap-2 border-b border-border pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-medium text-foreground">{p.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.category === 'hub'
                      ? t('wearablesHubPending', {
                          defaultValue: 'Needs thin native shell (coming after TWA / iOS).',
                        })
                      : p.category === 'session'
                        ? t('wearablesBleHint', {
                            defaultValue: 'Use live heart rate on the Active workout screen.',
                          })
                        : p.status === 'not_configured'
                          ? t('wearablesNotConfigured', {
                              defaultValue: 'Not configured on this server yet.',
                            })
                          : p.connected
                            ? t('wearablesStatusConnected', {
                                at: p.lastSyncAt
                                  ? fmt.dateTime(p.lastSyncAt)
                                  : '—',
                                defaultValue: `Connected · last sync ${
                                  p.lastSyncAt ? fmt.dateTime(p.lastSyncAt) : '—'
                                }`,
                              })
                            : t('wearablesStatusAvailable', { defaultValue: 'Ready to connect' })}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.category === 'oauth' && p.configured && !p.connected && (
                    <Button type="button" size="sm" onClick={() => connect(p.provider)} disabled={busy === p.provider}>
                      {t('wearablesConnect', { defaultValue: 'Connect' })}
                    </Button>
                  )}
                  {p.category === 'oauth' && p.connected && (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void sync(p.provider)}
                        disabled={busy === p.provider}
                      >
                        {t('wearablesSync', { defaultValue: 'Sync' })}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => void disconnect(p.provider)}
                        disabled={busy === p.provider}
                      >
                        {t('wearablesDisconnect', { defaultValue: 'Disconnect' })}
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
        <p className="text-[11px] text-muted-foreground">
          {t('wearablesManualHint', {
            defaultValue: 'No account? Import Apple / Google JSON or CSV on Track.',
          })}{' '}
          <Link href="/track" className="text-primary underline-offset-2 hover:underline">
            {t('wearablesOpenTrack', { defaultValue: 'Open Track' })}
          </Link>
        </p>
    </div>
  );
}
