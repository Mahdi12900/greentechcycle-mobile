/**
 * Asset service — queries and writes to the Supabase `assets` table.
 * Falls back to offline queue when network is unavailable.
 */
import { supabase } from '../config/supabase';
import { offlineQueue } from './offlineQueue';
import type { Asset, AssetInsert } from '../types';

export const assetService = {
  /**
   * Look up an asset by serial number or asset tag (barcode value).
   */
  async findByBarcode(barcode: string): Promise<Asset | null> {
    // Try serial_number first
    const { data: bySerial } = await supabase
      .from('assets')
      .select('*')
      .eq('serial_number', barcode)
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle();

    if (bySerial) return bySerial as unknown as Asset;

    // Fallback: try asset_tag
    const { data: byTag } = await supabase
      .from('assets')
      .select('*')
      .eq('asset_tag', barcode)
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle();

    return (byTag as unknown as Asset) ?? null;
  },

  /**
   * Insert a new asset. Queues offline if network is unavailable.
   */
  async createAsset(
    asset: AssetInsert,
    isOnline: boolean
  ): Promise<{ data: Asset | null; queued: boolean; error: string | null }> {
    if (!isOnline) {
      await offlineQueue.enqueue({ action: 'insert', table: 'assets', data: asset as any });
      return { data: null, queued: true, error: null };
    }

    const { data, error } = await supabase
      .from('assets')
      .insert(asset)
      .select()
      .single();

    if (error) return { data: null, queued: false, error: error.message };
    return { data: data as unknown as Asset, queued: false, error: null };
  },

  /**
   * Fetch recent assets for history / browse.
   */
  async fetchRecent(limit = 50): Promise<Asset[]> {
    const { data } = await supabase
      .from('assets')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    return (data as unknown as Asset[]) ?? [];
  },
};
