/** Pure unit helpers — shared by hooks and coach engine. */

export type UnitsPref = 'metric' | 'imperial';
export type WeightUnit = 'kg' | 'lb';

export function parseWeightUnit(value: unknown): WeightUnit | undefined {
  return value === 'kg' ? 'kg' : value === 'lb' || value === 'lbs' ? 'lb' : undefined;
}

export function weightUnitFor(units: UnitsPref): WeightUnit {
  return units === 'imperial' ? 'lb' : 'kg';
}

export function unitsForWeight(unit: WeightUnit): UnitsPref {
  return unit === 'lb' ? 'imperial' : 'metric';
}

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

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  return from === to ? value : kgToDisplay(displayToKg(value, unitsForWeight(from)), unitsForWeight(to));
}
