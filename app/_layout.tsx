import { View } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { AppProviders } from '@/components/app-providers'
import { LockScreen } from '@/components/lock-screen'
import { OfflineBanner } from '@/components/offline-banner'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { colors } from '@/constants/app-styles'
import { useAuthStore } from '@/stores/auth-store'
import { useSettingsStore } from '@/stores/settings-store'
import { useAppLock } from '@/hooks/use-app-lock'

function AppContent() {
  const { isAuthenticated } = useAuthStore()
  const { biometricEnabled } = useSettingsStore()

  // Auto-lock app when backgrounded for too long
  useAppLock()

  // Show lock screen if biometric is enabled and not authenticated
  if (biometricEnabled && !isAuthenticated) {
    return (
      <>
        <LockScreen />
        <StatusBar style="light" />
      </>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </View>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </GestureHandlerRootView>
  )
}
