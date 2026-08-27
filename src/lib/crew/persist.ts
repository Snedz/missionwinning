import { readJson, writeJson } from '@/lib/storage/safeStorage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { applyCrew, emptyCrewState, parseCrewState, type CrewAction, type CrewState } from './machine';

export function loadCrewState(now = Date.now()): CrewState {
  return parseCrewState(readJson(STORAGE_KEYS.crewBoard, null), now);
}

export function saveCrewState(state: CrewState): boolean {
  return writeJson(STORAGE_KEYS.crewBoard, state);
}

export function dispatchCrew(state: CrewState, action: CrewAction, now = Date.now()): CrewState {
  const next = applyCrew(state, action, now);
  saveCrewState(next);
  return next;
}

export function resetCrewBoard(now = Date.now()): CrewState {
  const next = emptyCrewState(now);
  saveCrewState(next);
  return next;
}
