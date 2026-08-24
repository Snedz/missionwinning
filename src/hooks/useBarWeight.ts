'use client';
/**
 * Editable barbell weight for the free set-row plate line (.948).
 * Device-local. Missing / invalid falls back to 20 kg / 45 lb.
 */

import { useCallback, useEffect, useState } from 'react';
import type { UnitsPref } from '@/lib/units';
import {
  readStoredBarWeight,
  writeStoredBarWeight,
} from '@/lib/plateCalculator';
import { STORAGE_KEYS } from '@/lib/storage/keys';

export function useBarWeight(units: UnitsPref): [number, (next: number) => void] {
  const [bar, setBar] = useState(() => readStoredBarWeight(units));

  useEffect(() => {
    setBar(readStoredBarWeight(units));
  }, [units]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.barWeight) {
        setBar(readStoredBarWeight(units));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [units]);

  const update = useCallback(
    (next: number) => {
      setBar(writeStoredBarWeight(units, next));
    },
    [units]
  );

  return [bar, update];
}
