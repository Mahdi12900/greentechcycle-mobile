import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { offlineQueue } from '../services/offlineQueue';

interface OfflineState {
  isOnline: boolean;
  pendingCount: number;
  syncNow: () => Promise<void>;
  refreshPendingCount: () => Promise<void>;
}

const OfflineContext = createContext<OfflineState>({
  isOnline: true,
  pendingCount: 0,
  syncNow: async () => {},
  refreshPendingCount: async () => {},
});

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPendingCount = useCallback(async () => {
    const count = await offlineQueue.getPendingCount();
    setPendingCount(count);
  }, []);

  const syncNow = useCallback(async () => {
    if (isOnline) {
      await offlineQueue.processQueue();
      await refreshPendingCount();
    }
  }, [isOnline, refreshPendingCount]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected === true && state.isInternetReachable !== false;
      setIsOnline(online);

      // Auto-sync when coming back online
      if (online) {
        offlineQueue.processQueue().then(refreshPendingCount);
      }
    });

    refreshPendingCount();

    return () => unsubscribe();
  }, [refreshPendingCount]);

  return (
    <OfflineContext.Provider value={{ isOnline, pendingCount, syncNow, refreshPendingCount }}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => useContext(OfflineContext);
