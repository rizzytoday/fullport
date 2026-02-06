import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Transaction, TransactionType } from '@/constants/mock-data'
import { DEMO_MODE, MOCK_TRANSACTIONS } from '@/constants/mock-data'

// Re-export Transaction type
export type { Transaction } from '@/constants/mock-data'

// Helius API
const HELIUS_API_KEY = '8d0eb0c7-f3ef-46a0-915d-9e4728b04daa'
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`

// Known program IDs for transaction classification
const PROGRAMS = {
  SYSTEM: '11111111111111111111111111111111',
  TOKEN: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  ASSOCIATED_TOKEN: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  JUPITER_V6: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
  JUPITER_LIMIT: 'jupoNjAxXgZ4rjzxzPMP4oxduvQsQtZzyknqvzYNrNu',
  SKR_STAKING: 'SKRskrmtL83pcL4YqLWt6iPefDqwXQWHSw9S9vz94BZ',
}

// Token logos for common tokens
const TOKEN_LOGOS: Record<string, string> = {
  'So11111111111111111111111111111111111111112': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  'SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3': 'https://coin-images.coingecko.com/coins/images/70974/large/seeker-logo.jpg',
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'https://static.jup.ag/jup/icon.png',
}

interface HeliusTransaction {
  signature: string
  timestamp: number
  type: string
  source: string
  fee: number
  feePayer: string
  nativeTransfers?: Array<{
    fromUserAccount: string
    toUserAccount: string
    amount: number
  }>
  tokenTransfers?: Array<{
    fromUserAccount: string
    toUserAccount: string
    fromTokenAccount: string
    toTokenAccount: string
    tokenAmount: number
    mint: string
    tokenName?: string
    tokenSymbol?: string
  }>
  accountData?: Array<{
    account: string
    nativeBalanceChange: number
    tokenBalanceChanges?: Array<{
      mint: string
      rawTokenAmount: {
        tokenAmount: string
        decimals: number
      }
      userAccount: string
    }>
  }>
  description?: string
  events?: {
    swap?: {
      nativeInput?: { account: string; amount: string }
      nativeOutput?: { account: string; amount: string }
      tokenInputs?: Array<{ mint: string; tokenAmount: number; userAccount: string }>
      tokenOutputs?: Array<{ mint: string; tokenAmount: number; userAccount: string }>
    }
  }
}

// Classify transaction type based on Helius enhanced data
function classifyTransaction(tx: HeliusTransaction, walletAddress: string): TransactionType {
  const type = tx.type?.toUpperCase()
  const source = tx.source?.toUpperCase()

  // SKR Staking transactions
  if (source === 'SKR_STAKING' || tx.description?.toLowerCase().includes('stake')) {
    if (tx.description?.toLowerCase().includes('unstake')) return 'unstake'
    if (tx.description?.toLowerCase().includes('claim')) return 'claim'
    return 'stake'
  }

  // Swaps (Jupiter, etc.)
  if (type === 'SWAP' || source === 'JUPITER' || tx.events?.swap) {
    return 'swap'
  }

  // Token transfers
  if (tx.tokenTransfers && tx.tokenTransfers.length > 0) {
    const transfer = tx.tokenTransfers[0]
    // If we're receiving tokens (toUserAccount is our wallet)
    if (transfer.toUserAccount === walletAddress) {
      // Check if it's an airdrop (no corresponding outgoing transfer)
      const hasOutgoing = tx.tokenTransfers.some(t => t.fromUserAccount === walletAddress)
      if (!hasOutgoing && transfer.tokenAmount > 0) {
        return 'airdrop'
      }
      return 'transfer_in'
    }
    return 'transfer_out'
  }

  // Native SOL transfers
  if (tx.nativeTransfers && tx.nativeTransfers.length > 0) {
    const transfer = tx.nativeTransfers[0]
    if (transfer.toUserAccount === walletAddress) {
      return 'transfer_in'
    }
    return 'transfer_out'
  }

  // Default to transfer_in for unknown incoming transactions
  return 'transfer_in'
}

// Parse Helius transaction into our Transaction format
function parseTransaction(tx: HeliusTransaction, walletAddress: string): Transaction {
  const type = classifyTransaction(tx, walletAddress)
  const signature = tx.signature.slice(0, 4) + '...' + tx.signature.slice(-4)

  const base: Transaction = {
    signature,
    type,
    timestamp: tx.timestamp * 1000, // Convert to milliseconds
    status: 'confirmed',
  }

  // Handle swaps
  if (type === 'swap' && tx.events?.swap) {
    const swap = tx.events.swap
    const tokenIn = swap.tokenInputs?.[0]
    const tokenOut = swap.tokenOutputs?.[0]
    const nativeIn = swap.nativeInput
    const nativeOut = swap.nativeOutput

    if (tokenIn && tokenOut) {
      base.fromToken = {
        symbol: tokenIn.mint.slice(0, 4),
        amount: tokenIn.tokenAmount,
        logoUri: TOKEN_LOGOS[tokenIn.mint] || '',
      }
      base.toToken = {
        symbol: tokenOut.mint.slice(0, 4),
        amount: tokenOut.tokenAmount,
        logoUri: TOKEN_LOGOS[tokenOut.mint] || '',
      }
    } else if (nativeIn && tokenOut) {
      base.fromToken = {
        symbol: 'SOL',
        amount: parseInt(nativeIn.amount) / 1e9,
        logoUri: TOKEN_LOGOS['So11111111111111111111111111111111111111112'],
      }
      base.toToken = {
        symbol: tokenOut.mint.slice(0, 4),
        amount: tokenOut.tokenAmount,
        logoUri: TOKEN_LOGOS[tokenOut.mint] || '',
      }
    } else if (tokenIn && nativeOut) {
      base.fromToken = {
        symbol: tokenIn.mint.slice(0, 4),
        amount: tokenIn.tokenAmount,
        logoUri: TOKEN_LOGOS[tokenIn.mint] || '',
      }
      base.toToken = {
        symbol: 'SOL',
        amount: parseInt(nativeOut.amount) / 1e9,
        logoUri: TOKEN_LOGOS['So11111111111111111111111111111111111111112'],
      }
    }
  }

  // Handle token transfers (including airdrops)
  if ((type === 'transfer_in' || type === 'transfer_out' || type === 'airdrop' ||
       type === 'stake' || type === 'unstake' || type === 'claim') &&
      tx.tokenTransfers && tx.tokenTransfers.length > 0) {
    const transfer = tx.tokenTransfers[0]
    base.token = {
      symbol: transfer.tokenSymbol || transfer.mint.slice(0, 4),
      amount: transfer.tokenAmount,
      logoUri: TOKEN_LOGOS[transfer.mint] || '',
    }
    if (type === 'transfer_in') {
      base.address = transfer.fromUserAccount?.slice(0, 4) + '...' + transfer.fromUserAccount?.slice(-4)
    } else if (type === 'transfer_out') {
      base.address = transfer.toUserAccount?.slice(0, 4) + '...' + transfer.toUserAccount?.slice(-4)
    }
  }

  // Handle native SOL transfers
  if ((type === 'transfer_in' || type === 'transfer_out') &&
      !base.token && tx.nativeTransfers && tx.nativeTransfers.length > 0) {
    const transfer = tx.nativeTransfers[0]
    base.token = {
      symbol: 'SOL',
      amount: transfer.amount / 1e9,
      logoUri: TOKEN_LOGOS['So11111111111111111111111111111111111111112'],
    }
    if (type === 'transfer_in') {
      base.address = transfer.fromUserAccount?.slice(0, 4) + '...' + transfer.fromUserAccount?.slice(-4)
    } else {
      base.address = transfer.toUserAccount?.slice(0, 4) + '...' + transfer.toUserAccount?.slice(-4)
    }
  }

  return base
}

// Fetch transactions from Helius Enhanced Transactions API
async function fetchTransactionHistory(address: string): Promise<Transaction[]> {
  // Use mock data in demo mode
  if (DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return MOCK_TRANSACTIONS
  }

  try {
    // Use Helius parsed transaction history API
    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}&limit=50`
    )

    if (!response.ok) {
      console.error('Helius API error:', response.status)
      return []
    }

    const transactions: HeliusTransaction[] = await response.json()

    // Parse and filter transactions
    const parsed = transactions
      .map(tx => parseTransaction(tx, address))
      .filter(tx => {
        // Filter out transactions with no meaningful data
        if (tx.type === 'swap' && !tx.fromToken && !tx.toToken) return false
        if ((tx.type === 'transfer_in' || tx.type === 'transfer_out') && !tx.token) return false
        return true
      })

    return parsed
  } catch (error) {
    console.error('Failed to fetch transaction history:', error)
    return []
  }
}

