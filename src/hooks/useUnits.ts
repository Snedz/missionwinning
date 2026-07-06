'use client';
/**
 * Metric/imperial preference from localStorage.
 * Consumers: workout logger, calculators
 */

import { useEffect, useState } from 'react';
import {
  type UnitsPref,
  weightUnitLabel,
  weightStep,
  heightUnitLabel,
  bodyweightUnitLabel,
} from '@/lib/units';

export type { UnitsPref };

export function useUnits(): UnitsPref {
  const [units, setUnits] = useState<UnitsPref>('metric');

  useEffect(() => {
    const saved = localStorage.getItem('mw_units') as UnitsPref | null;
    if (saved === 'metric' || saved === 'imperial') setUnits(saved);

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'mw_units' && (e.newValue === 'metric' || e.newValue === 'imperial')) {
        setUnits(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return units;
}

export { weightUnitLabel, weightStep, heightUnitLabel, bodyweightUnitLabel };
