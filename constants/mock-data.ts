import { TokenHolding } from '@/stores/portfolio-store'

// Generate realistic price history (7 days, hourly = 168 points, sampled to 24)
function generatePriceHistory(currentPrice: number, changePercent: number): number[] {
  const points = 24
  const history: number[] = []

  // Calculate start price based on change percent
  const startPrice = currentPrice / (1 + changePercent / 100)

  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1)
    // Add some noise for realistic chart
    const noise = (Math.random() - 0.5) * 0.02 * currentPrice
    const basePrice = startPrice + (currentPrice - startPrice) * progress
    // Add wave pattern for more visual interest
    const wave = Math.sin(progress * Math.PI * 3) * currentPrice * 0.015
    history.push(basePrice + noise + wave)
  }

  // Ensure last point matches current price
  history[points - 1] = currentPrice
  return history
}
import { StakingInfo } from '@/stores/skr-store'
import { SKR_CONFIG, KNOWN_TOKENS } from './app-config'

// Demo portfolio data - $238K total value
export const MOCK_HOLDINGS: TokenHolding[] = [
  {
    mint: KNOWN_TOKENS.SOL,
    symbol: 'SOL',
    name: 'Solana',
    amount: 1250_000_000_000, // 1250 SOL
    decimals: 9,
    uiAmount: 1250,
    priceUsd: 98.50,
    valueUsd: 123125,
    change24h: 4.2,
    logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    priceHistory: generatePriceHistory(98.50, 4.2),
  },
  {
    mint: SKR_CONFIG.mint,
    symbol: 'SKR',
    name: 'Seeker',
    amount: 850000_000_000_000, // 850,000 SKR
    decimals: 9,
    uiAmount: 850000,
    priceUsd: 0.0285,
    valueUsd: 24225,
    change24h: 12.5,
    logoUri: 'https://coin-images.coingecko.com/coins/images/70974/large/seeker-logo.jpg',
    priceHistory: generatePriceHistory(0.0285, 12.5),
  },
  {
    mint: KNOWN_TOKENS.USDC,
    symbol: 'USDC',
    name: 'USD Coin',
    amount: 45000_000_000, // 45,000 USDC
    decimals: 6,
    uiAmount: 45000,
    priceUsd: 1.00,
    valueUsd: 45000,
    change24h: 0,
    logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    priceHistory: generatePriceHistory(1.00, 0),
  },
  {
    mint: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    symbol: 'JUP',
    name: 'Jupiter',
    amount: 25000_000_000, // 25,000 JUP
    decimals: 6,
    uiAmount: 25000,
    priceUsd: 0.82,
    valueUsd: 20500,
    change24h: -2.3,
    logoUri: 'https://static.jup.ag/jup/icon.png',
    priceHistory: generatePriceHistory(0.82, -2.3),
  },
  {
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    symbol: 'BONK',
    name: 'Bonk',
    amount: 1500000000_000_000, // 1.5B BONK
    decimals: 5,
    uiAmount: 15000000000,
    priceUsd: 0.0000012,
    valueUsd: 18000,
    change24h: 8.7,
    logoUri: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
    priceHistory: generatePriceHistory(0.0000012, 8.7),
  },
  {
    mint: 'FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P',
    symbol: 'MELANIA',
    name: 'Melania Meme',
    amount: 50000_000_000, // 50,000 MELANIA
    decimals: 6,
    uiAmount: 50000,
    priceUsd: 0.15,
    valueUsd: 7500,
    change24h: 42.0,
    logoUri: 'https://coin-images.coingecko.com/coins/images/53775/small/melania-meme.png',
    priceHistory: generatePriceHistory(0.15, 42.0),
  },
]

// Calculate total value
export const MOCK_TOTAL_VALUE = MOCK_HOLDINGS.reduce((sum, h) => sum + (h.valueUsd ?? 0), 0)

// Demo SKR staking data
export const MOCK_SKR_BALANCE = 850000 // 850K SKR available
export const MOCK_SKR_PRICE = 0.0285

export const MOCK_STAKING_INFO: StakingInfo = {
  stakedAmount: 500000_000_000_000, // 500K SKR staked
  stakedUiAmount: 500000,
  pendingRewards: 2850_000_000_000, // 2,850 SKR rewards
  guardian: SKR_CONFIG.primaryGuardian,
  guardianName: 'Solana Mobile',
  lastCompound: Date.now() / 1000 - 86400, // 24 hours ago
  cooldownEnd: null,
  isUnstaking: false,
  stakingStartedAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // Started 30 days ago
}

