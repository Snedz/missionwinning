'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HoldToConfirmButton } from '@/components/ui/HoldToConfirmButton';
import { FLAG_PERCENT_PRESETS } from '@/lib/featureFlags/catalog';

type AdminFlag = {
  key: string;
  title: string;
  description: string;
  percent: number;
  killed: boolean;
  allowlist: string[];
  updatedAt: string | null;
  updatedBy: string | null;
};

type AdminEvent = {
  id: number;
  flagKey: string;
  kind: string;
  actor: string;
  createdAt: string;
};

type PreviewResult = { on: boolean; bucket: number | null; reason: string };

type Status = 'loading' | 'ok' | 'forbidden' | 'unavailable';

export function FlagsConsole() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>('loading');
  const [flags, setFlags] = useState<AdminFlag[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [draftPercent, setDraftPercent] = useState(0);
  const [draftEntry, setDraftEntry] = useState('');
  const [previewSubject, setPreviewSubject] = useState('');
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = flags.find((f) => f.key === selectedKey) ?? flags[0] ?? null;

  const applyPayload = useCallback((nextFlags: AdminFlag[], nextEvents: AdminEvent[]) => {
    if (nextFlags.length === 0) {
      setStatus('unavailable');
      setFlags([]);
      return;
    }
    setFlags(nextFlags);
    setEvents(nextEvents);
    setStatus('ok');
    setSelectedKey((prev) => {
      const keep = nextFlags.find((f) => f.key === prev);
      const key = keep?.key ?? nextFlags[0]!.key;
      const row = nextFlags.find((f) => f.key === key) ?? nextFlags[0]!;
      setDraftPercent(row.percent);
      return key;
    });
  }, []);

  const load = useCallback(async () => {
    const res = await fetch('/api/flags/admin');
    if (res.status === 403) {
      setStatus('forbidden');
      setFlags([]);
      return;
    }
    if (res.status === 503) {
      setStatus('unavailable');
      setFlags([]);
      return;
    }
    if (!res.ok) {
      setStatus('unavailable');
      setFlags([]);
      return;
    }
    const body = (await res.json()) as { flags?: AdminFlag[]; events?: AdminEvent[] };
    applyPayload(Array.isArray(body.flags) ? body.flags : [], Array.isArray(body.events) ? body.events : []);
  }, [applyPayload]);

  useEffect(() => {
    void load();
  }, [load]);

  async function patch(body: Record<string, unknown>): Promise<boolean> {
    setBusy(true);
    try {
      const res = await fetch('/api/flags/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 403) {
        setStatus('forbidden');
        return false;
      }
      if (res.status === 503) {
        setStatus('unavailable');
        return false;
      }
      if (!res.ok) return false;
      await load();
      return true;
    } finally {
      setBusy(false);
    }
  }

  async function runPreview() {
    if (!selected) return;
    const subject = previewSubject.trim();
    if (!subject) return;
    const params = new URLSearchParams({ subject, key: selected.key });
    const res = await fetch(`/api/flags/admin/preview?${params.toString()}`);
    if (!res.ok) {
      setPreview(null);
      return;
    }
    const body = (await res.json()) as PreviewResult;
    setPreview({ on: body.on === true, bucket: body.bucket ?? null, reason: String(body.reason ?? '') });
  }

  if (status === 'loading') return null;

  if (status === 'forbidden') {
    return (
      <div className="house-card" data-testid="flags-forbidden">
        <p className="house-lede">
          {t('flagsConsoleForbidden', {
            defaultValue: 'This console is for the founder allowlist only.',
          })}
        </p>
      </div>
    );
  }

  if (status === 'unavailable' || !selected) {
    return (
      <div className="house-card" data-testid="flags-unavailable">
        <p className="house-lede">
          {t('flagsConsoleUnavailable', {
            defaultValue:
              'Flag overrides are not available on this install. The catalog still defaults off. This is not an empty rollout.',
          })}
        </p>
      </div>
    );
  }

  const allowlist = selected.allowlist;
  const saveIsHold = draftPercent === 100 && selected.percent !== 100;

  return (
    <div className="space-y-6" data-testid="flags-console">
      <div className="house-card space-y-3">
        <p className="font-semibold">{selected.title}</p>
        <p className="house-kicker">{selected.description}</p>
        <p className="house-kicker">
          {selected.key}
          {selected.killed
            ? ` · ${t('flagsConsoleKilled', { defaultValue: 'Killed' })}`
            : ''}
          {` · ${t('flagsConsoleAllowlistCount', {
            count: allowlist.length,
            defaultValue: '{{count}} on the list',
          })}`}
        </p>
        <p className="house-kicker">
          {t('flagsConsoleLoweringNote', {
            defaultValue: 'Lowering percent can drop people who were already in.',
          })}
        </p>

        <div className="flex flex-wrap gap-2">
          {FLAG_PERCENT_PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              className={`house-state tap-target${draftPercent === n ? ' is-on' : ''}`}
              data-testid={`flags-percent-${n}`}
              onClick={() => setDraftPercent(n)}
              disabled={busy}
            >
              {t('flagsConsolePercent', { percent: n, defaultValue: '{{percent}}%' })}
            </button>
          ))}
        </div>

        {saveIsHold ? (
          <HoldToConfirmButton
            chrome="house"
            className="house-btn-primary"
            label={t('flagsConsoleHold100', { defaultValue: 'Hold to confirm 100 percent' })}
            onConfirm={() => void patch({ key: selected.key, percent: 100 })}
            disabled={busy}
            data-testid="flags-save-percent"
          />
        ) : (
          <button
            type="button"
            className="house-btn house-btn-primary"
            data-testid="flags-save-percent"
            disabled={busy || draftPercent === selected.percent}
            onClick={() => void patch({ key: selected.key, percent: draftPercent })}
          >
            {t('flagsConsoleSavePercent', { defaultValue: 'Save percent' })}
          </button>
        )}

        {selected.killed ? (
          <button
            type="button"
            className="house-btn house-btn-ghost"
            data-testid="flags-unkill"
            disabled={busy}
            onClick={() => void patch({ key: selected.key, killed: false })}
          >
            {t('flagsConsoleUnkill', { defaultValue: 'Restore this flag' })}
          </button>
        ) : (
          <HoldToConfirmButton
            chrome="house"
            label={t('flagsConsoleKill', { defaultValue: 'Kill this flag' })}
            onConfirm={() => void patch({ key: selected.key, killed: true })}
            disabled={busy}
            data-testid="flags-kill"
          />
        )}
      </div>

      <div className="house-card space-y-3">
        <p className="font-semibold">
          {t('flagsConsoleAllowlist', { defaultValue: 'Allowlist' })}
        </p>
        <ul className="space-y-2">
          {allowlist.map((entry) => (
            <li key={entry} className="flex min-h-[44px] items-center justify-between gap-2">
              <span>{entry}</span>
              <button
                type="button"
                className="house-btn house-btn-ghost"
                disabled={busy}
                onClick={() =>
                  void patch({
                    key: selected.key,
                    allowlist: allowlist.filter((x) => x !== entry),
                  })
                }
              >
                {t('flagsConsoleAllowlistRemove', { defaultValue: 'Remove' })}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <input
            className="house-field min-h-[44px] flex-1"
            value={draftEntry}
            onChange={(e) => setDraftEntry(e.target.value)}
            placeholder={t('flagsConsoleAllowlistAdd', {
              defaultValue: 'Add email or id',
            })}
            disabled={busy || allowlist.length >= 50}
          />
          <button
            type="button"
            className="house-btn house-btn-ghost"
            disabled={busy || allowlist.length >= 50 || !draftEntry.trim()}
            onClick={() => {
              const next = draftEntry.trim();
              if (!next) return;
              void patch({ key: selected.key, allowlist: [...allowlist, next] }).then((ok) => {
                if (ok) setDraftEntry('');
              });
            }}
          >
            {t('flagsConsoleAllowlistAddBtn', { defaultValue: 'Add' })}
          </button>
        </div>
      </div>

      <div className="house-card space-y-3">
        <p className="font-semibold">
          {t('flagsConsolePreview', { defaultValue: 'Preview' })}
        </p>
        <input
          className="house-field min-h-[44px] w-full"
          value={previewSubject}
          onChange={(e) => setPreviewSubject(e.target.value)}
          placeholder={t('flagsConsolePreviewSubject', {
            defaultValue: 'Email or user id',
          })}
        />
        <button
          type="button"
          className="house-btn house-btn-ghost"
          data-testid="flags-preview"
          onClick={() => void runPreview()}
        >
          {t('flagsConsolePreview', { defaultValue: 'Preview' })}
        </button>
        {preview ? (
          <p className="house-kicker" data-testid="flags-preview-result">
            {preview.on
              ? t('flagsConsolePreviewOn', { defaultValue: 'On' })
              : t('flagsConsolePreviewOff', { defaultValue: 'Off' })}
            {preview.bucket != null ? ` · ${preview.bucket}` : ''}
            {preview.reason ? ` · ${preview.reason}` : ''}
          </p>
        ) : null}
      </div>

      <div className="house-card space-y-2">
        <p className="font-semibold">
          {t('flagsConsoleAudit', { defaultValue: 'Recent changes' })}
        </p>
        {events.length === 0 ? (
          <p className="house-kicker">
            {t('flagsConsoleAuditEmpty', { defaultValue: 'No changes yet.' })}
          </p>
        ) : (
          <ul className="space-y-2">
            {events.map((event) => (
              <li key={event.id} className="house-kicker">
                {event.kind} · {event.flagKey} · {event.actor}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
