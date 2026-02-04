import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Preset colors for visual differentiation
export const WALLET_COLORS = [
  '#a855f7', // Purple
  '#60a5fa', // Blue
  '#4ade80', // Green
  '#fcd34d', // Gold
  '#f87171', // Red
  '#fb923c', // Orange
  '#2dd4bf', // Teal
  '#f472b6', // Pink
]

export interface WatchedWallet {
  id: string
  address: string
  label: string
  color: string
  addedAt: number
}

export interface WatchedWalletsState {
  wallets: WatchedWallet[]
  aggregateMode: boolean // Combined vs separate view

  // Actions
  addWallet: (address: string, label?: string) => void
  updateWallet: (id: string, updates: Partial<WatchedWallet>) => void
  removeWallet: (id: string) => void
  setAggregateMode: (enabled: boolean) => void
  getNextColor: () => string
  clear: () => void
}

export const useWatchedWalletsStore = create<WatchedWalletsState>()(
  persist(
    (set, get) => ({
      wallets: [],
      aggregateMode: true, // Default to combined view

      addWallet: (address, label) => {
        const { wallets, getNextColor } = get()

        // Check if address already exists
        if (wallets.some((w) => w.address === address)) {
          return
        }

        const id = `wallet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`

        const newWallet: WatchedWallet = {
          id,
          address,
          label: label || shortAddress,
          color: getNextColor(),
          addedAt: Date.now(),
        }

        set((state) => ({
          wallets: [...state.wallets, newWallet],
        }))
      },

      updateWallet: (id, updates) => {
        set((state) => ({
          wallets: state.wallets.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        }))
      },

      removeWallet: (id) => {
        set((state) => ({
          wallets: state.wallets.filter((w) => w.id !== id),
        }))
      },

      setAggregateMode: (aggregateMode) => set({ aggregateMode }),

      getNextColor: () => {
        const { wallets } = get()
        const usedColors = wallets.map((w) => w.color)
        // Find first unused color, or cycle back
        const availableColor = WALLET_COLORS.find((c) => !usedColors.includes(c))
        return availableColor || WALLET_COLORS[wallets.length % WALLET_COLORS.length]
      },

      clear: () => set({ wallets: [], aggregateMode: true }),
    }),
    {
      name: 'fullport-watched-wallets',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
