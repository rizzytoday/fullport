import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing } from '@/constants/app-styles'
import { useNetworkStatus } from '@/hooks/use-network-status'
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated'

export function OfflineBanner() {
  const { isConnected, isInternetReachable } = useNetworkStatus()

  // Show banner if disconnected or internet not reachable
  const isOffline = !isConnected || isInternetReachable === false

  if (!isOffline) return null

  return (
    <Animated.View
      entering={FadeInUp.duration(200)}
      exiting={FadeOutUp.duration(200)}
      style={styles.container}
    >
      <Ionicons name="cloud-offline" size={16} color={colors.textPrimary} />
      <Text style={styles.text}>You're offline. Showing cached data.</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentGold,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.bgPrimary,
  },
})
