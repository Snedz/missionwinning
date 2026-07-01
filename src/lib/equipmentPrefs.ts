/** Shared equipment defaults — bodyweight-first for rural / pre-onboarding users. */

export const DEFAULT_EQUIPMENT = 'bodyweight';

export const TRAIN_LOCATIONS = ['village', 'home', 'school', 'gym'] as const;
export type TrainLocation = (typeof TRAIN_LOCATIONS)[number];

const STORAGE_EQUIPMENT = 'mw_equipment';
const STORAGE_TRAIN_LOCATION = 'mw_train_location';

export function getStoredEquipment(fallback = DEFAULT_EQUIPMENT): string {
  if (typeof window === 'undefined') return fallback;
  return localStorage.getItem(STORAGE_EQUIPMENT) || fallback;
}

export function getStoredTrainLocation(): TrainLocation | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_TRAIN_LOCATION);
  return TRAIN_LOCATIONS.includes(raw as TrainLocation) ? (raw as TrainLocation) : null;
}

/** Library filter token from welcome equipment value. */
export function equipmentLibraryFilter(equipment: string): string {
  if (equipment === 'bodyweight') return 'bodyweight';
  if (equipment === 'dumbbells') return 'dumbbell';
  return '';
}

export function isBodyweightFirst(equipment: string): boolean {
  return equipment === 'bodyweight';
}

export function trainLocationSuggestsBodyweight(location: TrainLocation | null): boolean {
  return location === 'village' || location === 'home' || location === 'school';
}

export function saveTrainLocation(location: TrainLocation): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_TRAIN_LOCATION, location);
  if (trainLocationSuggestsBodyweight(location)) {
    localStorage.setItem(STORAGE_EQUIPMENT, DEFAULT_EQUIPMENT);
  }
}
