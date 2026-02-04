import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import NetInfo, { NetInfoState } from '@react-native-community/netinfo'

interface NetworkStatus {
  isConnected: boolean
  isInternetReachable: boolean | null
  type: string | null
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: null,
  })

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Web fallback
      const handleOnline = () => setStatus((s) => ({ ...s, isConnected: true, isInternetReachable: true }))
      const handleOffline = () => setStatus((s) => ({ ...s, isConnected: false, isInternetReachable: false }))

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      setStatus({
        isConnected: navigator.onLine,
        isInternetReachable: navigator.onLine,
        type: 'unknown',
      })

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }

    // Native - use NetInfo
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      })
    })

    // Get initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      })
    })

    return () => unsubscribe()
  }, [])

  return status
}

// Format relative time
export function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return 'Never'

  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (seconds < 60) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return new Date(timestamp).toLocaleDateString()
}

// Check if data is stale (older than threshold)
export function isDataStale(timestamp: number | null, thresholdMinutes: number = 5): boolean {
  if (!timestamp) return true
  const diff = Date.now() - timestamp
  return diff > thresholdMinutes * 60 * 1000
}
