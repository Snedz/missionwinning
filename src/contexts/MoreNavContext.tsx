'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { MoreSheet } from '@/components/layout/MoreSheet';
import { MoreFab } from '@/components/layout/MoreFab';

type MoreNavContextValue = {
  openMore: () => void;
  closeMore: () => void;
};

const MoreNavContext = createContext<MoreNavContextValue | null>(null);

export function MoreNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openMore = useCallback(() => setOpen(true), []);
  const closeMore = useCallback(() => setOpen(false), []);

  return (
    <MoreNavContext.Provider value={{ openMore, closeMore }}>
      {children}
      <MoreFab onClick={openMore} />
      <MoreSheet open={open} onClose={closeMore} />
    </MoreNavContext.Provider>
  );
}

export function useMoreNav(): MoreNavContextValue {
  const ctx = useContext(MoreNavContext);
  if (!ctx) {
    return {
      openMore: () => {},
      closeMore: () => {},
    };
  }
  return ctx;
}
