/**
 * House first-rooms checklist — three MW rows, inferred from behavior.
 * Not getFirstSteps (that list dumps later pillars). Not a Patreon tour.
 */

import { STORAGE_KEYS } from '@/lib/storage/keys';
import { readRaw, writeRaw } from '@/lib/storage/safeStorage';

export const HOUSE_FIRST_ROOM_KEYS = ['log-set', 'open-week', 'open-history'] as const;
export type HouseFirstRoomKey = (typeof HOUSE_FIRST_ROOM_KEYS)[number];

export type HouseFirstRoomKind = 'compose' | 'pane' | 'navigate';

export type HouseFirstRoom = {
  key: HouseFirstRoomKey;
  done: boolean;
  locked: boolean;
  kind: HouseFirstRoomKind;
  href?: string;
  titleKey: string;
  title: string;
  whyKey: string;
  why: string;
  lockWhyKey?: string;
  lockWhy?: string;
};

export type HouseFirstRoomsInput = {
  loggedSet: boolean;
  weekOpened: boolean;
  historyOpened: boolean;
  hasFinish: boolean;
};

export function getHouseFirstRooms(input: HouseFirstRoomsInput): HouseFirstRoom[] {
  const hasFinish = input.hasFinish;
  return [
    {
      key: 'log-set',
      done: input.loggedSet,
      locked: false,
      kind: 'compose',
      titleKey: 'houseFirstLogTitle',
      title: 'Log a set',
      whyKey: 'houseFirstLogWhy',
      why: 'Type the number. That is the product.',
    },
    {
      key: 'open-week',
      done: input.weekOpened,
      locked: false,
      kind: 'pane',
      titleKey: 'houseFirstWeekTitle',
      title: 'Open this week',
      whyKey: 'houseFirstWeekWhy',
      why: 'See the week Coach wrote from your logs.',
    },
    {
      key: 'open-history',
      done: hasFinish && input.historyOpened,
      locked: !hasFinish,
      kind: 'navigate',
      href: '/history',
      titleKey: 'houseFirstHistoryTitle',
      title: 'Open History after a finish',
      whyKey: 'houseFirstHistoryWhy',
      why: 'After one finish, History is yours.',
      lockWhyKey: 'houseFirstHistoryLock',
      lockWhy: 'Finish a session first — then History is yours.',
    },
  ];
}

export function summarizeHouseFirstRooms(rooms: HouseFirstRoom[]): {
  done: number;
  total: number;
  complete: boolean;
} {
  const done = rooms.filter((row) => row.done).length;
  return { done, total: rooms.length, complete: done === rooms.length };
}

export function readHouseWeekOpened(): boolean {
  return readRaw(STORAGE_KEYS.houseWeekOpened) === '1';
}

export function readHouseHistoryOpened(): boolean {
  return readRaw(STORAGE_KEYS.houseHistoryOpened) === '1';
}

export function readHouseChecklistCollapsed(): boolean {
  return readRaw(STORAGE_KEYS.houseChecklistCollapsed) === '1';
}

export function markHouseWeekOpened(): void {
  writeRaw(STORAGE_KEYS.houseWeekOpened, '1');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('mw-journey-event'));
  }
}

export function markHouseHistoryOpened(hasFinish: boolean): void {
  if (!hasFinish) return;
  writeRaw(STORAGE_KEYS.houseHistoryOpened, '1');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('mw-journey-event'));
  }
}

export function writeHouseChecklistCollapsed(collapsed: boolean): void {
  writeRaw(STORAGE_KEYS.houseChecklistCollapsed, collapsed ? '1' : '0');
}
