import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useStakingRewardsStore } from '@/stores/staking-rewards-store'
import { useSkrStore } from '@/stores/skr-store'
import { colors, spacing } from '@/constants/app-styles'
import * as Haptics from 'expo-haptics'

const isWeb = Platform.OS === 'web'

// Format currency values
function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  if (value >= 100) return `$${value.toFixed(0)}`
  return `$${value.toFixed(2)}`
}

export function IncomeSummaryMini() {
  const router = useRouter()
  const { totalEarnedUsd, thisMonthEarnedUsd, dailyAverage, claims } = useStakingRewardsStore()
  const { priceUsd, staking, currentApy } = useSkrStore()

  const dailyAverageUsd = priceUsd ? dailyAverage * priceUsd : 0
  const hasClaims = claims.length > 0

  // Calculate projected monthly earnings from staked amount (uses store APY, not hardcoded)
  const monthlyEarningsUsd = staking && priceUsd
    ? ((staking.stakedUiAmount * currentApy) / 12) * priceUsd
    : 0

  const handlePress = () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    router.push('/skr')
  }

  // Don't show if no staking income yet
  if (!hasClaims || totalEarnedUsd === 0) {
    return null
  }

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      {/* Section Label */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="trending-up" size={14} color={colors.accentPurple} />
        </View>
        <Text style={styles.label}>STAKING INCOME</Text>
        <TouchableOpacity onPress={handlePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.viewMore}>View details</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatUsd(totalEarnedUsd)}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <Text style={styles.separator}>·</Text>

        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatUsd(thisMonthEarnedUsd)}</Text>
          <Text style={styles.statLabel}>This month</Text>
        </View>

        <Text style={styles.separator}>·</Text>

        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatUsd(dailyAverageUsd)}</Text>
          <Text style={styles.statLabel}>Daily avg</Text>
        </View>
      </View>

      {/* Monthly projection */}
      {monthlyEarningsUsd >= 1 && (
        <View style={styles.projectionRow}>
          <View style={styles.purpleDot} />
          <Text style={styles.projectionText}>
            On track to earn ~{formatUsd(monthlyEarningsUsd)}/month at current rate
          </Text>
        </View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  viewMore: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.accentPurple,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.textMuted,
  },
  separator: {
    fontSize: 14,
    color: colors.textMuted,
  },
  projectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  purpleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentPurple,
  },
  projectionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
})
