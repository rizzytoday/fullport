import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface SettingsState {
  // Preferences
  biometricEnabled: boolean
  hapticEnabled: boolean
  notificationsEnabled: boolean
  currency: 'USD' | 'SOL'

  // Price alerts
  priceAlerts: Array<{
    id: string
    tokenMint: string
    targetPrice: number
    direction: 'above' | 'below'
    enabled: boolean
  }>

  // Actions
  setBiometricEnabled: (enabled: boolean) => void
  setHapticEnabled: (enabled: boolean) => void
  setNotificationsEnabled: (enabled: boolean) => void
  setCurrency: (currency: 'USD' | 'SOL') => void
  addPriceAlert: (alert: SettingsState['priceAlerts'][0]) => void
  removePriceAlert: (id: string) => void
  togglePriceAlert: (id: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Initial state
      biometricEnabled: true, // Enable by default for demo
      hapticEnabled: true,
      notificationsEnabled: false,
      currency: 'USD',
      priceAlerts: [],

      // Actions
      setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),
      setHapticEnabled: (hapticEnabled) => set({ hapticEnabled }),
      setNotificationsEnabled: (notificationsEnabled) =>
        set({ notificationsEnabled }),
      setCurrency: (currency) => set({ currency }),

      addPriceAlert: (alert) =>
        set((state) => ({
          priceAlerts: [...state.priceAlerts, alert],
        })),

      removePriceAlert: (id) =>
        set((state) => ({
          priceAlerts: state.priceAlerts.filter((a) => a.id !== id),
        })),

      togglePriceAlert: (id) =>
        set((state) => ({
          priceAlerts: state.priceAlerts.map((a) =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
          ),
        })),
    }),
    {
      name: 'fullport-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
