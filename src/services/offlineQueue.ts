/**
 * Offline queue — persists pending write operations to AsyncStorage
 * and replays them against Supabase when connectivity returns.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import type { OfflineQueueItem } from '../types';

const QUEUE_KEY = '@greentechcycle/offline_queue';

async function getQueue(): Promise<OfflineQueueItem[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveQueue(queue: OfflineQueueItem[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export const offlineQueue = {
  /**
   * Enqueue a write operation for later sync.
   */
  async enqueue(item: Omit<OfflineQueueItem, 'id' | 'created_at'>): Promise<void> {
    const queue = await getQueue();
    queue.push({
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      created_at: new Date().toISOString(),
    });
    await saveQueue(queue);
  },

  /**
   * Process all queued items sequentially.
   * Successfully synced items are removed; failed items stay in queue.
   */
  async processQueue(): Promise<{ synced: number; failed: number }> {
    const queue = await getQueue();
    if (queue.length === 0) return { synced: 0, failed: 0 };

    const remaining: OfflineQueueItem[] = [];
    let synced = 0;

    for (const item of queue) {
      try {
        if (item.action === 'insert') {
          const { error } = await supabase.from(item.table).insert(item.data);
          if (error) throw error;
        } else if (item.action === 'update') {
          const { id, ...rest } = item.data as { id: string; [k: string]: unknown };
          const { error } = await supabase.from(item.table).update(rest).eq('id', id);
          if (error) throw error;
        }
        synced++;
      } catch {
        // Keep failed items in the queue for next retry
        remaining.push(item);
      }
    }

    await saveQueue(remaining);
    return { synced, failed: remaining.length };
  },

  async getPendingCount(): Promise<number> {
    const queue = await getQueue();
    return queue.length;
  },

  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
  },
};
