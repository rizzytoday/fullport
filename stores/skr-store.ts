import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface StakingInfo {
  stakedAmount: number // Base units
  stakedUiAmount: number // Human readable
  pendingRewards: number
  guardian: string
  guardianName: string
  lastCompound: number | null
  cooldownEnd: number | null // Timestamp when unstaking cooldown ends
  isUnstaking: boolean
}

export interface SKRState {
  // SKR balance
  balance: number // Base units
  uiBalance: number // Human readable
  priceUsd: number | null
  valueUsd: number | null

  // Staking info
  staking: StakingInfo | null

  // Network stats
  totalStaked: number | null
  currentApy: number

  // Cache
  lastUpdated: number | null

  // Loading states
  isLoading: boolean
  error: string | null

  // Actions
  setBalance: (balance: number, decimals: number) => void
  setPrice: (price: number | null) => void
  setStaking: (staking: StakingInfo | null) => void
  setNetworkStats: (totalStaked: number, apy: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clear: () => void
}

export const useSkrStore = create<SKRState>()(
  persist(
    (set, get) => ({
      // Initial state
      balance: 0,
      uiBalance: 0,
      priceUsd: null,
      valueUsd: null,
      staking: null,
      totalStaked: null,
      currentApy: 0.211, // 21.1% default
      lastUpdated: null,
      isLoading: false,
      error: null,

      // Actions
      setBalance: (balance, decimals) => {
        const uiBalance = balance / Math.pow(10, decimals)
        const { priceUsd } = get()
        set({
          balance,
          uiBalance,
          valueUsd: priceUsd ? uiBalance * priceUsd : null,
          lastUpdated: Date.now(),
        })
      },

      setPrice: (priceUsd) => {
        const { uiBalance } = get()
        set({
          priceUsd,
          valueUsd: priceUsd ? uiBalance * priceUsd : null,
        })
      },

      setStaking: (staking) => set({ staking }),

      setNetworkStats: (totalStaked, apy) => set({
        totalStaked,
        currentApy: apy,
      }),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      clear: () => set({
        balance: 0,
        uiBalance: 0,
        priceUsd: null,
        valueUsd: null,
        staking: null,
        totalStaked: null,
        lastUpdated: null,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'fullport-skr',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        balance: state.balance,
        uiBalance: state.uiBalance,
        priceUsd: state.priceUsd,
        staking: state.staking,
        totalStaked: state.totalStaked,
        currentApy: state.currentApy,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
)
