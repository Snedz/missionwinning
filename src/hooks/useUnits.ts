'use client';

import { useEffect, useState } from 'react';

export type UnitsPref = 'metric' | 'imperial';

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

export function weightUnitLabel(units: UnitsPref): string {
  return units === 'imperial' ? 'lbs' : 'kg';
}

export function weightStep(units: UnitsPref): number {
  return units === 'imperial' ? 2.5 : 2.5;
}
