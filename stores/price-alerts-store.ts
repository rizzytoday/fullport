import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type AlertDirection = 'above' | 'below'

export interface PriceAlert {
  id: string
  mint: string
  symbol: string
  name: string
  logoUri: string | null
  targetPrice: number
  direction: AlertDirection
  currentPriceAtCreation: number
  createdAt: number
  triggered: boolean
  triggeredAt?: number
}

interface PriceAlertsState {
  alerts: PriceAlert[]
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void
  removeAlert: (id: string) => void
  markTriggered: (id: string) => void
  getAlertsForToken: (mint: string) => PriceAlert[]
  clearTriggered: () => void
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export const usePriceAlertsStore = create<PriceAlertsState>()(
  persist(
    (set, get) => ({
      alerts: [],

      addAlert: (alertData) => {
        const newAlert: PriceAlert = {
          ...alertData,
          id: generateId(),
          createdAt: Date.now(),
          triggered: false,
        }
        set((state) => ({
          alerts: [...state.alerts, newAlert],
        }))
      },

      removeAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        }))
      },

      markTriggered: (id) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, triggered: true, triggeredAt: Date.now() } : a
          ),
        }))
      },

      getAlertsForToken: (mint) => {
        return get().alerts.filter((a) => a.mint === mint && !a.triggered)
      },

      clearTriggered: () => {
        set((state) => ({
          alerts: state.alerts.filter((a) => !a.triggered),
        }))
      },
    }),
    {
      name: 'fullport-price-alerts',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
