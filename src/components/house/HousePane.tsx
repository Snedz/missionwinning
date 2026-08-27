'use client';

/**
 * Deeper second-rail pane (back chevron + title + blurb).
 * Home rooms stay the default bar. Visit ticks live here so /coach
 * and /history infer completion without Today owning those routes.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { readWorkoutHistoryFromStorage } from '@/lib/workout/workoutPersistLite';
import { isHouseTodayFamilyPath } from './houseNav';
import {
  markHouseHistoryOpened,
  markHouseWeekOpened,
} from './houseFirstRooms';

export type HousePaneId = 'week' | null;

type HousePaneApi = {
  pane: HousePaneId;
  openPane: (id: Exclude<HousePaneId, null>) => void;
  closePane: () => void;
};

const HousePaneContext = createContext<HousePaneApi>({
  pane: null,
  openPane: () => {
    markHouseWeekOpened();
  },
  closePane: () => {},
});

export function useHousePane(): HousePaneApi {
  return useContext(HousePaneContext);
}

function HouseVisitTicks() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/coach' || pathname.startsWith('/coach/')) {
      markHouseWeekOpened();
    }
    if (pathname === '/history' || pathname.startsWith('/history/')) {
      const history = readWorkoutHistoryFromStorage();
      markHouseHistoryOpened(history.some((row) => !row.deletedAt));
    }
  }, [pathname]);

  return null;
}

export function HousePaneProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pane, setPane] = useState<HousePaneId>(null);

  useEffect(() => {
    if (!isHouseTodayFamilyPath(pathname)) setPane(null);
  }, [pathname]);

  const openPane = useCallback((id: Exclude<HousePaneId, null>) => {
    if (id === 'week') markHouseWeekOpened();
    setPane(id);
  }, []);

  const closePane = useCallback(() => setPane(null), []);

  const value = useMemo(() => ({ pane, openPane, closePane }), [pane, openPane, closePane]);

  return (
    <HousePaneContext.Provider value={value}>
      <HouseVisitTicks />
      {children}
    </HousePaneContext.Provider>
  );
}
