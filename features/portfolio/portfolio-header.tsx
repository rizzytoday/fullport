import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { usePortfolioStore } from '@/stores/portfolio-store'
import { useSkrStore } from '@/stores/skr-store'
import { colors, spacing, typography, borderRadius } from '@/constants/app-styles'
import { formatRelativeTime, isDataStale } from '@/hooks/use-network-status'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`
  }
  return `$${value.toFixed(0)}`
}

export function PortfolioHeader() {
  const { totalValueUsd, change24h, walletCount, lastUpdated } = usePortfolioStore()
  const { staking, currentApy, priceUsd } = useSkrStore()

  const isPositive = (change24h ?? 0) >= 0
  const changeText = change24h !== null
    ? `${isPositive ? '+' : ''}${change24h.toFixed(2)}%`
    : '--'

  const isStale = isDataStale(lastUpdated, 5) // Stale after 5 minutes
  const lastUpdatedText = formatRelativeTime(lastUpdated)

  // Calculate projected value (12 month projection from staking rewards)
  const stakedValue = staking ? staking.stakedUiAmount * (priceUsd ?? 0) : 0
  const projectedStakingRewards = stakedValue * currentApy // 12 month rewards
  const projectedValue = totalValueUsd + projectedStakingRewards
  const hasProjection = projectedStakingRewards > 0

  // Calculate staking progress
  const calculateProgress = () => {
    if (!staking || projectedStakingRewards <= 0) return 0

    // Time-based progress (if we have staking start date)
    let timeProgress = 0
    if (staking.stakingStartedAt) {
      const monthsElapsed = (Date.now() - staking.stakingStartedAt) / (1000 * 60 * 60 * 24 * 30)
      timeProgress = Math.min(monthsElapsed / 12, 1) // 12-month vesting period
    }

    // Rewards-based progress (pending rewards vs projected annual)
    let rewardsProgress = 0
    if (staking.pendingRewards > 0 && projectedStakingRewards > 0) {
      const pendingRewardsValue = staking.pendingRewards * (priceUsd ?? 0)
      rewardsProgress = Math.min(pendingRewardsValue / projectedStakingRewards, 1)
    }

    // Use whichever is higher (time-based is primary, rewards confirms)
    return Math.max(timeProgress, rewardsProgress)
  }

  const stakingProgress = calculateProgress()

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Portfolio</Text>
        {walletCount > 1 && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.walletBadge}>
            <Ionicons name="wallet-outline" size={12} color={colors.textMuted} />
            <Text style={styles.walletBadgeText}>{walletCount} wallets</Text>
          </Animated.View>
        )}
        {lastUpdated && (
          <View style={[styles.updatedBadge, isStale && styles.staleBadge]}>
            <Ionicons
              name={isStale ? 'time-outline' : 'checkmark-circle'}
              size={10}
              color={isStale ? colors.accentGold : colors.accentGreen}
            />
            <Text style={[styles.updatedText, isStale && styles.staleText]}>
              {lastUpdatedText}
            </Text>
          </View>
        )}
      </View>

      <Animated.Text
        entering={FadeInDown.delay(50).duration(400)}
        style={styles.value}
      >
        {formatCurrency(totalValueUsd)}
      </Animated.Text>

      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={styles.changeRow}
      >
        <Text
          style={[
            styles.change,
            { color: isPositive ? colors.accentGreen : colors.accentRed },
          ]}
        >
          {changeText}
        </Text>
        <Text style={styles.period}>24h</Text>
      </Animated.View>

      {/* Projected with progress bar */}
      {hasProjection && (
        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          style={styles.projectedSection}
        >
          {/* Progress header */}
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progress</Text>
            <Text style={styles.progressPercent}>
              {(stakingProgress * 100).toFixed(1)}%
            </Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${stakingProgress * 100}%` }
              ]}
            />
          </View>

          {/* Projected label below */}
          <View style={styles.projectedRow}>
            <Text style={styles.projectedLabel}>Projected (incl. staking)</Text>
            <Text style={styles.projectedValue}>{formatCompact(projectedValue)}</Text>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.labelSmall,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  walletBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.glassBg,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: borderRadius.full,
  },
  walletBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
  },
  updatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 'auto',
  },
  staleBadge: {
    opacity: 0.8,
  },
  updatedText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.accentGreen,
  },
  staleText: {
    color: colors.accentGold,
  },
  value: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  change: {
    ...typography.body,
    fontWeight: '600',
  },
  period: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  projectedSection: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    gap: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accentPurple,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accentPurple,
    borderRadius: 2,
  },
  projectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  projectedLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  projectedValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accentPurple,
  },
})
