import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { scanHistory } from '../services/scanHistory';
import { assetService } from '../services/assetService';
import type { ScanHistoryItem } from '../types';

type RootStackParamList = {
  MainTabs: undefined;
  DeviceDetail: { asset: any };
  AssetIntake: { barcode: string };
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ScanHistoryScreen() {
  const [items, setItems] = useState<ScanHistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const loadHistory = useCallback(async () => {
    const data = await scanHistory.getAll();
    setItems(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleClear = () => {
    Alert.alert('Clear History', 'Remove all scan history from this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await scanHistory.clear();
          setItems([]);
        },
      },
    ]);
  };

  const handleItemPress = async (item: ScanHistoryItem) => {
    if (item.found && item.asset_id) {
      // Re-fetch the latest data
      const asset = await assetService.findByBarcode(item.barcode);
      if (asset) {
        navigation.navigate('DeviceDetail', { asset });
        return;
      }
    }
    navigation.navigate('AssetIntake', { barcode: item.barcode });
  };

  const renderItem = ({ item }: { item: ScanHistoryItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: item.found ? theme.colors.success : theme.colors.warning },
          ]}
        />
        <Text style={styles.itemBarcode} numberOfLines={1}>
          {item.barcode}
        </Text>
        <Text style={styles.itemTime}>{formatTime(item.scanned_at)}</Text>
      </View>

      {item.found ? (
        <Text style={styles.itemDetail}>
          {item.manufacturer ?? ''} {item.model ?? ''}{' '}
          {item.category ? `(${item.category})` : ''}
        </Text>
      ) : (
        <Text style={[styles.itemDetail, { color: theme.colors.warning }]}>
          New device — not in database
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {items.length > 0 && (
        <View style={styles.toolBar}>
          <Text style={styles.countText}>{items.length} scan(s)</Text>
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={items.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.emptySubtitle}>
              Scan a barcode or QR code to get started.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  toolBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  countText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  clearText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  list: {
    padding: theme.spacing.md,
  },
  itemCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  itemBarcode: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: 'monospace',
  },
  itemTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
  },
  itemDetail: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.md + theme.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
