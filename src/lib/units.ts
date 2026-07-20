/** Pure unit helpers — shared by hooks and coach engine. */

export type UnitsPref = 'metric' | 'imperial';

export function weightUnitLabel(units: UnitsPref): string {
  return units === 'imperial' ? 'lbs' : 'kg';
}

export function weightStep(units: UnitsPref): number {
  return units === 'imperial' ? 5 : 2.5;
}

export function heightUnitLabel(units: UnitsPref): string {
  return units === 'imperial' ? 'in' : 'cm';
}

export function bodyweightUnitLabel(units: UnitsPref): string {
  return weightUnitLabel(units);
}

/** Convert kg → display units. */
export function kgToDisplay(kg: number, units: UnitsPref): number {
  return units === 'imperial' ? kg * 2.2046226218 : kg;
}

/** Convert display weight → kg for storage. */
export function displayToKg(value: number, units: UnitsPref): number {
  return units === 'imperial' ? value / 2.2046226218 : value;
}
