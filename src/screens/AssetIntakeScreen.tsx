import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { assetService } from '../services/assetService';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';
import {
  AssetCategory,
  AssetCondition,
  conditionLabels,
  conditionMap,
} from '../types';

type RootStackParamList = {
  MainTabs: undefined;
  DeviceDetail: { asset: any };
  AssetIntake: { barcode: string };
};

const CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'server', label: 'Server' },
  { value: 'phone', label: 'Phone' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'monitor', label: 'Monitor' },
  { value: 'printer', label: 'Printer' },
  { value: 'network', label: 'Network' },
];

const CONDITIONS: AssetCondition[] = ['A', 'B', 'C', 'D', 'E'];

export default function AssetIntakeScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'AssetIntake'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { isOnline, refreshPendingCount } = useOffline();

  const barcode = route.params.barcode;

  const [category, setCategory] = useState<AssetCategory>('laptop');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [condition, setCondition] = useState<AssetCondition>('B');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!manufacturer.trim()) {
      Alert.alert('Validation', 'Manufacturer / brand is required.');
      return;
    }
    if (!model.trim()) {
      Alert.alert('Validation', 'Model is required.');
      return;
    }

    setSaving(true);

    // Use user's organization or fallback
    const orgId = user?.user_metadata?.organization_id ?? user?.app_metadata?.organization_id;

    const assetData = {
      organization_id: orgId ?? '00000000-0000-0000-0000-000000000000',
      asset_tag: barcode,
      serial_number: barcode,
      manufacturer: manufacturer.trim(),
      model: model.trim(),
      category,
      status: 'active' as const,
      condition: conditionMap[condition],
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      metadata: photo ? { photo_uri: photo } : undefined,
    };

    const { error, queued } = await assetService.createAsset(assetData, isOnline);

    setSaving(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }

    if (queued) {
      await refreshPendingCount();
      Alert.alert(
        'Queued Offline',
        'The device has been saved locally and will sync when connectivity is restored.',
        [{ text: 'OK', onPress: () => navigation.navigate('MainTabs') }]
      );
    } else {
      Alert.alert('Success', 'Device registered successfully.', [
        { text: 'OK', onPress: () => navigation.navigate('MainTabs') },
      ]);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerCard}>
        <Text style={styles.headerLabel}>NEW DEVICE INTAKE</Text>
        <Text style={styles.barcodeValue}>{barcode}</Text>
        <Text style={styles.headerHint}>
          No matching asset found. Register this device below.
        </Text>
      </View>

      {/* Category picker */}
      <Text style={styles.label}>Device Type</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={[styles.chip, category === c.value && styles.chipActive]}
            onPress={() => setCategory(c.value)}
          >
            <Text
              style={[
                styles.chipText,
                category === c.value && styles.chipTextActive,
              ]}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Brand / Manufacturer */}
      <Text style={styles.label}>Brand / Manufacturer *</Text>
      <TextInput
        style={styles.input}
        value={manufacturer}
        onChangeText={setManufacturer}
        placeholder="e.g. Dell, Lenovo, HP"
        placeholderTextColor={theme.colors.textMuted}
      />

      {/* Model */}
      <Text style={styles.label}>Model *</Text>
      <TextInput
        style={styles.input}
        value={model}
        onChangeText={setModel}
        placeholder="e.g. Latitude 5540, ThinkPad T14"
        placeholderTextColor={theme.colors.textMuted}
      />

      {/* Condition */}
      <Text style={styles.label}>Condition Grade</Text>
      <View style={styles.conditionContainer}>
        {CONDITIONS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.conditionBtn, condition === c && styles.conditionBtnActive]}
            onPress={() => setCondition(c)}
          >
            <Text
              style={[
                styles.conditionBtnText,
                condition === c && styles.conditionBtnTextActive,
              ]}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.conditionHint}>{conditionLabels[condition]}</Text>

      {/* Location */}
      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="e.g. Warehouse A, Site Paris"
        placeholderTextColor={theme.colors.textMuted}
      />

      {/* Notes */}
      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Additional observations..."
        placeholderTextColor={theme.colors.textMuted}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {/* Photo */}
      <Text style={styles.label}>Photo</Text>
      <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photoPreview} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>Tap to capture photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, saving && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Text style={styles.submitText}>
            {isOnline ? 'Register Device' : 'Save Offline'}
          </Text>
        )}
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
  headerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  headerLabel: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.warning,
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  barcodeValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: 'monospace',
    marginBottom: theme.spacing.xs,
  },
  headerHint: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 80,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.sm + 4,
    paddingVertical: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  conditionContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  conditionBtn: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  conditionBtnText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  conditionBtnTextActive: {
    color: theme.colors.white,
  },
  conditionHint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  photoButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  photoPlaceholder: {
    height: 120,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  submitButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
});
