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
