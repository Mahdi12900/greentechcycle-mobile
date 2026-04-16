import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { OfflineProvider } from './src/contexts/OfflineContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <OfflineProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </OfflineProvider>
    </AuthProvider>
  );
}
