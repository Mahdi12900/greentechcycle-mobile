import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../theme';
import type { Asset } from '../types';

type RootStackParamList = {
  MainTabs: undefined;
  DeviceDetail: { asset: Asset };
  AssetIntake: { barcode: string };
};

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value ?? '—'}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: theme.colors.success,
    in_transit: theme.colors.warning,
    in_repair: theme.colors.secondary,
    retired: theme.colors.textMuted,
    disposed: theme.colors.error,
  };

  return (
    <View style={[styles.badge, { backgroundColor: colorMap[status] ?? theme.colors.textMuted }]}>
      <Text style={styles.badgeText}>{status.replace('_', ' ').toUpperCase()}</Text>
    </View>
  );
}

export default function DeviceDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'DeviceDetail'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { asset } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {asset.manufacturer ?? 'Unknown'} {asset.model ?? ''}
        </Text>
        <StatusBadge status={asset.status} />
      </View>

      {/* Detail card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Device Information</Text>
        <InfoRow label="Asset Tag" value={asset.asset_tag} />
        <InfoRow label="Serial Number" value={asset.serial_number} />
        <InfoRow label="Category" value={asset.category} />
        <InfoRow label="Manufacturer" value={asset.manufacturer} />
        <InfoRow label="Model" value={asset.model} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Status & Condition</Text>
        <InfoRow label="Status" value={asset.status} />
        <InfoRow label="Condition" value={asset.condition} />
        <InfoRow label="Location" value={asset.location} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Financial</Text>
        <InfoRow
          label="Purchase Price"
          value={asset.purchase_price != null ? `${asset.purchase_price} EUR` : null}
        />
        <InfoRow
          label="Current Value"
          value={asset.current_value != null ? `${asset.current_value} EUR` : null}
        />
        <InfoRow label="Warranty Expiry" value={asset.warranty_expiry} />
      </View>

      {asset.notes && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notes</Text>
          <Text style={styles.notes}>{asset.notes}</Text>
        </View>
      )}

      {/* Actions */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('MainTabs')}
        activeOpacity={0.8}
      >
        <Text style={styles.scanButtonText}>Scan Another Device</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  rowValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  notes: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  scanButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  scanButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
});
