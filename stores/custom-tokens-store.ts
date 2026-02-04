import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface CustomToken {
  id: string
  mint: string
  symbol: string
  name: string
  decimals: number
  logoUri: string | null
  manualAmount: number | null // User-entered balance (UI amount)
  manualPriceUsd: number | null // For pre-launch tokens
  addedAt: number
}

export interface CustomTokensState {
  tokens: CustomToken[]

  // Actions
  addToken: (token: Omit<CustomToken, 'id' | 'addedAt'>) => void
  updateToken: (id: string, updates: Partial<CustomToken>) => void
  removeToken: (id: string) => void
  getTokenByMint: (mint: string) => CustomToken | undefined
  clear: () => void
}

export const useCustomTokensStore = create<CustomTokensState>()(
  persist(
    (set, get) => ({
      tokens: [],

      addToken: (token) => {
        const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
        const newToken: CustomToken = {
          ...token,
          id,
          addedAt: Date.now(),
        }
        set((state) => ({
          tokens: [...state.tokens, newToken],
        }))
      },

      updateToken: (id, updates) => {
        set((state) => ({
          tokens: state.tokens.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }))
      },

      removeToken: (id) => {
        set((state) => ({
          tokens: state.tokens.filter((t) => t.id !== id),
        }))
      },

      getTokenByMint: (mint) => {
        return get().tokens.find((t) => t.mint === mint)
      },

      clear: () => set({ tokens: [] }),
    }),
    {
      name: 'fullport-custom-tokens',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
