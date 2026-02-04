import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean
  isAuthenticating: boolean
  setAuthenticated: (authenticated: boolean) => void
  setAuthenticating: (authenticating: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isAuthenticating: false,
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setAuthenticating: (isAuthenticating) => set({ isAuthenticating }),
}))
