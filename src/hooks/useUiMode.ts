'use client';

import { useCallback, useEffect, useState } from 'react';
import { loadUiMode, saveUiMode, type UiMode } from '@/lib/uiMode';

export function useUiMode() {
  const [mode, setMode] = useState<UiMode>(() => loadUiMode());

  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<UiMode>).detail;
      if (detail) setMode(detail);
      else setMode(loadUiMode());
    };
    window.addEventListener('mw-ui-mode', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('mw-ui-mode', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const setUiMode = useCallback((next: UiMode) => {
    saveUiMode(next);
    setMode(next);
  }, []);

  return {
    mode,
    isPro: mode === 'pro',
    isSimple: mode === 'simple',
    setUiMode,
  };
}
