import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useMobileWallet } from '@wallet-ui/react-native-kit'
import { useSkrStore, StakingInfo } from '@/stores/skr-store'
import { SKR_CONFIG, JUPITER_PRICE_API } from '@/constants/app-config'
import { DEMO_MODE, MOCK_SKR_BALANCE, MOCK_SKR_PRICE, MOCK_STAKING_INFO } from '@/constants/mock-data'
import { Platform } from 'react-native'

const isWeb = Platform.OS === 'web'

// Helius API for token balances
const HELIUS_API_KEY = '8d0eb0c7-f3ef-46a0-915d-9e4728b04daa'
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`

// Fetch SKR token balance
async function fetchSkrBalance(walletAddress: string): Promise<number> {
  try {
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'skr-balance',
        method: 'getTokenAccountsByOwner',
        params: [
          walletAddress,
          { mint: SKR_CONFIG.mint },
          { encoding: 'jsonParsed' },
        ],
      }),
    })

    const data = await response.json()

    if (data.result?.value?.length > 0) {
      const tokenAccount = data.result.value[0]
      const amount = tokenAccount.account.data.parsed.info.tokenAmount.amount
      return parseInt(amount, 10)
    }

    return 0
  } catch (error) {
    console.error('Failed to fetch SKR balance:', error)
    return 0
  }
}

// Fetch SKR price from Jupiter
async function fetchSkrPrice(): Promise<number | null> {
  try {
    const response = await fetch(
      `${JUPITER_PRICE_API}?ids=${SKR_CONFIG.mint}`
    )
    const data = await response.json()

    if (data.data?.[SKR_CONFIG.mint]?.price) {
      return data.data[SKR_CONFIG.mint].price
    }

    return null
  } catch (error) {
    console.error('Failed to fetch SKR price:', error)
    return null
  }
}

// Fetch staking info from the SKR staking program
async function fetchStakingInfo(walletAddress: string): Promise<StakingInfo | null> {
  try {
    // Derive the staking account PDA
    // For now, we'll fetch using Helius to check for staking program accounts
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'staking-info',
        method: 'getProgramAccounts',
        params: [
          SKR_CONFIG.stakingProgram,
          {
            encoding: 'base64',
            filters: [
              {
                memcmp: {
                  offset: 8, // After discriminator
                  bytes: walletAddress,
                },
              },
            ],
          },
        ],
      }),
    })

    const data = await response.json()

    if (data.result?.length > 0) {
      // Parse the staking account data
      // This is a simplified version - actual parsing depends on the program's account structure
      const accountData = data.result[0].account.data

      // For demo purposes, return mock staking data
      // In production, we'd decode the actual account data
      return {
        stakedAmount: 0,
        stakedUiAmount: 0,
        pendingRewards: 0,
        guardian: SKR_CONFIG.primaryGuardian,
        guardianName: 'Solana Mobile',
        lastCompound: null,
        cooldownEnd: null,
        isUnstaking: false,
        stakingStartedAt: null,
      }
    }

    return null
  } catch (error) {
    console.error('Failed to fetch staking info:', error)
    return null
  }
}

// Main hook to fetch and manage SKR data
export function useSkrData() {
  const wallet = isWeb ? null : useMobileWallet()
  const account = wallet?.account
  const {
    setBalance,
    setPrice,
    setStaking,
    setLoading,
    setError,
    isLoading,
  } = useSkrStore()

  const fetchSkrData = useCallback(async () => {
    if (!account?.address) return null

    setLoading(true)
    setError(null)

    try {
      // Use mock data in demo mode for impressive screenshots
      if (DEMO_MODE) {
        const mockBalance = MOCK_SKR_BALANCE * Math.pow(10, SKR_CONFIG.decimals)
        setBalance(mockBalance, SKR_CONFIG.decimals)
        setPrice(MOCK_SKR_PRICE)
        setStaking(MOCK_STAKING_INFO)
        setLoading(false)
        return { balance: mockBalance, price: MOCK_SKR_PRICE, stakingInfo: MOCK_STAKING_INFO }
      }

      // Fetch balance, price, and staking info in parallel
      const [balance, price, stakingInfo] = await Promise.all([
        fetchSkrBalance(account.address),
        fetchSkrPrice(),
        fetchStakingInfo(account.address),
      ])

      setBalance(balance, SKR_CONFIG.decimals)
      setPrice(price)
      setStaking(stakingInfo)
      setLoading(false)

      return { balance, price, stakingInfo }
    } catch (error) {
      console.error('Failed to fetch SKR data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch SKR data')
      setLoading(false)
      return null
    }
  }, [account?.address, setBalance, setPrice, setStaking, setLoading, setError])

  // Use React Query for caching and refetching
  const { refetch } = useQuery({
    queryKey: ['skr', account?.address],
    queryFn: fetchSkrData,
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
