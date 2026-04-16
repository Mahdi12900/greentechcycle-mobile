/**
 * Local scan history — persisted to AsyncStorage.
 * Keeps the last 200 scans on-device.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ScanHistoryItem } from '../types';

const HISTORY_KEY = '@greentechcycle/scan_history';
const MAX_ITEMS = 200;

async function getHistory(): Promise<ScanHistoryItem[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveHistory(items: ScanHistoryItem[]): Promise<void> {
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
}

export const scanHistory = {
  async getAll(): Promise<ScanHistoryItem[]> {
    return getHistory();
  },

  async add(item: Omit<ScanHistoryItem, 'id' | 'scanned_at'>): Promise<void> {
    const history = await getHistory();
    history.unshift({
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      scanned_at: new Date().toISOString(),
    });
    await saveHistory(history);
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(HISTORY_KEY);
  },
};
