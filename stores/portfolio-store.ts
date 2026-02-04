import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface TokenHolding {
  mint: string
  symbol: string
  name: string
  amount: number // raw amount
  decimals: number
  uiAmount: number // human readable
  priceUsd: number | null
  valueUsd: number | null
  change24h: number | null
  logoUri: string | null
  priceHistory?: number[] // 24 data points for sparkline
  isCustom?: boolean // Manually added token
}

export interface PortfolioState {
  // Data
  holdings: TokenHolding[]
  totalValueUsd: number
  change24h: number | null
  lastUpdated: number | null
  walletCount: number // Number of wallets in aggregated view

  // Loading states
  isLoading: boolean
  error: string | null

  // Actions
  setHoldings: (holdings: TokenHolding[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setWalletCount: (count: number) => void
  refresh: () => Promise<void>
  clear: () => void
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      // Initial state
      holdings: [],
      totalValueUsd: 0,
      change24h: null,
      lastUpdated: null,
      walletCount: 1,
      isLoading: false,
      error: null,

      // Actions
      setHoldings: (holdings) => {
        const totalValueUsd = holdings.reduce(
          (sum, h) => sum + (h.valueUsd ?? 0),
          0
        )
        // Calculate weighted average 24h change
        const totalChange = holdings.reduce((sum, h) => {
          if (h.change24h !== null && h.valueUsd !== null) {
            return sum + h.change24h * (h.valueUsd / totalValueUsd)
          }
          return sum
        }, 0)

        set({
          holdings,
          totalValueUsd,
          change24h: totalValueUsd > 0 ? totalChange : null,
          lastUpdated: Date.now(),
        })
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setWalletCount: (walletCount) => set({ walletCount }),

      refresh: async () => {
        // This will be called to trigger a refresh
        // The actual fetching happens in the usePortfolioData hook
        set({ isLoading: true, error: null })
      },

      clear: () =>
        set({
          holdings: [],
          totalValueUsd: 0,
          change24h: null,
          lastUpdated: null,
          walletCount: 1,
          error: null,
        }),
    }),
    {
      name: 'fullport-portfolio',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        holdings: state.holdings,
        totalValueUsd: state.totalValueUsd,
        change24h: state.change24h,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
)
