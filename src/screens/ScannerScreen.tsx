import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { assetService } from '../services/assetService';
import { scanHistory } from '../services/scanHistory';
import { useOffline } from '../contexts/OfflineContext';

type RootStackParamList = {
  MainTabs: undefined;
  DeviceDetail: { asset: any };
  AssetIntake: { barcode: string };
};

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isOnline } = useOffline();
  const lastScanned = useRef<string>('');
  const cooldownRef = useRef(false);

  const handleBarCodeScanned = async (result: BarcodeScanningResult) => {
    const barcode = result.data;

    // Debounce: ignore duplicate scans within 3 seconds
    if (cooldownRef.current || barcode === lastScanned.current) return;
    cooldownRef.current = true;
    lastScanned.current = barcode;
    setTimeout(() => {
      cooldownRef.current = false;
    }, 3000);

    setProcessing(true);
    setScanning(false);

    try {
      const asset = await assetService.findByBarcode(barcode);

      if (asset) {
        // Record in scan history
        await scanHistory.add({
          barcode,
          asset_id: asset.id,
          asset_tag: asset.asset_tag,
          manufacturer: asset.manufacturer,
          model: asset.model,
          category: asset.category,
          found: true,
        });

        navigation.navigate('DeviceDetail', { asset });
      } else {
        await scanHistory.add({
          barcode,
          asset_id: null,
          asset_tag: null,
          manufacturer: null,
          model: null,
          category: null,
          found: false,
        });

        navigation.navigate('AssetIntake', { barcode });
      }
    } catch (err: any) {
      Alert.alert('Lookup Error', err.message ?? 'Failed to query the database.');
      setScanning(true);
    } finally {
      setProcessing(false);
    }
  };

  const resetScanner = () => {
    lastScanned.current = '';
    setScanning(true);
    setProcessing(false);
  };

  // Reset scanner when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', resetScanner);
    return unsubscribe;
  }, [navigation]);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>
          Camera access is required to scan barcodes and QR codes.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Online/offline indicator */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>
            OFFLINE — scans will be queued
          </Text>
        </View>
      )}

      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: [
            'qr',
            'ean13',
            'ean8',
            'code128',
            'code39',
            'code93',
            'upc_a',
            'upc_e',
            'datamatrix',
            'pdf417',
          ],
        }}
        onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
      >
        {/* Scanning overlay */}
        <View style={styles.overlay}>
          <View style={styles.overlayTop} />
          <View style={styles.overlayMiddle}>
            <View style={styles.overlaySide} />
            <View style={styles.scanWindow}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <View style={styles.overlaySide} />
          </View>
          <View style={styles.overlayBottom}>
            {processing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator color={theme.colors.primary} size="large" />
                <Text style={styles.processingText}>Looking up device...</Text>
              </View>
            ) : (
              <Text style={styles.instructionText}>
                Align barcode or QR code within the frame
              </Text>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const SCAN_SIZE = 260;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
  },
  overlayMiddle: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
  },
  scanWindow: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    borderWidth: 0,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: theme.colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
  },
  instructionText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    textAlign: 'center',
  },
  processingContainer: {
    alignItems: 'center',
  },
  processingText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    marginTop: theme.spacing.sm,
  },
  permissionText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  permissionButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  offlineBanner: {
    backgroundColor: theme.colors.warning,
    paddingVertical: theme.spacing.xs,
    alignItems: 'center',
  },
  offlineBannerText: {
    color: theme.colors.black,
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
