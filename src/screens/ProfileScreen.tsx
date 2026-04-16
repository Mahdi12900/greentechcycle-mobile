import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { useOffline } from '../contexts/OfflineContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { isOnline, pendingCount, syncNow } = useOffline();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleSync = async () => {
    await syncNow();
    Alert.alert('Sync Complete', 'All pending items have been processed.');
  };

  return (
    <View style={styles.container}>
      {/* User card */}
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(user?.email?.[0] ?? 'T').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.email}>{user?.email ?? 'Unknown user'}</Text>
        <Text style={styles.role}>
          {user?.user_metadata?.role ?? user?.app_metadata?.role ?? 'technician'}
        </Text>
      </View>

      {/* Sync status */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>SYNC STATUS</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Connection</Text>
          <View style={styles.statusValue}>
            <View
              style={[
                styles.dot,
                { backgroundColor: isOnline ? theme.colors.success : theme.colors.error },
              ]}
            />
            <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Pending sync</Text>
          <Text style={styles.statusText}>
            {pendingCount} item{pendingCount !== 1 ? 's' : ''}
          </Text>
        </View>

        {pendingCount > 0 && isOnline && (
          <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
            <Text style={styles.syncButtonText}>Sync Now</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* App info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>APPLICATION</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>App</Text>
          <Text style={styles.statusText}>GreenTechCycle Mobile</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Version</Text>
          <Text style={styles.statusText}>1.0.0</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Platform</Text>
          <Text style={styles.statusText}>ITAD Command Center</Text>
        </View>
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.primary,
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  avatarText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700',
    color: theme.colors.white,
  },
  email: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  role: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
    marginTop: theme.spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: theme.spacing.xs + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  statusLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  statusValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '600',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  syncButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  syncButtonText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: '700',
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  signOutText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
});