// Demo mode flag - set to true to use mock data for display
export const DEMO_MODE = true

// Transaction types
export type TransactionType = 'swap' | 'transfer_in' | 'transfer_out' | 'stake' | 'unstake' | 'claim' | 'airdrop'

export interface Transaction {
  signature: string
  type: TransactionType
  timestamp: number
  status: 'confirmed' | 'pending' | 'failed'
  // For swaps
  fromToken?: { symbol: string; amount: number; logoUri: string }
  toToken?: { symbol: string; amount: number; logoUri: string }
  // For transfers
  token?: { symbol: string; amount: number; logoUri: string }
  address?: string
  // Value in USD at time of transaction
  valueUsd?: number
}

// Generate timestamps for the past few days
const now = Date.now()
const hour = 3600000
const day = 86400000

// Mock transactions - realistic activity
// Staking Rewards Claim History - past 60 days
// Generate realistic claim history with varying intervals and amounts
function generateStakingRewardsClaims(): {
  id: string
  timestamp: number
  amount: number
  usdValue: number
  txSignature: string
}[] {
  const claims: {
    id: string
    timestamp: number
    amount: number
    usdValue: number
    txSignature: string
  }[] = []

  const SKR_PRICE = 0.0285
  let currentTimestamp = now
  const sixtyDaysAgo = now - 60 * day

  // Generate claims going backwards in time
  while (currentTimestamp > sixtyDaysAgo) {
    // Random interval between 3-7 days
    const intervalDays = 3 + Math.random() * 4
    currentTimestamp -= intervalDays * day

    if (currentTimestamp < sixtyDaysAgo) break

    // Random amount between 50-200 SKR per claim
    // Slightly higher amounts for more recent claims (compounding effect)
    const daysFromNow = (now - currentTimestamp) / day
    const baseAmount = 50 + Math.random() * 150
    const compoundBonus = 1 + (60 - daysFromNow) / 200 // Up to 30% bonus for recent claims
    const amount = Math.round(baseAmount * compoundBonus)

    const usdValue = Math.round(amount * SKR_PRICE * 100) / 100

    // Generate realistic tx signature
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    const txSignature = Array(8).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('') + '...' + Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('')

    claims.push({
      id: `claim-${claims.length + 1}`,
      timestamp: currentTimestamp,
      amount,
      usdValue,
      txSignature,
    })
  }

  // Sort by timestamp ascending (oldest first)
  return claims.sort((a, b) => a.timestamp - b.timestamp)
}

export const MOCK_STAKING_REWARDS = generateStakingRewardsClaims()

// Calculate totals from mock data
export const MOCK_STAKING_REWARDS_TOTALS = {
  totalEarned: MOCK_STAKING_REWARDS.reduce((sum, c) => sum + c.amount, 0),
  totalEarnedUsd: MOCK_STAKING_REWARDS.reduce((sum, c) => sum + c.usdValue, 0),
}

// Portfolio History - 30 days of portfolio value snapshots
// Shows realistic growth with daily volatility
function generatePortfolioHistory(): {
  timestamp: number
  totalValue: number
  change24h: number
  holdings: { symbol: string; value: number }[]
}[] {
  const history: {
    timestamp: number
    totalValue: number
    change24h: number
    holdings: { symbol: string; value: number }[]
  }[] = []

  const currentTotal = MOCK_TOTAL_VALUE // ~238K
  const thirtyDaysAgo = now - 30 * day

  // Start from a value that would grow to current with ~15% monthly gain
  // Plus realistic volatility
  let baseValue = currentTotal * 0.85

  for (let d = 0; d <= 30; d++) {
    const timestamp = thirtyDaysAgo + d * day

    // Daily growth rate (~0.5% average to get ~15% over 30 days)
    const dailyGrowth = 0.005

    // Add daily volatility (+/- 3%)
    const volatility = (Math.random() - 0.5) * 0.06

    // Add market trend component (sine wave for realistic patterns)
    const trendCycle = Math.sin(d / 7 * Math.PI) * 0.02

    // Calculate day's total value
    const dayFactor = 1 + dailyGrowth + volatility + trendCycle
    baseValue = baseValue * dayFactor

    // Ensure final day matches current total
    const totalValue = d === 30 ? currentTotal : Math.round(baseValue)

    // Calculate 24h change
    const prevDayValue = history.length > 0 ? history[history.length - 1].totalValue : baseValue
    const change24h = Math.round(((totalValue - prevDayValue) / prevDayValue) * 10000) / 100

    // Approximate holdings breakdown (proportional to current holdings)
    const holdingRatios = {
      SOL: 0.517,    // ~123K of 238K
      SKR: 0.102,    // ~24K
      USDC: 0.189,   // ~45K
      JUP: 0.086,    // ~20K
      BONK: 0.076,   // ~18K
      MELANIA: 0.032 // ~7.5K
    }

    const holdings = Object.entries(holdingRatios).map(([symbol, ratio]) => ({
      symbol,
      value: Math.round(totalValue * ratio),
    }))

    history.push({
      timestamp,
      totalValue,
      change24h,
      holdings,
    })
  }

  return history
}

