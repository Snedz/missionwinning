'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  type ConnectivityMode,
  detectSaveData,
  readLiteModePreference,
  resolveConnectivityMode,
  setLiteModePreference,
} from '@/lib/connectivityMode';

interface ConnectivityContextValue {
  mode: ConnectivityMode;
  online: boolean;
  litePreference: boolean;
  setLitePreference: (enabled: boolean) => void;
}

const ConnectivityContext = createContext<ConnectivityContextValue>({
  mode: 'online',
  online: true,
  litePreference: false,
  setLitePreference: () => {},
});

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  const [online, setOnline] = useState(true);
  const [litePreference, setLitePreferenceState] = useState(false);
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    setOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    setLitePreferenceState(readLiteModePreference());
    setSaveData(detectSaveData());

    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    const conn = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } })
      .connection;
    const onConnChange = () => setSaveData(detectSaveData());
    conn?.addEventListener?.('change', onConnChange);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      conn?.removeEventListener?.('change', onConnChange);
    };
  }, []);

  const setLitePreference = useCallback((enabled: boolean) => {
    setLiteModePreference(enabled);
    setLitePreferenceState(enabled);
  }, []);

  const mode = useMemo(
    () => resolveConnectivityMode(online, { litePreference, saveData }),
    [online, litePreference, saveData]
  );

  const value = useMemo(
    () => ({ mode, online, litePreference, setLitePreference }),
    [mode, online, litePreference, setLitePreference]
  );

  return (
    <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>
  );
}

export function useConnectivity() {
  return useContext(ConnectivityContext);
}
