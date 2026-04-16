import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { theme } from '../theme';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ScanHistoryScreen from '../screens/ScanHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DeviceDetailScreen from '../screens/DeviceDetailScreen';
import AssetIntakeScreen from '../screens/AssetIntakeScreen';

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.primary,
    notification: theme.colors.error,
  },
};

// Simple text-based tab icons (avoids extra icon library dependency)
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={[tabStyles.iconContainer, focused && tabStyles.iconActive]}>
      <View style={tabStyles.iconInner}>
        <ActivityIndicator
          size={0}
          // invisible — we just use the label below
        />
      </View>
    </View>
  );
}

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: 4,
          height: 60,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Scanner"
        component={ScannerScreen}
        options={{
          title: 'Scanner',
          headerTitle: 'Device Scanner',
          tabBarLabel: 'Scan',
        }}
      />
      <Tab.Screen
        name="History"
        component={ScanHistoryScreen}
        options={{
          title: 'History',
          headerTitle: 'Scan History',
          tabBarLabel: 'History',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerTitle: 'Profile & Sync',
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={loadStyles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        {session ? (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DeviceDetail"
              component={DeviceDetailScreen}
              options={{ title: 'Device Details' }}
            />
            <Stack.Screen
              name="AssetIntake"
              component={AssetIntakeScreen}
              options={{ title: 'New Device Intake' }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const loadStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const tabStyles = StyleSheet.create({
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {},
  iconInner: {
    width: 0,
    height: 0,
  },
});
