import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DEMO_MODE, MOCK_PORTFOLIO_HISTORY } from '@/constants/mock-data'

export interface PortfolioSnapshot {
  timestamp: number
  totalValueUsd: number
  holdings: { mint: string; symbol: string; valueUsd: number }[]
}

type Period = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'

const MAX_SNAPSHOTS = 365
const ONE_DAY_MS = 24 * 60 * 60 * 1000

// Helper to get start of day (midnight UTC)
const getStartOfDay = (timestamp: number): number => {
  const date = new Date(timestamp)
  date.setUTCHours(0, 0, 0, 0)
  return date.getTime()
}

// Helper to get period start timestamp
const getPeriodStartTimestamp = (period: Period): number => {
  const now = Date.now()
  switch (period) {
    case '1D':
      return now - ONE_DAY_MS
    case '1W':
      return now - 7 * ONE_DAY_MS
    case '1M':
      return now - 30 * ONE_DAY_MS
    case '3M':
      return now - 90 * ONE_DAY_MS
    case '1Y':
      return now - 365 * ONE_DAY_MS
    case 'ALL':
      return 0
  }
}

export interface PortfolioHistoryState {
  // Data
  snapshots: PortfolioSnapshot[]

  // Actions
  addSnapshot: (snapshot: PortfolioSnapshot) => void
  getSnapshots: (period: Period) => PortfolioSnapshot[]
  clearHistory: () => void
  initializeWithMockData: () => void
}

export const usePortfolioHistoryStore = create<PortfolioHistoryState>()(
  persist(
    (set, get) => ({
      // Initial state
      snapshots: [],

      // Actions
      addSnapshot: (snapshot) =>
        set((state) => {
          const snapshotDay = getStartOfDay(snapshot.timestamp)

          // Check if we already have a snapshot for this day
          const existingIndex = state.snapshots.findIndex(
            (s) => getStartOfDay(s.timestamp) === snapshotDay
          )

          let newSnapshots: PortfolioSnapshot[]

          if (existingIndex !== -1) {
            // Replace existing snapshot for this day with newer one
            newSnapshots = [...state.snapshots]
            newSnapshots[existingIndex] = snapshot
          } else {
            // Add new snapshot
            newSnapshots = [...state.snapshots, snapshot]
          }

          // Sort by timestamp (oldest first)
          newSnapshots.sort((a, b) => a.timestamp - b.timestamp)

          // Trim to max 365 days (keep most recent)
          if (newSnapshots.length > MAX_SNAPSHOTS) {
            newSnapshots = newSnapshots.slice(-MAX_SNAPSHOTS)
          }

          return { snapshots: newSnapshots }
        }),

      getSnapshots: (period) => {
        const { snapshots } = get()
        const startTimestamp = getPeriodStartTimestamp(period)
        return snapshots.filter((s) => s.timestamp >= startTimestamp)
      },

      clearHistory: () => set({ snapshots: [] }),

      initializeWithMockData: () => {
        if (!DEMO_MODE) return

        // In demo mode, always reinitialize so timestamps stay relative to current time.
        // Stale persisted data (from a previous install) would break 1D/1W filters.
        const mockSnapshots: PortfolioSnapshot[] = MOCK_PORTFOLIO_HISTORY.map((h) => ({
          timestamp: h.timestamp,
          totalValueUsd: h.totalValue,
          holdings: h.holdings.map((holding) => ({
            mint: '',
            symbol: holding.symbol,
            valueUsd: holding.value,
          })),
        }))

        set({ snapshots: mockSnapshots })
      },
    }),
    {
      name: 'fullport-portfolio-history',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state && DEMO_MODE) {
          state.initializeWithMockData()
        }
      },
    }
  )
)
