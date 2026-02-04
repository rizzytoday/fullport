import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus, Platform } from 'react-native'
import { useAuthStore } from '@/stores/auth-store'
import { useSettingsStore } from '@/stores/settings-store'

const LOCK_DELAY_MS = 5000 // Lock after 5 seconds in background

export function useAppLock() {
  const { setAuthenticated } = useAuthStore()
  const { biometricEnabled } = useSettingsStore()
  const appState = useRef(AppState.currentState)
  const backgroundTime = useRef<number | null>(null)

  useEffect(() => {
    if (Platform.OS === 'web') return

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // App going to background
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        backgroundTime.current = Date.now()
      }

      // App coming back to foreground
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (biometricEnabled && backgroundTime.current) {
          const elapsed = Date.now() - backgroundTime.current
          if (elapsed > LOCK_DELAY_MS) {
            // Lock the app - require re-authentication
            setAuthenticated(false)
          }
        }
        backgroundTime.current = null
      }

      appState.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [biometricEnabled, setAuthenticated])
}
