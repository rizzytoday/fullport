import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PropsWithChildren } from 'react'
import { Platform } from 'react-native'
import { NetworkProvider } from '@/features/network/network-provider'
import { MobileWalletProvider } from '@wallet-ui/react-native-kit'
import { AppConfig } from '@/constants/app-config'

const queryClient = new QueryClient()
const isWeb = Platform.OS === 'web'

export function AppProviders({ children }: PropsWithChildren) {
  // Skip wallet provider on web - it doesn't work there
  if (isWeb) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NetworkProvider
        networks={AppConfig.networks}
        render={({ selectedNetwork }) => (
          <MobileWalletProvider cluster={selectedNetwork} identity={AppConfig.identity}>
            {children}
          </MobileWalletProvider>
        )}
      />
    </QueryClientProvider>
  )
}