// Detect new airdrops by comparing with previous known tokens
export async function detectNewAirdrops(
  address: string,
  knownMints: Set<string>
): Promise<Transaction[]> {
  if (DEMO_MODE) return []

  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}&limit=20&type=TRANSFER`
    )

    if (!response.ok) return []

    const transactions: HeliusTransaction[] = await response.json()
    const airdrops: Transaction[] = []

    for (const tx of transactions) {
      if (!tx.tokenTransfers) continue

      for (const transfer of tx.tokenTransfers) {
        // Check if we received a token we didn't have before
        if (transfer.toUserAccount === address && !knownMints.has(transfer.mint)) {
          // This is potentially an airdrop
          const airdrop = parseTransaction(tx, address)
          airdrop.type = 'airdrop'
          airdrops.push(airdrop)
        }
      }
    }

    return airdrops
  } catch (error) {
    console.error('Failed to detect airdrops:', error)
    return []
  }
}

export function useTransactionHistory(address: string | undefined) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', address],
    queryFn: () => fetchTransactionHistory(address || 'demo'),
    enabled: !!address || DEMO_MODE,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes (renamed from cacheTime in v5)
  })

  const refresh = useCallback(async () => {
    if (address) {
      await refetch()
    }
  }, [address, refetch])

  return {
    transactions: data ?? [],
    isLoading,
    error: error ? String(error) : null,
    refresh,
  }
}
