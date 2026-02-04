import { useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { usePortfolioStore, TokenHolding } from '@/stores/portfolio-store'
import { useCustomTokensStore, CustomToken } from '@/stores/custom-tokens-store'
import { useWatchedWalletsStore } from '@/stores/watched-wallets-store'
import { usePriceAlertsStore } from '@/stores/price-alerts-store'
import { checkPriceAlerts } from '@/services/notification-service'
import { KNOWN_TOKENS } from '@/constants/app-config'
import { DEMO_MODE, MOCK_HOLDINGS } from '@/constants/mock-data'
import { Platform } from 'react-native'

const isWeb = Platform.OS === 'web'

// Helius API for token balances
const HELIUS_API_KEY = '8d0eb0c7-f3ef-46a0-915d-9e4728b04daa'
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`

interface HeliusAsset {
  id: string
  content: {
    metadata: {
      name: string
      symbol: string
    }
    links?: {
      image?: string
    }
  }
  token_info?: {
    balance: number
    decimals: number
    price_info?: {
      price_per_token: number
      total_price: number
    }
  }
}

// Fetch token balances using Helius DAS API
async function fetchTokenBalances(walletAddress: string): Promise<TokenHolding[]> {
  try {
    // Use Helius getAssetsByOwner for comprehensive token data
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'fullport',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: walletAddress,
          page: 1,
          limit: 100,
          displayOptions: {
            showFungible: true,
            showNativeBalance: true,
          },
        },
      }),
    })

    const data = await response.json()

    if (data.error) {
      console.error('Helius API error:', data.error)
      throw new Error(data.error.message)
    }

    const holdings: TokenHolding[] = []

    // Process native SOL balance
    if (data.result?.nativeBalance) {
      const solBalance = data.result.nativeBalance.lamports / 1e9
      const solPrice = data.result.nativeBalance.price_per_sol || 0
      holdings.push({
        mint: KNOWN_TOKENS.SOL,
        symbol: 'SOL',
        name: 'Solana',
        amount: data.result.nativeBalance.lamports,
        decimals: 9,
        uiAmount: solBalance,
        priceUsd: solPrice,
        valueUsd: solBalance * solPrice,
        change24h: null, // Will fetch separately if needed
        logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
      })
    }

    // Process fungible tokens
    if (data.result?.items) {
      for (const asset of data.result.items as HeliusAsset[]) {
        if (asset.token_info && asset.token_info.balance > 0) {
          const decimals = asset.token_info.decimals || 0
          const uiAmount = asset.token_info.balance / Math.pow(10, decimals)
          const priceUsd = asset.token_info.price_info?.price_per_token || null
          const valueUsd = asset.token_info.price_info?.total_price || (priceUsd ? uiAmount * priceUsd : null)

          holdings.push({
            mint: asset.id,
            symbol: asset.content?.metadata?.symbol || 'UNKNOWN',
            name: asset.content?.metadata?.name || 'Unknown Token',
            amount: asset.token_info.balance,
            decimals,
            uiAmount,
            priceUsd,
            valueUsd,
            change24h: null,
            logoUri: asset.content?.links?.image || null,
          })
        }
      }
    }

    // Sort by value (highest first)
    holdings.sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0))

    return holdings
  } catch (error) {
    console.error('Failed to fetch from Helius:', error)
    // Return empty array on error
    return []
  }
}

// Convert custom token to TokenHolding format
function customTokenToHolding(token: CustomToken): TokenHolding {
  const uiAmount = token.manualAmount ?? 0
  const priceUsd = token.manualPriceUsd
  const valueUsd = priceUsd && uiAmount ? uiAmount * priceUsd : null

  return {
    mint: token.mint,
    symbol: token.symbol,
    name: token.name,
    amount: Math.floor(uiAmount * Math.pow(10, token.decimals)),
    decimals: token.decimals,
    uiAmount,
    priceUsd,
    valueUsd,
    change24h: null,
    logoUri: token.logoUri,
    isCustom: true,
  }
}

// Merge custom tokens with API holdings
function mergeHoldings(
  apiHoldings: TokenHolding[],
  customTokens: CustomToken[]
): TokenHolding[] {
  // Filter out custom tokens that already exist in API holdings
  const customHoldings = customTokens
    .filter((ct) => !apiHoldings.some((h) => h.mint === ct.mint))
    .map(customTokenToHolding)

  // Combine and sort by value
  const merged = [...apiHoldings, ...customHoldings]
  merged.sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0))

  return merged
}

// Aggregate holdings from multiple wallets
function aggregateMultiWalletHoldings(holdingsArrays: TokenHolding[][]): TokenHolding[] {
  const aggregated = new Map<string, TokenHolding>()

  for (const holdings of holdingsArrays) {
    for (const holding of holdings) {
      const existing = aggregated.get(holding.mint)
      if (existing) {
        // Aggregate amounts and values
        aggregated.set(holding.mint, {
          ...existing,
          amount: existing.amount + holding.amount,
          uiAmount: existing.uiAmount + holding.uiAmount,
          valueUsd:
            existing.valueUsd !== null && holding.valueUsd !== null
              ? existing.valueUsd + holding.valueUsd
              : existing.valueUsd ?? holding.valueUsd,
        })
      } else {
        aggregated.set(holding.mint, { ...holding })
      }
    }
  }

  // Convert to array and sort by value
  const result = Array.from(aggregated.values())
  result.sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0))

  return result
}

// Main hook to fetch and manage portfolio data
export function usePortfolioData() {
  const wallet = isWeb ? null : useMobileWallet()
  const account = wallet?.account
  const { setHoldings, setLoading, setError, isLoading, holdings } = usePortfolioStore()
  const { setWalletCount } = usePortfolioStore()
  const customTokens = useCustomTokensStore((state) => state.tokens)
  const { wallets: watchedWallets, aggregateMode } = useWatchedWalletsStore()
  const { alerts, markTriggered } = usePriceAlertsStore()

  // Check price alerts when holdings update
  useEffect(() => {
    if (holdings.length === 0 || isWeb) return

    const activeAlerts = alerts.filter((a) => !a.triggered)
    if (activeAlerts.length === 0) return

    const getCurrentPrice = (mint: string): number | null => {
      const holding = holdings.find((h) => h.mint === mint)
      return holding?.priceUsd ?? null
    }

    checkPriceAlerts(activeAlerts, getCurrentPrice, markTriggered)
  }, [holdings, alerts, markTriggered])

  const fetchPortfolio = useCallback(async () => {
    if (!account?.address) return []

    setLoading(true)
    setError(null)

    try {
      // Use mock data in demo mode for impressive screenshots
      if (DEMO_MODE) {
        const merged = mergeHoldings(MOCK_HOLDINGS, customTokens)
        // Simulate watched wallets in demo mode
        const totalWallets = 1 + watchedWallets.length
        setWalletCount(aggregateMode ? totalWallets : 1)
        setHoldings(merged)
        setLoading(false)
        return merged
      }

      // Collect all addresses to fetch
      const addresses = [account.address, ...watchedWallets.map((w) => w.address)]

      // Fetch all wallets in parallel
      const holdingsArrays = await Promise.all(
        addresses.map((address) => fetchTokenBalances(address))
      )

      // Aggregate if in combined mode, otherwise just use primary wallet
      let finalHoldings: TokenHolding[]
      if (aggregateMode && holdingsArrays.length > 1) {
        finalHoldings = aggregateMultiWalletHoldings(holdingsArrays)
        setWalletCount(addresses.length)
      } else {
        finalHoldings = holdingsArrays[0] || []
        setWalletCount(1)
      }

      // Merge with custom tokens
      const merged = mergeHoldings(finalHoldings, customTokens)
      setHoldings(merged)
      setLoading(false)
      return merged
    } catch (error) {
      console.error('Failed to fetch portfolio:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch portfolio')
      setLoading(false)
      return []
    }
  }, [account?.address, customTokens, watchedWallets, aggregateMode, setHoldings, setLoading, setError, setWalletCount])

  // Use React Query for caching and refetching
  const watchedAddresses = watchedWallets.map((w) => w.address).join(',')
  const { refetch } = useQuery({
    queryKey: ['portfolio', account?.address, watchedAddresses, aggregateMode],
    queryFn: fetchPortfolio,
    enabled: !!account?.address,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    refetchInterval: 60000, // Auto-refresh every minute
  })

  return {
    refetch,
    isLoading,
  }
}