export const MOCK_PORTFOLIO_HISTORY = generatePortfolioHistory()

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    signature: '5KtP...9xVm',
    type: 'claim',
    timestamp: now - 2 * hour,
    status: 'confirmed',
    token: { symbol: 'SKR', amount: 2850, logoUri: 'https://coin-images.coingecko.com/coins/images/70974/large/seeker-logo.jpg' },
    valueUsd: 81.23,
  },
  {
    signature: '3mNq...7yKp',
    type: 'swap',
    timestamp: now - 5 * hour,
    status: 'confirmed',
    fromToken: { symbol: 'USDC', amount: 5000, logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png' },
    toToken: { symbol: 'SOL', amount: 50.76, logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' },
    valueUsd: 5000,
  },
  {
    signature: '8vRt...2wBn',
    type: 'stake',
    timestamp: now - 12 * hour,
    status: 'confirmed',
    token: { symbol: 'SKR', amount: 500000, logoUri: 'https://coin-images.coingecko.com/coins/images/70974/large/seeker-logo.jpg' },
    valueUsd: 14250,
  },
  {
    signature: '2pLm...5hGc',
    type: 'airdrop',
    timestamp: now - 1 * day,
    status: 'confirmed',
    token: { symbol: 'SKR', amount: 850000, logoUri: 'https://coin-images.coingecko.com/coins/images/70974/large/seeker-logo.jpg' },
    valueUsd: 24225,
  },
  {
    signature: '9kWx...3nTf',
    type: 'swap',
    timestamp: now - 1.5 * day,
    status: 'confirmed',
    fromToken: { symbol: 'SOL', amount: 100, logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' },
    toToken: { symbol: 'JUP', amount: 12000, logoUri: 'https://static.jup.ag/jup/icon.png' },
    valueUsd: 9850,
  },
  {
    signature: '7jHz...1qRs',
    type: 'transfer_in',
    timestamp: now - 2 * day,
    status: 'confirmed',
    token: { symbol: 'SOL', amount: 500, logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' },
    address: '8xK4...mN2p',
    valueUsd: 49250,
  },
  {
    signature: '4fDp...8zYk',
    type: 'swap',
    timestamp: now - 2.5 * day,
    status: 'confirmed',
    fromToken: { symbol: 'USDC', amount: 20000, logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png' },
    toToken: { symbol: 'BONK', amount: 15000000000, logoUri: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I' },
    valueUsd: 20000,
  },
  {
    signature: '1aNb...6cPq',
    type: 'transfer_out',
    timestamp: now - 3 * day,
    status: 'confirmed',
    token: { symbol: 'USDC', amount: 10000, logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png' },
    address: '3vM7...xK9r',
    valueUsd: 10000,
  },
  {
    signature: '6gTr...4mWv',
    type: 'swap',
    timestamp: now - 4 * day,
    status: 'confirmed',
    fromToken: { symbol: 'SOL', amount: 200, logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png' },
    toToken: { symbol: 'MELANIA', amount: 50000, logoUri: 'https://coin-images.coingecko.com/coins/images/53775/small/melania-meme.png' },
    valueUsd: 19700,
  },
  {
    signature: '5yQs...9kLn',
    type: 'transfer_in',
    timestamp: now - 5 * day,
    status: 'confirmed',
    token: { symbol: 'USDC', amount: 75000, logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png' },
    address: 'Coinbase',
    valueUsd: 75000,
  },
]
