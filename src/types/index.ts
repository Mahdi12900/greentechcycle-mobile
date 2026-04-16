/**
 * Type definitions matching the Supabase `assets` table schema
 * and related app types.
 */

export type AssetCategory =
  | 'laptop'
  | 'desktop'
  | 'server'
  | 'phone'
  | 'tablet'
  | 'monitor'
  | 'printer'
  | 'network';

export type AssetStatus =
  | 'active'
  | 'in_transit'
  | 'in_repair'
  | 'retired'
  | 'disposed';

export type AssetCondition = 'A' | 'B' | 'C' | 'D' | 'E';

/** Maps mobile condition grades to Supabase condition values */
export const conditionMap: Record<AssetCondition, string> = {
  A: 'excellent',
  B: 'good',
  C: 'fair',
  D: 'poor',
  E: 'poor',
};

export const conditionLabels: Record<AssetCondition, string> = {
  A: 'A - Like new, fully functional',
  B: 'B - Minor cosmetic wear, functional',
  C: 'C - Visible wear, functional',
  D: 'D - Significant wear, partially functional',
  E: 'E - Non-functional / for parts',
};

export interface Asset {
  id: string;
  organization_id: string;
  site_id: string | null;
  asset_tag: string;
  serial_number: string | null;
  manufacturer: string | null;
  model: string | null;
  category: string;
  status: AssetStatus;
  condition: string | null;
  location: string | null;
  assigned_to: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  current_value: number | null;
  warranty_expiry: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AssetInsert {
  organization_id: string;
  asset_tag: string;
  serial_number: string;
  manufacturer: string;
  model: string;
  category: AssetCategory;
  status: AssetStatus;
  condition: string;
  location?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface ScanHistoryItem {
  id: string;
  barcode: string;
  asset_id: string | null;
  asset_tag: string | null;
  manufacturer: string | null;
  model: string | null;
  category: string | null;
  found: boolean;
  scanned_at: string;
}

export interface OfflineQueueItem {
  id: string;
  action: 'insert' | 'update';
  table: string;
  data: Record<string, unknown>;
  created_at: string;
}
