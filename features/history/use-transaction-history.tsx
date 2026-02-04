import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Transaction } from '@/constants/mock-data'
import { DEMO_MODE, MOCK_TRANSACTIONS } from '@/constants/mock-data'

// Re-export Transaction type
export type { Transaction } from '@/constants/mock-data'

// Fetch transactions from Helius
async function fetchTransactionHistory(address: string): Promise<Transaction[]> {
  // Use mock data in demo mode
  if (DEMO_MODE) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return MOCK_TRANSACTIONS
  }

  // TODO: Implement real Helius transaction history fetching
  // Using getSignaturesForAddress and getTransaction
  return []
}

export function useTransactionHistory(address: string | undefined) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', address],
    queryFn: () => (address ? fetchTransactionHistory(address) : Promise.resolve([])),
    enabled: !!address,
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
