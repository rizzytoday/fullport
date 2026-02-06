import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DEMO_MODE, MOCK_STAKING_REWARDS } from '@/constants/mock-data'

export interface RewardClaim {
  id: string
  timestamp: number
  amount: number        // SKR amount claimed
  usdValue: number      // USD value at time of claim
  txSignature?: string  // Transaction signature
}

interface StakingRewardsState {
  claims: RewardClaim[]
  totalEarned: number           // Total SKR ever earned
  totalEarnedUsd: number        // Total USD value earned
  thisMonthEarned: number       // Current month's earnings
  thisMonthEarnedUsd: number
  dailyAverage: number          // Average daily earnings
  lastUpdated: number | null

  // Actions
  recordClaim: (claim: Omit<RewardClaim, 'id'>) => void
  getClaimsByPeriod: (days: number) => RewardClaim[]
  calculateStats: () => void
  clearHistory: () => void
  initializeWithMockData: () => void
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function getStartOfMonth(): number {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime()
}

function getDaysAgoTimestamp(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1000
}

export const useStakingRewardsStore = create<StakingRewardsState>()(
  persist(
    (set, get) => ({
      // Initial state
      claims: [],
      totalEarned: 0,
      totalEarnedUsd: 0,
      thisMonthEarned: 0,
      thisMonthEarnedUsd: 0,
      dailyAverage: 0,
      lastUpdated: null,

      // Actions
      recordClaim: (claimData) => {
        const newClaim: RewardClaim = {
          ...claimData,
          id: generateId(),
        }
        set((state) => ({
          claims: [...state.claims, newClaim],
          lastUpdated: Date.now(),
        }))
        // Recalculate stats after adding
        get().calculateStats()
      },

      getClaimsByPeriod: (days) => {
        const cutoff = getDaysAgoTimestamp(days)
        return get().claims.filter((c) => c.timestamp >= cutoff)
      },

      calculateStats: () => {
        const { claims } = get()

        if (claims.length === 0) {
          set({
            totalEarned: 0,
            totalEarnedUsd: 0,
            thisMonthEarned: 0,
            thisMonthEarnedUsd: 0,
            dailyAverage: 0,
          })
          return
        }

        // Calculate totals
        const totalEarned = claims.reduce((sum, c) => sum + c.amount, 0)
        const totalEarnedUsd = claims.reduce((sum, c) => sum + c.usdValue, 0)

        // Calculate this month's earnings
        const monthStart = getStartOfMonth()
        const thisMonthClaims = claims.filter((c) => c.timestamp >= monthStart)
        const thisMonthEarned = thisMonthClaims.reduce((sum, c) => sum + c.amount, 0)
        const thisMonthEarnedUsd = thisMonthClaims.reduce((sum, c) => sum + c.usdValue, 0)

        // Calculate daily average (based on span of claims history)
        const timestamps = claims.map((c) => c.timestamp)
        const oldestClaim = Math.min(...timestamps)
        const newestClaim = Math.max(...timestamps)
        const daySpan = Math.max(1, (newestClaim - oldestClaim) / (24 * 60 * 60 * 1000))
        const dailyAverage = totalEarned / daySpan

        set({
          totalEarned,
          totalEarnedUsd,
          thisMonthEarned,
          thisMonthEarnedUsd,
          dailyAverage,
        })
      },

      clearHistory: () => {
        set({
          claims: [],
          totalEarned: 0,
          totalEarnedUsd: 0,
          thisMonthEarned: 0,
          thisMonthEarnedUsd: 0,
          dailyAverage: 0,
          lastUpdated: null,
        })
      },

      initializeWithMockData: () => {
        if (!DEMO_MODE) return

        const { claims } = get()
        // Only initialize if store is empty
        if (claims.length > 0) return

        // Load mock staking rewards
        set({
          claims: MOCK_STAKING_REWARDS,
          lastUpdated: Date.now(),
        })
        // Calculate stats from mock data
        get().calculateStats()
      },
    }),
    {
      name: 'fullport-staking-rewards',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        claims: state.claims,
        totalEarned: state.totalEarned,
        totalEarnedUsd: state.totalEarnedUsd,
        thisMonthEarned: state.thisMonthEarned,
        thisMonthEarnedUsd: state.thisMonthEarnedUsd,
        dailyAverage: state.dailyAverage,
        lastUpdated: state.lastUpdated,
      }),
      onRehydrateStorage: () => (state) => {
        // After rehydration, initialize with mock data if empty and in demo mode
        if (state && DEMO_MODE && state.claims.length === 0) {
          state.initializeWithMockData()
        }
      },
    }
  )
)
