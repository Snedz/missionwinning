'use client';

import { useState } from 'react';
import { Barcode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { FoodSearchItem } from '@/lib/foodSearch';

type Props = {
  onSelect: (item: FoodSearchItem) => void;
};

export function BarcodeLookup({ onSelect }: Props) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = async () => {
    const digits = code.replace(/\D/g, '');
    if (digits.length < 8) {
      setError(t('fuelBarcodeInvalid', { defaultValue: 'Enter at least 8 digits.' }));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/fuel/barcode?code=${encodeURIComponent(digits)}`);
      const data = (await res.json()) as { item?: FoodSearchItem | null; error?: string };
      if (data.item) {
        onSelect(data.item);
        setCode('');
      } else {
        setError(
          t('fuelBarcodeNotFound', {
            defaultValue: 'Product not found — try manual search or quick-add.',
          })
        );
      }
    } catch {
      setError(
        typeof navigator !== 'undefined' && !navigator.onLine
          ? t('fuelSearchOffline', {
              defaultValue: 'You appear offline — try again when connected.',
            })
          : t('fuelSearchUnavailable', { defaultValue: 'Lookup unavailable. Try again.' })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 flex-wrap items-end">
      <div className="flex-1 min-w-[180px]">
        <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
          <Barcode className="h-3.5 w-3.5" />
          {t('fuelBarcodeLabel', { defaultValue: 'Barcode (UPC/EAN)' })}
        </label>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="012345678905"
          inputMode="numeric"
          autoComplete="off"
          className="font-mono"
        />
      </div>
      <Button type="button" variant="outline" disabled={loading} onClick={lookup} className="min-h-[44px] tap-target">
        {loading
          ? t('fuelSearchLoading', { defaultValue: 'Searching…' })
          : t('fuelBarcodeLookup', { defaultValue: 'Look up' })}
      </Button>
      {error && <p className="w-full text-xs text-muted-foreground">{error}</p>}
    </div>
  );
}
