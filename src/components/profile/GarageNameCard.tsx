'use client';

/**
 * How the Garage names this account.
 *
 * Call sign is the default. Real name is a second choice the owner turns on.
 * The device handle is synced when it already fits the column; this card is
 * the place that choice can be changed afterwards.
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { GarageNameMode } from '@/lib/social/authorStamp';
import {
  loadGarageIdentity,
  saveGarageCallSign,
  saveGarageNameMode,
  syncDeviceCallSign,
  type GarageWriteResult,
} from '@/lib/social/callSignSync';

type GarageNameCardProps = {
  signedIn: boolean;
};

export function GarageNameCard({ signedIn }: GarageNameCardProps) {
  const { t } = useTranslation();
  const [callSign, setCallSign] = useState('');
  const [mode, setMode] = useState<GarageNameMode>('call_sign');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<'saved' | GarageWriteResult | null>(null);

  useEffect(() => {
    if (!signedIn) return;
    let cancel = false;
    void (async () => {
      await syncDeviceCallSign();
      const loaded = await loadGarageIdentity();
      if (cancel || !loaded) return;
      setCallSign(loaded.callSign);
      setMode(loaded.mode);
    })();
    return () => {
      cancel = true;
    };
  }, [signedIn]);

  const chooseMode = async (next: GarageNameMode) => {
    if (busy || next === mode) return;
    const previous = mode;
    setMode(next);
    setBusy(true);
    setNote(null);
    const result = await saveGarageNameMode(next);
    setBusy(false);
    if (result === 'ok') {
      setNote('saved');
      return;
    }
    setMode(previous);
    setNote('failed');
  };

  const saveCallSign = async () => {
    if (busy) return;
    setBusy(true);
    setNote(null);
    const result = await saveGarageCallSign(callSign);
    setBusy(false);
    if (result === 'ok') {
      setCallSign(callSign.trim());
      setNote('saved');
      return;
    }
    setNote(result);
  };

  if (!signedIn) {
    return (
      <div className="house-card space-y-2" data-testid="account-garage-name-card">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          {t('garageNameTitle', { defaultValue: 'Garage name' })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('garageNameSignedOut', {
            defaultValue: 'Sign in to choose the name the Garage shows.',
          })}
        </p>
      </div>
    );
  }

  const alert =
    note === 'invalid'
      ? t('garageNameInvalid', {
          defaultValue: 'Use 3-20 letters, numbers, hyphens, or underscores.',
        })
      : note === 'taken'
        ? t('garageNameTaken', { defaultValue: 'That call sign is already taken.' })
        : note === 'failed'
          ? t('garageNameFailed', { defaultValue: 'Could not save the Garage name.' })
          : note === 'reserved'
            ? t('garageNameReserved', {
                defaultValue:
                  'That name matches a call sign or starts with Mission, so the Garage will not show it as your real name.',
              })
            : null;

  return (
    <div className="house-card space-y-3" data-testid="account-garage-name-card">
      <h3 className="text-2xl font-semibold leading-none tracking-tight">
        {t('garageNameTitle', { defaultValue: 'Garage name' })}
      </h3>
      <div className="flex gap-2" role="group" aria-label={t('garageNameTitle', { defaultValue: 'Garage name' })}>
        <Button
          type="button"
          className="min-h-[44px] tap-target"
          variant={mode === 'call_sign' ? 'selected' : 'outline'}
          aria-pressed={mode === 'call_sign'}
          disabled={busy}
          onClick={() => void chooseMode('call_sign')}
        >
          {t('garageNameCallSign', { defaultValue: 'Call sign' })}
        </Button>
        <Button
          type="button"
          className="min-h-[44px] tap-target"
          variant={mode === 'real_name' ? 'selected' : 'outline'}
          aria-pressed={mode === 'real_name'}
          disabled={busy}
          onClick={() => void chooseMode('real_name')}
        >
          {t('garageNameRealName', { defaultValue: 'Real name' })}
        </Button>
      </div>
      <div className="space-y-1">
        <label htmlFor="garage-call-sign" className="text-sm text-muted-foreground">
          {t('garageNameLabel', { defaultValue: 'Call sign' })}
        </label>
        <Input
          id="garage-call-sign"
          value={callSign}
          maxLength={20}
          disabled={busy}
          onChange={(e) => {
            setCallSign(e.target.value);
            setNote(null);
          }}
          className="max-w-none"
        />
      </div>
      <Button
        type="button"
        variant="outline"
        className="min-h-[44px] tap-target"
        disabled={busy}
        onClick={() => void saveCallSign()}
      >
        {t('garageNameSave', { defaultValue: 'Save' })}
      </Button>
      {alert ? (
        <p className="text-sm text-primary" role="alert">
          {alert}
        </p>
      ) : null}
      {note === 'saved' ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t('garageNameSaved', { defaultValue: 'Saved.' })}
        </p>
      ) : null}
      <p className="text-sm text-muted-foreground">
        {t('garageNameHint', {
          defaultValue:
            'The Garage shows this call sign. With none set, a post says Mission and your number. Your real name is shown only after you choose Real name.',
        })}
      </p>
    </div>
  );
}
